import os
import uuid
import logging
import asyncio
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware

from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, ConfigDict, Field

import jwt  # PyJWT
from jwt import ExpiredSignatureError, InvalidTokenError

from passlib.context import CryptContext
import resend

# =========================================================
# Load .env once for local dev (Azure App Settings override)
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
# Helpers
# =========================================================
def require_env(name: str) -> str:
    v = os.environ.get(name)
    if not v:
        raise RuntimeError(
            f"Missing required environment variable: {name}. "
            f"Set it in Azure App Settings or backend/.env"
        )
    return v.strip()

def get_env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()

def is_production() -> bool:
    return get_env("ENV", "").lower() in ("prod", "production")

# =========================================================
# App
# =========================================================
app = FastAPI(title="Primary Care Services API")
api_router = APIRouter(prefix="/api")

# GZip helps response size + speed for JSON lists
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Root path for Azure probes
@app.get("/")
async def root():
    return {"status": "ok"}

# =========================================================
# Mongo (lazy init on startup)
# =========================================================
MONGO_URL = require_env("MONGO_URL")
DB_NAME = require_env("DB_NAME")

MONGO_TIMEOUT_MS = int(get_env("MONGO_TIMEOUT_MS", "5000"))          # server selection
MONGO_SOCKET_TIMEOUT_MS = int(get_env("MONGO_SOCKET_TIMEOUT_MS", "5000"))

@app.on_event("startup")
async def startup_mongo():
    """
    Create client on startup (not import time). Use short timeouts so Azure doesn't hang.
    """
    app.state.mongo_client = AsyncIOMotorClient(
        MONGO_URL,
        serverSelectionTimeoutMS=MONGO_TIMEOUT_MS,
        socketTimeoutMS=MONGO_SOCKET_TIMEOUT_MS,
        connectTimeoutMS=MONGO_TIMEOUT_MS,
        maxPoolSize=int(get_env("MONGO_MAX_POOL", "50")),
    )
    app.state.db = app.state.mongo_client[DB_NAME]
    logger.info("Mongo initialized. DB=%s | timeout_ms=%s", DB_NAME, MONGO_TIMEOUT_MS)

@app.on_event("shutdown")
async def shutdown_mongo():
    client = getattr(app.state, "mongo_client", None)
    if client:
        client.close()
        logger.info("Mongo client closed.")

def get_db(request: Request):
    db = getattr(request.app.state, "db", None)
    if db is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    return db

async def db_ping(db) -> bool:
    """
    Ping Mongo with an asyncio timeout so health checks don't hang.
    """
    try:
        await asyncio.wait_for(db.command("ping"), timeout=2.0)
        return True
    except Exception as e:
        logger.warning("DB ping failed: %s", str(e))
        return False

# =========================================================
# Security / Auth
# =========================================================
# bcrypt can be slow if rounds are high; keep defaults but allow tuning via env for dev.
BCRYPT_ROUNDS = int(get_env("BCRYPT_ROUNDS", "12"))
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=BCRYPT_ROUNDS,
)

JWT_SECRET = get_env("JWT_SECRET", "")
if not JWT_SECRET:
    if is_production():
        raise RuntimeError("JWT_SECRET is required in production. Set it in Azure App Settings.")
    JWT_SECRET = "dev-only-change-me"
    logger.warning("JWT_SECRET not set. Using dev-only secret (NOT SAFE FOR PRODUCTION).")

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(get_env("JWT_EXPIRATION_HOURS", "24"))
security = HTTPBearer()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    db = get_db(request)
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
# Email (Resend)
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
# Models (include all used types)
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
    email: str = "unknown"  # sent | disabled | failed

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
# Routes
# =========================================================
@api_router.get("/")
async def api_root():
    return {"message": "Primary Care Services API"}

@api_router.get("/health")
async def health(request: Request):
    db = get_db(request)
    db_ok = await db_ping(db)
    return {
        "status": "ok",
        "time": datetime.now(timezone.utc).isoformat(),
        "env": get_env("ENV", "unknown"),
        "db_ok": db_ok,
        "email_enabled": EMAIL_ENABLED,
    }

@api_router.get("/health/db")
async def health_db(request: Request):
    db = get_db(request)
    ok = await db_ping(db)
    if not ok:
        raise HTTPException(status_code=503, detail="Database unreachable")
    return {"status": "ok", "db": "reachable", "time": datetime.now(timezone.utc).isoformat()}

# --- Auth ---
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate, request: Request):
    db = get_db(request)
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    doc = {
        "user_id": user_id,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "password_hash": hash_password(user_data.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)

    token = create_access_token({"sub": user_id})
    return TokenResponse(
        access_token=token,
        user=User(user_id=user_id, email=doc["email"], full_name=doc["full_name"], created_at=doc["created_at"]),
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin, request: Request):
    db = get_db(request)
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user["user_id"]})
    return TokenResponse(
        access_token=token,
        user=User(user_id=user["user_id"], email=user["email"], full_name=user["full_name"], created_at=user["created_at"]),
    )

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    return User(**current_user)

# --- Providers ---
@api_router.get("/providers", response_model=List[Provider])
async def get_providers(request: Request):
    db = get_db(request)
    return await db.providers.find({}, {"_id": 0}).to_list(100)

@api_router.get("/providers/{provider_id}", response_model=Provider)
async def get_provider(provider_id: str, request: Request):
    db = get_db(request)
    provider = await db.providers.find_one({"provider_id": provider_id}, {"_id": 0})
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider

@api_router.post("/providers", response_model=Provider)
async def create_provider(provider_data: ProviderCreate, request: Request, current_user: dict = Depends(get_current_user)):
    db = get_db(request)
    provider_id = str(uuid.uuid4())
    doc = provider_data.model_dump()
    doc["provider_id"] = provider_id
    await db.providers.insert_one(doc)
    return Provider(provider_id=provider_id, **provider_data.model_dump())

# --- Services ---
@api_router.get("/services", response_model=List[Service])
async def get_services(request: Request):
    db = get_db(request)
    return await db.services.find({}, {"_id": 0}).to_list(100)

@api_router.get("/services/{service_id}", response_model=Service)
async def get_service(service_id: str, request: Request):
    db = get_db(request)
    doc = await db.services.find_one({"service_id": service_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Service not found")
    return doc

@api_router.post("/services", response_model=Service)
async def create_service(service_data: ServiceCreate, request: Request, current_user: dict = Depends(get_current_user)):
    db = get_db(request)
    service_id = str(uuid.uuid4())
    doc = service_data.model_dump()
    doc["service_id"] = service_id
    await db.services.insert_one(doc)
    return Service(service_id=service_id, **service_data.model_dump())

# --- Locations ---
@api_router.get("/locations", response_model=List[Location])
async def get_locations(request: Request):
    db = get_db(request)
    return await db.locations.find({}, {"_id": 0}).to_list(100)

@api_router.get("/locations/{location_id}", response_model=Location)
async def get_location(location_id: str, request: Request):
    db = get_db(request)
    doc = await db.locations.find_one({"location_id": location_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Location not found")
    return doc

@api_router.post("/locations", response_model=Location)
async def create_location(location_data: LocationCreate, request: Request, current_user: dict = Depends(get_current_user)):
    db = get_db(request)
    location_id = str(uuid.uuid4())
    doc = location_data.model_dump()
    doc["location_id"] = location_id
    await db.locations.insert_one(doc)
    return Location(location_id=location_id, **location_data.model_dump())

# --- Resources ---
@api_router.get("/resources", response_model=List[PatientResource])
async def get_resources(request: Request):
    db = get_db(request)
    return await db.resources.find({}, {"_id": 0}).to_list(100)

@api_router.post("/resources", response_model=PatientResource)
async def create_resource(resource_data: PatientResourceCreate, request: Request, current_user: dict = Depends(get_current_user)):
    db = get_db(request)
    resource_id = str(uuid.uuid4())
    doc = resource_data.model_dump()
    doc["resource_id"] = resource_id
    await db.resources.insert_one(doc)
    return PatientResource(resource_id=resource_id, **resource_data.model_dump())

# --- Contact ---
@api_router.post("/contact", response_model=ContactFormResponse)
async def submit_contact_form(form_data: ContactFormSubmit, request: Request):
    db = get_db(request)

    contact_doc = form_data.model_dump()
    contact_doc["contact_id"] = str(uuid.uuid4())
    contact_doc["submitted_at"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(contact_doc)

    email_status = "disabled"
    if EMAIL_ENABLED:
        html_content = f"""
        <html><body style="font-family: Arial, sans-serif;">
          <h2>New Contact Form Submission</h2>
          <p><b>Name:</b> {form_data.name}</p>
          <p><b>Email:</b> {form_data.email}</p>
          <p><b>Phone:</b> {form_data.phone}</p>
          <p><b>Subject:</b> {form_data.subject}</p>
          <p><b>Message:</b></p>
          <p>{form_data.message}</p>
        </body></html>
        """
        params = {
            "from": SENDER_EMAIL,
            "to": [CONTACT_TO_EMAIL],
            "subject": f"Contact Form: {form_data.subject}",
            "html": html_content,
            "reply_to": str(form_data.email),
        }
        try:
            await asyncio.to_thread(resend.Emails.send, params)
            email_status = "sent"
        except Exception as e:
            logger.error("Email send failed: %s", str(e))
            email_status = "failed"

    return ContactFormResponse(
        status="success",
        message="Thank you for contacting us. We will respond within 24-48 hours.",
        email=email_status,
    )

# =========================================================
# CORS
# =========================================================
def parse_cors_origins(value: str) -> List[str]:
    if not value or value.strip() == "":
        return ["*"]
    v = value.strip()
    if v == "*":
        return ["*"]
    return [o.strip() for o in v.split(",") if o.strip()]

cors_origins = parse_cors_origins(get_env("CORS_ORIGINS", "*"))
allow_all = (len(cors_origins) == 1 and cors_origins[0] == "*")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False if allow_all else True,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Finally include router (only once, after routes are defined)
app.include_router(api_router)


