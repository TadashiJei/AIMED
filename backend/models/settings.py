from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy import Column, String, Boolean, Integer, DateTime
from sqlalchemy.orm import relationship
from backend.database.db import Base
from datetime import datetime

class NotificationSettings(BaseModel):
    appointments: bool = True
    medicationReminders: bool = True
    labResults: bool = True
    newsletters: bool = False

class UserPreferences(BaseModel):
    language: str = "en"
    theme: str = "light"
    timeZone: str = "UTC+8"

class PrivacySettings(BaseModel):
    shareDataWithDoctors: bool = True
    shareDataWithResearchers: bool = False
    allowAnalytics: bool = True

class UserSettings(BaseModel):
    user_id: int
    notifications: NotificationSettings
    preferences: UserPreferences
    privacy: PrivacySettings

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True)
    email_notifications = Column(Boolean, default=True)
    daily_reports = Column(Boolean, default=False)
    auto_verification = Column(Boolean, default=False)
    maintenance_mode = Column(Boolean, default=False)
    system_email = Column(String, nullable=False)
    backup_frequency = Column(String, default="daily")
    max_upload_size = Column(Integer, default=10)
    retention_days = Column(Integer, default=90)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SystemSettingsResponse(BaseModel):
    email_notifications: bool
    daily_reports: bool
    auto_verification: bool
    maintenance_mode: bool
    system_email: EmailStr
    backup_frequency: str
    max_upload_size: int
    retention_days: int

    class Config:
        from_attributes = True
