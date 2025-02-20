import os
from fastapi.responses import JSONResponse
import stripe
from fastapi import APIRouter, Request, HTTPException, Depends
from app.core.db import get_db
from sqlalchemy.orm import Session
from app.models.order import Order, OrderItem
from app.models.cart import CartItem


stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

@router.post("/webhooks/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handles Stripe payment success events and stores the order"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        order_id = session["metadata"].get("order_id")  # Retrieve `order_id` from metadata
        user_id = session["metadata"].get("user_id")  # Retrieve `user_id` from metadata

        if not order_id or not user_id:
            print("Missing user_id or order_id in metadata")
            return JSONResponse(status_code=400, content={"error": "Missing metadata"})

        # ✅ Step 1: Update Order Status
        order = db.query(Order).filter(Order.id == int(order_id)).first()
        if not order:
            print(f"❌ Order {order_id} not found")
            return JSONResponse(status_code=400, content={"error": "Order not found"})

        order.status = "completed"
        order.total_price = session["amount_total"] / 100  # Convert to dollars
        db.commit()

        print(f"✅ Order {order_id} completed for user {user_id}")

        # Step 2: Clear the Cart
        db.query(CartItem).filter(CartItem.user_id == user_id).delete()
        db.commit()
        print(f"🛒 Cart cleared for user {user_id}")

    return {"status": "success"}


def verify_stripe_signature(payload: bytes, sig_header: str):
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, WEBHOOK_SECRET
        )
        return event
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")