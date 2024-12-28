from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import List
from backend.models.user import User, VerificationAction, UserRole
from backend.models.admin import Admin
from backend.models.analysis import Analysis, AnalysisResponse
from backend.models.report import Report, ReportResponse
from backend.models.settings import SystemSettings, SystemSettingsResponse
from backend.auth.auth_bearer import JWTBearer
from backend.auth.auth_handler import get_current_user, create_access_token
from backend.services.email import send_verification_email
from backend.database.db import get_db
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
from sqlalchemy import func
import asyncio

router = APIRouter(prefix="/admin", tags=["admin"])

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminCreate(BaseModel):
    username: str
    password: str
    email: str
    full_name: str
    is_superadmin: bool = False

async def verify_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access this endpoint"
        )
    return current_user

@router.post("/create", response_model=dict)
async def create_admin(
    admin_data: AdminCreate,
    current_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Create a new admin account (only existing admins can create new admins)"""
    # Check if username or email already exists
    if db.query(Admin).filter(Admin.username == admin_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    if db.query(Admin).filter(Admin.email == admin_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new admin
    new_admin = Admin(
        username=admin_data.username,
        email=admin_data.email,
        full_name=admin_data.full_name,
        is_superadmin=admin_data.is_superadmin
    )
    new_admin.set_password(admin_data.password)

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return {"message": "Admin created successfully", "admin": new_admin.to_dict()}

@router.post("/login")
async def admin_login(
    admin_credentials: AdminLogin,
    db: Session = Depends(get_db)
):
    """Login for admin users"""
    admin = db.query(Admin).filter(Admin.username == admin_credentials.username).first()
    if not admin or not admin.check_password(admin_credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    token = create_access_token({"sub": str(admin.id), "is_admin": True})
    return {
        "access_token": token,
        "token_type": "bearer",
        "admin": admin.to_dict()
    }

@router.get("/pending-verifications", response_model=List[User])
async def get_pending_verifications(
    current_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get all doctors with pending verification status"""
    pending_doctors = db.query(User).filter(
        User.role == UserRole.DOCTOR,
        User.doctor_info.verification_status == "pending"
    ).all()
    return pending_doctors

@router.post("/verify-doctor/{doctor_id}")
async def verify_doctor(
    doctor_id: str,
    verification: VerificationAction,
    current_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Verify or reject a doctor's registration"""
    doctor = db.query(User).filter(User.id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    if not doctor.doctor_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not registered as a doctor"
        )
    
    doctor.doctor_info.verification_status = verification.action
    doctor.doctor_info.verified_by = current_user.id
    
    if verification.action == "rejected":
        doctor.doctor_info.rejection_reason = verification.notes
    
    db.commit()
    
    # Send email notification
    if verification.action == "approved":
        await send_verification_email(
            doctor.email,
            "Doctor Verification Approved",
            "Your doctor verification has been approved. You can now access all doctor features."
        )
    elif verification.action == "rejected":
        await send_verification_email(
            doctor.email,
            "Doctor Verification Rejected",
            f"Your doctor verification has been rejected. Reason: {verification.notes}"
        )
    
    return {"message": f"Doctor verification {verification.action}"}

@router.get("/users", response_model=List[User])
async def get_all_users(
    current_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get all users in the system"""
    users = db.query(User).all()
    return users

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    new_role: UserRole,
    current_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Update a user's role"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.role = new_role
    db.commit()
    return {"message": f"User role updated to {new_role}"}

# Initialize default superadmin if none exists
@router.post("/init-superadmin")
async def initialize_superadmin(
    admin_data: AdminCreate = Body(...),
    db: Session = Depends(get_db)
):
    """Initialize the first superadmin account (can only be used if no admins exist)"""
    # Check if any admin exists
    if db.query(Admin).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Superadmin already exists"
        )

    # Create superadmin
    superadmin = Admin(
        username=admin_data.username,
        email=admin_data.email,
        full_name=admin_data.full_name,
        is_superadmin=True
    )
    superadmin.set_password(admin_data.password)

    db.add(superadmin)
    db.commit()
    db.refresh(superadmin)

    return {"message": "Superadmin created successfully", "admin": superadmin.to_dict()}

# Dashboard Routes
@router.get("/analytics")
async def get_analytics(
    current_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get analytics data for the admin dashboard"""
    # Get user statistics
    total_users = db.query(User).count()
    doctors = db.query(User).filter(User.role == UserRole.DOCTOR).count()
    patients = db.query(User).filter(User.role == UserRole.PATIENT).count()
    pending_verifications = db.query(User).filter(
        User.role == UserRole.DOCTOR,
        User.doctor_info['verification_status'].astext == 'pending'
    ).count()

    # Get daily signups for the last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    daily_signups = db.query(
        func.date(User.created_at).label('date'),
        func.count().label('count')
    ).filter(
        User.created_at >= thirty_days_ago
    ).group_by(
        func.date(User.created_at)
    ).all()

    # Get analysis metrics
    total_analyses = db.query(Analysis).count()
    status_distribution = db.query(
        Analysis.status,
        func.count().label('count')
    ).group_by(Analysis.status).all()

    analysis_types = db.query(
        Analysis.analysis_type,
        func.count().label('count')
    ).group_by(Analysis.analysis_type).all()

    # Get system usage metrics
    daily_active_users = db.query(
        func.date(User.last_login).label('date'),
        func.count().label('count')
    ).filter(
        User.last_login >= thirty_days_ago
    ).group_by(
        func.date(User.last_login)
    ).all()

    return {
        "user_stats": {
            "total_users": total_users,
            "doctors": doctors,
            "patients": patients,
            "pending_verifications": pending_verifications,
            "daily_signups": [{"date": str(d[0]), "count": d[1]} for d in daily_signups]
        },
        "analysis_metrics": {
            "total_analyses": total_analyses,
            "status_distribution": {s[0]: s[1] for s in status_distribution},
            "analysis_types": {t[0]: t[1] for t in analysis_types}
        },
        "system_usage": {
            "daily_active_users": [{"date": str(d[0]), "count": d[1]} for d in daily_active_users]
        }
    }

@router.get("/staff", response_model=List[User])
async def get_staff_members(
    current_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get all staff members (doctors)"""
    staff = db.query(User).filter(User.role == UserRole.DOCTOR).all()
    return staff

@router.get("/patients", response_model=List[User])
async def get_patients(
    current_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get all patients"""
    patients = db.query(User).filter(User.role == UserRole.PATIENT).all()
    return patients

@router.get("/reports", response_model=List[ReportResponse])
async def get_reports(
    current_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get all generated reports"""
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    return reports

@router.post("/reports/generate", response_model=ReportResponse)
async def generate_report(
    report_type: str = Body(...),
    current_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Generate a new report"""
    report = Report(
        title=f"{report_type.replace('-', ' ').title()} Report",
        type=report_type,
        status="processing",
        generated_by=str(current_user.id)
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Start report generation process (this would typically be handled by a background job)
    # For now, we'll just update the status after a delay
    async def process_report():
        await asyncio.sleep(5)
        report.status = "completed"
        report.download_url = f"/api/admin/reports/{report.id}/download"
        db.commit()

    asyncio.create_task(process_report())
    return report

@router.get("/settings", response_model=SystemSettingsResponse)
async def get_settings(
    current_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get system settings"""
    settings = db.query(SystemSettings).first()
    if not settings:
        # Create default settings if none exist
        settings = SystemSettings(
            system_email="system@aimed.com"
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.patch("/settings", response_model=SystemSettingsResponse)
async def update_settings(
    settings_update: SystemSettingsResponse,
    current_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Update system settings"""
    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings(**settings_update.dict())
        db.add(settings)
    else:
        for key, value in settings_update.dict().items():
            setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings
