from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserRole(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"

class VerificationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class BloodType(str, Enum):
    A_POSITIVE = "A+"
    A_NEGATIVE = "A-"
    B_POSITIVE = "B+"
    B_NEGATIVE = "B-"
    AB_POSITIVE = "AB+"
    AB_NEGATIVE = "AB-"
    O_POSITIVE = "O+"
    O_NEGATIVE = "O-"

class VerificationDocument(BaseModel):
    document_type: str
    document_url: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None
    verification_notes: Optional[str] = None

class DoctorInfo(BaseModel):
    license_number: str
    specialization: str
    hospital_affiliation: str
    years_of_experience: int
    education: str
    verification_documents: List[VerificationDocument] = []
    verification_status: VerificationStatus = VerificationStatus.PENDING
    verification_date: Optional[datetime] = None
    verified_by: Optional[str] = None
    rejection_reason: Optional[str] = None

class MedicalInfo(BaseModel):
    blood_type: Optional[BloodType] = None
    allergies: List[str] = []
    chronic_conditions: List[str] = []
    current_medications: List[str] = []
    family_history: List[str] = []
    height: Optional[float] = None  # in cm
    weight: Optional[float] = None  # in kg
    emergency_contact: Optional[dict] = Field(
        default=None,
        example={
            "name": "John Doe",
            "relationship": "Spouse",
            "phone": "+1234567890"
        }
    )
    insurance_info: Optional[dict] = Field(
        default=None,
        example={
            "provider": "Health Insurance Co",
            "policy_number": "12345678",
            "group_number": "G12345"
        }
    )
    last_physical_exam: Optional[datetime] = None
    immunizations: List[dict] = Field(
        default=[],
        example=[{
            "name": "COVID-19",
            "date": "2023-01-01",
            "provider": "City Hospital"
        }]
    )

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone_number: str
    role: UserRole = UserRole.PATIENT
    doctor_info: Optional[DoctorInfo] = None
    medical_info: Optional[MedicalInfo] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    doctor_info: Optional[DoctorInfo] = None
    medical_info: Optional[MedicalInfo] = None

class User(UserBase):
    id: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[UserRole] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class VerificationAction(BaseModel):
    action: VerificationStatus
    notes: Optional[str] = None
