from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

class DailyMetric(BaseModel):
    date: str
    count: int

class UserStats(BaseModel):
    total_users: int
    doctors: int
    patients: int
    pending_verifications: int
    daily_signups: List[DailyMetric]

class AnalysisMetrics(BaseModel):
    total_analyses: int
    status_distribution: Dict[str, int]
    analysis_types: Dict[str, int]

class SystemUsage(BaseModel):
    daily_active_users: List[DailyMetric]

class DashboardAnalytics(BaseModel):
    user_stats: UserStats
    analysis_metrics: AnalysisMetrics
    system_usage: SystemUsage

class Report(BaseModel):
    id: str
    title: str
    type: str
    status: str
    download_url: Optional[str]
    generated_by: str
    created_at: datetime

class Settings(BaseModel):
    email_notifications: bool = True
    daily_reports: bool = False
    auto_verification: bool = False
    maintenance_mode: bool = False
    system_email: str
    backup_frequency: str = "daily"
    max_upload_size: int = 10
    retention_days: int = 90
