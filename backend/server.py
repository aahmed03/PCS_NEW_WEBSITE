import os
import uuid
import logging
import asyncio
import html
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, ConfigDict, Field
import jwt  # PyJWT
from jwt import ExpiredSignatureError, InvalidTokenError
from passlib.context import CryptContext
import resend

# =========================================================
# Load .env once for local dev (Azure App Settings override)
# - This won't break Azure, because App Settings env vars take precedence.
# - Only load if file exists (prevents confusion in production).
# =========================================================
ROOT_DIR = Path(__file__).resolve().parent
ENV_FILE = ROOT_DIR / ".env"
if ENV_FILE.exists():
  load_dotenv(ENV_FILE)

# =========================================================
# Logging
# =========================================================
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
  level=getattr(logging, LOG_LEVEL, logging.INFO),
  format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("pcs-api")

# =========================================================
# Environment helpers
# =========================================================
def require_env(name: str) -> str:
  value = os.environ.get(name)
  if not value:
    raise RuntimeError(
      f"Missing required environment variable: {name}. "
      f"Create backend/.env for local dev or set it in Azure App Settings."
    )
  return value.strip()

def get_env(name: str, default: str = "") -> str:
  return os.environ.get(name, default).strip()

def is_production() -> bool:
  env = get_env("ENV", "").lower()
  return env in ("prod", "production")

# =========================================================
# MongoDB
# - Azure: use Cosmos DB (Mongo API) or MongoDB Atlas connection string
# - Local: mongodb://127.0.0.1:27017
# =========================================================
MONGO_URL = require_env("MONGO_URL")
DB_NAME = require_env("DB_NAME")

# Optional hardening for Azure networking / cold starts
MONGO_CONNECT_TIMEOUT_MS = int(get_env("MONGO_CONNECT_TIMEOUT_MS", "10000"))
MONGO_SERVER_SELECTION_TIMEOUT_MS = int(get_env("MONGO_SERVER_SELECTION_TIMEOUT_MS", "10000"))

client = AsyncIOMotorClient(
  MONGO_URL,
  connectTimeoutMS=MONGO_CONNECT_TIMEOUT_MS,
  serverSelectionTimeoutMS=MONGO_SERVER_SELECTION_TIMEOUT_MS,
)
db = client[DB_NAME]

# =========================================================
# Security / Auth
# =========================================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = get_env("JWT_SECRET", "")
if not JWT_SECRET:
  # Fail-fast in production; allow dev with a warning.
  if is_production():
    raise RuntimeError("JWT_SECRET is required in production. Set it in Azure App Settings.")
  JWT_SECRET = "dev-only-change-me"
  logger.warning("JWT_SECRET not set. Using dev-only secret (NOT SAFE FOR PRODUCTION).")

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(get_env("JWT_EXPIRATION_HOURS", "24"))

security = HTTPBearer()

# =========================================================
# Resend Email
# NOTE:
# - Resend requires a verified "from" address/domain.
# - Best practice: SENDER_EMAIL = "Primary Care Services <no-reply@my-primarycare.com>"
# =========================================================
RESEND_API_KEY = get_env("RESEND_API_KEY", "")
SENDER_EMAIL = get_env("SENDER_EMAIL", "onboarding@resend.dev")
CONTACT_TO_EMAIL = get_env("CONTACT_TO_EMAIL", "info@my-primarycare.com")

EMAIL_ENABLED = bool(RESEND_API_KEY)

if EMAIL_ENABLED:
  resend.api_key = RESEND_API_KEY
  logger.info("Email enabled via Resend. Sender=%s To=%s", SENDER_EMAIL, CONTACT_TO_EMAIL)
else:
  logger.warning("RESEND_API_KEY not set. Contact emails will be stored but NOT emailed.")

# =========================================================
# App / Router
# =========================================================
app = FastAPI(title="Primary Care Services API")
api_router = APIRouter(prefix="/api")

# =========================================================
# Models
# =========================================================
class UserBase(BaseModel):
  email: EmailStr
  full_name: str

class UserCreate(UserBase):
  password: str

class UserLogin(BaseModel):
  email: EmailStr
  password: str

class User(UserBase):
  model_config = ConfigDict(extra="ignore")
  user_id: str
  created_at: str

class TokenResponse(BaseModel):
  access_token: str
  token_type: str = "bearer"
  user: User

class Provider(BaseModel):
  model_config = ConfigDict(extra="ignore")
  provider_id: str
  name: str
  credentials: str
  specialty: str
  bio: str
  languages: List[str]
  locations: List[str]
  photo_url: str
  accepting_patients: bool = True

class ProviderCreate(BaseModel):
  name: str
  credentials: str
  specialty: str
  bio: str
  languages: List[str]
  locations: List[str]
  photo_url: str
  accepting_patients: bool = True

class Service(BaseModel):
  model_config = ConfigDict(extra="ignore")
  service_id: str
  title: str
  description: str
  icon: str
  category: str

class ServiceCreate(BaseModel):
  title: str
  description: str
  icon: str
  category: str

class Location(BaseModel):
  model_config = ConfigDict(extra="ignore")
  location_id: str
  name: str
  address: str
  city: str
  state: str
  zip_code: str
  phone: str
  fax: str
  hours: Dict[str, Any]
  map_url: str

class LocationCreate(BaseModel):
  name: str
  address: str
  city: str
  state: str
  zip_code: str
  phone: str
  fax: str
  hours: Dict[str, Any]
  map_url: str

class ContactFormSubmit(BaseModel):
  name: str = Field(..., min_length=1, max_length=120)
  email: EmailStr
  phone: str = Field(..., min_length=3, max_length=40)
  subject: str = Field(..., min_length=1, max_length=160)
  message: str = Field(..., min_length=1, max_length=5000)

class ContactFormResponse(BaseModel):
  status: str
  message: str
  email: str = "unknown"  # "sent" | "disabled" | "failed"

class PatientResource(BaseModel):
  model_config = ConfigDict(extra="ignore")
  resource_id: str
  title: str
  description: str
  file_url: str
  category: str

class PatientResourceCreate(BaseModel):
  title: str
  description: str
  file_url: str
  category: str

# =========================================================
# Auth Helpers
# =========================================================
def hash_password(password: str) -> str:
  return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
  return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
  to_encode = data.copy()
  expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
  to_encode.update({"exp": expire})
  return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
  token = credentials.credentials
  try:
    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    user_id: Optional[str] = payload.get("sub")
    if not user_id:
      raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
      raise HTTPException(status_code=401, detail="User not found")

    return user

  except ExpiredSignatureError:
    raise HTTPException(status_code=401, detail="Token has expired")
  except InvalidTokenError:
    raise HTTPException(status_code=401, detail="Could not validate credentials")

# =========================================================
# Routes
# =========================================================
@api_router.get("/")
async def root():
  return {"message": "Primary Care Services API"}

@api_router.get("/health")
async def health():
  # Helpful for local + Azure health checks.
  # Avoid leaking secrets; only report boolean/status.
  return {
    "status": "ok",
    "time": datetime.now(timezone.utc).isoformat(),
    "env": get_env("ENV", "unknown"),
    "email_enabled": EMAIL_ENABLED,
  }

# Optional: quick DB probe endpoint (useful during Azure bring-up)
@api_router.get("/health/db")
async def health_db():
  try:
    # ping admin database
    await client.admin.command("ping")
    return {"status": "ok", "db": "reachable", "time": datetime.now(timezone.utc).isoformat()}
  except Exception as e:
    logger.error("DB ping failed: %s", str(e))
    raise HTTPException(status_code=503, detail="Database unreachable")

# -------------------------
# Providers
# -------------------------
@api_router.get("/providers", response_model=List[Provider])
async def get_providers():
  return await db.providers.find({}, {"_id": 0}).to_list(100)

@api_router.get("/providers/{provider_id}", response_model=Provider)
async def get_provider(provider_id: str):
  provider = await db.providers.find_one({"provider_id": provider_id}, {"_id": 0})
  if not provider:
    raise HTTPException(status_code=404, detail="Provider not found")
  return provider

@api_router.post("/providers", response_model=Provider)
async def create_provider(provider_data: ProviderCreate, current_user: dict = Depends(get_current_user)):
  provider_id = str(uuid.uuid4())
  provider_doc = provider_data.model_dump()
  provider_doc["provider_id"] = provider_id
  await db.providers.insert_one(provider_doc)
  return Provider(provider_id=provider_id, **provider_data.model_dump())

# -------------------------
# Services
# -------------------------
@api_router.get("/services", response_model=List[Service])
async def get_services():
  return await db.services.find({}, {"_id": 0}).to_list(100)

@api_router.get("/services/{service_id}", response_model=Service)
async def get_service(service_id: str):
  service = await db.services.find_one({"service_id": service_id}, {"_id": 0})
  if not service:
    raise HTTPException(status_code=404, detail="Service not found")
  return service

@api_router.post("/services", response_model=Service)
async def create_service(service_data: ServiceCreate, current_user: dict = Depends(get_current_user)):
  service_id = str(uuid.uuid4())
  service_doc = service_data.model_dump()
  service_doc["service_id"] = service_id
  await db.services.insert_one(service_doc)
  return Service(service_id=service_id, **service_data.model_dump())

# -------------------------
# Locations
# -------------------------
@api_router.get("/locations", response_model=List[Location])
async def get_locations():
  return await db.locations.find({}, {"_id": 0}).to_list(100)

@api_router.get("/locations/{location_id}", response_model=Location)
async def get_location(location_id: str):
  location = await db.locations.find_one({"location_id": location_id}, {"_id": 0})
  if not location:
    raise HTTPException(status_code=404, detail="Location not found")
  return location

@api_router.post("/locations", response_model=Location)
async def create_location(location_data: LocationCreate, current_user: dict = Depends(get_current_user)):
  location_id = str(uuid.uuid4())
  location_doc = location_data.model_dump()
  location_doc["location_id"] = location_id
  await db.locations.insert_one(location_doc)
  return Location(location_id=location_id, **location_data.model_dump())

# -------------------------
# Contact (Sends to CONTACT_TO_EMAIL)
# -------------------------
@api_router.post("/contact", response_model=ContactFormResponse)
async def submit_contact_form(form_data: ContactFormSubmit):
  contact_doc = form_data.model_dump()
  contact_doc["contact_id"] = str(uuid.uuid4())
  contact_doc["submitted_at"] = datetime.now(timezone.utc).isoformat()

  await db.contacts.insert_one(contact_doc)

  email_status = "disabled"

  if EMAIL_ENABLED:
    # Escape user-provided fields to avoid HTML injection in the email body
    safe_name = html.escape(form_data.name)
    safe_email = html.escape(str(form_data.email))
    safe_phone = html.escape(form_data.phone)
    safe_subject = html.escape(form_data.subject)
    safe_message = html.escape(form_data.message).replace("\n", "<br/>")

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
        <h2 style="color:#0f766e;margin:0 0 12px 0;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> {safe_name}</p>
        <p><strong>Email:</strong> {safe_email}</p>
        <p><strong>Phone:</strong> {safe_phone}</p>
        <p><strong>Subject:</strong> {safe_subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background:#f4f4f4;padding:14px;border-radius:8px;">{safe_message}</div>
        <hr style="border:none;border-top:1px solid #ddd;margin:18px 0;">
        <p style="font-size:12px;color:#666;">Non-urgent inquiry. For emergencies, call 911.</p>
      </body>
    </html>
    """

    params = {
      "from": SENDER_EMAIL,
      "to": [CONTACT_TO_EMAIL],
      "subject": f"Contact Form: {form_data.subject}",
      "html": html_content,
      # Resend supports reply_to; keeping it as a string works with their Python SDK.
      "reply_to": str(form_data.email),
    }

    try:
      await asyncio.to_thread(resend.Emails.send, params)
      logger.info("Contact email sent. From=%s To=%s Patient=%s", SENDER_EMAIL, CONTACT_TO_EMAIL, form_data.email)
      email_status = "sent"
    except Exception as e:
      logger.error("Failed to send email via Resend: %s", str(e))
      email_status = "failed"

  return ContactFormResponse(
    status="success",
    message="Thank you for contacting us. We will respond within 24-48 hours.",
    email=email_status,
  )

# -------------------------
# Resources
# -------------------------
@api_router.get("/resources", response_model=List[PatientResource])
async def get_resources():
  return await db.resources.find({}, {"_id": 0}).to_list(100)

@api_router.post("/resources", response_model=PatientResource)
async def create_resource(resource_data: PatientResourceCreate, current_user: dict = Depends(get_current_user)):
  resource_id = str(uuid.uuid4())
  resource_doc = resource_data.model_dump()
  resource_doc["resource_id"] = resource_id
  await db.resources.insert_one(resource_doc)
  return PatientResource(resource_id=resource_id, **resource_data.model_dump())

# =========================================================
# Router + CORS
# =========================================================
app.include_router(api_router)

def parse_cors_origins(value: str) -> List[str]:
  if not value or value.strip() == "":
    return ["*"]
  v = value.strip()
  if v == "*":
    return ["*"]
  return [o.strip() for o in v.split(",") if o.strip()]

cors_origins = parse_cors_origins(get_env("CORS_ORIGINS", "*"))

# IMPORTANT:
# If you use allow_credentials=True, you cannot use allow_origins=["*"].
# We'll automatically disable credentials when origins is "*".
allow_all = (len(cors_origins) == 1 and cors_origins[0] == "*")

app.add_middleware(
  CORSMiddleware,
  allow_credentials=False if allow_all else True,
  allow_origins=cors_origins,
  allow_methods=["*"],
  allow_headers=["*"],
)

# =========================================================
# Startup / Shutdown
# =========================================================
@app.on_event("startup")
async def startup_checks():
  # In Azure, this helps quickly diagnose env / DB connectivity in Log Stream.
  logger.info("Starting PCS API | ENV=%s | EMAIL_ENABLED=%s", get_env("ENV", "unknown"), EMAIL_ENABLED)
  try:
    await client.admin.command("ping")
    logger.info("MongoDB ping: OK")
  except Exception as e:
    # Don’t crash the app automatically; health/db will show failure.
    logger.error("MongoDB ping failed on startup: %s", str(e))

@app.on_event("shutdown")
async def shutdown_db_client():
  client.close()
  logger.info("MongoDB client closed")



