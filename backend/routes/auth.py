from fastapi import APIRouter, HTTPException, Depends
from models.user import UserCreate, UserLogin, MedicalInfo, User
from typing import Optional

router = APIRouter()

# Mock database - replace with actual database in production
users_db = {}
medical_info_db = {}

@router.post("/register")
async def register(user: UserCreate):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # In production, hash the password before storing
    users_db[user.email] = {
        "id": len(users_db) + 1,
        "email": user.email,
        "name": user.name,
        "phone_number": user.phone_number,
        "password": user.password  # In production, store hashed password
    }
    return {"message": "Registration successful"}

@router.post("/login")
async def login(user_login: UserLogin):
    if user_login.email not in users_db:
        raise HTTPException(status_code=400, detail="Email not found")
    
    user = users_db[user_login.email]
    if user["password"] != user_login.password:  # In production, verify hashed password
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    # Check if onboarding is completed
    user_id = user["id"]
    onboarding_status = medical_info_db.get(user_id, {}).get("onboarding_completed", False)
    
    return {
        "message": "Login successful",
        "onboarding_completed": onboarding_status,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "phone_number": user["phone_number"]
        }
    }

@router.post("/onboarding/{user_id}")
async def complete_onboarding(user_id: int, medical_info: MedicalInfo):
    if user_id not in [u["id"] for u in users_db.values()]:
        raise HTTPException(status_code=404, detail="User not found")
    
    medical_info_dict = medical_info.dict()
    medical_info_dict["onboarding_completed"] = True
    medical_info_db[user_id] = medical_info_dict
    
    return {"message": "Onboarding completed successfully"}

@router.get("/medical-info/{user_id}")
async def get_medical_info(user_id: int) -> Optional[MedicalInfo]:
    if user_id not in [u["id"] for u in users_db.values()]:
        raise HTTPException(status_code=404, detail="User not found")
    
    medical_info = medical_info_db.get(user_id)
    if not medical_info:
        raise HTTPException(status_code=404, detail="Medical information not found")
    
    return medical_info
