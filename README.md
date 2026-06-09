# Canaan Portfolio CMS

A full-stack Content Management System tailored for the Canaan logistics and shipping portfolio. Built to be ultra-fast, visually premium, and highly secure.

## Tech Stack

### Frontend
- **Next.js 14+ (App Router)**: Fast, server-rendered React framework.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **Lucide React**: Beautiful, consistent icon set.
- **Axios**: HTTP client for API communication, configured with interceptors for JWT authentication.

### Backend
- **FastAPI**: Modern, fast Python web framework.
- **SQLite**: Lightweight database engine.
- **SQLAlchemy**: Python SQL toolkit and Object Relational Mapper.
- **PyJWT & Passlib (PBKDF2 SHA256)**: Secure JSON Web Token authentication and pure Python password hashing.
- **Uvicorn**: Lightning-fast ASGI server.

## Architecture and Features

1. **Blob Storage Architecture**: Instead of storing files on disk (which requires complex permission management and external bucket setup), images and PDFs are stored directly as BLOBs within the SQLite database. They are served dynamically via high-performance FastAPI endpoints.
2. **Server-Side Authentication**: The API is completely locked down using JWT (JSON Web Tokens). The frontend securely stores the token and attaches it to every outgoing request via an Axios interceptor.
3. **Hardened Security Headers**: The Next.js frontend implements strict HTTP security headers (X-Frame-Options, X-Content-Type-Options, CSP, HSTS) to protect against XSS and clickjacking attacks.
4. **Data Integrity and Validation**: Strict file upload validations ensure that only specific mime-types (e.g., `image/*`, `application/pdf`) and reasonable file sizes (<= 5MB) are permitted into the database. Pydantic models validate all incoming textual data.
5. **Batch Processing**: The Cargo and Achievement modules are specifically optimized to accept multiple images in a single batch request, dramatically improving upload speeds and reducing network overhead.

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Conda (Optional, but recommended)

### 1. Backend Setup
Navigate to the backend directory, set up your Python environment, and configure your local environment variables.

```bash
cd backend
conda create -n canaan-cms python=3.13
conda activate canaan-cms
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` directory with the following structure:
```env
ENVIRONMENT=development
JWT_SECRET_KEY=your_secure_development_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
API_BASE_URL=http://localhost:8000
```

Run the backend development server:
```bash
uvicorn main:app --reload
```
The backend will automatically seed the default admin user on its first run if the database is empty.

### 2. Frontend Setup
In a new terminal window, navigate to the root directory and create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the application:
```bash
npm install
npm run dev
```

## Security Best Practices for Production

Before deploying this CMS to a live environment, ensure the following steps are taken:
1. **Change Default Credentials**: Ensure the `ADMIN_USERNAME` and `ADMIN_PASSWORD` in your production `.env` file are highly secure. The backend will use these values to verify or inject the master admin account.
2. **Set JWT Secret**: Replace the `JWT_SECRET_KEY` in your `.env` file with a strong, randomly generated string.
3. **Update CORS Origins**: Update the `ALLOWED_ORIGINS` in your `.env` file to only include your exact production frontend domain strings.
4. **Disable Swagger Docs**: Ensure `ENVIRONMENT=production` is set in your `.env` file. This automatically disables the `/docs` and `/openapi.json` FastAPI endpoints, shielding the API schema from public view.
5. **HTTPS Enforced**: Ensure your reverse proxy enforces strict HTTPS.

## API Structure

The backend exposes a highly RESTful API organized by entity. All endpoints (except GET requests) require a valid `Authorization: Bearer <token>` header.

### Authentication
- `POST /api/auth/login`: Authenticates the user and returns a JWT access token.

### Achievements
- `GET /api/achievements/`: Retrieves all achievements.
- `POST /api/achievements/`: Creates a new achievement.
- `PUT /api/achievements/{id}`: Updates an existing achievement.
- `DELETE /api/achievements/{id}`: Deletes an achievement and its associated images.
- `POST /api/achievements/{id}/images`: Accepts a batch list of image files to associate with the achievement.
- `DELETE /api/achievements/images/{id}`: Deletes a specific image from an achievement.
- `GET /api/achievements/images/{id}/content`: Serves the raw image blob data.

### Cargo Categories
- `GET /api/cargos/`: Retrieves all cargo categories.
- `POST /api/cargos/`: Creates a new cargo category.
- `PUT /api/cargos/{id}`: Updates an existing cargo category.
- `DELETE /api/cargos/{id}`: Deletes a cargo category and its associated images.
- `POST /api/cargos/{id}/images`: Accepts a batch list of image files to associate with the category.
- `DELETE /api/cargos/images/{id}`: Deletes a specific image.
- `GET /api/cargos/images/{id}/content`: Serves the raw image blob data.

### Services
- `GET /api/services/`: Retrieves all services.
- `POST /api/services/`: Creates a new service.
- `PUT /api/services/{id}`: Updates a service.
- `DELETE /api/services/{id}`: Deletes a service.
- `POST /api/services/{id}/image`: Uploads the primary image for the service.
- `GET /api/services/{id}/image`: Serves the primary image blob.

### Branches
- `GET /api/branches/`: Retrieves all branch locations.
- `POST /api/branches/`: Creates a new branch.
- `PUT /api/branches/{id}`: Updates a branch.
- `DELETE /api/branches/{id}`: Deletes a branch.
- `POST /api/branches/{id}/image`: Uploads the primary image for the branch.
- `GET /api/branches/{id}/image`: Serves the primary image blob.

### Teams
- `GET /api/teams/`: Retrieves all team members.
- `POST /api/teams/`: Adds a new team member.
- `PUT /api/teams/{id}`: Updates a team member.
- `DELETE /api/teams/{id}`: Removes a team member.
- `POST /api/teams/{id}/image`: Uploads the team member's portrait image.
- `GET /api/teams/{id}/image`: Serves the portrait image blob.

### Licenses
- `GET /api/licenses/`: Retrieves all licenses and certifications.
- `POST /api/licenses/`: Adds a new license.
- `PUT /api/licenses/{id}`: Updates a license.
- `DELETE /api/licenses/{id}`: Removes a license.
- `POST /api/licenses/{id}/image`: Uploads the license image.
- `GET /api/licenses/{id}/image`: Serves the license image blob.

### Circulars
- `GET /api/circulars/`: Retrieves all circulars.
- `POST /api/circulars/`: Creates a new circular entry.
- `PUT /api/circulars/{id}`: Updates a circular.
- `DELETE /api/circulars/{id}`: Deletes a circular.
- `POST /api/circulars/{id}/pdf`: Uploads a PDF document for the circular.
- `GET /api/circulars/{id}/pdf`: Serves the raw PDF blob data.
