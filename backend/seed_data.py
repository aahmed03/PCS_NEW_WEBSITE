import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent

# ✅ Load .env reliably even if script is launched from another folder
load_dotenv(dotenv_path=ROOT_DIR / ".env")

mongo_url = os.environ.get("MONGO_URL")
db_name = os.environ.get("DB_NAME")

if not mongo_url:
    raise RuntimeError("Missing MONGO_URL in backend/.env (or env vars).")
if not db_name:
    raise RuntimeError("Missing DB_NAME in backend/.env (or env vars).")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]


async def seed_database():
    print("Seeding database...")
    print(f"✅ Target Mongo: {mongo_url}")
    print(f"✅ Target DB:    {db_name}")

    # ✅ Clear existing data (this is what "refresh seed data" means)
    await db.providers.delete_many({})
    await db.services.delete_many({})
    await db.locations.delete_many({})
    await db.resources.delete_many({})
    await db.users.delete_many({})
    await db.contacts.delete_many({})

    # -------- Providers --------
    providers = [
        {
            "provider_id": "provider-001",
            "name": "Iram Ahmed, MD",
            "credentials": "Board Certified Internist",
            "specialty": "Internal Medicine",
            "bio": (
                "Iram Ahmed, MD is a board-certified internal medicine physician with extensive experience "
                "in both hospital-based and outpatient care. She completed her internal medicine residency "
                "at Resurrection Westlake Hospital.\n\n"
                "Dr. Ahmed has served as both a hospitalist and a primary care physician, allowing her to bring "
                "a comprehensive and coordinated approach to patient care.\n\n"
                "She has a special interest in geriatric medicine, with a dedicated focus on optimizing quality "
                "of life and managing complex medical conditions.\n\n"
                "Dr. Ahmed is fluent in Hindi and Urdu.\n\n"
                "In recognition of her commitment to excellence in medicine, Dr. Ahmed was selected by the "
                "Consumer Research Council of America as one of America's Top Physicians."
            ),
            # ✅ IMPORTANT: if you serve provider images from React, store a URL the frontend can load
            # For local dev, easiest: keep external URLs (or set up static hosting in backend).
            "photo_url": "/images/provider/Ahmed.jpg",
            "languages": ["English", "Hindi", "Urdu"],
            "locations": ["Lombard Office", "Glendale Heights Office"],
            "accepting_patients": True,
        },
        {
            "provider_id": "provider-002",
            "name": "Caseylin Cheng, PA-C",
            "credentials": "Board Certified Physician Assistant",
            "specialty": "Internal Medicine",
            # ✅ FIX: use a normal Python string (or implicit string concatenation) to avoid triple-quote issues
            "bio": (
                "Caseylin Cheng, PA-C is a board-certified Physician Assistant specializing in Internal Medicine. "
                "She completed her Physician Assistant training at Midwestern University, where she developed a strong "
                "foundation in comprehensive and evidence-based patient care.\n\n"
                "Caseylin takes a holistic approach to internal medicine, focusing on the overall well-being of each patient. "
                "She is dedicated to building long-term, trusting relationships with patients and their families, emphasizing "
                "compassionate care, preventive health, and continuity of treatment."
            ),
            "languages": ["English", "Mandarin"],
            "locations": ["Lombard Office"],
            # ✅ FIX: React public folder path should be "/images/..." (NOT "/public/images/...")
            # Put the file here: frontend/public/images/provider/Casey.jpg
            "photo_url": "/images/provider/Casey.jpg",
            "accepting_patients": True,
        },

        # {
        #     "provider_id": "provider-003",
        #     "name": "Dr. Emily Rodriguez",
        #     "credentials": "MD, FAAFP",
        #     "specialty": "Family Practice",
        #     "bio": "Dr. Rodriguez is dedicated to providing comprehensive care for the entire family.",
        #     "languages": ["English", "Spanish"],
        #     "locations": ["Glendale Heights Office"],
        #     "photo_url": "https://images.pexels.com/photos/8376272/pexels-photo-8376272.jpeg",
        #     "accepting_patients": True,
        # },
    ]
    await db.providers.insert_many(providers)

    # -------- Services --------
    services = [
        {
            "service_id": "service-001",
            "title": "Primary Care",
            "description": "Primary care for common illnesses, annual exams, and follow-ups.",
            "icon": "Stethoscope",
            "category": "General",
        },
        {
            "service_id": "service-002",
            "title": "Internal Medicine",
            "description": "Specialized adult care for acute and chronic conditions.",
            "icon": "Heart",
            "category": "Specialty",
        },
        {
            "service_id": "service-003",
            "title": "Diabetes Screening & Management",
            "description": "Screening and ongoing diabetes management with lifestyle support.",
            "icon": "Activity",
            "category": "Screening",
        },
        {
            "service_id": "service-004",
            "title": "Annual Wellness Programs",
            "description": "Wellness visits, screenings, and preventive planning.",
            "icon": "CheckCircle",
            "category": "Preventive",
        },
        {
            "service_id": "service-005",
            "title": "Heart Disease Management",
            "description": "Cardiovascular prevention and management.",
            "icon": "HeartPulse",
            "category": "Specialty",
        },
        {
            "service_id": "service-006",
            "title": "Asthma Care",
            "description": "Asthma and respiratory management.",
            "icon": "Wind",
            "category": "Specialty",
        },
        {
            "service_id": "service-007",
            "title": "Vaccinations & Immunizations",
            "description": "Routine immunizations and seasonal vaccines.",
            "icon": "Syringe",
            "category": "Preventive",
        },
        {
            "service_id": "service-008",
            "title": "Flu Shots",
            "description": "Annual flu vaccination services.",
            "icon": "Shield",
            "category": "Preventive",
        },
    ]
    await db.services.insert_many(services)

    # -------- Locations --------
    locations = [
        {
            "location_id": "location-001",
            "name": "Lombard Office",
            "address": "2500 S. Highland Ave., Suite 230",
            "city": "Lombard",
            "state": "IL",
            "zip_code": "60148",
            "phone": "(630) 429-9000",
            "fax": "(630) 429-9060",
            "hours": {
                "Monday": "9:00 AM - 5:00 PM",
                "Tuesday": "9:00 AM - 5:00 PM",
                "Wednesday": "9:00 AM - 5:00 PM",
                "Thursday": "9:00 AM - 5:00 PM",
                "Friday": "9:00 AM - 5:00 PM",
                "Saturday": "9:00 AM - 1:00 PM",
                "Sunday": "Closed",
            },
            "map_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2972.7!2d-88.007!3d41.849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1",
        },
        {
            "location_id": "location-002",
            "name": "Glendale Heights Office",
            "address": "701 N. Winthrop Ave.",
            "city": "Glendale Heights",
            "state": "IL",
            "zip_code": "60139",
            "phone": "(630) 429-9000",
            "fax": "(630) 429-9060",
            "hours": {
                "Monday": "Closed",
                "Tuesday": "11:00 AM - 5:00 PM",
                "Wednesday": "Closed",
                "Thursday": "11:00 AM - 5:00 PM",
                "Friday": "Closed",
                "Saturday": "Closed",
                "Sunday": "Closed",
            },
            "map_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2971.1!2d-88.064!3d41.918!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1",
        },
    ]
    await db.locations.insert_many(locations)

    # -------- Resources --------
    resources = [
        {
            "resource_id": "resource-001",
            "title": "New Patient Registration Form",
            "description": "Download and complete before your first visit.",
            "file_url": "/downloads/new-patient-registration.pdf",
            "category": "forms",
        },
        {
            "resource_id": "resource-002",
            "title": "HIPAA Authorization Form",
            "description": "Authorization for release of protected health information.",
            "file_url": "/downloads/hipaa-authorization.pdf",
            "category": "forms",
        },
        {
            "resource_id": "resource-003",
            "title": "Notice of Privacy Practices",
            "description": "How your health info may be used and disclosed.",
            "file_url": "/downloads/privacy-practices.pdf",
            "category": "privacy",
        },
        {
            "resource_id": "resource-004",
            "title": "Annual Wellness Checklist",
            "description": "Checklist to prepare for your annual wellness visit.",
            "file_url": "/downloads/wellness-checklist.pdf",
            "category": "wellness",
        },
        {
            "resource_id": "resource-005",
            "title": "Insurance Information Guide",
            "description": "Accepted plans and billing procedures.",
            "file_url": "/downloads/insurance-guide.pdf",
            "category": "insurance",
        },
    ]
    await db.resources.insert_many(resources)

    # ✅ Print counts so we KNOW seed is in the DB your API will read
    providers_count = await db.providers.count_documents({})
    services_count  = await db.services.count_documents({})
    locations_count = await db.locations.count_documents({})
    resources_count = await db.resources.count_documents({})

    print("✅ Seed complete. Counts:")
    print(f"  providers: {providers_count}")
    print(f"  services:  {services_count}")
    print(f"  locations: {locations_count}")
    print(f"  resources: {resources_count}")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
