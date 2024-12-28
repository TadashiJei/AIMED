from fastapi import APIRouter, HTTPException, Depends
from backend.models.user import UserCreate, UserLogin, MedicalInfo, User
from typing import Optional, Dict, Any
import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

router = APIRouter()

# Mock database - replace with actual database in production
users_db = {
    "test@example.com": {
        "id": 1,
        "email": "test@example.com",
        "name": "Test User",
        "phone_number": "1234567890",
        "password": "password123"  # In production, this would be hashed
    }
}
medical_info_db = {}

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def format_user_response(user: Dict[str, Any], token: str, onboarding_completed: bool = False) -> Dict[str, Any]:
    return {
        "message": "Login successful",
        "token": token,
        "onboarding_completed": onboarding_completed,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "phone_number": user["phone_number"]
        }
    }

@router.post("/register")
async def register(user: UserCreate):
    try:
        logger.info(f"Registration attempt for email: {user.email}")
        
        if user.email in users_db:
            logger.warning(f"Registration failed: Email already exists: {user.email}")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user_id = len(users_db) + 1
        users_db[user.email] = {
            "id": user_id,
            "email": user.email,
            "name": user.name,
            "phone_number": user.phone_number,
            "password": user.password  # In production, hash the password
        }

        logger.info(f"Registration successful for email: {user.email}")
        
        # Create access token
        access_token = create_access_token({"sub": user.email, "id": user_id})
        
        return format_user_response(users_db[user.email], access_token)
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login(user_login: UserLogin):
    try:
        logger.info(f"Login attempt for email: {user_login.email}")
        
        if user_login.email not in users_db:
            logger.warning(f"Login failed: Email not found: {user_login.email}")
            raise HTTPException(status_code=400, detail="Email not found")
        
        user = users_db[user_login.email]
        if user["password"] != user_login.password:
            logger.warning(f"Login failed: Incorrect password for email: {user_login.email}")
            raise HTTPException(status_code=400, detail="Incorrect password")
        
        logger.info(f"Login successful for email: {user_login.email}")
        
        # Check if onboarding is completed
        user_id = user["id"]
        onboarding_status = medical_info_db.get(user_id, {}).get("onboarding_completed", False)
        
        # Create access token
        access_token = create_access_token({"sub": user_login.email, "id": user_id})

        return format_user_response(user, access_token, onboarding_status)
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/onboarding/{user_id}")
async def complete_onboarding(user_id: int, medical_info: MedicalInfo):
    try:
        logger.info(f"Onboarding attempt for user_id: {user_id}")
        
        if user_id not in [u["id"] for u in users_db.values()]:
            logger.warning(f"Onboarding failed: User not found: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        
        medical_info_dict = medical_info.dict()
        medical_info_dict["onboarding_completed"] = True
        medical_info_db[user_id] = medical_info_dict
        
        logger.info(f"Onboarding completed for user_id: {user_id}")
        return {"message": "Onboarding completed successfully"}
    except Exception as e:
        logger.error(f"Onboarding error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/medical-info/{user_id}")
async def get_medical_info(user_id: int):
    try:
        logger.info(f"Fetching medical info for user_id: {user_id}")
        
        if user_id not in medical_info_db:
            logger.warning(f"Medical info not found for user_id: {user_id}")
            raise HTTPException(status_code=404, detail="Medical information not found")
        
        return medical_info_db[user_id]
    except Exception as e:
        logger.error(f"Error fetching medical info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
