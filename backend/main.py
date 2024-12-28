from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.api import router as api_router
from routes.auth import router as auth_router
from routes.settings import router as settings_router
from routes.admin import router as admin_router
from database.db import engine, Base
import uvicorn
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS with specific origins
origins = [
    "http://localhost:3000",  # Next.js development server
    "http://127.0.0.1:3000",
]

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include API routes
app.include_router(api_router, prefix="/api")
app.include_router(auth_router, prefix="/auth", tags=["authentication"])
app.include_router(settings_router, prefix="/api", tags=["settings"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])

@app.get("/")
async def root():
    return {"message": "AIMED Healthcare API"}

if __name__ == "__main__":
    PORT = 8888
    logger.info(f"Starting AIMED Healthcare API server on port {PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="info")
