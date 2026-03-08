import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer

from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr

import jwt
import resend
import httpx
from passlib.context import CryptContext


# ============================================================
# Load .env for LOCAL development
# Azure uses App Settings
# ============================================================

ROOT = Path(__file__).resolve().parent
env_file = ROOT / ".env"

if env_file.exists():
    load_dotenv(env_file)


# ============================================================
# Logging
# ============================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger("pcs-api")


# ============================================================
# Environment helper
# ============================================================

def get_env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


# ============================================================
# FastAPI
# ============================================================

app = FastAPI(title="Primary Care Services API")

api = APIRouter(prefix="/api")

app.state.mongo_client = None
app.state.db = None
app.state.db_error = None


# ============================================================
# CORS
# ============================================================

CORS_ORIGINS = get_env("CORS_ORIGINS", "")

origins = (
    [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]
    if CORS_ORIGINS
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)


# ============================================================
# MongoDB
# ============================================================

MONGO_URL = get_env("MONGO_URL")
DB_NAME = get_env("DB_NAME")


@app.on_event("startup")
async def mongo_startup():

    if not MONGO_URL:
        app.state.db_error = "Missing MONGO_URL"
        logger.error(app.state.db_error)
        return

    if not DB_NAME:
        app.state.db_error = "Missing DB_NAME"
        logger.error(app.state.db_error)
        return

    try:
        client = AsyncIOMotorClient(
            MONGO_URL,
            maxPoolSize=5,
            minPoolSize=1,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=10000,
            appname="pcs-api",
        )

        db = client[DB_NAME]

        await db.command("ping")

        app.state.mongo_client = client
        app.state.db = db
        app.state.db_error = None

        logger.info(f"MongoDB connected → DB={DB_NAME}")

    except Exception as e:
        app.state.mongo_client = None
        app.state.db = None
        app.state.db_error = str(e)
        logger.exception("MongoDB connection failed")


@app.on_event("shutdown")
async def mongo_shutdown():

    client = getattr(app.state, "mongo_client", None)

    if client:
        client.close()
        logger.info("MongoDB connection closed")


def get_db(request: Request):

    db = getattr(request.app.state, "db", None)

    if db is None:
        error = getattr(request.app.state, "db_error", None)

        raise HTTPException(
            status_code=503,
            detail=error or "Database not available"
        )

    return db


# ============================================================
# JWT Authentication
# ============================================================

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = get_env("JWT_SECRET", "dev-secret")
JWT_ALGO = "HS256"

security = HTTPBearer(auto_error=False)


def create_token(payload: dict) -> str:

    payload = payload.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(days=1)

    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def verify_password(password: str, hash_value: str) -> bool:
    return pwd_context.verify(password, hash_value)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# ============================================================
# Email (Resend)
# ============================================================

RESEND_API_KEY = get_env("RESEND_API_KEY")

SENDER_EMAIL = get_env(
    "SENDER_EMAIL",
    "no-reply@resend.my-primarycare.com"
)

CONTACT_TO_EMAIL = get_env(
    "CONTACT_TO_EMAIL",
    "info@my-primarycare.com"
)

EMAIL_ENABLED = bool(RESEND_API_KEY)

if EMAIL_ENABLED:
    resend.api_key = RESEND_API_KEY
    logger.info("Resend email enabled")
else:
    logger.warning("Email disabled (missing RESEND_API_KEY)")


# ============================================================
# reCAPTCHA
# ============================================================

RECAPTCHA_SECRET = get_env("RECAPTCHA_SECRET")
APP_ENV = get_env("ENV", "development").lower()


async def verify_recaptcha(token: str, ip: str) -> bool:
    """
    Skip verification locally.
    Enforce verification in production.
    """

    # ------------------------------------------------
    # Skip reCAPTCHA for local development
    # ------------------------------------------------
    if ip in ("127.0.0.1", "localhost", "::1"):
        logger.info("reCAPTCHA skipped for localhost")
        return True

    if APP_ENV == "development":
        logger.info("reCAPTCHA skipped (development env)")
        return True

    # ------------------------------------------------
    # Production verification
    # ------------------------------------------------
    if not RECAPTCHA_SECRET:
        logger.warning("RECAPTCHA_SECRET missing — skipping verification")
        return True

    if not token:
        logger.warning("reCAPTCHA token missing")
        return False

    try:

        async with httpx.AsyncClient(timeout=8) as client:

            resp = await client.post(
                "https://www.google.com/recaptcha/api/siteverify",
                data={
                    "secret": RECAPTCHA_SECRET,
                    "response": token,
                    "remoteip": ip,
                },
            )

        data = resp.json()

        logger.info(f"reCAPTCHA response = {data}")

        if not data.get("success"):
            return False

        score = float(data.get("score", 0))

        return score >= 0.3

    except Exception:
        logger.exception("reCAPTCHA verification failed")
        return False


# ============================================================
# Rate limiting
# ============================================================

RATE_LIMIT = {}
RATE_WINDOW = 60
RATE_MAX = 3


def rate_limit(ip: str) -> bool:

    now = datetime.utcnow().timestamp()

    hits = [t for t in RATE_LIMIT.get(ip, []) if now - t < RATE_WINDOW]

    if len(hits) >= RATE_MAX:
        return False

    hits.append(now)
    RATE_LIMIT[ip] = hits

    return True


# ============================================================
# Models
# ============================================================

class ContactForm(BaseModel):

    name: str
    email: EmailStr
    phone: str
    subject: str
    message: str

    recaptcha_token: Optional[str] = ""
    website: Optional[str] = ""


# ============================================================
# Root
# ============================================================

@app.get("/")
async def root():
    return {"message": "Primary Care Services API is running"}


# ============================================================
# Contact Form
# ============================================================


@api.post("/contact")
async def contact(request: Request, form: ContactForm):

    ip = request.client.host or ""

    # Honeypot trap
    if form.website:
        return {"status": "ok"}

    # Rate limit
    if not rate_limit(ip):
        raise HTTPException(429, "Too many requests")

    # ------------------------------------------------
    # Skip reCAPTCHA completely for localhost
    # ------------------------------------------------
    if ip not in ("127.0.0.1", "localhost", "::1"):
        if not await verify_recaptcha(form.recaptcha_token, ip):
            raise HTTPException(400, "reCAPTCHA failed")

    db = getattr(request.app.state, "db", None)

    if db:
        await db.contacts.insert_one({
            "contact_id": str(uuid.uuid4()),
            "name": form.name,
            "email": form.email,
            "phone": form.phone,
            "subject": form.subject,
            "message": form.message,
            "submitted_at": datetime.utcnow().isoformat(),
            "ip": ip,
        })

    # Send email notification (if enabled)
    if EMAIL_ENABLED:
        try:
            resend.Emails.send({
                "from": SENDER_EMAIL,
                "to": CONTACT_TO_EMAIL,
                "reply_to": form.email,
                "subject": f"Website Contact Form: {form.subject}",
                "html": f"""
                <h2>New Contact Form Submission</h2>
                <p><b>Name:</b> {form.name}</p>
                <p><b>Email:</b> {form.email}</p>
                <p><b>Phone:</b> {form.phone}</p>
                <p><b>Subject:</b> {form.subject}</p>
                <p><b>Message:</b></p>
                <p>{form.message}</p>
                <hr>
                <p>Submitted at: {datetime.utcnow().isoformat()}</p>
                <p>IP Address: {ip}</p>
                """
            })

            logger.info("Contact email sent")

        except Exception:
            logger.exception("Contact email failed")

    return {"status": "ok"}

# ============================================================
# Providers
# ============================================================

@api.get("/providers")
async def providers(request: Request):

    db = get_db(request)

    rows = await db.providers.find().to_list(500)

    for r in rows:
        r.pop("_id", None)

    return {
        "count": len(rows),
        "items": rows
    }


# ============================================================
# Provider Detail
# ============================================================

@api.get("/providers/{provider_id}")
async def provider_detail(provider_id: str, request: Request):

    db = get_db(request)

    provider_id = provider_id.strip()

    provider = await db.providers.find_one({
        "provider_id": {"$regex": f"^{provider_id}$", "$options": "i"}
    })

    if not provider:
        raise HTTPException(404, "Provider not found")

    provider.pop("_id", None)

    return provider


# ============================================================
# Services
# ============================================================

@api.get("/services")
async def services(request: Request):

    db = get_db(request)

    rows = await db.services.find().to_list(500)

    for r in rows:
        r.pop("_id", None)

    return {
        "count": len(rows),
        "items": rows
    }


# ============================================================
# Locations
# ============================================================

@api.get("/locations")
async def locations(request: Request):

    db = get_db(request)

    rows = await db.locations.find().to_list(500)

    for r in rows:
        r.pop("_id", None)

    return {
        "count": len(rows),
        "items": rows
    }


# ============================================================
# Health
# ============================================================

@api.get("/health")
async def health(request: Request):

    db = getattr(request.app.state, "db", None)

    db_ok = False
    db_error = getattr(request.app.state, "db_error", None)

    if db:
        try:
            await db.command("ping")
            db_ok = True
        except Exception as e:
            db_error = str(e)

    return {
        "status": "ok",
        "db": db_ok,
        "db_error": db_error,
        "time": datetime.utcnow().isoformat(),
        "env": APP_ENV,
    }


# ============================================================
# Router
# ============================================================

app.include_router(api)











