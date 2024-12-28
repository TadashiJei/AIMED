from fastapi import APIRouter, HTTPException, Depends
from backend.models.settings import UserSettings, NotificationSettings, UserPreferences, PrivacySettings
from backend.auth.auth_handler import get_current_user
from typing import Dict, Any

router = APIRouter()

# Mock database
settings_db = {}

@router.get("/settings/{user_id}")
async def get_user_settings(user_id: int):
    if user_id not in settings_db:
        # Return default settings if not found
        return UserSettings(
            user_id=user_id,
            notifications=NotificationSettings(),
            preferences=UserPreferences(),
            privacy=PrivacySettings()
        )
    return settings_db[user_id]

@router.put("/settings/{user_id}")
async def update_user_settings(user_id: int, settings: UserSettings):
    settings_db[user_id] = settings
    return {"message": "Settings updated successfully"}

@router.put("/settings/{user_id}/notifications")
async def update_notification_settings(user_id: int, notifications: NotificationSettings):
    if user_id not in settings_db:
        settings_db[user_id] = UserSettings(
            user_id=user_id,
            notifications=notifications,
            preferences=UserPreferences(),
            privacy=PrivacySettings()
        )
    else:
        settings_db[user_id].notifications = notifications
    return {"message": "Notification settings updated successfully"}

@router.put("/settings/{user_id}/preferences")
async def update_preferences(user_id: int, preferences: UserPreferences):
    if user_id not in settings_db:
        settings_db[user_id] = UserSettings(
            user_id=user_id,
            notifications=NotificationSettings(),
            preferences=preferences,
            privacy=PrivacySettings()
        )
    else:
        settings_db[user_id].preferences = preferences
    return {"message": "Preferences updated successfully"}

@router.put("/settings/{user_id}/privacy")
async def update_privacy_settings(user_id: int, privacy: PrivacySettings):
    if user_id not in settings_db:
        settings_db[user_id] = UserSettings(
            user_id=user_id,
            notifications=NotificationSettings(),
            preferences=UserPreferences(),
            privacy=privacy
        )
    else:
        settings_db[user_id].privacy = privacy
    return {"message": "Privacy settings updated successfully"}
