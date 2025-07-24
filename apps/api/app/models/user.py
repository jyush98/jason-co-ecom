from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.core.db import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    clerk_id = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    
    # NEW: Account management columns (added by migration)
    settings = Column(Text, nullable=True)  # JSON backup/legacy support
    is_active = Column(Boolean, default=True, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Existing relationships
    cart_items = relationship("CartItem", back_populates="user")
    wishlist_items = relationship("WishlistItem", back_populates="user", cascade="all, delete-orphan")
    addresses = relationship("UserAddress", back_populates="user", cascade="all, delete-orphan")
    
    # Settings relationship
    user_settings = relationship("UserSetting", back_populates="user", cascade="all, delete-orphan")
    notification_preferences = relationship("NotificationPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")

    
    # Optional convenience methods for settings
    def get_setting(self, key: str, default=None):
        """Get a setting value with fallback."""
        from app.models.user_settings import SettingsManager
        from app.core.db import SessionLocal
        
        db = SessionLocal()
        try:
            return SettingsManager.get_setting(db, self.id, key) or default
        finally:
            db.close()
    
    def set_setting(self, key: str, value, category: str = None):
        """Set a setting value."""
        from app.models.user_settings import SettingsManager
        from app.core.db import SessionLocal
        
        db = SessionLocal()
        try:
            return SettingsManager.set_setting(db, self.id, key, value, category)
        finally:
            db.close()