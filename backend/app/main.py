from fastapi import FastAPI, HTTPException
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.incidents import router as incidents_router
from app.api.v1.disasters import router as disasters_router
from app.api.v1.shelters import router as shelters_router

app = FastAPI(
    title=settings.app_name,
    description="Adaptive Emergency Evacuation & Relocation Intelligence System",
    version=settings.app_version,
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(incidents_router, prefix="/api/v1")
app.include_router(disasters_router, prefix="/api/v1")
app.include_router(shelters_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": "RakshaNet Backend is running",
        "version": "0.1.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/health/db")
def database_health_check():
    if engine is None:
        raise HTTPException(
            status_code=503,
            detail="DATABASE_URL is not configured",
        )

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed",
        ) from exc

    return {"status": "healthy", "database": "connected"}