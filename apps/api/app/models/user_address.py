# models/user_address.py - User Address Database Model
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.db import Base

class UserAddress(Base):
    """
    User addresses for shipping and billing.
    Each user can have multiple addresses with one marked as default.
    """
    __tablename__ = "user_addresses"

    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign key to user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Address identification
    label = Column(String(100), nullable=False)  # "Home", "Work", "Mom's House", etc.
    
    # Contact information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    company = Column(String(200), nullable=True)
    phone = Column(String(50), nullable=True)
    
    # Address details
    address_line_1 = Column(String(255), nullable=False)
    address_line_2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)  # State/Province
    postal_code = Column(String(20), nullable=False)  # ZIP/Postal Code
    country = Column(String(2), default="US", nullable=False)  # ISO country code
    
    # Address settings
    is_default = Column(Boolean, default=False, nullable=False)
    is_billing = Column(Boolean, default=True, nullable=False)  # Can be used for billing
    is_shipping = Column(Boolean, default=True, nullable=False)  # Can be used for shipping
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Soft delete support
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="addresses")
    
    # Ensure unique label per user
    __table_args__ = (
        UniqueConstraint('user_id', 'label', name='unique_user_address_label'),
    )
    
    def __repr__(self):
        return f"<UserAddress {self.label} for user_id={self.user_id}>"
    
    @property
    def full_name(self):
        """Get the full name for this address."""
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def full_address(self):
        """Get the formatted full address."""
        address_parts = [self.address_line_1]
        if self.address_line_2:
            address_parts.append(self.address_line_2)
        address_parts.append(f"{self.city}, {self.state} {self.postal_code}")
        if self.country != "US":
            address_parts.append(self.country)
        return "\n".join(address_parts)
    
    def to_dict(self):
        """Convert address to dictionary for API responses."""
        return {
            "id": self.id,
            "label": self.label,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "company": self.company,
            "phone": self.phone,
            "address_line_1": self.address_line_1,
            "address_line_2": self.address_line_2,
            "city": self.city,
            "state": self.state,
            "postal_code": self.postal_code,
            "country": self.country,
            "is_default": self.is_default,
            "is_billing": self.is_billing,
            "is_shipping": self.is_shipping,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "full_name": self.full_name,
            "full_address": self.full_address
        }