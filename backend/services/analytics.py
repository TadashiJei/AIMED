from datetime import datetime, timedelta
from typing import Dict, List
from sqlalchemy import func
from sqlalchemy.orm import Session
from ..models.user import User, UserRole
from ..models.analysis import Analysis
from ..database import get_db

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_statistics(self) -> Dict:
        """Get user-related statistics"""
        total_users = self.db.query(User).count()
        doctors = self.db.query(User).filter(User.role == UserRole.DOCTOR).count()
        patients = self.db.query(User).filter(User.role == UserRole.PATIENT).count()
        pending_verifications = self.db.query(User).filter(
            User.role == UserRole.DOCTOR,
            User.doctor_info.verification_status == "pending"
        ).count()

        # User growth over time (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        daily_signups = (
            self.db.query(
                func.date(User.created_at).label('date'),
                func.count(User.id).label('count')
            )
            .filter(User.created_at >= thirty_days_ago)
            .group_by(func.date(User.created_at))
            .all()
        )

        return {
            "total_users": total_users,
            "doctors": doctors,
            "patients": patients,
            "pending_verifications": pending_verifications,
            "daily_signups": [
                {"date": str(date), "count": count}
                for date, count in daily_signups
            ]
        }

    def get_analysis_metrics(self) -> Dict:
        """Get analysis-related metrics"""
        total_analyses = self.db.query(Analysis).count()
        
        # Analysis by status
        status_counts = (
            self.db.query(
                Analysis.status,
                func.count(Analysis.id).label('count')
            )
            .group_by(Analysis.status)
            .all()
        )

        # Average processing time
        avg_processing_time = (
            self.db.query(
                func.avg(
                    func.extract('epoch', Analysis.completed_at - Analysis.created_at)
                )
            )
            .filter(Analysis.status == 'completed')
            .scalar()
        )

        # Analysis by type
        type_counts = (
            self.db.query(
                Analysis.analysis_type,
                func.count(Analysis.id).label('count')
            )
            .group_by(Analysis.analysis_type)
            .all()
        )

        return {
            "total_analyses": total_analyses,
            "status_distribution": {
                status: count for status, count in status_counts
            },
            "avg_processing_time_seconds": avg_processing_time,
            "analysis_types": {
                type_: count for type_, count in type_counts
            }
        }

    def get_system_usage(self, days: int = 30) -> Dict:
        """Get system usage statistics"""
        start_date = datetime.utcnow() - timedelta(days=days)

        # Daily active users
        daily_active_users = (
            self.db.query(
                func.date(User.last_login).label('date'),
                func.count(User.id).label('count')
            )
            .filter(User.last_login >= start_date)
            .group_by(func.date(User.last_login))
            .all()
        )

        # Analysis requests per day
        daily_analyses = (
            self.db.query(
                func.date(Analysis.created_at).label('date'),
                func.count(Analysis.id).label('count')
            )
            .filter(Analysis.created_at >= start_date)
            .group_by(func.date(Analysis.created_at))
            .all()
        )

        # Peak usage hours
        peak_hours = (
            self.db.query(
                func.extract('hour', Analysis.created_at).label('hour'),
                func.count(Analysis.id).label('count')
            )
            .filter(Analysis.created_at >= start_date)
            .group_by(func.extract('hour', Analysis.created_at))
            .order_by(func.count(Analysis.id).desc())
            .all()
        )

        return {
            "daily_active_users": [
                {"date": str(date), "count": count}
                for date, count in daily_active_users
            ],
            "daily_analyses": [
                {"date": str(date), "count": count}
                for date, count in daily_analyses
            ],
            "peak_hours": [
                {"hour": int(hour), "count": count}
                for hour, count in peak_hours
            ]
        }
