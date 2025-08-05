from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.core.db import Base

class ContactInquiry(Base):
    __tablename__ = "contact_inquiries"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Info
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    company = Column(String(255), nullable=True)
    
    # Inquiry Details
    subject = Column(String(100), nullable=False)  # general, custom_order, consultation, etc.
    message = Column(Text, nullable=False)
    budget_range = Column(String(50), nullable=True)
    timeline = Column(String(50), nullable=True)
    preferred_location = Column(String(100), nullable=True, default="nyc-atelier")
    
    # Contact Preferences
    preferred_contact = Column(JSON, nullable=True)  # ["email", "phone", "whatsapp"]
    
    # Metadata
    source = Column(String(50), default="contact_page")
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Status tracking
    status = Column(String(50), default="new")  # new, contacted, in_progress, closed
    assigned_to = Column(String(255), nullable=True)
    response_sent_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<ContactInquiry(name='{self.name}', subject='{self.subject}')>"


class ConsultationBooking(Base):
    __tablename__ = "consultation_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Info
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    
    # Consultation Details
    consultation_type = Column(String(50), nullable=False)  # virtual, in-person, premium
    preferred_date = Column(DateTime, nullable=True)
    alternative_dates = Column(JSON, nullable=True)  # Alternative time slots
    duration_requested = Column(Integer, default=60)  # minutes
    
    # Project Info
    project_description = Column(Text, nullable=True)
    budget_range = Column(String(50), nullable=True)
    timeline = Column(String(50), nullable=True)
    
    # Status
    status = Column(String(50), default="pending")  # pending, confirmed, completed, cancelled
    confirmed_date = Column(DateTime, nullable=True)
    meeting_link = Column(String(500), nullable=True)  # For virtual consultations
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class LocationNotification(Base):
    __tablename__ = "location_notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    
    email = Column(String(255), nullable=False)
    location_id = Column(String(100), nullable=False)  # la-showroom, miami-boutique, etc.
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    notified_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="subscribed")  # subscribed, notified, unsubscribed
    
    def __repr__(self):
        return f"<LocationNotification(email='{self.email}', location='{self.location_id}')>"