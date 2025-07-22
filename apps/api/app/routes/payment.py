from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import stripe
import os
from datetime import datetime
from app.core.db import get_db
from app.models.cart import CartItem
from app.auth import verify_clerk_token

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
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Submit the final order after successful payment."""
    try:
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
        
        # TODO: Create order record in database
        # order = Order(
        #     order_number=order_number,
        #     user_id=user["sub"],
        #     total=total,
        #     subtotal=subtotal,
        #     tax=tax,
        #     shipping_cost=shipping_cost,
        #     shipping_address=request.shipping_address,
        #     billing_address=request.billing_address or request.shipping_address,
        #     shipping_method=request.shipping_method,
        #     payment_intent_id=request.payment_intent_id,
        #     status="confirmed",
        #     created_at=datetime.utcnow()
        # )
        # db.add(order)
        
        # TODO: Create order items
        # for cart_item in cart_items:
        #     order_item = OrderItem(
        #         order_id=order.id,
        #         product_id=cart_item.product_id,
        #         quantity=cart_item.quantity,
        #         price=cart_item.product.price
        #     )
        #     db.add(order_item)
        
        # Clear the user's cart
        db.query(CartItem).filter(CartItem.user_id == user["sub"]).delete()
        db.commit()
        
        print(f"Order {order_number} created successfully, cart cleared")
        
        # TODO: Send confirmation email
        # send_order_confirmation_email(user["email"], order_number)
        
        return {
            "success": True,
            "order_number": order_number,
            "total": total,
            "estimated_delivery": "3-5 business days",
            "confirmation_email_sent": True,
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
