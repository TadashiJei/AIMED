from datetime import datetime
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel

class NotificationType(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    SUCCESS = "success"

class Notification(BaseModel):
    id: str
    title: str
    message: str
    type: NotificationType
    start_date: datetime
    end_date: Optional[datetime]
    target_roles: List[str]
    is_active: bool = True

class MedicalForm(BaseModel):
    id: str
    title: str
    description: str
    fields: List[Dict]
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
    version: int

class StaticContent(BaseModel):
    id: str
    key: str
    content: str
    last_updated: datetime
    updated_by: str

class ContentService:
    def __init__(self, db: Session):
        self.db = db

    async def create_notification(self, notification: Dict) -> Notification:
        """Create a new system notification"""
        new_notification = Notification(
            id=str(uuid.uuid4()),
            **notification
        )
        self.db.add(new_notification)
        await self.db.commit()
        return new_notification

    async def update_notification(self, notification_id: str, data: Dict) -> Optional[Notification]:
        """Update an existing notification"""
        notification = await self.db.get(Notification, notification_id)
        if not notification:
            return None
        
        for key, value in data.items():
            setattr(notification, key, value)
        
        await self.db.commit()
        return notification

    async def get_active_notifications(self, user_role: str) -> List[Notification]:
        """Get active notifications for a specific user role"""
        now = datetime.utcnow()
        return await self.db.query(Notification).filter(
            Notification.is_active == True,
            Notification.start_date <= now,
            (Notification.end_date.is_(None) | (Notification.end_date >= now)),
            Notification.target_roles.contains([user_role])
        ).all()

    async def create_medical_form(self, form_data: Dict) -> MedicalForm:
        """Create a new medical form template"""
        # Get the latest version number for this form title
        latest_version = await self.db.query(func.max(MedicalForm.version)).filter(
            MedicalForm.title == form_data['title']
        ).scalar() or 0

        new_form = MedicalForm(
            id=str(uuid.uuid4()),
            version=latest_version + 1,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            **form_data
        )
        self.db.add(new_form)
        await self.db.commit()
        return new_form

    async def update_medical_form(self, form_id: str, data: Dict) -> Optional[MedicalForm]:
        """Update an existing medical form"""
        form = await self.db.get(MedicalForm, form_id)
        if not form:
            return None
        
        # Create a new version if fields are modified
        if 'fields' in data:
            data['version'] = form.version + 1
        
        data['updated_at'] = datetime.utcnow()
        
        for key, value in data.items():
            setattr(form, key, value)
        
        await self.db.commit()
        return form

    async def get_medical_forms(self, active_only: bool = True) -> List[MedicalForm]:
        """Get all medical forms"""
        query = self.db.query(MedicalForm)
        if active_only:
            query = query.filter(MedicalForm.is_active == True)
        return await query.all()

    async def update_static_content(self, key: str, content: str, user_id: str) -> StaticContent:
        """Update static content by key"""
        static_content = await self.db.query(StaticContent).filter(
            StaticContent.key == key
        ).first()

        if static_content:
            static_content.content = content
            static_content.last_updated = datetime.utcnow()
            static_content.updated_by = user_id
        else:
            static_content = StaticContent(
                id=str(uuid.uuid4()),
                key=key,
                content=content,
                last_updated=datetime.utcnow(),
                updated_by=user_id
            )
            self.db.add(static_content)

        await self.db.commit()
        return static_content

    async def get_static_content(self, key: str) -> Optional[StaticContent]:
        """Get static content by key"""
        return await self.db.query(StaticContent).filter(
            StaticContent.key == key
        ).first()
