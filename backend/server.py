import os
import uuid
import logging
import asyncio
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from passlib.context import CryptContext
import resend


# =========================================================
# Load .env for local only (App Service env vars override)
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

# Silence very noisy Azure SDK HTTP logging (causes slowness)
logging.getLogger("azure.core.pipeline.policies.http_logging_policy").setLevel(logging.WARNING)
logging.getLogger("azure.monitor.opentelemetry.exporter").setLevel(logging.WARNING)
logging.getLogger("azure.core").setLevel(logging.WARNING)


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


# IMPORTANT for Azure: fast root path (no auth, no db)
@app.get("/")
async def root():
    return {"status": "ok", "service": "pcs-api"}


# =========================================================
# Mongo (lazy init on startup)
# =========================================================
MONGO_URL = require_env("MONGO_URL")
DB_NAME = require_env("DB_NAME")
MONGO_TIMEOUT_MS = int(get_env("MONGO_TIMEOUT_MS", "5000"))


@app.on_event("startup")
async def startup_mongo():
    # Create client on startup (per worker)
    app.state.mongo_client = AsyncIOMotorClient(
        MONGO_URL,
        serverSelectionTimeoutMS=MONGO_TIMEOUT_MS,
        connectTimeoutMS=MONGO_TIMEOUT_MS,
        socketTimeoutMS=MONGO_TIMEOUT_MS,
        tz_aware=True,
    )
    app.state.db = app.state.mongo_client[DB_NAME]

    # Quick ping so we know immediately if connectivity is broken
    try:
        await app.state.db.command("ping")
        logger.info("Mongo initialized. DB=%s | timeout_ms=%s", DB_NAME, MONGO_TIMEOUT_MS)
    except Exception as e:
        # Don't crash the app; health will show db_ok=false
        logger.error("Mongo ping failed on startup: %s", str(e))


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


# =========================================================
# Auth / JWT
# =========================================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = get_env("JWT_SECRET", "")
if not JWT_SECRET:
    if is_production():
        raise RuntimeError("JWT_SECRET is required in production. Set it in Azure App Settings.")
    JWT_SECRET = "dev-only-change-me"
    logger.warning("JWT_SECRET not set. Using dev-only secret (NOT SAFE FOR PRODUCTION).")

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(get_env("JWT_EXPIRATION_HOURS", "24"))

security = HTTPBearer()


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    exp = datetime.now(timezone.utc).timestamp() + (JWT_EXPIRATION_HOURS * 3600)
    to_encode.update({"exp": int(exp)})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")

        db = get_db(request)
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
# Models
# =========================================================
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


# =========================================================
# API Routes
# =========================================================
@api_router.get("/")
async def api_root():
    return {"message": "Primary Care Services API"}


@api_router.get("/health")
async def health(request: Request):
    db_ok = False
    try:
        db = get_db(request)
        await db.command("ping")
        db_ok = True
    except Exception as e:
        logger.warning("DB ping failed: %s", str(e))

    return {
        "status": "ok",
        "time": datetime.now(timezone.utc).isoformat(),
        "env": get_env("ENV", "unknown"),
        "db_ok": db_ok,
        "email_enabled": EMAIL_ENABLED,
    }


# =========================================================
# ✅ Content endpoints used by the frontend
# =========================================================
async def _find_many(
    db,
    collection: str,
    query: Optional[Dict[str, Any]] = None,
    limit: int = 500,
) -> List[Dict[str, Any]]:
    q = query or {}
    try:
        docs = await db[collection].find(q).to_list(length=limit)
    except Exception as e:
        logger.error("Query failed for collection '%s': %s", collection, str(e))
        return []

    for d in docs:
        d.pop("_id", None)  # remove Mongo ObjectId for JSON safety
    return docs


@api_router.get("/providers")
async def get_providers(request: Request):
    db = get_db(request)
    return await _find_many(db, "providers")


@api_router.get("/services")
async def get_services(request: Request):
    db = get_db(request)
    return await _find_many(db, "services")


@api_router.get("/locations")
async def get_locations(request: Request):
    db = get_db(request)
    return await _find_many(db, "locations")


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


# ✅ Make sure this is AFTER all @api_router.get/post declarations
app.include_router(api_router)

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




