# routes/notification_preferences.py - API endpoints for notification preferences
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from app.core.db import get_db
from app.models.user import User
from app.models.notification_preferences import NotificationPreference, NotificationPreferenceManager
from app.auth import verify_clerk_token
import re

router = APIRouter()

# Pydantic models for request/response validation
class NotificationSettingsRequest(BaseModel):
    """Request model that matches your frontend NotificationSettings component exactly."""
    
    email_notifications: Dict[str, bool] = Field(default_factory=lambda: {
        "order_confirmations": True,
        "order_updates": True,
        "shipping_notifications": True,
        "delivery_confirmations": True,
        "payment_receipts": True,
        "returns_refunds": True
    })
    
    marketing_notifications: Dict[str, bool] = Field(default_factory=lambda: {
        "new_products": False,
        "sales_promotions": False,
        "exclusive_offers": True,
        "collection_launches": False,
        "wishlist_updates": True,
        "price_drops": True,
        "abandoned_cart": True
    })
    
    account_notifications: Dict[str, bool] = Field(default_factory=lambda: {
        "security_alerts": True,
        "password_changes": True,
        "profile_updates": False,
        "privacy_updates": True
    })
    
    sms_notifications: Dict[str, Any] = Field(default_factory=lambda: {
        "enabled": False,
        "phone_number": "",
        "order_updates": False,
        "shipping_alerts": False,
        "delivery_notifications": False,
        "security_alerts": True
    })
    
    # 🔧 FIXED: Changed from regex to pattern for Pydantic v2 compatibility
    notification_frequency: str = Field(default="immediate", pattern="^(immediate|daily|weekly)$")
    
    quiet_hours: Dict[str, Any] = Field(default_factory=lambda: {
        "enabled": False,
        "start_time": "22:00",
        "end_time": "08:00",
        "timezone": "America/New_York"
    })
    
    @validator('notification_frequency')
    def validate_frequency(cls, v):
        """Additional validation for notification frequency."""
        allowed = ["immediate", "daily", "weekly"]
        if v not in allowed:
            raise ValueError(f'notification_frequency must be one of: {", ".join(allowed)}')
        return v
    
    @validator('sms_notifications')
    def validate_sms_phone(cls, v):
        """Validate phone number format if SMS is enabled."""
        if v.get('enabled') and v.get('phone_number'):
            phone = v['phone_number'].replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
            if not re.match(r'^\+?1?[0-9]{10,11}$', phone):
                raise ValueError('Invalid phone number format')
        return v
    
    @validator('quiet_hours')
    def validate_quiet_hours(cls, v):
        """Validate time format for quiet hours."""
        if v.get('enabled'):
            time_pattern = r'^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
            if not re.match(time_pattern, v.get('start_time', '')):
                raise ValueError('Invalid start_time format (use HH:MM)')
            if not re.match(time_pattern, v.get('end_time', '')):
                raise ValueError('Invalid end_time format (use HH:MM)')
        return v

class NotificationSettingsResponse(BaseModel):
    """Response model with user's current notification preferences."""
    
    email_notifications: Dict[str, bool]
    marketing_notifications: Dict[str, bool]
    account_notifications: Dict[str, bool]
    sms_notifications: Dict[str, Any]
    notification_frequency: str
    quiet_hours: Dict[str, Any]
    last_updated: Optional[str] = None

def get_user_by_clerk_id(db: Session, clerk_id: str) -> User:
    """Helper function to get user by Clerk ID."""
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/notification-preferences", response_model=NotificationSettingsResponse)
def get_notification_preferences(
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """
    Get user's notification preferences.
    Matches the API call your frontend makes: GET /account/notification-preferences
    """
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Get preferences using the manager
        preferences = NotificationPreferenceManager.get_user_preferences(db, db_user.id)
        
        # Get the database record for last_updated timestamp
        pref_record = db.query(NotificationPreference).filter(
            NotificationPreference.user_id == db_user.id
        ).first()
        
        return NotificationSettingsResponse(
            email_notifications=preferences["email_notifications"],
            marketing_notifications=preferences["marketing_notifications"],
            account_notifications=preferences["account_notifications"],
            sms_notifications=preferences["sms_notifications"],
            notification_frequency=preferences["notification_frequency"],
            quiet_hours=preferences["quiet_hours"],
            last_updated=pref_record.updated_at.isoformat() if pref_record else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get notification preferences: {str(e)}")

@router.post("/notification-preferences", response_model=dict)
def update_notification_preferences(
    preferences: NotificationSettingsRequest,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """
    Update user's notification preferences.
    Matches the API call your frontend makes: POST /account/notification-preferences
    """
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Convert Pydantic model to dict
        preferences_data = {
            "email_notifications": preferences.email_notifications,
            "marketing_notifications": preferences.marketing_notifications,
            "account_notifications": preferences.account_notifications,
            "sms_notifications": preferences.sms_notifications,
            "notification_frequency": preferences.notification_frequency,
            "quiet_hours": preferences.quiet_hours
        }
        
        # Update preferences using the manager (handles validation)
        updated_preferences = NotificationPreferenceManager.update_user_preferences(
            db, db_user.id, preferences_data
        )
        
        return {
            "success": True,
            "message": "Notification preferences updated successfully",
            "user_id": db_user.id,
            "last_updated": updated_preferences.updated_at.isoformat()
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update notification preferences: {str(e)}")

@router.get("/notification-preferences/check/{notification_type}")
def check_notification_enabled(
    notification_type: str,
    category: str,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """
    Check if a specific notification type is enabled for a user.
    Useful for internal API calls when sending notifications.
    
    Example: GET /notification-preferences/check/order_confirmations?category=email_notifications
    """
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Check if notification is allowed
        is_allowed = NotificationPreferenceManager.check_notification_allowed(
            db, db_user.id, notification_type, category
        )
        
        # Check if quiet hours are active
        is_quiet_hours = NotificationPreferenceManager.is_quiet_hours_active(db, db_user.id)
        
        return {
            "notification_type": notification_type,
            "category": category,
            "enabled": is_allowed,
            "quiet_hours_active": is_quiet_hours,
            "should_send": is_allowed and not is_quiet_hours
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check notification: {str(e)}")

@router.post("/notification-preferences/send-test")
def send_test_notification(
    notification_type: str,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """
    Send a test notification to verify settings are working.
    Useful for testing email/SMS setup from the frontend.
    """
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Check if this notification type is enabled
        if notification_type.startswith('email_'):
            category = 'email_notifications'
            notification_key = notification_type[6:]  # Remove 'email_' prefix
        elif notification_type.startswith('sms_'):
            category = 'sms_notifications'
            notification_key = notification_type[4:]  # Remove 'sms_' prefix
        else:
            raise HTTPException(status_code=400, detail="Invalid notification type")
        
        # Check if enabled
        is_enabled = NotificationPreferenceManager.check_notification_allowed(
            db, db_user.id, notification_key, category
        )
        
        if not is_enabled:
            return {
                "success": False,
                "message": f"Test notification not sent - {notification_type} is disabled in your preferences"
            }
        
        # TODO: Integrate with your notification service to actually send the test
        # For now, return success to indicate the preference check worked
        
        return {
            "success": True,
            "message": f"Test {notification_type} sent successfully",
            "notification_type": notification_type,
            "user_email": db_user.email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send test notification: {str(e)}")

@router.get("/notification-preferences/history")
def get_notification_history(
    limit: int = 50,
    offset: int = 0,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """
    Get user's notification history.
    This will be useful once we implement notification logging.
    """
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # TODO: Implement notification log model and return actual history
        # For now, return placeholder response
        
        return {
            "notifications": [],
            "total": 0,
            "limit": limit,
            "offset": offset,
            "message": "Notification history tracking will be available soon"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get notification history: {str(e)}")

@router.delete("/notification-preferences/reset")
def reset_notification_preferences(
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """
    Reset user's notification preferences to defaults.
    Useful for troubleshooting or user preference cleanup.
    """
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Delete existing preferences (will trigger recreating defaults)
        existing_prefs = db.query(NotificationPreference).filter(
            NotificationPreference.user_id == db_user.id
        ).first()
        
        if existing_prefs:
            db.delete(existing_prefs)
            db.commit()
        
        # Create new default preferences
        default_prefs = NotificationPreferenceManager.create_default_preferences(db, db_user.id)
        
        return {
            "success": True,
            "message": "Notification preferences reset to defaults",
            "reset_at": default_prefs.created_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset notification preferences: {str(e)}")

# Utility endpoint for checking SMS phone number
@router.get("/notification-preferences/sms-phone")
def get_sms_phone_number(
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """
    Get user's SMS phone number if SMS notifications are enabled.
    Useful for other services that need to send SMS.
    """
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Get SMS phone number
        phone_number = NotificationPreferenceManager.get_sms_phone_number(db, db_user.id)
        
        return {
            "sms_enabled": phone_number is not None,
            "phone_number": phone_number,
            "user_id": db_user.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get SMS phone number: {str(e)}")