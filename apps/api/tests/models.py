"""
Test-specific models that are compatible with SQLite.

These models mirror the production models but use SQLite-compatible types.
"""
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base

# Create separate test base to avoid conflicts with production models
TestBase = declarative_base()


class TestUser(TestBase):
    """Test-compatible User model."""
    __tablename__ = "test_users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    clerk_id = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TestProduct(TestBase):
    """Test-compatible Product model using JSON instead of JSONB."""
    __tablename__ = 'test_products'

    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Pricing in cents
    price = Column(Integer, nullable=False, comment='Price in cents')
    
    # Categories
    category_string = Column('category', String, nullable=True)
    
    # Inventory management
    inventory_count = Column(Integer, nullable=True)
    featured = Column(Boolean, nullable=False, default=False)
    
    # Product details using JSON (SQLite compatible)
    details = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())