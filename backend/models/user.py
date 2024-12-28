from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone_number: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class MedicalInfo(BaseModel):
    occupation: str
    emergency_contact_name: str
    emergency_contact_number: str
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    allergies: Optional[List[str]] = None
    current_medications: Optional[List[str]] = None
    medical_conditions: Optional[List[str]] = None
    blood_type: Optional[str] = None
    height: Optional[float] = None  # in cm
    weight: Optional[float] = None  # in kg
    onboarding_completed: bool = False

class User(UserBase):
    id: int
    medical_info: Optional[MedicalInfo] = None

    class Config:
        from_attributes = True
