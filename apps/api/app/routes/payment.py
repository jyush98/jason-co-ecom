# app/routes/payment.py - FIXED with proper user lookup
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import stripe
import os
from datetime import datetime
from app.core.db import get_db
from app.models.cart import CartItem
from app.models.order import Order, OrderItem
from app.models.user import User
from app.auth import verify_clerk_token
from app.services.email_service import EmailService
import asyncio
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

router = APIRouter()

class PaymentIntentRequest(BaseModel):
    amount: int  # Amount in cents
    currency: str = "usd"
    shipping_address: Optional[dict] = None

class OrderSubmissionRequest(BaseModel):
    shipping_address: dict
    billing_address: Optional[dict] = None
    shipping_method: dict
    payment_method: dict
    gift_options: Optional[dict] = None
    order_notes: Optional[str] = None
    payment_intent_id: str

# Initialize email service
email_service = EmailService()

# ✅ ADD THIS HELPER FUNCTION
def get_db_user_from_clerk(db: Session, clerk_id: str) -> User:
    """Get database user by Clerk ID, raise 404 if not found."""
    db_user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if not db_user:
        raise HTTPException(
            status_code=404, 
            detail=f"User not found in database. Clerk ID: {clerk_id}. Please contact support."
        )
    return db_user

def schedule_confirmation_email(background_tasks: BackgroundTasks, email: str, order_number: str, order_details: dict):
    """Schedule email as background task"""
    background_tasks.add_task(email_service.send_order_confirmation_email, email, order_number, order_details)

@router.post("/create-intent")
def create_payment_intent(
    request: PaymentIntentRequest,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Create a Stripe PaymentIntent for checkout."""
    try:
        # ✅ FIXED: Get database user first
        db_user = get_db_user_from_clerk(db, user["sub"])
        logger.info(f"Creating payment intent for user: {db_user.clerk_id} (DB ID: {db_user.id})")
        
        # ✅ FIXED: Use database user.id for cart query
        cart_items = db.query(CartItem).filter(CartItem.user_id == db_user.id).all()
        
        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")
        
        # Calculate cart total
        subtotal = sum(item.product.price * item.quantity for item in cart_items)
        tax = subtotal * 0.08  # 8% tax rate
        shipping = 15 if subtotal < 100 else 0  # Free shipping over $100
        total = subtotal + tax + shipping
        
        logger.info(f"Creating payment intent for ${total}")
        
        # Create PaymentIntent
        intent = stripe.PaymentIntent.create(
            amount=request.amount,
            currency=request.currency,
            metadata={
                'user_id': user['sub'],
                'db_user_id': db_user.id,  # ✅ ADDED: Store both IDs for reference
                'cart_items_count': len(cart_items)
            }
        )
        
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "amount": request.amount,
            "currency": request.currency
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        logger.error(f"Payment intent error: {e}")
        raise HTTPException(status_code=500, detail=f"Payment intent creation failed: {str(e)}")

@router.post("/submit-order")
def submit_order(
    request: OrderSubmissionRequest,
    background_tasks: BackgroundTasks,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Submit the final order after successful payment."""
    try:
        # 🔍 DEBUG: Let's see what we're working with
        logger.info(f"Processing order for user: {user['sub']}")
        logger.debug(f"User object keys: {list(user.keys()) if user else 'No user'}")
        
        # ✅ FIXED: Get database user first
        db_user = get_db_user_from_clerk(db, user["sub"])
        logger.info(f"Found DB user: ID={db_user.id}, Clerk ID={db_user.clerk_id}")
        
        # Verify the payment was successful
        intent = stripe.PaymentIntent.retrieve(request.payment_intent_id)
        
        if intent.status != 'succeeded':
            raise HTTPException(
                status_code=400, 
                detail=f"Payment not successful. Status: {intent.status}"
            )
        
        # ✅ FIXED: Get user's cart using database user.id
        cart_items = db.query(CartItem).filter(CartItem.user_id == db_user.id).all()
        
        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")
        
        # Calculate totals
        subtotal = sum(item.product.price * item.quantity for item in cart_items)
        tax = subtotal * 0.08
        shipping_cost = request.shipping_method.get('price', 0)
        total = subtotal + tax + shipping_cost
        
        # Create order number
        order_number = f"ORD-{intent.id[-8:].upper()}"
        
        logger.info(f"Creating order {order_number} for user {user['sub']}")
        
        # 🔧 ROBUST EMAIL DETECTION - Multiple fallbacks
        customer_email = None
        
        # Try different ways to get the email from Clerk user object
        if user:
            customer_email = (
                user.get('email') or 
                user.get('email_address') or 
                user.get('emailAddress') or
                user.get('primaryEmailAddress') or
                (user.get('email_addresses', [{}])[0].get('email_address') if user.get('email_addresses') else None)
            )
        
        # Fallback to database user email
        if not customer_email and db_user:
            customer_email = db_user.email
        
        # Fallback to shipping address email
        if not customer_email and request.shipping_address:
            customer_email = (
                request.shipping_address.get('email') or 
                request.shipping_address.get('email_address')
            )
        
        # Final fallback to billing address email
        if not customer_email and request.billing_address:
            customer_email = (
                request.billing_address.get('email') or 
                request.billing_address.get('email_address')
            )
        
        logger.info(f"Customer email resolved: {customer_email}")
        
        if not customer_email:
            logger.warning("No customer email found! Email will not be sent.")
            logger.debug(f"User object: {user}")
            logger.debug(f"DB user email: {db_user.email if db_user else 'No DB user'}")
            logger.debug(f"Shipping address: {request.shipping_address}")
        
        # Create order with enhanced tracking
        order = Order(
            order_number=order_number,
            user_id=user["sub"],  # Keep Clerk ID for order tracking
            total_price=total,
            status="confirmed",
            created_at=datetime.utcnow(),
            
            # Enhanced customer information
            customer_first_name=request.shipping_address.get('first_name'),
            customer_last_name=request.shipping_address.get('last_name'),
            customer_email=customer_email,  # 🔧 FIXED: Robust email detection
            customer_phone=request.shipping_address.get('phone'),
            
            # Financial breakdown
            subtotal=subtotal,
            tax_amount=tax,
            shipping_amount=shipping_cost,
            discount_amount=0.0,
            currency="USD",
            
            # Addresses (stored as JSON)
            shipping_address=request.shipping_address,
            billing_address=request.billing_address or request.shipping_address,
            
            # Shipping method
            shipping_method_name=request.shipping_method.get('name'),
            shipping_method_id=request.shipping_method.get('id'),
            
            # Payment info
            stripe_payment_intent_id=request.payment_intent_id,
            payment_status="completed",
            
            # Gift options
            is_gift=request.gift_options.get('is_gift', False) if request.gift_options else False,
            gift_message=request.gift_options.get('message') if request.gift_options else None,
            gift_wrapping=request.gift_options.get('wrapping', False) if request.gift_options else False,
            
            # Notes
            order_notes=request.order_notes,
            
            # Email tracking
            confirmation_email_sent=False
        )
        
        db.add(order)
        db.flush()  # Get the order ID
        
        # ✅ Create order items with enhanced tracking
        for cart_item in cart_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                product_name=cart_item.product.name,
                unit_price=cart_item.product.price,
                quantity=cart_item.quantity,
                line_total=cart_item.product.price * cart_item.quantity,
                
                # Enhanced product snapshot
                product_sku=getattr(cart_item.product, 'sku', None),
                product_description=getattr(cart_item.product, 'description', None),
                product_image_url=getattr(cart_item.product, 'image_url', None),
                product_category=getattr(cart_item.product, 'category', None),
                
                # Custom options (if any)
                custom_options=getattr(cart_item, 'custom_options', None),
                
                item_status="pending",
                item_created_at=datetime.utcnow()
            )
            db.add(order_item)
        
        # ✅ FIXED: Clear the user's cart using database user.id
        deleted_count = db.query(CartItem).filter(CartItem.user_id == db_user.id).delete()
        logger.info(f"Cleared {deleted_count} items from cart for user {db_user.id}")
        
        # Commit all changes
        db.commit()
        
        logger.info(f"✅ Order {order_number} created successfully, cart cleared")
        
        # ✅ ENHANCED NOTIFICATION SYSTEM
        notification_sent = False
        if customer_email:
            try:
                # Use the database user record for notification preferences
                user_record = db_user  # We already have it!
                
                # Prepare comprehensive order details for email
                order_details = {
                    "order_number": order_number,
                    "total": total,
                    "subtotal": subtotal,
                    "tax": tax,
                    "shipping": shipping_cost,
                    "customer_name": f"{order.customer_first_name} {order.customer_last_name}",
                    "shipping_address": request.shipping_address,
                    "shipping_method": request.shipping_method,
                    "payment_method": request.payment_method,
                    "is_gift": order.is_gift,
                    "gift_message": order.gift_message,
                    "items": [
                        {
                            "name": item.product_name,
                            "quantity": item.quantity,
                            "unit_price": item.unit_price,
                            "line_total": item.line_total,
                            "image_url": item.product_image_url
                        }
                        for item in order.items
                    ],
                    "estimated_delivery": "3-5 business days",
                    "order_date": order.created_at.strftime("%B %d, %Y"),
                    "support_email": "support@jasonjewels.com"
                }
                
                logger.info(f"📧 Scheduling confirmation email to: {customer_email}")
                
                # Schedule email as background task
                schedule_confirmation_email(
                    background_tasks, 
                    customer_email,
                    order_number, 
                    order_details
                )
                
                # Mark email as scheduled
                order.confirmation_email_sent = True
                notification_sent = True
                
                logger.info(f"✅ Email scheduled for {customer_email}")
                
                # 🚀 FUTURE: Enhanced notification system integration
                # Uncomment when you implement the notification service:
                # if user_record:
                #     try:
                #         from app.services.order_events import trigger_order_confirmed
                #         asyncio.create_task(trigger_order_confirmed(db, order, user['sub']))
                #         logger.info(f"Enhanced notification queued for user {user_record.id}")
                #     except ImportError:
                #         logger.warning("Enhanced notification service not available")
                
            except Exception as e:
                logger.error(f"Failed to send order confirmation: {str(e)}")
                order.confirmation_email_sent = False
                # Don't fail the order if email fails
        else:
            logger.warning("No email address found - confirmation email not sent")
            order.confirmation_email_sent = False
        
        # Final commit with email status
        db.commit()
        
        return {
            "success": True,
            "order_number": order_number,
            "order_id": order.id,
            "total": total,
            "currency": "USD",
            "estimated_delivery": "3-5 business days",
            "confirmation_email_sent": notification_sent,
            "customer_email": customer_email if customer_email else "Not provided",
            "message": "Order placed successfully! You will receive a confirmation email shortly." if notification_sent else "Order placed successfully!"
        }
        
    except stripe.error.StripeError as e:
        db.rollback()
        logger.error(f"Stripe error during order submission: {e}")
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        db.rollback()
        logger.error(f"Order submission error: {e}")
        raise HTTPException(status_code=500, detail=f"Order submission failed: {str(e)}")

@router.get("/orders/{order_number}")
def get_order(
    order_number: str,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get order details by order number"""
    try:
        order = db.query(Order).filter(Order.order_number == order_number).first()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Security: Users can only view their own orders
        if order.user_id != user["sub"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Get order items
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        
        return {
            "order": {
                "order_number": order.order_number,
                "status": order.status,
                "total_price": order.total_price,
                "subtotal": getattr(order, 'subtotal', order.total_price),
                "tax_amount": getattr(order, 'tax_amount', 0),
                "shipping_amount": getattr(order, 'shipping_amount', 0),
                "currency": getattr(order, 'currency', 'USD'),
                "created_at": order.created_at.isoformat(),
                "customer_name": f"{order.customer_first_name} {order.customer_last_name}",
                "customer_email": order.customer_email,
                "shipping_address": order.shipping_address,
                "billing_address": getattr(order, 'billing_address', None),
                "shipping_method": getattr(order, 'shipping_method_name', None),
                "payment_status": getattr(order, 'payment_status', 'completed'),
                "is_gift": getattr(order, 'is_gift', False),
                "gift_message": getattr(order, 'gift_message', None),
                "order_notes": getattr(order, 'order_notes', None),
                "tracking_number": getattr(order, 'shipping_tracking_number', None),
                "estimated_delivery": "3-5 business days",
                "confirmation_email_sent": getattr(order, 'confirmation_email_sent', False)
            },
            "items": [
                {
                    "product_id": item.product_id,
                    "product_name": item.product_name,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                    "line_total": getattr(item, 'line_total', item.unit_price * item.quantity),
                    "product_image_url": getattr(item, 'product_image_url', None),
                    "product_category": getattr(item, 'product_category', None),
                    "custom_options": getattr(item, 'custom_options', None)
                }
                for item in items
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving order: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve order")

@router.get("/orders")
def get_user_orders(
    limit: int = 10,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get user's order history"""
    try:
        orders = (db.query(Order)
                 .filter(Order.user_id == user["sub"])
                 .order_by(Order.created_at.desc())
                 .limit(limit)
                 .all())
        
        return {
            "orders": [
                {
                    "order_number": order.order_number,
                    "status": order.status,
                    "total_price": order.total_price,
                    "currency": getattr(order, 'currency', 'USD'),
                    "created_at": order.created_at.isoformat(),
                    "customer_name": f"{order.customer_first_name or ''} {order.customer_last_name or ''}".strip(),
                    "item_count": len(order.items) if hasattr(order, 'items') and order.items else 0,
                    "payment_status": getattr(order, 'payment_status', 'completed'),
                    "is_gift": getattr(order, 'is_gift', False)
                }
                for order in orders
            ],
            "total_orders": len(orders)
        }
        
    except Exception as e:
        logger.error(f"Error retrieving user orders: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve orders")

# Health check endpoint
@router.get("/health")
def payment_health_check():
    """Health check for payment service"""
    try:
        # Test Stripe connection
        stripe.Account.retrieve()
        return {
            "status": "healthy",
            "stripe_connected": True,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Payment health check failed: {e}")
        return {
            "status": "unhealthy",
            "stripe_connected": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }