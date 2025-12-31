# Primary Care Services Website

A modern, production-ready website for Primary Care Services, S.C. serving Lombard and Glendale Heights, IL.

## Built With

- **Frontend**: React + Tailwind CSS + Framer Motion
- **Backend**: FastAPI (Python) + MongoDB
- **Design**: Warm & Welcoming theme (Sage Green + Terracotta + Cream)
- **Typography**: Manrope (headings) + Public Sans (body)
- **Authentication**: JWT-based
- **Email**: Resend integration

## Features

✅ **Complete Pages**:
- Home - Hero section, Why Choose Us, Services overview, Providers spotlight, Locations preview
- Providers - Directory with individual profile pages
- Services - Categorized service listings
- Preventive Care - Wellness programs, screenings, immunizations
- Locations - Two clinic locations with embedded maps
- Patient Portal - Gateway to EPIC MyChart
- Login/Register - JWT authentication
- Contact - Contact form with Resend email integration
- Patient Resources - Downloadable forms and FAQs

✅ **Key Features**:
- WCAG 2.2 AA accessibility compliant
- Mobile-first responsive design
- Framer Motion animations
- SEO optimized with React Helmet
- JWT authentication system
- Secure contact form with email notifications
- 24/7 patient portal access
- Same-day appointment scheduling links

## Setup Instructions

### 1. Email Integration (Contact Form)

To enable the contact form email functionality:

1. Sign up at https://resend.com
2. Create an API key from the dashboard
3. Add to `/app/backend/.env`:
   ```
   RESEND_API_KEY=re_your_api_key_here
   SENDER_EMAIL=your-verified-email@yourdomain.com
   ```
4. Restart backend: `sudo supervisorctl restart backend`

**Note**: In development/testing mode, emails only go to verified email addresses. For production, verify your domain with Resend.

### 2. Database

The database is pre-seeded with:
- 3 providers (Dr. Sarah Johnson, Dr. Michael Chen, Dr. Emily Rodriguez)
- 8 services (Primary Care, Internal Medicine, Diabetes Screening, etc.)
- 2 locations (Lombard & Glendale Heights offices)
- 5 patient resources

To re-seed the database:
```bash
cd /app/backend && python seed_data.py
```

### 3. Environment Variables

**Backend** (`/app/backend/.env`):
- `MONGO_URL` - MongoDB connection (pre-configured)
- `DB_NAME` - Database name (pre-configured)
- `JWT_SECRET` - JWT token secret
- `RESEND_API_KEY` - Resend email API key (add yours)
- `SENDER_EMAIL` - Verified sender email

**Frontend** (`/app/frontend/.env`):
- `REACT_APP_BACKEND_URL` - Backend API URL (pre-configured)

## Testing

### Backend API Test:
```bash
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
curl "$API_URL/api/"
curl "$API_URL/api/providers"
curl "$API_URL/api/services"
curl "$API_URL/api/locations"
```

### Authentication Test:
```bash
# Register
curl -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User"}'

# Login
curl -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Design Guidelines

The website follows the design system in `/app/design_guidelines.json`:

- **Colors**:
  - Primary: #4A7C59 (Sage Green)
  - Secondary: #E07A5F (Terracotta)
  - Background: #FDFBF7 (Cream)
  
- **Typography**:
  - Headings: Manrope (bold, semibold)
  - Body: Public Sans
  - Accent: DM Serif Display

- **Components**: Modern, rounded designs with subtle shadows and hover animations

## Production Checklist

Before going live:

1. ✅ Update JWT_SECRET in backend .env with a strong secret
2. ✅ Add Resend API key for contact form
3. ✅ Update provider photos and bios with real data
4. ✅ Update location Google Maps embed URLs with correct coordinates
5. ✅ Configure CORS_ORIGINS in backend .env for production domain
6. ✅ Test all forms and authentication flows
7. ✅ Run Lighthouse audit (target: Performance ≥90, Accessibility ≥95)
8. ✅ Set up SSL certificate for HTTPS
9. ✅ Configure backup for MongoDB database

## File Structure

```
/app/
├── backend/
│   ├── server.py           # Main FastAPI application
│   ├── seed_data.py        # Database seeding script
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/         # All page components
│   │   ├── components/    # Reusable components (Header, Footer, Layout)
│   │   ├── contexts/      # AuthContext for authentication
│   │   ├── utils/         # API utilities
│   │   ├── App.js         # Main app with routing
│   │   └── index.css      # Global styles with custom theme
│   ├── package.json       # Node dependencies
│   └── .env              # Environment variables
└── design_guidelines.json # Design system reference

```

## API Endpoints

### Public Endpoints:
- `GET /api/` - Health check
- `GET /api/providers` - List all providers
- `GET /api/providers/{id}` - Get provider by ID
- `GET /api/services` - List all services
- `GET /api/locations` - List all locations
- `GET /api/resources` - List patient resources
- `POST /api/contact` - Submit contact form
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Protected Endpoints (require JWT token):
- `GET /api/auth/me` - Get current user
- `POST /api/providers` - Create provider (admin)
- `POST /api/services` - Create service (admin)
- `POST /api/locations` - Create location (admin)

## Support

For issues or questions:
- Backend logs: `/var/log/supervisor/backend.*.log`
- Frontend logs: Browser console
- Service status: `sudo supervisorctl status`
- Restart services: `sudo supervisorctl restart backend` / `frontend`

## Next Steps

Consider adding:
1. **Payment Integration**: Stripe for online payments
2. **Appointment Scheduling**: Direct integration with EPIC or custom scheduler
3. **Telemedicine**: Video consultation feature
4. **Admin Dashboard**: Manage providers, services, and content
5. **Analytics**: Google Analytics or similar for visitor tracking
6. **Blog/News**: Patient education content management
7. **Multi-language**: Spanish language support

---

Built with ❤️ using Emergent's modern tech stack
