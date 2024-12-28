from fastapi import APIRouter, Depends
from typing import List
from ..models.user import User
from ..auth.auth_bearer import JWTBearer
from ..auth.auth_handler import get_current_user
from ..auth.rbac import admin_only, doctors_only, patients_only, medical_staff, authenticated

router = APIRouter(
    prefix="/api",
    tags=["protected"],
    dependencies=[Depends(JWTBearer())]
)

@router.get("/admin-only")
async def admin_route(current_user: User = Depends(admin_only)):
    return {
        "message": "This is an admin only route",
        "user": current_user.email
    }

@router.get("/doctor-only")
async def doctor_route(current_user: User = Depends(doctors_only)):
    return {
        "message": "This is a doctor only route",
        "user": current_user.email
    }

@router.get("/patient-only")
async def patient_route(current_user: User = Depends(patients_only)):
    return {
        "message": "This is a patient only route",
        "user": current_user.email
    }

@router.get("/medical-staff")
async def medical_staff_route(current_user: User = Depends(medical_staff)):
    return {
        "message": "This route is accessible by doctors and admins",
        "user": current_user.email
    }

@router.get("/authenticated")
async def authenticated_route(current_user: User = Depends(authenticated)):
    return {
        "message": "This route is accessible by all authenticated users",
        "user": current_user.email
    }
