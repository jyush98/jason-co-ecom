from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class ContactInquiryBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    subject: str
    message: str
    budget_range: Optional[str] = None
    timeline: Optional[str] = None
    preferred_location: Optional[str] = "nyc-atelier"
    preferred_contact: Optional[List[str]] = []

class ContactInquiryCreate(ContactInquiryBase):
    source: str = "contact_page"
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class ContactInquiryResponse(BaseModel):
    success: bool
    message: str
    inquiry_id: Optional[int] = None

class ConsultationBookingBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    consultation_type: str  # virtual, in-person, premium
    preferred_date: Optional[datetime] = None
    project_description: Optional[str] = None
    budget_range: Optional[str] = None
    timeline: Optional[str] = None

class ConsultationBookingCreate(ConsultationBookingBase):
    alternative_dates: Optional[List[datetime]] = []

class ConsultationBookingResponse(BaseModel):
    success: bool
    message: str
    booking_id: Optional[int] = None
    next_steps: Optional[str] = None

class LocationNotificationCreate(BaseModel):
    email: EmailStr
    location_id: str

class LocationNotificationResponse(BaseModel):
    success: bool
    message: str

# Admin schemas for dashboard
class ContactInquiryOut(ContactInquiryBase):
    id: int
    status: str
    assigned_to: Optional[str]
    created_at: datetime
    response_sent_at: Optional[datetime]

    class Config:
        from_attributes = True

class ConsultationBookingOut(ConsultationBookingBase):
    id: int
    status: str
    confirmed_date: Optional[datetime]
    meeting_link: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
