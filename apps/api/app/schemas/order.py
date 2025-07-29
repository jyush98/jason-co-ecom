from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# Enums for validation
class OrderStatusEnum(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    FAILED = "failed"
    COMPLETED = "completed"

class PaymentStatusEnum(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class ItemStatusEnum(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"

# Enhanced Order Item Schema
class OrderItemSchema(BaseModel):
    id: Optional[int] = None
    product_id: int
    product_name: str
    unit_price: float
    quantity: int
    line_total: Optional[float] = None
    
    # Enhanced fields
    product_sku: Optional[str] = None
    product_description: Optional[str] = None
    product_image_url: Optional[str] = None
    product_category: Optional[str] = None
    custom_options: Optional[Dict[str, Any]] = None
    item_status: ItemStatusEnum = ItemStatusEnum.PENDING
    tracking_info: Optional[Dict[str, Any]] = None
    
    # Timestamps
    item_created_at: Optional[datetime] = None
    item_updated_at: Optional[datetime] = None

    @validator('line_total', always=True)
    def calculate_line_total(cls, v, values):
        if v is None and 'unit_price' in values and 'quantity' in values:
            return values['unit_price'] * values['quantity']
        return v

    class Config:
        from_attributes = True
        use_enum_values = True

# Address Schema
class AddressSchema(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = "US"

    class Config:
        from_attributes = True

# Enhanced Order Schema
class OrderSchema(BaseModel):
    id: Optional[int] = None
    order_number: Optional[str] = None
    
    # Customer information
    user_id: Optional[str] = None
    customer_first_name: Optional[str] = None
    customer_last_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    
    # Legacy guest fields (for backward compatibility)
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None
    
    # Financial information
    total_price: float
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    shipping_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    currency: str = "USD"
    
    # Promo information
    promo_code: Optional[str] = None
    promo_discount: Optional[float] = None
    
    # Status information
    status: OrderStatusEnum = OrderStatusEnum.PENDING
    payment_status: PaymentStatusEnum = PaymentStatusEnum.PENDING
    
    # Addresses
    shipping_address: Optional[Dict[str, Any]] = None
    billing_address: Optional[Dict[str, Any]] = None
    
    # Shipping information
    shipping_method_id: Optional[str] = None
    shipping_method_name: Optional[str] = None
    shipping_tracking_number: Optional[str] = None
    estimated_delivery_date: Optional[datetime] = None
    actual_delivery_date: Optional[datetime] = None
    
    # Payment information
    stripe_payment_intent_id: Optional[str] = None
    stripe_charge_id: Optional[str] = None
    payment_method_last4: Optional[str] = None
    payment_method_brand: Optional[str] = None
    
    # Notes and special instructions
    order_notes: Optional[str] = None
    internal_notes: Optional[str] = None
    
    # Gift options
    is_gift: bool = False
    gift_message: Optional[str] = None
    gift_wrapping: bool = False
    
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    
    # Email tracking
    confirmation_email_sent: bool = False
    shipping_email_sent: bool = False
    delivery_email_sent: bool = False
    
    # Order items
    items: List[OrderItemSchema] = []

    @property
    def full_customer_name(self) -> str:
        """Get the full customer name"""
        if self.customer_first_name and self.customer_last_name:
            return f"{self.customer_first_name} {self.customer_last_name}".strip()
        return self.guest_name or "Unknown Customer"
    
    @property
    def customer_email_address(self) -> Optional[str]:
        """Get customer email (prefer detailed over guest)"""
        return self.customer_email or self.guest_email

    class Config:
        from_attributes = True
        use_enum_values = True

# Response Schemas (what gets sent to frontend)
class OrderItemResponseSchema(BaseModel):
    """Simplified order item for API responses"""
    id: int
    product_id: int
    product_name: str
    unit_price: float
    quantity: int
    line_total: Optional[float] = None
    product_image_url: Optional[str] = None
    product_category: Optional[str] = None
    custom_options: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class OrderResponseSchema(BaseModel):
    """Complete order response for admin/user viewing"""
    id: int
    order_number: Optional[str] = None
    
    # Customer information
    customer_first_name: Optional[str] = None
    customer_last_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    
    # Legacy fields for compatibility
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None
    
    # Financial information
    total_price: float
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    shipping_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    promo_code: Optional[str] = None
    promo_discount: Optional[float] = None
    
    # Status information
    status: str
    payment_status: str
    
    # Addresses
    shipping_address: Optional[Dict[str, Any]] = None
    billing_address: Optional[Dict[str, Any]] = None
    
    # Shipping information
    shipping_method_name: Optional[str] = None
    shipping_tracking_number: Optional[str] = None
    estimated_delivery_date: Optional[datetime] = None
    
    # Notes
    order_notes: Optional[str] = None
    
    # Gift options
    is_gift: bool = False
    gift_message: Optional[str] = None
    gift_wrapping: bool = False
    
    # Timestamps
    created_at: datetime
    updated_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    
    # Order items
    items: List[OrderItemResponseSchema] = []

    @property
    def full_customer_name(self) -> str:
        """Get the full customer name"""
        if self.customer_first_name and self.customer_last_name:
            return f"{self.customer_first_name} {self.customer_last_name}".strip()
        return self.guest_name or "Unknown Customer"

    class Config:
        from_attributes = True

# Admin-specific schemas
class AdminOrderListResponseSchema(BaseModel):
    """Simplified order list for admin dashboard"""
    id: int
    order_number: Optional[str] = None
    customer_first_name: Optional[str] = None
    customer_last_name: Optional[str] = None
    customer_email: Optional[str] = None
    guest_name: Optional[str] = None  # Fallback for guest orders
    guest_email: Optional[str] = None  # Fallback for guest orders
    total_price: float
    status: str
    payment_status: str
    created_at: datetime
    items: List[OrderItemResponseSchema] = []
    shipping_address: Optional[Dict[str, Any]] = None
    billing_address: Optional[Dict[str, Any]] = None

    @property
    def full_customer_name(self) -> str:
        """Get the full customer name"""
        if self.customer_first_name and self.customer_last_name:
            return f"{self.customer_first_name} {self.customer_last_name}".strip()
        return self.guest_name or "Unknown Customer"

    class Config:
        from_attributes = True

# Request schemas for creating/updating orders
class CreateOrderItemRequest(BaseModel):
    product_id: int
    quantity: int
    custom_options: Optional[Dict[str, Any]] = None

class CreateOrderRequest(BaseModel):
    """Schema for creating a new order"""
    shipping_address: AddressSchema
    billing_address: Optional[AddressSchema] = None
    shipping_method_id: Optional[str] = None
    payment_method_id: str
    order_notes: Optional[str] = None
    promo_code: Optional[str] = None
    is_gift: bool = False
    gift_message: Optional[str] = None
    gift_wrapping: bool = False
    items: List[CreateOrderItemRequest] = []

class UpdateOrderStatusRequest(BaseModel):
    """Schema for updating order status"""
    status: OrderStatusEnum
    reason: Optional[str] = None
    internal_notes: Optional[str] = None

class OrderTrackingRequest(BaseModel):
    """Schema for updating tracking information"""
    tracking_number: str
    shipping_method: Optional[str] = None
    estimated_delivery: Optional[datetime] = None

# Order status history schema
class OrderStatusHistorySchema(BaseModel):
    id: int
    order_id: int
    from_status: Optional[str] = None
    to_status: str
    changed_by: str
    change_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Search and filter schemas
class OrderSearchRequest(BaseModel):
    """Schema for searching orders"""
    search_term: Optional[str] = None
    status_filter: Optional[OrderStatusEnum] = None
    payment_status_filter: Optional[PaymentStatusEnum] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    customer_email: Optional[str] = None
    order_number: Optional[str] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=50, ge=1, le=100)

class OrderSearchResponse(BaseModel):
    """Schema for order search results"""
    orders: List[AdminOrderListResponseSchema]
    total_count: int
    page: int
    page_size: int
    total_pages: int

    class Config:
        from_attributes = True

# Analytics schemas
class OrderStatsSchema(BaseModel):
    """Order statistics for dashboard"""
    total_orders: int
    total_revenue: float
    pending_orders: int
    confirmed_orders: int
    shipped_orders: int
    delivered_orders: int
    cancelled_orders: int
    average_order_value: float

class OrderTrendsSchema(BaseModel):
    """Order trends over time"""
    date: datetime
    order_count: int
    revenue: float
    average_order_value: float

# Email notification schemas
class OrderEmailSchema(BaseModel):
    """Schema for order email data"""
    order_number: str
    customer_name: str
    customer_email: str
    total_price: float
    items: List[OrderItemResponseSchema]
    shipping_address: Optional[Dict[str, Any]] = None
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[datetime] = None