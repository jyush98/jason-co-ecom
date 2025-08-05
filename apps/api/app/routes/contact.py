from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.schemas.contact import (
    ContactInquiryCreate, ContactInquiryResponse,
    ConsultationBookingCreate, ConsultationBookingResponse,
    LocationNotificationCreate, LocationNotificationResponse
)
from app.models.contact import ContactInquiry, ConsultationBooking, LocationNotification
from app.services.email_service import send_contact_inquiry_email, send_consultation_booking_email
import logging

router = APIRouter(prefix="/api/contact", tags=["contact"])
logger = logging.getLogger(__name__)

# Helper function to get client IP safely
def get_client_ip(request: Request) -> str:
    """Get client IP address safely"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return getattr(request.client, 'host', 'unknown')

@router.post("/inquiry", response_model=ContactInquiryResponse)
async def submit_contact_inquiry(
    inquiry: ContactInquiryCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Submit a general contact inquiry"""
    try:
        # Add request metadata
        inquiry_dict = inquiry.dict()
        inquiry_dict['ip_address'] = get_client_ip(request)
        inquiry_dict['user_agent'] = request.headers.get("user-agent", "")
        
        # Create inquiry record
        db_inquiry = ContactInquiry(**inquiry_dict)
        db.add(db_inquiry)
        db.commit()
        db.refresh(db_inquiry)
        
        # Send notification emails (background task)
        try:
            await send_contact_inquiry_email(
                inquiry_data=inquiry.dict(),
                inquiry_id=db_inquiry.id
            )
        except Exception as email_error:
            logger.error(f"Email sending failed: {email_error}")
            # Don't fail the API call if email fails
        
        logger.info(f"Contact inquiry submitted: {db_inquiry.id} from {inquiry.email}")
        
        return ContactInquiryResponse(
            success=True,
            message="Thank you for your inquiry. We'll respond within 2 hours during business hours.",
            inquiry_id=db_inquiry.id
        )
        
    except Exception as e:
        logger.error(f"Error submitting contact inquiry: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to submit inquiry")

@router.post("/consultation", response_model=ConsultationBookingResponse)
async def book_consultation(
    booking: ConsultationBookingCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Book a design consultation"""
    try:
        # Create booking record
        db_booking = ConsultationBooking(**booking.dict())
        db.add(db_booking)
        db.commit()
        db.refresh(db_booking)
        
        # Send confirmation emails
        try:
            await send_consultation_booking_email(
                booking_data=booking.dict(),
                booking_id=db_booking.id
            )
        except Exception as email_error:
            logger.error(f"Email sending failed: {email_error}")
        
        logger.info(f"Consultation booked: {db_booking.id} for {booking.email}")
        
        return ConsultationBookingResponse(
            success=True,
            message="Consultation request received! We'll confirm your appointment within 24 hours.",
            booking_id=db_booking.id,
            next_steps="Check your email for confirmation and preparation materials."
        )
        
    except Exception as e:
        logger.error(f"Error booking consultation: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to book consultation")

@router.post("/location-notify", response_model=LocationNotificationResponse)
async def subscribe_location_notification(
    notification: LocationNotificationCreate,
    db: Session = Depends(get_db)
):
    """Subscribe to notifications for new location openings"""
    try:
        # Check if already subscribed
        existing = db.query(LocationNotification).filter(
            LocationNotification.email == notification.email,
            LocationNotification.location_id == notification.location_id,
            LocationNotification.status == "subscribed"
        ).first()
        
        if existing:
            return LocationNotificationResponse(
                success=True,
                message="You're already subscribed to notifications for this location."
            )
        
        # Create notification subscription
        db_notification = LocationNotification(**notification.dict())
        db.add(db_notification)
        db.commit()
        
        logger.info(f"Location notification subscription: {notification.email} for {notification.location_id}")
        
        return LocationNotificationResponse(
            success=True,
            message="Thanks! We'll notify you when this location opens."
        )
        
    except Exception as e:
        logger.error(f"Error subscribing to location notifications: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to subscribe")

@router.get("/hours")
async def get_business_hours():
    """Get current business hours and availability"""
    return {
        "regular_hours": {
            "monday": {"open": "10:00", "close": "19:00", "timezone": "EST"},
            "tuesday": {"open": "10:00", "close": "19:00", "timezone": "EST"},
            "wednesday": {"open": "10:00", "close": "19:00", "timezone": "EST"},
            "thursday": {"open": "10:00", "close": "19:00", "timezone": "EST"},
            "friday": {"open": "10:00", "close": "19:00", "timezone": "EST"},
            "saturday": {"open": "10:00", "close": "18:00", "timezone": "EST"},
            "sunday": {"open": None, "close": None, "note": "By appointment only"}
        },
        "emergency_line": {
            "available": True,
            "phone": "+1-212-555-VIPS",
            "conditions": "VIP clients with orders $25,000+"
        },
        "response_times": {
            "email": "Within 2 hours during business hours",
            "phone": "Immediate during business hours",
            "consultation_booking": "Confirmed within 24 hours"
        }
    }