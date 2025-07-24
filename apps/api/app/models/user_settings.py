# models/user_settings.py - User Settings Database Model
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.db import Base

class UserSetting(Base):
    """
    Flexible user settings model using key-value pairs.
    This approach allows adding new settings without schema changes.
    """
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign key to users table
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Setting identification
    setting_key = Column(String(100), nullable=False, index=True)
    setting_value = Column(Text, nullable=True)  # Store as JSON string or plain text
    
    # Setting metadata
    setting_category = Column(String(50), nullable=True, index=True)  # 'security', 'privacy', 'ui'
    is_encrypted = Column(String(10), default='false')  # 'true'/'false' for sensitive settings
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationship
    user = relationship("User", back_populates="user_settings")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'setting_key', name='unique_user_setting'),
        Index('idx_user_settings_user_category', 'user_id', 'setting_category'),
        Index('idx_user_settings_key_value', 'setting_key', 'setting_value'),
    )
    
    def __repr__(self):
        return f"<UserSetting user_id={self.user_id} key={self.setting_key}>"

# Utility functions for settings management
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
import json

class SettingsManager:
    """Helper class for managing user settings operations."""
    
    # Default settings with their categories
    DEFAULT_SETTINGS = {
        # UI/Theme settings
        'theme': {'value': 'system', 'category': 'ui'},
        'language': {'value': 'en-US', 'category': 'ui'},
        'currency': {'value': 'USD', 'category': 'ui'},
        'timezone': {'value': 'America/New_York', 'category': 'ui'},
        
        # Security settings
        'two_factor_enabled': {'value': 'false', 'category': 'security'},
        'login_notifications': {'value': 'true', 'category': 'security'},
        'device_tracking': {'value': 'true', 'category': 'security'},
        'session_timeout': {'value': '30', 'category': 'security'},
        
        # Privacy settings
        'data_collection': {'value': 'true', 'category': 'privacy'},
        'marketing_emails': {'value': 'true', 'category': 'privacy'},
        'personalized_ads': {'value': 'false', 'category': 'privacy'},
        'public_profile': {'value': 'false', 'category': 'privacy'},
    }
    
    @staticmethod
    def get_user_settings(db: Session, user_id: int) -> Dict[str, Any]:
        """Get all settings for a user with defaults."""
        # Get stored settings
        stored_settings = db.query(UserSetting).filter(
            UserSetting.user_id == user_id
        ).all()
        
        # Convert to dict
        settings_dict = {}
        for setting in stored_settings:
            try:
                # Try to parse as JSON first
                settings_dict[setting.setting_key] = json.loads(setting.setting_value)
            except (json.JSONDecodeError, TypeError):
                # Fall back to string value
                settings_dict[setting.setting_key] = setting.setting_value
        
        # Apply defaults for missing settings
        for key, default_info in SettingsManager.DEFAULT_SETTINGS.items():
            if key not in settings_dict:
                settings_dict[key] = default_info['value']
        
        return settings_dict
    
    @staticmethod
    def get_setting(db: Session, user_id: int, setting_key: str) -> Optional[Any]:
        """Get a single setting value."""
        setting = db.query(UserSetting).filter(
            UserSetting.user_id == user_id,
            UserSetting.setting_key == setting_key
        ).first()
        
        if setting:
            try:
                return json.loads(setting.setting_value)
            except (json.JSONDecodeError, TypeError):
                return setting.setting_value
        
        # Return default if exists
        default_info = SettingsManager.DEFAULT_SETTINGS.get(setting_key)
        return default_info['value'] if default_info else None
    
    @staticmethod
    def set_setting(
        db: Session, 
        user_id: int, 
        setting_key: str, 
        setting_value: Any,
        category: Optional[str] = None
    ) -> UserSetting:
        """Set a single setting value."""
        # Determine category if not provided
        if not category:
            default_info = SettingsManager.DEFAULT_SETTINGS.get(setting_key)
            category = default_info['category'] if default_info else 'custom'
        
        # Convert value to JSON string if not already string
        if isinstance(setting_value, (dict, list, bool)):
            value_str = json.dumps(setting_value)
        else:
            value_str = str(setting_value)
        
        # Find existing setting or create new
        setting = db.query(UserSetting).filter(
            UserSetting.user_id == user_id,
            UserSetting.setting_key == setting_key
        ).first()
        
        if setting:
            setting.setting_value = value_str
            setting.setting_category = category
            setting.updated_at = func.now()
        else:
            setting = UserSetting(
                user_id=user_id,
                setting_key=setting_key,
                setting_value=value_str,
                setting_category=category
            )
            db.add(setting)
        
        db.commit()
        db.refresh(setting)
        return setting
    
    @staticmethod
    def set_multiple_settings(
        db: Session, 
        user_id: int, 
        settings_dict: Dict[str, Any]
    ) -> List[UserSetting]:
        """Set multiple settings at once (more efficient)."""
        updated_settings = []
        
        for key, value in settings_dict.items():
            setting = SettingsManager.set_setting(db, user_id, key, value)
            updated_settings.append(setting)
        
        return updated_settings
    
    @staticmethod
    def delete_setting(db: Session, user_id: int, setting_key: str) -> bool:
        """Delete a specific setting (reverts to default)."""
        setting = db.query(UserSetting).filter(
            UserSetting.user_id == user_id,
            UserSetting.setting_key == setting_key
        ).first()
        
        if setting:
            db.delete(setting)
            db.commit()
            return True
        return False
    
    @staticmethod
    def get_settings_by_category(
        db: Session, 
        user_id: int, 
        category: str
    ) -> Dict[str, Any]:
        """Get all settings in a specific category."""
        settings = db.query(UserSetting).filter(
            UserSetting.user_id == user_id,
            UserSetting.setting_category == category
        ).all()
        
        category_settings = {}
        for setting in settings:
            try:
                category_settings[setting.setting_key] = json.loads(setting.setting_value)
            except (json.JSONDecodeError, TypeError):
                category_settings[setting.setting_key] = setting.setting_value
        
        # Add defaults for missing settings in this category
        for key, default_info in SettingsManager.DEFAULT_SETTINGS.items():
            if default_info['category'] == category and key not in category_settings:
                category_settings[key] = default_info['value']
        
        return category_settings
    
    @staticmethod
    def reset_to_defaults(db: Session, user_id: int) -> bool:
        """Reset all user settings to defaults."""
        # Delete all existing settings
        db.query(UserSetting).filter(UserSetting.user_id == user_id).delete()
        db.commit()
        return True
    
    @staticmethod
    def export_user_settings(db: Session, user_id: int) -> Dict[str, Any]:
        """Export all user settings for data portability."""
        settings = SettingsManager.get_user_settings(db, user_id)
        
        return {
            "user_id": user_id,
            "settings": settings,
            "exported_at": func.now(),
            "format_version": "1.0"
        }

# Database creation function
def create_user_settings_table(engine):
    """Create the user_settings table."""
    UserSetting.metadata.create_all(bind=engine)

# Example usage:
"""
from models.user_settings import SettingsManager

# Get all user settings
settings = SettingsManager.get_user_settings(db, user_id=1)

# Set a theme
SettingsManager.set_setting(db, user_id=1, 'theme', 'dark')

# Set multiple settings
SettingsManager.set_multiple_settings(db, user_id=1, {
    'theme': 'dark',
    'language': 'en-US',
    'two_factor_enabled': True
})

# Get privacy settings only
privacy_settings = SettingsManager.get_settings_by_category(db, user_id=1, 'privacy')
"""