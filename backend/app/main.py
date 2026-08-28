from fastapi import FastAPI, HTTPException
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine

app = FastAPI(
    title=settings.app_name,
    description="Adaptive Emergency Evacuation & Relocation Intelligence System",
    version=settings.app_version,
)


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