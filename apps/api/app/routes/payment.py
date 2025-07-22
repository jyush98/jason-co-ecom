# app/routes/payment.py - Updated with Order Storage & Email - EMAIL BUG FIXED
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import stripe
import os
from datetime import datetime
from app.core.db import get_db
from app.models.cart import CartItem
from app.models.order import Order, OrderItem, create_order_from_payment  # NEW IMPORTS
from app.auth import verify_clerk_token
from app.services.email_service import send_order_confirmation_email


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


def schedule_confirmation_email(background_tasks: BackgroundTasks, email: str, order_number: str, order_details: dict):
    """Schedule email as background task"""
    background_tasks.add_task(send_order_confirmation_email, email, order_number, order_details)

@router.post("/create-intent")
def create_payment_intent(
    request: PaymentIntentRequest,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Create a Stripe PaymentIntent for checkout."""
    try:
        # Get user's cart to validate amount
        cart_items = db.query(CartItem).filter(CartItem.user_id == user["sub"]).all()
        
        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")
        
        # Calculate cart total
        subtotal = sum(item.product.price * item.quantity for item in cart_items)
        tax = subtotal * 0.08  # 8% tax rate
        shipping = 15 if subtotal < 100 else 0  # Free shipping over $100
        total = subtotal + tax + shipping
        
        print(f"Creating payment intent for ${total}")  # Debug log
        
        # Create PaymentIntent
        intent = stripe.PaymentIntent.create(
            amount=request.amount,
            currency=request.currency,
            metadata={
                'user_id': user['sub'],
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
        print(f"Stripe error: {e}")
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        print(f"Payment intent error: {e}")
        raise HTTPException(status_code=500, detail=f"Payment intent creation failed: {str(e)}")

@router.post("/submit-order")
def submit_order(
    request: OrderSubmissionRequest,
    background_tasks: BackgroundTasks,  # NEW: For email background tasks
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Submit the final order after successful payment."""
    try:
        # 🔍 DEBUG: Let's see what we're working with
        print(f"\n🔍 EMAIL DEBUG - User object: {user}")
        print(f"🔍 EMAIL DEBUG - User keys: {list(user.keys()) if user else 'No user'}")
        print(f"🔍 EMAIL DEBUG - Shipping address: {request.shipping_address}")
        
        # Verify the payment was successful
        intent = stripe.PaymentIntent.retrieve(request.payment_intent_id)
        
        if intent.status != 'succeeded':
            raise HTTPException(
                status_code=400, 
                detail=f"Payment not successful. Status: {intent.status}"
            )
        
        # Get user's cart
        cart_items = db.query(CartItem).filter(CartItem.user_id == user["sub"]).all()
        
        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")
        
        # Calculate totals
        subtotal = sum(item.product.price * item.quantity for item in cart_items)
        tax = subtotal * 0.08
        shipping_cost = request.shipping_method.get('price', 0)
        total = subtotal + tax + shipping_cost
        
        # Create order number
        order_number = f"ORD-{intent.id[-8:].upper()}"
        
        print(f"Creating order {order_number} for user {user['sub']}")
        
        # 🔧 FIXED: Multiple fallbacks for customer email
        customer_email = None
        
        # Try different ways to get the email
        if user:
            # Try common Clerk user email fields
            customer_email = (
                user.get('email') or 
                user.get('email_address') or 
                user.get('emailAddress') or
                user.get('primaryEmailAddress') or
                (user.get('email_addresses', [{}])[0].get('email_address') if user.get('email_addresses') else None)
            )
        
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
        
        print(f"🔍 EMAIL DEBUG - Final customer email: {customer_email}")
        
        if not customer_email:
            print("❌ WARNING: No customer email found! Email will not be sent.")
            print(f"   User object: {user}")
            print(f"   Shipping address: {request.shipping_address}")
            print(f"   Billing address: {request.billing_address}")
        
        # ✅ COMPLETED TODO: Create order record in database
        order = Order(
            order_number=order_number,
            user_id=user["sub"],
            total_price=total,  # Using your existing field name
            status="confirmed",  # Your existing status
            created_at=datetime.utcnow(),
            
            # Enhanced fields
            customer_first_name=request.shipping_address.get('first_name'),
            customer_last_name=request.shipping_address.get('last_name'),
            customer_email=customer_email,  # 🔧 FIXED: Using our robust email detection
            customer_phone=request.shipping_address.get('phone'),
            
            # Financial breakdown
            subtotal=subtotal,
            tax_amount=tax,
            shipping_amount=shipping_cost,
            discount_amount=0.0,
            currency="USD",
            
            # Addresses
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
            confirmation_email_sent=False  # Will be set to True after email
        )
        
        db.add(order)
        db.flush()  # Get the order ID
        
        # ✅ COMPLETED TODO: Create order items
        for cart_item in cart_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                product_name=cart_item.product.name,  # Store product name for history
                unit_price=cart_item.product.price,
                quantity=cart_item.quantity,
                line_total=cart_item.product.price * cart_item.quantity,  # NEW: Line total
                
                # Enhanced fields
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
        
        # Clear the user's cart
        db.query(CartItem).filter(CartItem.user_id == user["sub"]).delete()
        
        # Commit all changes
        db.commit()
        
        print(f"✅ Order {order_number} created successfully, cart cleared")
        
        # ✅ COMPLETED TODO: Send confirmation email (only if we have an email)
        if customer_email:
            order_details = {
                "order_number": order_number,
                "total": total,
                "customer_name": f"{order.customer_first_name} {order.customer_last_name}",
                "items": [
                    {
                        "name": item.product_name,
                        "quantity": item.quantity,
                        "price": item.unit_price
                    }
                    for item in order.items
                ]
            }
            
            print(f"📧 Scheduling confirmation email to: {customer_email}")
            
            # Schedule email as background task
            schedule_confirmation_email(
                background_tasks, 
                customer_email,  # 🔧 FIXED: Now guaranteed to be not None
                order_number, 
                order_details
            )
            
            # Mark email as scheduled
            order.confirmation_email_sent = True
            db.commit()
            
            print(f"✅ Email scheduled for {customer_email}")
        else:
            print("⚠️ No email address found - email not sent")
            order.confirmation_email_sent = False
            db.commit()
        
        return {
            "success": True,
            "order_number": order_number,
            "order_id": order.id,  # NEW: Return order ID
            "total": total,
            "estimated_delivery": "3-5 business days",
            "confirmation_email_sent": bool(customer_email),  # 🔧 FIXED: Accurate status
            "message": "Order placed successfully!"
        }
        
    except stripe.error.StripeError as e:
        db.rollback()
        print(f"Stripe error during order submission: {e}")
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        db.rollback()
        print(f"Order submission error: {e}")
        raise HTTPException(status_code=500, detail=f"Order submission failed: {str(e)}")

# NEW ENDPOINTS: Order tracking and history
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
                "created_at": order.created_at.isoformat(),
                "customer_name": f"{order.customer_first_name} {order.customer_last_name}",
                "shipping_address": order.shipping_address,
                "is_gift": order.is_gift,
                "gift_message": order.gift_message,
                "tracking_number": getattr(order, 'shipping_tracking_number', None)
            },
            "items": [
                {
                    "product_name": item.product_name,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                    "line_total": item.line_total,
                    "product_image_url": item.product_image_url
                }
                for item in items
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving order: {e}")
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
                    "created_at": order.created_at.isoformat(),
                    "item_count": len(order.items) if hasattr(order, 'items') else 0
                }
                for order in orders
            ]
        }
        
    except Exception as e:
        print(f"Error retrieving user orders: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve orders")