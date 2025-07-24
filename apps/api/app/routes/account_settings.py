# routes/account_settings.py - API endpoints for account settings
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.core.db import get_db
from app.models.user import User
from app.auth import verify_clerk_token
import json
from datetime import datetime

router = APIRouter()

# Pydantic models for settings
class SecuritySettings(BaseModel):
    twoFactorEnabled: bool = False
    loginNotifications: bool = True
    deviceTracking: bool = True
    sessionTimeout: int = Field(default=30, ge=15, le=480)

class PrivacySettings(BaseModel):
    dataCollection: bool = True
    marketingEmails: bool = True
    personalizedAds: bool = False
    publicProfile: bool = False

class UserSettings(BaseModel):
    security: SecuritySettings
    privacy: PrivacySettings
    language: str = "en-US"
    currency: str = "USD"
    timezone: str = "America/New_York"
    theme: Optional[str] = "system"

class UserSettingsResponse(BaseModel):
    security: SecuritySettings
    privacy: PrivacySettings
    language: str
    currency: str
    timezone: str
    theme: str
    updatedAt: str

def get_user_by_clerk_id(db: Session, clerk_id: str) -> User:
    """Helper function to get user by Clerk ID."""
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/settings", response_model=UserSettingsResponse)
def get_user_settings(
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get user's account settings."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Parse stored settings JSON or use defaults
        stored_settings = {}
        if hasattr(db_user, 'settings') and db_user.settings:
            try:
                stored_settings = json.loads(db_user.settings)
            except json.JSONDecodeError:
                stored_settings = {}
        
        # Return settings with defaults for missing values
        return UserSettingsResponse(
            security=SecuritySettings(**stored_settings.get('security', {})),
            privacy=PrivacySettings(**stored_settings.get('privacy', {})),
            language=stored_settings.get('language', 'en-US'),
            currency=stored_settings.get('currency', 'USD'),
            timezone=stored_settings.get('timezone', 'America/New_York'),
            theme=stored_settings.get('theme', 'system'),
            updatedAt=stored_settings.get('updatedAt', datetime.utcnow().isoformat())
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get settings: {str(e)}")

@router.put("/settings", response_model=dict)
def update_user_settings(
    settings: UserSettings,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Update user's account settings."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Convert settings to dict and add timestamp
        settings_dict = settings.dict()
        settings_dict['updatedAt'] = datetime.utcnow().isoformat()
        
        # Store as JSON string (you might want a separate settings table in production)
        db_user.settings = json.dumps(settings_dict)
        
        db.commit()
        db.refresh(db_user)
        
        return {
            "success": True,
            "message": "Settings updated successfully",
            "updatedAt": settings_dict['updatedAt']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update settings: {str(e)}")

@router.post("/export-data")
def export_user_data(
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Export all user data for GDPR compliance."""
    try:
        from fastapi.responses import JSONResponse
        
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Collect all user data
        user_data = {
            "profile": {
                "id": db_user.id,
                "clerk_id": db_user.clerk_id,
                "email": db_user.email,
                "first_name": db_user.first_name,
                "last_name": db_user.last_name,
                "created_at": db_user.created_at.isoformat() if hasattr(db_user, 'created_at') else None
            },
            "settings": json.loads(db_user.settings) if hasattr(db_user, 'settings') and db_user.settings else {},
            "addresses": [],
            "orders": [],
            "wishlist": [],
            "cart_items": []
        }
        
        # Add addresses if they exist
        if hasattr(db_user, 'addresses'):
            user_data["addresses"] = [
                {
                    "id": addr.id,
                    "first_name": addr.first_name,
                    "last_name": addr.last_name,
                    "address_line_1": addr.address_line_1,
                    "address_line_2": addr.address_line_2,
                    "city": addr.city,
                    "state": addr.state,
                    "postal_code": addr.postal_code,
                    "country": addr.country,
                    "is_default": addr.is_default,
                    "created_at": addr.created_at.isoformat()
                }
                for addr in db_user.addresses
            ]
        
        # Add orders if they exist
        if hasattr(db_user, 'orders'):
            user_data["orders"] = [
                {
                    "id": order.id,
                    "order_number": order.order_number,
                    "total_price": order.total_price,
                    "status": order.status,
                    "created_at": order.created_at.isoformat(),
                    "items": [
                        {
                            "product_name": item.product_name,
                            "quantity": item.quantity,
                            "unit_price": item.unit_price
                        }
                        for item in order.items
                    ] if hasattr(order, 'items') else []
                }
                for order in db_user.orders
            ]
        
        # Add wishlist if it exists
        if hasattr(db_user, 'wishlist_items'):
            user_data["wishlist"] = [
                {
                    "product_id": item.product_id,
                    "notes": item.notes,
                    "created_at": item.created_at.isoformat()
                }
                for item in db_user.wishlist_items
            ]
        
        # Add cart items if they exist
        if hasattr(db_user, 'cart_items'):
            user_data["cart_items"] = [
                {
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "created_at": item.created_at.isoformat()
                }
                for item in db_user.cart_items
            ]
        
        # Add export metadata
        user_data["export_info"] = {
            "exported_at": datetime.utcnow().isoformat(),
            "export_version": "1.0",
            "format": "JSON"
        }
        
        # Return as downloadable JSON
        return JSONResponse(
            content=user_data,
            headers={
                "Content-Disposition": f"attachment; filename=jasonco-account-data-{db_user.id}.json"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export data: {str(e)}")

@router.delete("/delete-account")
def delete_user_account(
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """
    Delete user account and all associated data.
    Note: This should also trigger Clerk user deletion on the frontend.
    """
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # In a real implementation, you might want to:
        # 1. Soft delete instead of hard delete
        # 2. Anonymize data instead of deleting
        # 3. Keep order history for business records
        # 4. Send confirmation email
        
        # For now, we'll mark the user as deleted but keep the record
        if hasattr(db_user, 'is_active'):
            db_user.is_active = False
        if hasattr(db_user, 'deleted_at'):
            db_user.deleted_at = datetime.utcnow()
        
        # Clear sensitive data
        db_user.email = f"deleted-user-{db_user.id}@deleted.com"
        db_user.first_name = None
        db_user.last_name = None
        
        # Clear settings
        if hasattr(db_user, 'settings'):
            db_user.settings = None
        
        db.commit()
        
        return {
            "success": True,
            "message": "Account deletion initiated. Please complete the process in your email."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")

@router.get("/privacy-settings", response_model=PrivacySettings)
def get_privacy_settings(
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get only privacy-related settings (for quick access)."""
    try:
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        stored_settings = {}
        if hasattr(db_user, 'settings') and db_user.settings:
            try:
                stored_settings = json.loads(db_user.settings)
            except json.JSONDecodeError:
                stored_settings = {}
        
        return PrivacySettings(**stored_settings.get('privacy', {}))
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get privacy settings: {str(e)}")

@router.put("/privacy-settings", response_model=dict)
def update_privacy_settings(
    privacy: PrivacySettings,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Update only privacy settings (for quick updates)."""
    try:
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Get existing settings
        stored_settings = {}
        if hasattr(db_user, 'settings') and db_user.settings:
            try:
                stored_settings = json.loads(db_user.settings)
            except json.JSONDecodeError:
                stored_settings = {}
        
        # Update only privacy section
        stored_settings['privacy'] = privacy.dict()
        stored_settings['updatedAt'] = datetime.utcnow().isoformat()
        
        db_user.settings = json.dumps(stored_settings)
        db.commit()
        
        return {
            "success": True,
            "message": "Privacy settings updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update privacy settings: {str(e)}")

# Optional: Add this column to your User model
"""
# In models/user.py, add this field:
settings = Column(Text, nullable=True)  # Store JSON settings
is_active = Column(Boolean, default=True)  # For soft deletes
deleted_at = Column(DateTime, nullable=True)  # Track deletion time
"""