import os
import uuid
import logging
from html import escape
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional, Any

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
# Azure uses App Settings / Key Vault in production
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
# Environment helpers
# ============================================================

def get_env(name: str, default: str = "") -> str:
    value = os.environ.get(name, default)
    return str(value).strip()


def get_first_env(*names: str, default: str = "") -> str:
    for name in names:
        value = get_env(name, "")
        if value:
            return value
    return default


# ============================================================
# FastAPI
# ============================================================

app = FastAPI(title="Primary Care Services API")

api = APIRouter(prefix="/api")

app.state.mongo_client = None
app.state.db = None
app.state.db_error = None
app.state.http_client = None


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
# MongoDB / CosmosDB (Mongo API)
# Supports both MONGO_URL and MONGO_URI
# ============================================================

MONGO_URL = get_first_env("MONGO_URL", "MONGO_URI")
DB_NAME = get_first_env("DB_NAME", "MONGO_DB_NAME")
APP_ENV = get_env("ENV", "development").lower()


def sanitize_doc(doc: dict[str, Any]) -> dict[str, Any]:
    doc.pop("_id", None)
    return doc


async def ensure_db_available(request: Request):
    """
    FIX:
    Centralized DB availability check.
    This is more production-safe because it:
    - returns a clean 503 if startup DB connection failed
    - protects endpoints from raw timeout tracebacks
    """
    db = getattr(request.app.state, "db", None)
    if db is None:
        error = getattr(request.app.state, "db_error", None)
        raise HTTPException(
            status_code=503,
            detail=error or "Database not available"
        )
    return db


@app.on_event("startup")
async def startup_event():
    """
    Application startup:
    - Initialize reusable HTTP client
    - Initialize Mongo / Cosmos DB connection
    """

    app.state.http_client = httpx.AsyncClient(timeout=8)

    if not MONGO_URL:
        app.state.db_error = "Missing MONGO_URL / MONGO_URI"
        logger.error(app.state.db_error)
        return

    if not DB_NAME:
        app.state.db_error = "Missing DB_NAME"
        logger.error(app.state.db_error)
        return

    try:
        # ----------------------------------------------------
        # FIX:
        # Tuned for Azure App Service + CosmosDB Mongo API.
        # Increased pool + timeouts for better production stability.
        # ----------------------------------------------------
        client = AsyncIOMotorClient(
            MONGO_URL,
            appname="pcs-api",
            maxPoolSize=50,
            minPoolSize=5,
            maxIdleTimeMS=120000,
            serverSelectionTimeoutMS=30000,
            connectTimeoutMS=20000,
            socketTimeoutMS=30000,
            retryWrites=False,   # CosmosDB Mongo API commonly prefers this disabled
            tls=True,            # Cosmos requires TLS
        )

        db = client[DB_NAME]

        # Warm the connection on startup
        await client.admin.command("ping")

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
async def shutdown_event():
    """
    Cleanly close shared clients.
    """

    http_client = getattr(app.state, "http_client", None)
    if http_client:
        await http_client.aclose()
        logger.info("HTTP client closed")

    mongo_client = getattr(app.state, "mongo_client", None)
    if mongo_client:
        mongo_client.close()
        logger.info("MongoDB connection closed")


# ============================================================
# JWT Authentication helpers
# (kept here in case you re-enable auth routes later)
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


async def verify_recaptcha(token: str, ip: str, request: Request) -> bool:
    """
    Skip verification locally.
    Enforce verification in production.
    """

    # --------------------------------------------
    # Skip for localhost / local dev
    # --------------------------------------------
    if ip in ("127.0.0.1", "localhost", "::1"):
        logger.info("reCAPTCHA skipped for localhost")
        return True

    if APP_ENV == "development":
        logger.info("reCAPTCHA skipped (development env)")
        return True

    # --------------------------------------------
    # Production verification
    # --------------------------------------------
    if not RECAPTCHA_SECRET:
        logger.warning("RECAPTCHA_SECRET missing — skipping verification")
        return True

    if not token:
        logger.warning("reCAPTCHA token missing")
        return False

    try:
        http_client: httpx.AsyncClient = request.app.state.http_client

        resp = await http_client.post(
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

RATE_LIMIT: dict[str, list[float]] = {}
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

    # Skip reCAPTCHA on localhost only
    if ip not in ("127.0.0.1", "localhost", "::1"):
        if not await verify_recaptcha(form.recaptcha_token, ip, request):
            raise HTTPException(400, "reCAPTCHA failed")

    # --------------------------------------------------------
    # FIX:
    # Database insert is now fully isolated from email sending.
    # Even if DB insert fails, email will still be attempted.
    # --------------------------------------------------------
    db = getattr(request.app.state, "db", None)

    if db is not None:
        try:
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
            logger.info("Contact form saved to database")
        except Exception:
            logger.exception("Failed to save contact form to database")

    # --------------------------------------------------------
    # FIX:
    # Email sending is independent of DB success/failure.
    # --------------------------------------------------------
    email_sent = False

    if EMAIL_ENABLED:
        try:
            resend.Emails.send({
                "from": SENDER_EMAIL,
                "to": CONTACT_TO_EMAIL,
                "reply_to": form.email,
                "subject": f"Website Contact Form: {form.subject}",
                "html": f"""
                <h2>New Contact Form Submission</h2>
                <p><b>Name:</b> {escape(form.name)}</p>
                <p><b>Email:</b> {escape(form.email)}</p>
                <p><b>Phone:</b> {escape(form.phone)}</p>
                <p><b>Subject:</b> {escape(form.subject)}</p>
                <p><b>Message:</b></p>
                <p>{escape(form.message).replace(chr(10), "<br>")}</p>
                <hr>
                <p>Submitted at: {datetime.utcnow().isoformat()}</p>
                <p>IP Address: {escape(ip)}</p>
                """
            })
            email_sent = True
            logger.info(f"Contact email sent → from {form.email} subject '{form.subject}'")

        except Exception:
            logger.exception("Contact email failed")
    else:
        logger.warning("Contact email skipped because email is disabled")

    return {
        "status": "ok",
        "email_sent": email_sent,
    }


# ============================================================
# Providers
# ============================================================

@api.get("/providers")
async def providers(request: Request):
    db = await ensure_db_available(request)

    try:
        rows = await db.providers.find().to_list(500)
        rows = [sanitize_doc(r) for r in rows]

        return {
            "count": len(rows),
            "items": rows
        }
    except Exception:
        logger.exception("Failed to load providers")
        raise HTTPException(503, "Unable to load providers at this time")


# ============================================================
# Provider Detail
# ============================================================

@api.get("/providers/{provider_id}")
async def provider_detail(provider_id: str, request: Request):
    db = await ensure_db_available(request)

    provider_id = provider_id.strip()

    try:
        provider = await db.providers.find_one({
            "provider_id": {"$regex": f"^{provider_id}$", "$options": "i"}
        })

        if not provider:
            raise HTTPException(404, "Provider not found")

        return sanitize_doc(provider)

    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to load provider detail")
        raise HTTPException(503, "Unable to load provider at this time")


# ============================================================
# Services
# ============================================================

@api.get("/services")
async def services(request: Request):
    db = await ensure_db_available(request)

    try:
        rows = await db.services.find().to_list(500)
        rows = [sanitize_doc(r) for r in rows]

        return {
            "count": len(rows),
            "items": rows
        }
    except Exception:
        logger.exception("Failed to load services")
        raise HTTPException(503, "Unable to load services at this time")


# ============================================================
# Locations
# ============================================================

@api.get("/locations")
async def locations(request: Request):
    db = await ensure_db_available(request)

    try:
        rows = await db.locations.find().to_list(500)
        rows = [sanitize_doc(r) for r in rows]

        return {
            "count": len(rows),
            "items": rows
        }
    except Exception:
        logger.exception("Failed to load locations")
        raise HTTPException(503, "Unable to load locations at this time")


# ============================================================
# Health
# Never crash here. Always return JSON.
# ============================================================

@api.get("/health")
async def health(request: Request):
    mongo_client = getattr(request.app.state, "mongo_client", None)
    db_ok = False
    db_error = getattr(request.app.state, "db_error", None)

    try:
        if mongo_client is not None:
            await mongo_client.admin.command("ping")
            db_ok = True
            db_error = None
    except Exception as e:
        db_ok = False
        db_error = str(e)
        logger.warning(f"Health check DB ping failed: {db_error}")

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











