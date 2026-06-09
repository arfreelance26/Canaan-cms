# Canaan Portfolio CMS

A full-stack Content Management System (CMS) tailored for the Canaan logistics and shipping portfolio. Built to be ultra-fast, visually premium, and highly secure.

## Tech Stack

### Frontend
- **Next.js 14+ (App Router)**: Fast, server-rendered React framework.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **Lucide React**: Beautiful, consistent icon set.
- **Axios**: HTTP client for API communication, configured with interceptors for JWT auth.

### Backend
- **FastAPI**: Modern, fast Python web framework.
- **SQLite**: Lightweight database engine.
- **SQLAlchemy**: Python SQL toolkit and Object Relational Mapper.
- **PyJWT & Passlib**: Secure JSON Web Token authentication and password hashing.
- **Uvicorn**: Lightning-fast ASGI server.

## Architecture & Features

1. **Blob Storage Architecture**: Instead of storing files on disk (which requires complex permission management and external bucket setup), images and PDFs are stored directly as BLOBs within the SQLite database. They are served dynamically via high-performance FastAPI endpoints (e.g., `/api/achievements/images/{id}/content`).
2. **Server-Side Authentication**: The API is completely locked down using JWT (JSON Web Tokens). The frontend securely stores the token and attaches it to every outgoing request via an Axios interceptor.
3. **Hardened Security Headers**: The Next.js frontend implements strict HTTP security headers (X-Frame-Options, X-Content-Type-Options, CSP, HSTS) to protect against XSS and clickjacking attacks.
4. **Data Integrity & Validation**: Strict file upload validations ensure that only specific mime-types (e.g., `image/*`, `application/pdf`) and reasonable file sizes (<= 5MB) are permitted into the database. Pydantic models validate all incoming textual data.

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Conda (Optional, but recommended)

### 1. Backend Setup
Navigate to the backend directory and set up your Python environment:
```bash
cd backend
conda create -n canaan-cms python=3.13
conda activate canaan-cms
pip install -r requirements.txt
```

Run the backend development server:
```bash
uvicorn main:app --reload
```
*The backend will automatically seed the default admin user (`admin` / `admin123`) on its first run.*

### 2. Frontend Setup
In a new terminal window, navigate to the root directory:
```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to access the CMS.
Visit `http://localhost:8000/docs` to view the interactive FastAPI Swagger Documentation.

## Security Best Practices for Production

Before deploying this CMS to a live environment, ensure the following steps are taken:
1. **Change Default Credentials**: Log in and modify the default `admin` / `admin123` credentials via the database, or deploy a script to update the password hash.
2. **Set JWT Secret**: In `backend/auth.py`, replace the default `JWT_SECRET_KEY` with a strong, randomly generated environment variable.
3. **Update CORS Origins**: In `backend/main.py`, update the `allow_origins` array to only include your exact production domain strings (e.g., `https://admin.canaan.com`).
4. **HTTPS Enforced**: Ensure your reverse proxy (Nginx, Vercel, Render) enforces strict HTTPS.

## API Structure

The backend exposes a highly RESTful API organized by entity:
- `/api/auth/login` (POST: Obtain JWT Token)
- `/api/achievements` (GET, POST, PUT, DELETE)
- `/api/circulars` (GET, POST, PUT, DELETE, PDF Upload)
- `/api/teams` (GET, POST, PUT, DELETE)
- `/api/cargos` (GET, POST, PUT, DELETE)
- `/api/services` (GET, POST, PUT, DELETE)
- `/api/licenses` (GET, POST, PUT, DELETE)
- `/api/branches` (GET, POST, PUT, DELETE)

*Note: All endpoints (except GET requests) require a valid `Authorization: Bearer <token>` header.*
