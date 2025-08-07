# models/order.py - Enhanced Order Models for Jason & Co. (Compatible Version)
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base  # Using your existing import
from datetime import datetime
from enum import Enum
import uuid

class OrderStatus(str, Enum):
    """Order status enumeration for type safety"""
    PENDING = "pending"
    PROCESSING = "processing"
    CONFIRMED = "confirmed"  # Your existing status
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    FAILED = "failed"  # Your existing status
    COMPLETED = "completed"  # Your existing status

class PaymentStatus(str, Enum):
    """Payment status enumeration"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class Order(Base):
    """Enhanced Order model - extends your existing structure"""
    __tablename__ = "orders"

    # Your existing fields (keeping exactly as they were)
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=True)
    total_price = Column(Float, nullable=False)  # Keeping your field name
    status = Column(String, default="pending")  # Your existing statuses
    created_at = Column(DateTime, default=datetime.utcnow)  # Your existing default
    guest_name = Column(String, nullable=True)  # Your existing field
    guest_email = Column(String, nullable=True)  # Your existing field

    # NEW ENHANCED FIELDS - Adding to your existing structure
    order_number = Column(String(50), unique=True, index=True)  # Human-readable order number
    
    # Customer information enhancement
    customer_first_name = Column(String(100))
    customer_last_name = Column(String(100))
    customer_email = Column(String(255), index=True)  # More detailed than guest_email
    customer_phone = Column(String(50))
    
    # Payment status tracking
    payment_status = Column(String(50), default=PaymentStatus.PENDING)
    
    # Financial breakdown (your total_price becomes the final total)
    subtotal = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    shipping_amount = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    currency = Column(String(3), default="USD")
    
    # Promo code information
    promo_code = Column(String(50))
    promo_discount = Column(Float, default=0.0)
    
    # Addresses (stored as JSON for flexibility)
    shipping_address = Column(JSON)
    billing_address = Column(JSON)
    
    # Shipping information
    shipping_method_id = Column(String(50))
    shipping_method_name = Column(String(100))
    shipping_tracking_number = Column(String(100))
    estimated_delivery_date = Column(DateTime)
    actual_delivery_date = Column(DateTime)
    
    # Payment information (Stripe integration)
    stripe_payment_intent_id = Column(String(255))
    stripe_charge_id = Column(String(255))
    payment_method_last4 = Column(String(4))
    payment_method_brand = Column(String(50))
    
    # Order notes and special instructions
    order_notes = Column(Text)
    internal_notes = Column(Text)  # Admin-only notes
    
    # Gift options
    is_gift = Column(Boolean, default=False)
    gift_message = Column(Text)
    gift_wrapping = Column(Boolean, default=False)
    
    # Enhanced timestamps
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    shipped_at = Column(DateTime)
    delivered_at = Column(DateTime)
    
    # Email tracking
    confirmation_email_sent = Column(Boolean, default=False)
    shipping_email_sent = Column(Boolean, default=False)
    delivery_email_sent = Column(Boolean, default=False)
    
    # Relationships (keeping your existing relationship)
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Order {self.order_number or self.id}: {self.status}>"
    
    @property
    def full_customer_name(self):
        """Get the full customer name"""
        if self.customer_first_name and self.customer_last_name:
            return f"{self.customer_first_name} {self.customer_last_name}".strip()
        return self.guest_name or "Unknown Customer"
    
    @property
    def customer_email_address(self):
        """Get customer email (prefer detailed over guest)"""
        return self.customer_email or self.guest_email
    
    def generate_order_number(self):
        """Generate a unique order number"""
        date_str = datetime.now().strftime("%Y%m%d")
        random_suffix = str(uuid.uuid4())[:4].upper()
        return f"JC-{date_str}-{random_suffix}"

class OrderItem(Base):
    """Enhanced Order Item model - extends your existing structure"""
    __tablename__ = "order_items"

    # Your existing fields (keeping exactly as they were)
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)  # Your existing FK
    product_name = Column(String, nullable=False)  # Your existing field
    unit_price = Column(Float, nullable=False)  # Your existing field
    quantity = Column(Integer, nullable=False)  # Your existing field

    # NEW ENHANCED FIELDS - Adding to your existing structure
    # Product snapshot (for historical accuracy)
    product_sku = Column(String(100))
    product_description = Column(Text)
    product_image_url = Column(String(500))
    product_category = Column(String(100))
    
    # Pricing information
    line_total = Column(Float, nullable=False)  # unit_price * quantity
    
    # Customization options (for custom jewelry)
    custom_options = Column(JSON)  # {"engraving": "text", "size": "L", etc.}
    
    # Item status (for partial fulfillment)
    item_status = Column(String(50), default="pending")  # pending, processing, shipped, delivered
    tracking_info = Column(JSON)  # Individual item tracking if needed
    
    # Timestamps
    item_created_at = Column(DateTime, default=datetime.utcnow)
    item_updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships (keeping your existing relationship)
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    
    def __repr__(self):
        return f"<OrderItem {self.product_name} x{self.quantity}>"

class OrderStatusHistory(Base):
    """Track order status changes for audit trail"""
    __tablename__ = "order_status_history"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    
    # Status change information
    from_status = Column(String(50))
    to_status = Column(String(50), nullable=False)
    changed_by = Column(String(255))  # User ID or "system"
    change_reason = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<StatusChange Order-{self.order_id}: {self.from_status} → {self.to_status}>"

# Database utility functions
def create_order_tables(engine):
    """Create all order-related tables"""
    Base.metadata.create_all(bind=engine)

def get_order_by_number(db_session, order_number: str):
    """Get order by order number"""
    return db_session.query(Order).filter(Order.order_number == order_number).first()

def get_orders_by_user(db_session, user_id: str, limit: int = 50):
    """Get orders for a specific user"""
    return (db_session.query(Order)
            .filter(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .limit(limit)
            .all())

def update_order_status(db_session, order_id: int, new_status: str, changed_by: str = "system", reason: str = None):
    """Update order status with history tracking"""
    order = db_session.query(Order).filter(Order.id == order_id).first()
    if not order:
        return None
    
    # Record status change
    old_status = order.status
    if old_status != new_status:
        # Create history record
        history = OrderStatusHistory(
            order_id=order_id,
            from_status=old_status,
            to_status=new_status,
            changed_by=changed_by,
            change_reason=reason
        )
        db_session.add(history)
        
        # Update order status
        order.status = new_status
        order.updated_at = datetime.utcnow()
        
        # Update special timestamp fields
        if new_status == OrderStatus.SHIPPED:
            order.shipped_at = datetime.utcnow()
        elif new_status == OrderStatus.DELIVERED:
            order.delivered_at = datetime.utcnow()
    
    db_session.commit()
    return order

# Backward compatibility functions (so your existing code still works)
def create_order_from_payment(
    user_id: str,
    total_price: float,
    cart_items,
    payment_intent_id: str,
    shipping_address: dict,
    billing_address: dict = None,
    shipping_method: dict = None,
    order_notes: str = None,
    is_guest: bool = False,
    guest_name: str = None,
    guest_email: str = None
):
    """Create order compatible with your existing payment flow"""
    
    # Generate order number
    order_number = f"JC-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
    
    # Create order
    order = Order(
        order_number=order_number,
        user_id=user_id if not is_guest else None,
        total_price=total_price,
        status="confirmed",  # Your existing status
        created_at=datetime.utcnow(),
        
        # Guest fields (your existing)
        guest_name=guest_name,
        guest_email=guest_email,
        
        # Enhanced fields
        customer_first_name=shipping_address.get('first_name'),
        customer_last_name=shipping_address.get('last_name'),
        customer_email=shipping_address.get('email') or guest_email,
        customer_phone=shipping_address.get('phone'),
        
        payment_status=PaymentStatus.COMPLETED,
        shipping_address=shipping_address,
        billing_address=billing_address or shipping_address,
        shipping_method_name=shipping_method.get('name') if shipping_method else None,
        stripe_payment_intent_id=payment_intent_id,
        order_notes=order_notes,
        confirmation_email_sent=False  # Will be set to True after email is sent
    )
    
    return order