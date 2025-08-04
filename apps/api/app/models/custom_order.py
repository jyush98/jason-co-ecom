# app/models/custom_order.py
from sqlalchemy import Column, ForeignKey, Integer, String, Text, DateTime, Float, Boolean, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.db import Base

class CustomOrder(Base):
    __tablename__ = "custom_orders"

    # Basic Info
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    
    # Project Details (Step 1: Define Your Vision)
    project_type = Column(String, nullable=True)  # 'furniture', 'decor', 'lighting', 'full_room'
    style_preference = Column(String, nullable=True)  # 'modern', 'traditional', 'rustic', etc.
    room_type = Column(String, nullable=True)  # 'living_room', 'bedroom', 'office', etc.
    project_description = Column(Text, nullable=True)
    inspiration_notes = Column(Text, nullable=True)
    
    # Specifications (Step 2: Specifications & Materials)
    dimensions = Column(JSON, nullable=True)  # {"length": 120, "width": 60, "height": 75, "unit": "cm"}
    materials = Column(JSON, nullable=True)  # ["oak", "steel", "leather"]
    color_preferences = Column(JSON, nullable=True)  # ["dark_brown", "black", "gold_accents"]
    special_requirements = Column(Text, nullable=True)
    functionality_needs = Column(JSON, nullable=True)  # ["storage", "adjustable", "removable"]
    
    # Investment (Step 3: Investment Range)
    budget_range = Column(String, nullable=True)  # '1k-3k', '3k-5k', '5k-10k', '10k-20k', '20k+'
    estimated_price = Column(Float, nullable=True)  # From price calculator
    price_breakdown = Column(JSON, nullable=True)  # Detailed pricing components
    payment_preference = Column(String, nullable=True)  # 'full_upfront', 'milestone', 'completion'
    
    # Timeline & Contact (Step 4: Project Coordination)
    timeline_preference = Column(String, nullable=True)  # 'rush', 'standard', 'flexible'
    target_completion = Column(DateTime, nullable=True)
    delivery_address = Column(Text, nullable=True)
    delivery_requirements = Column(Text, nullable=True)
    consultation_preference = Column(String, nullable=True)  # 'in_person', 'virtual', 'phone'
    preferred_contact_time = Column(String, nullable=True)
    
    # Project Status & Management
    status = Column(String, default="inquiry")  # 'inquiry', 'quoted', 'approved', 'in_progress', 'completed', 'cancelled'
    priority = Column(String, default="standard")  # 'urgent', 'high', 'standard', 'low'
    assigned_designer = Column(String, nullable=True)
    internal_notes = Column(Text, nullable=True)  # Admin-only notes
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_contact_date = Column(DateTime, nullable=True)
    
    # Form completion tracking
    current_step = Column(Integer, default=1)  # Which step user is on
    is_draft = Column(Boolean, default=True)  # True until final submission
    form_completion_percentage = Column(Float, default=0.0)
    
    # Communication preferences
    marketing_consent = Column(Boolean, default=False)
    communication_preferences = Column(JSON, nullable=True)  # ["email", "phone", "sms"]
    
    # Legacy fields (maintain compatibility)
    message = Column(Text, nullable=True)  # Original message field
    image_url = Column(String, nullable=True)  # Single image URL (legacy)
    
    # Relationships
    images = relationship("CustomOrderImage", back_populates="custom_order", cascade="all, delete-orphan")
    timeline_updates = relationship("CustomOrderTimeline", back_populates="custom_order")


class CustomOrderImage(Base):
    __tablename__ = "custom_order_images"
    
    id = Column(Integer, primary_key=True, index=True)
    custom_order_id = Column(Integer, ForeignKey("custom_orders.id"), nullable=False)
    image_url = Column(String, nullable=False)
    image_type = Column(String, nullable=True)  # 'inspiration', 'reference', 'specification'
    caption = Column(String, nullable=True)
    upload_order = Column(Integer, default=0)  # For sorting multiple images
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    custom_order = relationship("CustomOrder", back_populates="images")


class CustomOrderTimeline(Base):
    __tablename__ = "custom_order_timeline"
    
    id = Column(Integer, primary_key=True, index=True)
    custom_order_id = Column(Integer, ForeignKey("custom_orders.id"), nullable=False)
    milestone = Column(String, nullable=False)  # 'inquiry_received', 'quote_sent', 'approved', etc.
    description = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    estimated_date = Column(DateTime, nullable=True)
    is_completed = Column(Boolean, default=False)
    created_by = Column(String, nullable=True)  # Admin who created the milestone
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    custom_order = relationship("CustomOrder", back_populates="timeline_updates")


class DesignConsultation(Base):
    __tablename__ = "design_consultations"
    
    id = Column(Integer, primary_key=True, index=True)
    custom_order_id = Column(Integer, ForeignKey("custom_orders.id"), nullable=True)
    client_name = Column(String, nullable=False)
    client_email = Column(String, nullable=False)
    client_phone = Column(String, nullable=True)
    consultation_type = Column(String, nullable=False)  # 'initial', 'design_review', 'final_approval'
    consultation_method = Column(String, nullable=False)  # 'in_person', 'virtual', 'phone'
    scheduled_date = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, default=60)
    status = Column(String, default="scheduled")  # 'scheduled', 'completed', 'cancelled', 'rescheduled'
    meeting_link = Column(String, nullable=True)  # For virtual consultations
    meeting_notes = Column(Text, nullable=True)
    next_steps = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())