# app/routers/custom_orders.py
import os
from typing import List, Optional
import requests
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_
from datetime import datetime, timedelta

from app.core.db import get_db
from app.models.custom_order import CustomOrder, CustomOrderImage, CustomOrderTimeline, DesignConsultation
from app.schemas.custom_order import (
    CustomOrderOut, CustomOrderCreate, CustomOrderUpdate, CustomOrderSummary,
    CustomOrderFormComplete, CustomOrderResponse, CustomOrderListResponse,
    DesignConsultationCreate, DesignConsultationOut
)
from app.utils.s3 import upload_inspiration_image

router = APIRouter(prefix="/api/custom-orders", tags=["custom-orders"])

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@yourstore.com")

# ============================================================================
# CUSTOM ORDER CRUD OPERATIONS
# ============================================================================

@router.get("/", response_model=CustomOrderListResponse)
def get_custom_orders(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    is_draft: Optional[bool] = Query(None),
    search: Optional[str] = Query(None)
):
    """Get paginated list of custom orders with filtering"""
    query = db.query(CustomOrder)
    
    # Apply filters
    if status:
        query = query.filter(CustomOrder.status == status)
    if priority:
        query = query.filter(CustomOrder.priority == priority)
    if is_draft is not None:
        query = query.filter(CustomOrder.is_draft == is_draft)
    if search:
        query = query.filter(
            or_(
                CustomOrder.name.ilike(f"%{search}%"),
                CustomOrder.email.ilike(f"%{search}%"),
                CustomOrder.project_description.ilike(f"%{search}%")
            )
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    orders = (
        query.order_by(desc(CustomOrder.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    
    return CustomOrderListResponse(
        success=True,
        data=[CustomOrderSummary.from_orm(order) for order in orders],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )

@router.get("/{order_id}", response_model=CustomOrderResponse)
def get_custom_order(order_id: int, db: Session = Depends(get_db)):
    """Get detailed custom order by ID"""
    order = db.query(CustomOrder).filter(CustomOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Custom order not found")
    
    return CustomOrderResponse(
        success=True,
        message="Custom order retrieved successfully",
        data=CustomOrderOut.from_orm(order)
    )

@router.post("/", response_model=CustomOrderResponse)
def create_custom_order(order_data: CustomOrderCreate, db: Session = Depends(get_db)):
    """Create a new custom order"""
    try:
        # Create the order
        order = CustomOrder(**order_data.dict(exclude_unset=True))
        db.add(order)
        db.commit()
        db.refresh(order)
        
        # Create initial timeline entry
        timeline_entry = CustomOrderTimeline(
            custom_order_id=order.id,
            milestone="inquiry_received",
            description="Initial custom order inquiry received",
            is_completed=True,
            completed_at=datetime.utcnow()
        )
        db.add(timeline_entry)
        db.commit()
        
        return CustomOrderResponse(
            success=True,
            message="Custom order created successfully",
            data=CustomOrderOut.from_orm(order)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating custom order: {str(e)}")

@router.put("/{order_id}", response_model=CustomOrderResponse)
def update_custom_order(
    order_id: int, 
    order_data: CustomOrderUpdate, 
    db: Session = Depends(get_db)
):
    """Update an existing custom order"""
    order = db.query(CustomOrder).filter(CustomOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Custom order not found")
    
    try:
        # Update fields
        for field, value in order_data.dict(exclude_unset=True).items():
            setattr(order, field, value)
        
        order.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(order)
        
        return CustomOrderResponse(
            success=True,
            message="Custom order updated successfully",
            data=CustomOrderOut.from_orm(order)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating custom order: {str(e)}")

# ============================================================================
# MULTI-STEP FORM SUBMISSION (NEW ENHANCED FLOW)
# ============================================================================

@router.post("/submit", response_model=CustomOrderResponse)
async def submit_custom_order_form(
    form_data: CustomOrderFormComplete,
    db: Session = Depends(get_db)
):
    """Submit complete multi-step custom order form"""
    try:
        # Combine all steps into a single order
        order_dict = {
            # Step 1: Vision
            "project_type": form_data.step1.project_type,
            "style_preference": form_data.step1.style_preference,
            "room_type": form_data.step1.room_type,
            "project_description": form_data.step1.project_description,
            "inspiration_notes": form_data.step1.inspiration_notes,
            
            # Step 2: Specifications
            "dimensions": form_data.step2.dimensions,
            "materials": form_data.step2.materials,
            "color_preferences": form_data.step2.color_preferences,
            "special_requirements": form_data.step2.special_requirements,
            "functionality_needs": form_data.step2.functionality_needs,
            
            # Step 3: Investment
            "budget_range": form_data.step3.budget_range,
            "estimated_price": form_data.step3.estimated_price,
            "payment_preference": form_data.step3.payment_preference,
            
            # Step 4: Contact & Timeline
            "name": form_data.step4.name,
            "email": form_data.step4.email,
            "phone": form_data.step4.phone,
            "timeline_preference": form_data.step4.timeline_preference,
            "target_completion": form_data.step4.target_completion,
            "delivery_address": form_data.step4.delivery_address,
            "consultation_preference": form_data.step4.consultation_preference,
            "preferred_contact_time": form_data.step4.preferred_contact_time,
            "marketing_consent": form_data.step4.marketing_consent,
            "communication_preferences": form_data.step4.communication_preferences,
            
            # Form completion tracking
            "current_step": 4,
            "is_draft": False,
            "form_completion_percentage": 100.0,
            "status": "inquiry"
        }
        
        # Create the order
        order = CustomOrder(**order_dict)
        db.add(order)
        db.commit()
        db.refresh(order)
        
        # Add images if provided
        if form_data.images:
            for i, image_url in enumerate(form_data.images):
                image = CustomOrderImage(
                    custom_order_id=order.id,
                    image_url=image_url,
                    image_type="inspiration",
                    upload_order=i
                )
                db.add(image)
        
        # Create timeline entries
        timeline_entries = [
            CustomOrderTimeline(
                custom_order_id=order.id,
                milestone="inquiry_received",
                description="Initial custom order inquiry received",
                is_completed=True,
                completed_at=datetime.utcnow()
            ),
            CustomOrderTimeline(
                custom_order_id=order.id,
                milestone="quote_preparation",
                description="Quote preparation in progress",
                estimated_date=datetime.utcnow() + timedelta(days=3)
            ),
            CustomOrderTimeline(
                custom_order_id=order.id,
                milestone="design_consultation",
                description="Design consultation scheduled",
                estimated_date=datetime.utcnow() + timedelta(days=7)
            )
        ]
        
        for entry in timeline_entries:
            db.add(entry)
        
        db.commit()
        
        # Send notification email
        await send_custom_order_notification(order, form_data)
        
        return CustomOrderResponse(
            success=True,
            message="Custom order submitted successfully! We'll contact you within 24 hours.",
            data=CustomOrderOut.from_orm(order)
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error submitting custom order: {str(e)}")

# ============================================================================
# DRAFT MANAGEMENT (Save/Load Progress)
# ============================================================================

@router.post("/draft", response_model=CustomOrderResponse)
def save_draft(draft_data: CustomOrderCreate, db: Session = Depends(get_db)):
    """Save draft of custom order form"""
    try:
        # Check if draft already exists for this email
        existing_draft = db.query(CustomOrder).filter(
            and_(
                CustomOrder.email == draft_data.email,
                CustomOrder.is_draft == True
            )
        ).first()
        
        if existing_draft:
            # Update existing draft
            for field, value in draft_data.dict(exclude_unset=True).items():
                setattr(existing_draft, field, value)
            existing_draft.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing_draft)
            
            return CustomOrderResponse(
                success=True,
                message="Draft saved successfully",
                data=CustomOrderOut.from_orm(existing_draft)
            )
        else:
            # Create new draft
            order = CustomOrder(**draft_data.dict(exclude_unset=True))
            order.is_draft = True
            db.add(order)
            db.commit()
            db.refresh(order)
            
            return CustomOrderResponse(
                success=True,
                message="Draft created successfully",
                data=CustomOrderOut.from_orm(order)
            )
            
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error saving draft: {str(e)}")

@router.get("/draft/{email}")
def get_draft(email: str, db: Session = Depends(get_db)):
    """Get draft by email"""
    draft = db.query(CustomOrder).filter(
        and_(
            CustomOrder.email == email,
            CustomOrder.is_draft == True
        )
    ).first()
    
    if not draft:
        return JSONResponse(
            status_code=404,
            content={"success": False, "message": "No draft found"}
        )
    
    return CustomOrderResponse(
        success=True,
        message="Draft retrieved successfully",
        data=CustomOrderOut.from_orm(draft)
    )

# ============================================================================
# IMAGE UPLOAD HANDLING
# ============================================================================

@router.post("/upload-images")
async def upload_custom_order_images(
    files: List[UploadFile] = File(...),
    order_id: Optional[int] = Form(None),
    image_type: str = Form("inspiration")
):
    """Upload multiple images for custom order"""
    try:
        uploaded_urls = []
        
        for i, file in enumerate(files):
            if file.filename:
                # Upload to S3
                image_url = upload_inspiration_image(file)
                uploaded_urls.append(image_url)
                
                # If order_id provided, save to database
                if order_id:
                    db = next(get_db())
                    image = CustomOrderImage(
                        custom_order_id=order_id,
                        image_url=image_url,
                        image_type=image_type,
                        upload_order=i
                    )
                    db.add(image)
                    db.commit()
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": f"Uploaded {len(uploaded_urls)} images successfully",
                "image_urls": uploaded_urls
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading images: {str(e)}")

# ============================================================================
# LEGACY COMPATIBILITY (Simple Form)
# ============================================================================

@router.post("/legacy")
async def submit_legacy_custom_order(
    name: str = Form(...),
    phone: str = Form(...),
    email: str = Form(""),
    message: str = Form(...),
    inspiration: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """Legacy endpoint for simple custom order form (backward compatibility)"""
    try:
        image_url = "No image uploaded"
        if inspiration and inspiration.filename:
            image_url = upload_inspiration_image(inspiration)

        # Create order with legacy data mapped to new structure
        order = CustomOrder(
            name=name,
            phone=phone,
            email=email,
            message=message,  # Legacy message field
            image_url=image_url,  # Legacy single image
            project_description=message,  # Map message to project description
            current_step=4,  # Mark as complete
            is_draft=False,
            form_completion_percentage=100.0,
            status="inquiry"
        )
        db.add(order)
        db.commit()
        db.refresh(order)

        # Create initial timeline
        timeline_entry = CustomOrderTimeline(
            custom_order_id=order.id,
            milestone="inquiry_received",
            description="Legacy custom order inquiry received",
            is_completed=True,
            completed_at=datetime.utcnow()
        )
        db.add(timeline_entry)
        db.commit()

        # Send legacy notification email
        await send_legacy_notification_email(order, image_url)

        return JSONResponse(
            status_code=200,
            content={"success": True, "message": "Inquiry submitted successfully!"}
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

# ============================================================================
# DESIGN CONSULTATIONS
# ============================================================================

@router.post("/consultations", response_model=DesignConsultationOut)
def schedule_consultation(
    consultation_data: DesignConsultationCreate,
    db: Session = Depends(get_db)
):
    """Schedule a design consultation"""
    try:
        consultation = DesignConsultation(**consultation_data.dict())
        db.add(consultation)
        db.commit()
        db.refresh(consultation)
        
        return DesignConsultationOut.from_orm(consultation)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error scheduling consultation: {str(e)}")

@router.get("/consultations")
def get_consultations(
    db: Session = Depends(get_db),
    status: Optional[str] = Query(None),
    upcoming_only: bool = Query(False)
):
    """Get design consultations"""
    query = db.query(DesignConsultation)
    
    if status:
        query = query.filter(DesignConsultation.status == status)
    
    if upcoming_only:
        query = query.filter(DesignConsultation.scheduled_date >= datetime.utcnow())
    
    consultations = query.order_by(DesignConsultation.scheduled_date).all()
    return [DesignConsultationOut.from_orm(c) for c in consultations]

# ============================================================================
# NOTIFICATION HELPERS
# ============================================================================

async def send_custom_order_notification(order: CustomOrder, form_data: CustomOrderFormComplete):
    """Send enhanced notification email for multi-step form"""
    try:
        # Format materials and colors for email
        materials_str = ", ".join(form_data.step2.materials) if form_data.step2.materials else "Not specified"
        colors_str = ", ".join(form_data.step2.color_preferences) if form_data.step2.color_preferences else "Not specified"
        functionality_str = ", ".join(form_data.step2.functionality_needs) if form_data.step2.functionality_needs else "Not specified"
        communication_str = ", ".join(form_data.step4.communication_preferences) if form_data.step4.communication_preferences else "Email"
        
        # Format dimensions - FIX: Handle potential None values
        dims = form_data.step2.dimensions or {}
        dimensions_str = f"{dims.get('length', 'N/A')} x {dims.get('width', 'N/A')} x {dims.get('height', 'N/A')} {dims.get('unit', 'cm')}"
        
        # FIX: Handle estimated_price being None
        estimated_price_str = f"${form_data.step3.estimated_price:,.2f}" if form_data.step3.estimated_price else "TBD"
        
        # FIX: Handle target_completion being None
        target_completion_str = form_data.step4.target_completion.strftime('%B %d, %Y') if form_data.step4.target_completion else 'Flexible'
        
        email_body = f"""
🎨 NEW CUSTOM ORDER INQUIRY - ENHANCED FORM

👤 CLIENT INFORMATION:
Name: {form_data.step4.name}
Email: {form_data.step4.email}
Phone: {form_data.step4.phone}
Marketing Consent: {'Yes' if form_data.step4.marketing_consent else 'No'}
Preferred Contact: {communication_str}
Best Contact Time: {form_data.step4.preferred_contact_time or 'Not specified'}

🎯 PROJECT VISION:
Type: {form_data.step1.project_type}
Style: {form_data.step1.style_preference}
Room: {form_data.step1.room_type}
Description: {form_data.step1.project_description}
Inspiration Notes: {form_data.step1.inspiration_notes or 'None provided'}

📐 SPECIFICATIONS:
Dimensions: {dimensions_str}
Materials: {materials_str}
Colors: {colors_str}
Functionality: {functionality_str}
Special Requirements: {form_data.step2.special_requirements or 'None'}

💰 INVESTMENT & TIMELINE:
Budget Range: {form_data.step3.budget_range}
Estimated Price: {estimated_price_str}
Payment Preference: {form_data.step3.payment_preference}
Timeline: {form_data.step4.timeline_preference}
Target Completion: {target_completion_str}

📍 DELIVERY & CONSULTATION:
Delivery Address: {form_data.step4.delivery_address}
Consultation Preference: {form_data.step4.consultation_preference}

Order ID: {order.id}
Submitted: {order.created_at.strftime('%B %d, %Y at %I:%M %p')}
        """.strip()

        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": "custom-orders@resend.dev",
                "to": [ADMIN_EMAIL],
                "subject": f"🎨 Custom Order #{order.id} - {form_data.step1.project_type} ({form_data.step3.budget_range})",
                "text": email_body,
            },
        )

        if response.status_code != 200:
            print(f"❌ Email notification failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error sending notification: {e}")
async def send_legacy_notification_email(order: CustomOrder, image_url: str):
    """Send notification for legacy form submissions"""
    try:
        email_body = f"""
🛠️ New Custom Inquiry (Legacy Form)

Name: {order.name}
Phone: {order.phone}
Email: {order.email}
Message: {order.message}
Inspiration: {image_url}

Order ID: {order.id}
Submitted: {order.created_at.strftime('%B %d, %Y at %I:%M %p')}
        """.strip()

        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": "custom-orders@resend.dev",
                "to": [ADMIN_EMAIL],
                "subject": f"Custom Order Inquiry from {order.name}",
                "text": email_body,
            },
        )

        if response.status_code != 200:
            print(f"❌ Legacy email notification failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error sending legacy notification: {e}")

# ============================================================================
# ANALYTICS & REPORTING
# ============================================================================

@router.get("/analytics/summary")
def get_custom_orders_analytics(db: Session = Depends(get_db)):
    """Get custom orders analytics summary"""
    try:
        total_orders = db.query(CustomOrder).count()
        completed_orders = db.query(CustomOrder).filter(CustomOrder.status == 'completed').count()
        in_progress = db.query(CustomOrder).filter(CustomOrder.status == 'in_progress').count()
        pending_quotes = db.query(CustomOrder).filter(CustomOrder.status == 'inquiry').count()
        
        # Recent activity (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_orders = db.query(CustomOrder).filter(
            CustomOrder.created_at >= thirty_days_ago
        ).count()
        
        # Average completion percentage
        avg_completion = db.query(CustomOrder).filter(
            CustomOrder.form_completion_percentage.isnot(None)
        ).with_entities(
            db.func.avg(CustomOrder.form_completion_percentage)
        ).scalar() or 0
        
        return {
            "success": True,
            "data": {
                "total_orders": total_orders,
                "completed_orders": completed_orders,
                "in_progress": in_progress,
                "pending_quotes": pending_quotes,
                "recent_orders_30d": recent_orders,
                "average_form_completion": round(avg_completion, 1),
                "conversion_rate": round((completed_orders / total_orders * 100), 1) if total_orders > 0 else 0
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analytics: {str(e)}")