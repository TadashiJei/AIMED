import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from models.admin import Admin
from models.database import SessionLocal, engine, Base

def create_superadmin():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if superadmin already exists
        if db.query(Admin).filter(Admin.is_superadmin == True).first():
            print("Superadmin already exists!")
            return

        # Create superadmin
        superadmin = Admin(
            username="superadmin",
            email="admin@aimed.com",
            full_name="Super Administrator",
            is_superadmin=True
        )
        superadmin.set_password("Admin@123")  # You should change this password immediately after creation

        db.add(superadmin)
        db.commit()
        print("Superadmin created successfully!")
        print("Username: superadmin")
        print("Password: Admin@123")
        print("Please change this password immediately after logging in!")
        
    except Exception as e:
        print(f"Error creating superadmin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_superadmin()
