from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from datetime import datetime, timedelta
from ..database import get_db
from ..auth.jwt import get_current_user
from ..models.user import User
from ..models.analysis import Analysis
from ..models.appointment import Appointment
from ..services.analytics import AnalyticsService

router = APIRouter()
analytics_service = AnalyticsService()

@router.get("/dashboard/metrics/{user_id}")
async def get_user_metrics(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user-specific metrics"""
    if current_user.id != user_id and current_user.role not in ['admin', 'doctor']:
        raise HTTPException(status_code=403, detail="Not authorized to view these metrics")

    # Get user's recent activities
    recent_analyses = db.query(Analysis).filter(
        Analysis.patient_id == user_id
    ).order_by(Analysis.created_at.desc()).limit(5).all()

    recent_appointments = db.query(Appointment).filter(
        (Appointment.patient_id == user_id) | (Appointment.doctor_id == user_id)
    ).order_by(Appointment.scheduled_time.desc()).limit(5).all()

    # Get health metrics
    health_metrics = analytics_service.get_user_health_metrics(user_id)

    return {
        "recent_activities": {
            "analyses": recent_analyses,
            "appointments": recent_appointments
        },
        "health_metrics": health_metrics
    }

@router.get("/dashboard/doctor/{doctor_id}")
async def get_doctor_dashboard(
    doctor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get doctor-specific dashboard data"""
    if current_user.id != doctor_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized to view this dashboard")

    # Get doctor's patients
    patients = db.query(User).join(
        Appointment, User.id == Appointment.patient_id
    ).filter(
        Appointment.doctor_id == doctor_id
    ).distinct().all()

    # Get upcoming appointments
    upcoming_appointments = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.scheduled_time >= datetime.utcnow()
    ).order_by(Appointment.scheduled_time).limit(10).all()

    # Get pending analyses
    pending_analyses = db.query(Analysis).filter(
        Analysis.doctor_id == doctor_id,
        Analysis.status == 'pending'
    ).order_by(Analysis.created_at.desc()).all()

    # Get doctor's performance metrics
    performance_metrics = analytics_service.get_doctor_performance_metrics(doctor_id)

    return {
        "patients": patients,
        "upcoming_appointments": upcoming_appointments,
        "pending_analyses": pending_analyses,
        "performance_metrics": performance_metrics
    }

@router.get("/dashboard/activities/{user_id}")
async def get_recent_activities(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's recent activities"""
    if current_user.id != user_id and current_user.role not in ['admin', 'doctor']:
        raise HTTPException(status_code=403, detail="Not authorized to view these activities")

    # Get all types of activities
    activities = []

    # Get analyses
    analyses = db.query(Analysis).filter(
        Analysis.patient_id == user_id
    ).order_by(Analysis.created_at.desc()).limit(10).all()

    for analysis in analyses:
        activities.append({
            "type": "analysis",
            "timestamp": analysis.created_at,
            "data": analysis
        })

    # Get appointments
    appointments = db.query(Appointment).filter(
        (Appointment.patient_id == user_id) | (Appointment.doctor_id == user_id)
    ).order_by(Appointment.scheduled_time.desc()).limit(10).all()

    for appointment in appointments:
        activities.append({
            "type": "appointment",
            "timestamp": appointment.scheduled_time,
            "data": appointment
        })

    # Sort activities by timestamp
    activities.sort(key=lambda x: x["timestamp"], reverse=True)

    return {
        "activities": activities[:10]  # Return only the 10 most recent activities
    }

@router.get("/dashboard/health-insights/{user_id}")
async def get_health_insights(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered health insights for a user"""
    if current_user.id != user_id and current_user.role not in ['admin', 'doctor']:
        raise HTTPException(status_code=403, detail="Not authorized to view these insights")

    # Get user's analyses
    analyses = db.query(Analysis).filter(
        Analysis.patient_id == user_id
    ).order_by(Analysis.created_at.desc()).all()

    # Get health trends
    health_trends = analytics_service.get_health_trends(user_id)

    # Get risk assessments
    risk_assessments = []
    for analysis in analyses:
        if analysis.risk_assessment:
            risk_assessments.append(analysis.risk_assessment)

    # Get personalized recommendations
    recommendations = analytics_service.get_personalized_recommendations(user_id)

    return {
        "health_trends": health_trends,
        "risk_assessments": risk_assessments,
        "recommendations": recommendations
    }

@router.get("/dashboard/statistics")
async def get_dashboard_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get general dashboard statistics"""
    if current_user.role not in ['admin', 'doctor']:
        raise HTTPException(status_code=403, detail="Not authorized to view these statistics")

    # Get user counts
    total_patients = db.query(func.count(User.id)).filter(User.role == 'patient').scalar()
    total_doctors = db.query(func.count(User.id)).filter(User.role == 'doctor').scalar()

    # Get analysis statistics
    total_analyses = db.query(func.count(Analysis.id)).scalar()
    pending_analyses = db.query(func.count(Analysis.id)).filter(Analysis.status == 'pending').scalar()

    # Get appointment statistics
    upcoming_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.scheduled_time >= datetime.utcnow()
    ).scalar()

    # Get activity trends
    activity_trends = analytics_service.get_activity_trends()

    return {
        "user_counts": {
            "patients": total_patients,
            "doctors": total_doctors
        },
        "analysis_stats": {
            "total": total_analyses,
            "pending": pending_analyses
        },
        "appointment_stats": {
            "upcoming": upcoming_appointments
        },
        "activity_trends": activity_trends
    }
