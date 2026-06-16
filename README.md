# Canaan Global CMS & Backend API

A full-stack Content Management System for Canaan Global International — a logistics and shipping company. The CMS powers the public portfolio site by providing a secure, admin-only interface to manage all dynamic content including achievements, circulars, team members, cargo categories, exchange rates, fleets, services, licenses, owner images, and branch locations.

---

## Tech Stack

### Frontend (CMS & Main Site)

| Technology | Version | Role |
|---|---|---|
| Next.js | 16.2.7 | React framework with App Router (Static Export) |
| React | 19.2.4 | UI library |
| Tailwind CSS | v4 | Utility-first styling |
| Axios | ^1.17.0 | HTTP client with JWT interceptors |
| Lucide React | ^1.17.0 | Icon set |

### Backend

| Technology | Role |
|---|---|
| FastAPI | ASGI web framework |
| Uvicorn | ASGI server |
| SQLAlchemy | ORM |
| SQLite | Database |
| PyJWT | JWT signing and verification |
| passlib + bcrypt | Password hashing |
| slowapi | Login rate limiting |
| Pillow | On-the-fly Image Compression |

---

## System Architecture

```
┌─────────────────────────────────┐     HTTPS      ┌──────────────────────────────────┐
│   Next.js Frontends (Static)    │ ─────────────▶ │   FastAPI Backend                │
│   cms.canaanglobal...           │                 │   api.canaanglobalinternational..│
│   canaanglobalinternational...  │ ◀───────────── │                                  │
│                                 │   JSON + Blobs  │  • JWT Auth                      │
│  • App Router (Static Export)   │                 │  • SQLite + BLOB storage         │
│  • Axios + JWT interceptor      │                 │  • Rate limiting (slowapi)       │
│  • Apache .htaccess routing     │                 │  • Image compression (Pillow)    │
└─────────────────────────────────┘                 └──────────────────────────────────┘
                                                                    │
                                                                    ▼
                                                           ┌─────────────────┐
                                                           │   cms.db        │
                                                           │   (SQLite)      │
                                                           │                 │
                                                           │  All text,      │
                                                           │  images, PDFs   │
                                                           │  as BLOBs       │
                                                           └─────────────────┘
```

### Key Architectural Decisions

**BLOB Storage in SQLite**
Images and PDFs are stored as `LargeBinary` columns directly in the database instead of the filesystem or cloud buckets. This removes the need for write-permission management on shared hosting and eliminates dependency on external services.

**Image Compression**
The backend uses `Pillow` to automatically compress all uploaded images on the fly (max width 1920px, 80% quality JPEG) before saving them to the database. This ensures incredibly fast API load times and prevents the database from bloating.

**Client-Side Rendering for the CMS**
All CMS pages are statically exported single-page applications. The CMS is admin-only, so SEO and server-rendering are irrelevant. 

**Computed Image/PDF URLs in Schemas**
Pydantic response models use `@computed_field` to generate fully-qualified media URLs (e.g., `https://api.canaanglobalinternational.com/api/achievements/1/image`). This means the portfolio frontend receives ready-to-use URLs without any transformation.

---

## Content Modules

| Module | Fields | Media |
|---|---|---|
| Achievements | title, description | Single cover image |
| Circulars | title, description, circular_name, date | Single PDF |
| Team Members | name, designation, email, rank | Single portrait image |
| Cargo Categories | name | Multiple images per category |
| Services | title, description | Single image |
| Licenses | title, description | Single image |
| Branches | title, address, map_link | Single image |
| Fleets | title, description | Single image |
| Owner Image | (Standalone) | Single portrait image |
| Exchange Rates | usd, eur, gbp, aed | None |

---

## Authentication and Security

### Admin Authentication
- Single admin user seeded from environment variables on first startup.
- Credentials submitted as `application/x-www-form-urlencoded` (OAuth2 Password Flow).
- Backend returns a **7-day JWT** signed with HS256.
- Frontend stores the token in `sessionStorage` and attaches it to every request via an Axios request interceptor.

### Login Rate Limiting
The login endpoint is hard-limited to **5 attempts per minute per IP** using `slowapi`. Exceeding this returns HTTP 429.

### Frontend Security & Routing (`cms/public/.htaccess`)
Because the CMS is statically exported, security headers and single-page routing fallbacks are enforced via Apache `.htaccess`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- Fallback routing for 404 pages.

### Backend Security Headers (via `SecurityHeadersMiddleware`)
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (production only)

### Password Hashing
bcrypt via passlib.

### CORS
Allowed origins are strictly defined via the `ALLOWED_ORIGINS` environment variable to explicitly authorize `https://cms.canaanglobalinternational.com` and `https://canaanglobalinternational.com`.

### API Documentation Lockdown
When `ENVIRONMENT=production`, the `/docs`, `/redoc`, and `/openapi.json` endpoints are disabled.

---

## Repository Structure

```
cms/
├── app/                          Next.js App Router (frontend)
│   ├── api.js                    Axios instance — baseURL from NEXT_PUBLIC_API_URL
│   ├── AuthGuard.js              Wraps entire app — shows login form if no token
│   ├── layout.js                 Root layout with sidebar navigation
│   ├── page.js                   Dashboard with live counts per module
│   └── */page.js                 (Modules: achievements, branches, cargos, etc.)
│
├── backend/                      FastAPI backend
│   ├── main.py                   App entrypoint, lifespan, middleware, login route
│   ├── auth.py                   JWT + bcrypt helpers
│   ├── database.py               SQLAlchemy engine
│   ├── models.py                 ORM table definitions
│   ├── schemas.py                Pydantic models with computed media URLs
│   ├── utils.py                  Image compression (Pillow) utilities
│   ├── requirements.txt
│   ├── cms.db                    SQLite database (auto-created)
│   └── routers/                  Modular API routes (teams, cargos, fleets, etc.)
│
├── public/                       Static assets
│   └── .htaccess                 Apache configuration for Static Export
├── next.config.mjs               Next.js config (output: 'export')
└── README.md
```

---

## Local Development Setup

### Prerequisites
- Node.js v18+
- Python 3.10+

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:
```env
ENVIRONMENT=development
JWT_SECRET_KEY=any-long-random-string-for-local-dev
ADMIN_USERNAME=canaan
ADMIN_PASSWORD=canaan123
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001
API_BASE_URL=http://127.0.0.1:8000
```

```bash
uvicorn main:app --reload
```

The database file `cms.db` is created automatically. API docs are available at `http://127.0.0.1:8000/docs`.

### 2. Frontend

In a separate terminal, from the project root:

```bash
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

```bash
npm run dev
```

The CMS is available at `http://localhost:3000`. 

---

## Production Deployment (GoDaddy Ultimate Pack)

### Backend (cPanel / Phusion Passenger)
1. Upload the `backend/` directory to the server.
2. Configure a Python application in cPanel pointing at `main:app`.
3. Set all environment variables in the cPanel interface or `backend/.env`.
   - `ENVIRONMENT=production`
   - `API_BASE_URL=https://api.canaanglobalinternational.com`
   - `ALLOWED_ORIGINS=https://cms.canaanglobalinternational.com,https://canaanglobalinternational.com`

### Frontend (Static Export)
1. Run `npm run build`. This generates an `out/` directory.
2. Upload the contents of the `out/` directory to your GoDaddy `public_html` (or subdomain document root).
3. The `.htaccess` file inside `out/` will automatically configure Apache.
