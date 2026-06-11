# Canaan Portfolio CMS

A full-stack Content Management System for Canaan Global International — a logistics and shipping company. The CMS powers the public portfolio site by providing a secure, admin-only interface to manage all dynamic content: achievements, circulars, team members, cargo categories, services, licenses, and branch locations.

---

## Tech Stack

### Frontend

| Technology | Version | Role |
|---|---|---|
| Next.js | 16.2.7 | React framework with App Router |
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
| python-dotenv | Environment variable management |

---

## System Architecture

```
┌─────────────────────────────────┐     HTTPS      ┌──────────────────────────────────┐
│   Next.js Frontend              │ ─────────────▶ │   FastAPI Backend                │
│   canaan-cms.vercel.app         │                 │   api.popememorialhss.org        │
│                                 │ ◀───────────── │                                  │
│  • App Router (all client)      │   JSON + Blobs  │  • JWT Auth                      │
│  • Axios + JWT interceptor      │                 │  • SQLite + BLOB storage         │
│  • sessionStorage token         │                 │  • Rate limiting (slowapi)       │
│  • Security headers via config  │                 │  • Security headers middleware   │
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

**Client-Side Rendering for the CMS**
All CMS pages are `"use client"` components. The CMS is admin-only, so SEO and server-rendering are irrelevant. This keeps the architecture simple and avoids server actions or API route proxying.

**Computed Image/PDF URLs in Schemas**
Pydantic response models use `@computed_field` to generate fully-qualified media URLs (e.g., `https://api.popememorialhss.org/api/achievements/images/3/content`). This means the portfolio frontend receives ready-to-use URLs without any transformation.

**Phusion Passenger Compatibility**
cPanel's Phusion Passenger may bypass the ASGI `lifespan` startup. Admin seeding logic is therefore duplicated as an idempotent fallback inside the login route, ensuring the system initialises correctly in all deployment environments.

---

## Content Modules

| Module | Fields | Media |
|---|---|---|
| Achievements | title, description | Multiple images per achievement |
| Circulars | title, description, circular_name, date | Single PDF |
| Teams | name, designation, email | Single portrait image |
| Cargo Categories | name | Multiple images per category |
| Services | title, description | Single image |
| Licenses | title, description | Single image |
| Branches | title, address, iframe_input | Single image + Google Maps embed |

---

## Authentication and Security

### Admin Authentication
- Single admin user seeded from environment variables on first startup.
- Credentials submitted as `application/x-www-form-urlencoded` (OAuth2 Password Flow).
- Backend returns a **7-day JWT** signed with HS256.
- Frontend stores the token in `sessionStorage` and attaches it to every request via an Axios request interceptor.
- On receiving a `401` response (token expired or invalid), the interceptor clears the token and triggers a page reload, returning the user to the login screen.

### Login Rate Limiting
The login endpoint is hard-limited to **5 attempts per minute per IP** using `slowapi`. Exceeding this returns HTTP 429.

### Frontend Security Headers (via `next.config.mjs`)

| Header | Value |
|---|---|
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| X-XSS-Protection | 1; mode=block |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=(), payment=() |
| Strict-Transport-Security | max-age=31536000; includeSubDomains; preload |

### Backend Security Headers (via `SecurityHeadersMiddleware`)

| Header | Value |
|---|---|
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=() |
| Strict-Transport-Security | max-age=31536000; includeSubDomains *(production only)* |

### XSS Protection — Google Maps Embeds
The Branches module stores raw Google Maps `<iframe>` HTML. Rather than injecting this directly into the DOM with `dangerouslySetInnerHTML`, the frontend extracts only the `src` URL using a regex match and renders a controlled `<iframe>` with `sandbox="allow-scripts allow-same-origin"` and `referrerPolicy="no-referrer"`.

### Password Hashing
bcrypt via passlib. The `CryptContext` is configured to keep `pbkdf2_sha256` as a deprecated but verifiable scheme for backward compatibility, while all new password hashes are generated with bcrypt.

### CORS
Allowed origins are read from the `ALLOWED_ORIGINS` environment variable on the backend. Only exact production domains and localhost are permitted.

### API Documentation Lockdown
When `ENVIRONMENT=production`, the `/docs`, `/redoc`, and `/openapi.json` endpoints are disabled.

---

## Repository Structure

```
cms/
├── app/                          Next.js App Router (frontend)
│   ├── api.js                    Axios instance — baseURL from NEXT_PUBLIC_API_URL
│   ├── AuthGuard.js              Wraps entire app — shows login form if no token
│   ├── LogoutButton.js           Clears sessionStorage token and reloads
│   ├── layout.js                 Root layout with sidebar navigation
│   ├── page.js                   Dashboard with live counts per module
│   ├── achievements/page.js
│   ├── branches/page.js
│   ├── cargos/page.js
│   ├── circulars/page.js
│   ├── licenses/page.js
│   ├── services/page.js
│   └── teams/page.js
│
├── backend/                      FastAPI backend
│   ├── main.py                   App entrypoint, lifespan, middleware, login route
│   ├── auth.py                   JWT + bcrypt helpers, get_current_user dependency
│   ├── database.py               SQLAlchemy engine + get_db dependency
│   ├── models.py                 ORM table definitions
│   ├── schemas.py                Pydantic models with computed media URL fields
│   ├── requirements.txt
│   ├── cms.db                    SQLite database (auto-created)
│   └── routers/
│       ├── achievements.py
│       ├── branches.py
│       ├── cargos.py
│       ├── circulars.py
│       ├── licenses.py
│       ├── services.py
│       └── teams.py
│
├── public/                       Static assets
├── next.config.mjs               Security headers, Next.js config
├── package.json
└── README.md
```

---

## Local Development Setup

### Prerequisites
- Node.js v18+
- Conda (recommended) with the `deeplearning` environment, which has all backend dependencies installed

### 1. Backend

```bash
conda activate deeplearning
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:
```env
ENVIRONMENT=development
JWT_SECRET_KEY=any-long-random-string-for-local-dev
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
API_BASE_URL=http://localhost:8000
```

```bash
uvicorn main:app --reload
```

The database file `cms.db` is created automatically. The admin user is seeded from the env variables on first startup. API docs are available at `http://localhost:8000/docs` in development mode.

### 2. Frontend

In a separate terminal, from the project root:

```bash
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
```

The CMS is available at `http://localhost:3000`. Log in with the credentials from `backend/.env`.

---

## Production Deployment

### Backend (cPanel / Phusion Passenger)
1. Upload the `backend/` directory to the server.
2. Configure a Python application in cPanel pointing at `main:app`.
3. Set all environment variables in the cPanel interface or `backend/.env`.
4. Ensure `ENVIRONMENT=production` to disable API docs and activate HSTS.

### Frontend (Vercel)
1. Connect the repository to a Vercel project.
2. Set `NEXT_PUBLIC_API_URL=https://api.popememorialhss.org` in the Vercel environment variables.
3. Deploy. Security headers are applied automatically via `next.config.mjs`.

### Production Security Checklist
- [ ] `JWT_SECRET_KEY` is a cryptographically random string (`openssl rand -hex 32`)
- [ ] `ADMIN_PASSWORD` is long and unique — never the default `admin123`
- [ ] `ALLOWED_ORIGINS` contains only the exact production CMS domain
- [ ] `ENVIRONMENT=production` is set
- [ ] HTTPS is enforced at the reverse proxy / Vercel level
- [ ] `cms.db` is not publicly accessible (verify via `.htaccess` or server config)

---

## API Reference

All `POST`, `PUT`, `DELETE` endpoints require `Authorization: Bearer <token>`. `GET` endpoints are public.

For the complete API reference including request/response schemas, see [`backend/README.md`](backend/README.md).

### Quick Reference

| Module | Base Path |
|---|---|
| Auth | `POST /api/auth/login` |
| Achievements | `/api/achievements/` |
| Circulars | `/api/circulars/` |
| Teams | `/api/teams/` |
| Cargo Categories | `/api/cargos/` |
| Services | `/api/services/` |
| Licenses | `/api/licenses/` |
| Branches | `/api/branches/` |
