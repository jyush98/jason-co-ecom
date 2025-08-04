# app/schemas/custom_order.py - FIXED VERSION
# Add this at the top with your imports:

from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class CustomOrderOut(BaseModel):
    """Complete custom order response with all relationships"""
    model_config = ConfigDict(from_attributes=True)  # 🔧 FIX: Add this line
    
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    project_type: Optional[str] = None
    style_preference: Optional[str] = None
    budget_range: Optional[str] = None
    project_description: Optional[str] = None
    status: str = "inquiry"
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Timeline and images will be populated by relationships
    timeline: List["CustomOrderTimelineOut"] = []
    images: List["CustomOrderImageOut"] = []

class CustomOrderSummary(BaseModel):
    """Lightweight order summary for listings"""
    model_config = ConfigDict(from_attributes=True)  # 🔧 FIX: Add this line
    
    id: int
    name: str
    email: str
    project_type: Optional[str] = None
    budget_range: Optional[str] = None
    status: str
    created_at: datetime
    form_completion_percentage: Optional[float] = 0.0

class CustomOrderImageOut(BaseModel):
    """Image response schema"""
    model_config = ConfigDict(from_attributes=True)  # 🔧 FIX: Add this line
    
    id: int
    custom_order_id: int
    image_url: str
    image_type: str
    upload_order: Optional[int] = 0
    created_at: datetime

class CustomOrderTimelineOut(BaseModel):
    """Timeline entry response schema"""
    model_config = ConfigDict(from_attributes=True)  # 🔧 FIX: Add this line
    
    id: int
    custom_order_id: int
    milestone: str
    description: Optional[str] = None
    is_completed: bool = False
    completed_at: Optional[datetime] = None
    estimated_date: Optional[datetime] = None
    created_at: datetime

class DesignConsultationOut(BaseModel):
    """Design consultation response schema"""
    model_config = ConfigDict(from_attributes=True)  # 🔧 FIX: Add this line
    
    id: int
    custom_order_id: Optional[int] = None
    client_name: str
    client_email: str
    consultation_type: str
    scheduled_date: datetime
    status: str = "scheduled"
    notes: Optional[str] = None
    created_at: datetime

# ============================================================================
# WRAPPER RESPONSE SCHEMAS
# ============================================================================

class CustomOrderResponse(BaseModel):
    """Standard API response wrapper"""
    success: bool
    message: str
    data: CustomOrderOut

class CustomOrderListResponse(BaseModel):
    """Paginated list response"""
    success: bool
    data: List[CustomOrderSummary]
    total: int
    page: int
    page_size: int
    total_pages: int

# ============================================================================
# REQUEST SCHEMAS (These don't need from_attributes=True)
# ============================================================================

class CustomOrderCreate(BaseModel):
    """Create new custom order"""
    name: str
    email: str
    phone: Optional[str] = None
    project_type: Optional[str] = None
    style_preference: Optional[str] = None
    budget_range: Optional[str] = None
    project_description: Optional[str] = None
    # ... rest of your create fields

class CustomOrderUpdate(BaseModel):
    """Update existing custom order"""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    # ... rest of your update fields

# Multi-step form schemas (these also don't need from_attributes=True)
class CustomOrderStep1(BaseModel):
    project_type: str
    style_preference: str
    room_type: str
    project_description: str
    inspiration_notes: Optional[str] = None

class CustomOrderStep2(BaseModel):
    dimensions: Dict[str, Any]
    materials: List[str]
    color_preferences: List[str]
    special_requirements: Optional[str] = None
    functionality_needs: List[str]

class CustomOrderStep3(BaseModel):
    budget_range: str
    estimated_price: Optional[float] = None
    payment_preference: str

class CustomOrderStep4(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    timeline_preference: str
    target_completion: Optional[datetime] = None
    delivery_address: str
    consultation_preference: str
    preferred_contact_time: str
    marketing_consent: bool
    communication_preferences: List[str]

class CustomOrderFormComplete(BaseModel):
    """Complete multi-step form data"""
    step1: CustomOrderStep1
    step2: CustomOrderStep2
    step3: CustomOrderStep3
    step4: CustomOrderStep4
    images: Optional[List[str]] = []

# Other request schemas
class CustomOrderImageCreate(BaseModel):
    custom_order_id: int
    image_url: str
    image_type: str = "inspiration"
    upload_order: Optional[int] = 0

class DesignConsultationCreate(BaseModel):
    custom_order_id: Optional[int] = None
    client_name: str
    client_email: str
    consultation_type: str
    scheduled_date: datetime
    notes: Optional[str] = None

# 🔧 IMPORTANT: Update the forward references at the bottom of the file
CustomOrderOut.model_rebuild()
CustomOrderSummary.model_rebuild()
CustomOrderImageOut.model_rebuild()
CustomOrderTimelineOut.model_rebuild()