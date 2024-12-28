from fastapi import HTTPException, status
from typing import List
from ..models.user import UserRole, User

class RBACMiddleware:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    async def __call__(self, user: User):
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )
        
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(self.allowed_roles)}"
            )
        
        return user

# Role-based access control decorators
def admin_only(user: User):
    return RBACMiddleware([UserRole.ADMIN])(user)

def doctors_only(user: User):
    return RBACMiddleware([UserRole.DOCTOR])(user)

def patients_only(user: User):
    return RBACMiddleware([UserRole.PATIENT])(user)

def medical_staff(user: User):
    return RBACMiddleware([UserRole.DOCTOR, UserRole.ADMIN])(user)

def authenticated(user: User):
    return RBACMiddleware([UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN])(user)
