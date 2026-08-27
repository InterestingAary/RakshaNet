from fastapi import FastAPI

app = FastAPI(
    title="RakshaNet API",
    description="Adaptive Emergency Evacuation & Relocation Intelligence System",
    version="0.1.0",
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