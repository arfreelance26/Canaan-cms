from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import text
from sqlalchemy.orm import Session
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import timedelta
from database import engine, Base, get_db, SessionLocal
import models, schemas, auth
from routers import achievements, circulars, teams, cargos, services, licenses, branches, exchange_rates, fleets, owner_images, hero_video, contact
from limiter import limiter

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

import os
from dotenv import load_dotenv

load_dotenv()

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
IS_PRODUCTION = os.getenv("ENVIRONMENT") == "production"

_MIGRATIONS = [
    "ALTER TABLE circulars ADD COLUMN circular_name TEXT",
    "ALTER TABLE circulars ADD COLUMN date TEXT",
    "ALTER TABLE team_members ADD COLUMN rank INTEGER DEFAULT 0",
    "ALTER TABLE branches ADD COLUMN map_link TEXT",
    "ALTER TABLE achievements ADD COLUMN image_blob BLOB",
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

    with engine.connect() as conn:
        for stmt in _MIGRATIONS:
            try:
                conn.execute(text(stmt))
                conn.commit()
            except Exception:
                pass

    db = SessionLocal()
    try:
        # Only bootstrap an admin from env vars if none exists yet. Once an admin
        # row exists, leave it alone — otherwise a user-changed username/password
        # would get silently reset back to the env defaults on every restart.
        if ADMIN_USERNAME and ADMIN_PASSWORD and not db.query(models.AdminUser).first():
            hashed_pw = auth.get_password_hash(ADMIN_PASSWORD)
            db.add(models.AdminUser(username=ADMIN_USERNAME, hashed_password=hashed_pw))
            db.commit()
    finally:
        db.close()

    yield


app = FastAPI(
    lifespan=lifespan,
    title="Canaan CMS Backend API",
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        if IS_PRODUCTION:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,https://canaan-portfolio.vercel.app,https://canaan-cms.vercel.app",
).split(",")

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/auth/login", response_model=schemas.Token, tags=["Auth"])
@limiter.limit("5/minute")
def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # Fallback seed for environments where lifespan is bypassed (e.g. Phusion Passenger).
    # Only runs if no admin exists yet — never overwrites a user-changed username/password.
    if ADMIN_USERNAME and ADMIN_PASSWORD and not db.query(models.AdminUser).first():
        try:
            hashed_pw = auth.get_password_hash(ADMIN_PASSWORD)
            db.add(models.AdminUser(username=ADMIN_USERNAME, hashed_password=hashed_pw))
            db.commit()
        except Exception:
            pass

    user = db.query(models.AdminUser).filter(models.AdminUser.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", tags=["Auth"])
def get_current_admin(current_user: models.AdminUser = Depends(auth.get_current_user)):
    return {"username": current_user.username}


@app.put("/api/auth/credentials", response_model=schemas.Token, tags=["Auth"])
def update_credentials(
    payload: schemas.CredentialsUpdate,
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(auth.get_current_user),
):
    if not auth.verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if payload.new_username and payload.new_username != current_user.username:
        existing = db.query(models.AdminUser).filter(models.AdminUser.username == payload.new_username).first()
        if existing:
            raise HTTPException(status_code=400, detail="That username is already taken")
        current_user.username = payload.new_username

    if payload.new_password:
        current_user.hashed_password = auth.get_password_hash(payload.new_password)

    db.commit()

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": current_user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


app.include_router(achievements.router, prefix="/api/achievements", tags=["Achievements"])
app.include_router(circulars.router, prefix="/api/circulars", tags=["Circulars"])
app.include_router(teams.router, prefix="/api/teams", tags=["Teams"])
app.include_router(cargos.router, prefix="/api/cargos", tags=["Cargos"])
app.include_router(services.router, prefix="/api/services", tags=["Services"])
app.include_router(licenses.router, prefix="/api/licenses", tags=["Licenses"])
app.include_router(branches.router, prefix="/api/branches", tags=["Branches"])
app.include_router(exchange_rates.router, prefix="/api/exchange-rates", tags=["Exchange Rates"])
app.include_router(fleets.router, prefix="/api/fleets", tags=["Fleets"])
app.include_router(owner_images.router, prefix="/api/owner-image", tags=["Owner Image"])
app.include_router(hero_video.router, prefix="/api/hero-video", tags=["Hero Video"])
app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the CMS API"}
