# models/notification_preferences.py - Notification Preferences Database Model

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship, Session
from sqlalchemy.sql import func
from app.core.db import Base
from typing import Dict, Any, Optional
from datetime import datetime

class NotificationPreference(Base):
    """
    User notification preferences model.
    Stores comprehensive notification settings including email, SMS, marketing, and timing preferences.
    """
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    
    # Email notification preferences (JSON structure)
    email_notifications = Column(JSON, nullable=False, default={
        "order_confirmations": True,
        "order_updates": True,
        "shipping_notifications": True,
        "delivery_confirmations": True,
        "payment_receipts": True,
        "returns_refunds": True
    })
    
    # Marketing notification preferences (JSON structure)
    marketing_notifications = Column(JSON, nullable=False, default={
        "new_products": False,
        "sales_promotions": False,
        "exclusive_offers": True,
        "collection_launches": False,
        "wishlist_updates": True,
        "price_drops": True,
        "abandoned_cart": True
    })
    
    # Account & security notification preferences (JSON structure)
    account_notifications = Column(JSON, nullable=False, default={
        "security_alerts": True,
        "password_changes": True,
        "profile_updates": False,
        "privacy_updates": True
    })
    
    # SMS notification preferences (JSON structure)
    sms_notifications = Column(JSON, nullable=False, default={
        "enabled": False,
        "phone_number": "",
        "order_updates": False,
        "shipping_alerts": False,
        "delivery_notifications": False,
        "security_alerts": True
    })
    
    # General notification settings
    notification_frequency = Column(String(20), nullable=False, default="immediate")  # immediate, daily, weekly
    
    # Quiet hours settings (JSON structure)
    quiet_hours = Column(JSON, nullable=False, default={
        "enabled": False,
        "start_time": "22:00",
        "end_time": "08:00",
        "timezone": "America/New_York"
    })
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationship to User
    user = relationship("User", back_populates="notification_preferences")
    
    def __repr__(self):
        return f"<NotificationPreference user_id={self.user_id}>"

class NotificationPreferenceManager:
    """Helper class for managing notification preferences with proper validation and defaults."""
    
    # Default preference structure - matches your frontend exactly
    DEFAULT_PREFERENCES = {
        "email_notifications": {
            "order_confirmations": True,
            "order_updates": True,
            "shipping_notifications": True,
            "delivery_confirmations": True,
            "payment_receipts": True,
            "returns_refunds": True
        },
        "marketing_notifications": {
            "new_products": False,
            "sales_promotions": False,
            "exclusive_offers": True,
            "collection_launches": False,
            "wishlist_updates": True,
            "price_drops": True,
            "abandoned_cart": True
        },
        "account_notifications": {
            "security_alerts": True,
            "password_changes": True,
            "profile_updates": False,
            "privacy_updates": True
        },
        "sms_notifications": {
            "enabled": False,
            "phone_number": "",
            "order_updates": False,
            "shipping_alerts": False,
            "delivery_notifications": False,
            "security_alerts": True
        },
        "notification_frequency": "immediate",
        "quiet_hours": {
            "enabled": False,
            "start_time": "22:00",
            "end_time": "08:00",
            "timezone": "America/New_York"
        }
    }
    
    # Required notifications that users cannot disable (for security/legal compliance)
    REQUIRED_NOTIFICATIONS = {
        "email_notifications": ["order_confirmations", "payment_receipts"],
        "account_notifications": ["security_alerts", "password_changes"]
    }
    
    @classmethod
    def get_user_preferences(cls, db: Session, user_id: int) -> Dict[str, Any]:
        """Get user's notification preferences with defaults for missing values."""
        preferences = db.query(NotificationPreference).filter(
            NotificationPreference.user_id == user_id
        ).first()
        
        if not preferences:
            # Return defaults if no preferences exist
            return cls.DEFAULT_PREFERENCES.copy()
        
        # Merge with defaults to ensure all keys exist
        result = cls.DEFAULT_PREFERENCES.copy()
        
        # Update with stored preferences
        if preferences.email_notifications:
            result["email_notifications"].update(preferences.email_notifications)
        if preferences.marketing_notifications:
            result["marketing_notifications"].update(preferences.marketing_notifications)
        if preferences.account_notifications:
            result["account_notifications"].update(preferences.account_notifications)
        if preferences.sms_notifications:
            result["sms_notifications"].update(preferences.sms_notifications)
        if preferences.quiet_hours:
            result["quiet_hours"].update(preferences.quiet_hours)
        
        result["notification_frequency"] = preferences.notification_frequency or "immediate"
        
        return result
    
    @classmethod
    def update_user_preferences(cls, db: Session, user_id: int, preferences_data: Dict[str, Any]) -> NotificationPreference:
        """Update user's notification preferences with validation."""
        # Validate preferences against defaults and required settings
        validated_data = cls._validate_preferences(preferences_data)
        
        # Find existing preferences or create new
        preferences = db.query(NotificationPreference).filter(
            NotificationPreference.user_id == user_id
        ).first()
        
        if preferences:
            # Update existing preferences
            preferences.email_notifications = validated_data.get("email_notifications", preferences.email_notifications)
            preferences.marketing_notifications = validated_data.get("marketing_notifications", preferences.marketing_notifications)
            preferences.account_notifications = validated_data.get("account_notifications", preferences.account_notifications)
            preferences.sms_notifications = validated_data.get("sms_notifications", preferences.sms_notifications)
            preferences.notification_frequency = validated_data.get("notification_frequency", preferences.notification_frequency)
            preferences.quiet_hours = validated_data.get("quiet_hours", preferences.quiet_hours)
            preferences.updated_at = func.now()
        else:
            # Create new preferences
            preferences = NotificationPreference(
                user_id=user_id,
                email_notifications=validated_data.get("email_notifications", cls.DEFAULT_PREFERENCES["email_notifications"]),
                marketing_notifications=validated_data.get("marketing_notifications", cls.DEFAULT_PREFERENCES["marketing_notifications"]),
                account_notifications=validated_data.get("account_notifications", cls.DEFAULT_PREFERENCES["account_notifications"]),
                sms_notifications=validated_data.get("sms_notifications", cls.DEFAULT_PREFERENCES["sms_notifications"]),
                notification_frequency=validated_data.get("notification_frequency", "immediate"),
                quiet_hours=validated_data.get("quiet_hours", cls.DEFAULT_PREFERENCES["quiet_hours"])
            )
            db.add(preferences)
        
        db.commit()
        db.refresh(preferences)
        return preferences
    
    @classmethod
    def _validate_preferences(cls, preferences_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate preferences data and enforce required notifications."""
        validated = preferences_data.copy()
        
        # Enforce required notifications
        for category, required_keys in cls.REQUIRED_NOTIFICATIONS.items():
            if category in validated:
                for key in required_keys:
                    if key in validated[category]:
                        validated[category][key] = True  # Force required notifications to be enabled
        
        # Validate notification frequency
        if "notification_frequency" in validated:
            if validated["notification_frequency"] not in ["immediate", "daily", "weekly"]:
                validated["notification_frequency"] = "immediate"
        
        # Validate phone number format if SMS is enabled
        if "sms_notifications" in validated and validated["sms_notifications"].get("enabled"):
            phone = validated["sms_notifications"].get("phone_number", "")
            if not phone or len(phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")) < 10:
                # Disable SMS if phone number is invalid
                validated["sms_notifications"]["enabled"] = False
        
        # Validate quiet hours time format
        if "quiet_hours" in validated and validated["quiet_hours"].get("enabled"):
            start_time = validated["quiet_hours"].get("start_time", "22:00")
            end_time = validated["quiet_hours"].get("end_time", "08:00")
            
            # Basic time format validation (HH:MM)
            import re
            time_pattern = r'^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
            if not re.match(time_pattern, start_time):
                validated["quiet_hours"]["start_time"] = "22:00"
            if not re.match(time_pattern, end_time):
                validated["quiet_hours"]["end_time"] = "08:00"
        
        return validated
    
    @classmethod
    def check_notification_allowed(cls, db: Session, user_id: int, notification_type: str, category: str) -> bool:
        """Check if a specific notification type is allowed for a user."""
        preferences = db.query(NotificationPreference).filter(
            NotificationPreference.user_id == user_id
        ).first()
        
        if not preferences:
            # Use defaults if no preferences exist
            default_prefs = cls.DEFAULT_PREFERENCES
            return default_prefs.get(category, {}).get(notification_type, False)
        
        # Get the category preferences
        category_prefs = getattr(preferences, category, {})
        if not category_prefs:
            return cls.DEFAULT_PREFERENCES.get(category, {}).get(notification_type, False)
        
        return category_prefs.get(notification_type, False)
    
    @classmethod
    def is_quiet_hours_active(cls, db: Session, user_id: int, current_time: datetime = None) -> bool:
        """Check if quiet hours are currently active for a user."""
        if current_time is None:
            current_time = datetime.now()
        
        preferences = db.query(NotificationPreference).filter(
            NotificationPreference.user_id == user_id
        ).first()
        
        if not preferences or not preferences.quiet_hours or not preferences.quiet_hours.get("enabled"):
            return False
        
        # Get quiet hours settings
        start_time_str = preferences.quiet_hours.get("start_time", "22:00")
        end_time_str = preferences.quiet_hours.get("end_time", "08:00")
        
        try:
            # Parse time strings
            start_hour, start_min = map(int, start_time_str.split(":"))
            end_hour, end_min = map(int, end_time_str.split(":"))
            
            # Create time objects for comparison
            current_time_only = current_time.time()
            start_time = current_time.replace(hour=start_hour, minute=start_min, second=0, microsecond=0).time()
            end_time = current_time.replace(hour=end_hour, minute=end_min, second=0, microsecond=0).time()
            
            # Handle quiet hours that span midnight
            if start_time > end_time:
                # Quiet hours span midnight (e.g., 22:00 to 08:00)
                return current_time_only >= start_time or current_time_only <= end_time
            else:
                # Quiet hours within same day (e.g., 14:00 to 16:00)
                return start_time <= current_time_only <= end_time
                
        except (ValueError, AttributeError):
            # Invalid time format, assume not in quiet hours
            return False
    
    @classmethod
    def get_sms_phone_number(cls, db: Session, user_id: int) -> Optional[str]:
        """Get user's SMS phone number if SMS is enabled."""
        preferences = db.query(NotificationPreference).filter(
            NotificationPreference.user_id == user_id
        ).first()
        
        if not preferences or not preferences.sms_notifications:
            return None
        
        sms_prefs = preferences.sms_notifications
        if sms_prefs.get("enabled") and sms_prefs.get("phone_number"):
            return sms_prefs["phone_number"]
        
        return None
    
    @classmethod
    def create_default_preferences(cls, db: Session, user_id: int) -> NotificationPreference:
        """Create default notification preferences for a new user."""
        preferences = NotificationPreference(
            user_id=user_id,
            email_notifications=cls.DEFAULT_PREFERENCES["email_notifications"],
            marketing_notifications=cls.DEFAULT_PREFERENCES["marketing_notifications"],
            account_notifications=cls.DEFAULT_PREFERENCES["account_notifications"],
            sms_notifications=cls.DEFAULT_PREFERENCES["sms_notifications"],
            notification_frequency="immediate",
            quiet_hours=cls.DEFAULT_PREFERENCES["quiet_hours"]
        )
        
        db.add(preferences)
        db.commit()
        db.refresh(preferences)
        return preferences

# Update User model to include notification preferences relationship
# Add this to your User model:
"""
# In models/user.py, add this relationship:
notification_preferences = relationship("NotificationPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
"""