from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from ..database import get_db
from ..models.patient import Patient
from ..auth import get_current_user

router = APIRouter()

class PatientProfile(BaseModel):
    occupation: Optional[str] = None
    blood_type: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_number: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    medical_conditions: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("/profile/me")
async def get_profile(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return patient

@router.put("/profile/update")
async def update_profile(
    profile: PatientProfile,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        patient = Patient(user_id=current_user.id)
        db.add(patient)
    
    for field, value in profile.dict(exclude_unset=True).items():
        setattr(patient, field, value)
    
    db.commit()
    db.refresh(patient)
    return patient

@router.get("/blood-types")
async def get_blood_types():
    return [
        "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
    ]
