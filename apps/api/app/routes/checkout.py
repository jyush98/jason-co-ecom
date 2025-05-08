import os
from typing import List, Optional
import stripe
import requests
from fastapi import APIRouter, HTTPException, Depends
from app.auth import verify_clerk_token
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from app.core.db import get_db
from ..schemas.cart import CartSchema
from ..models.order import Order, OrderItem

load_dotenv()  # Load the .env file variables

router = APIRouter()

# ✅ Initialize Stripe with Secret Key
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
CLERK_API_KEY = os.getenv("CLERK_SECRET_KEY")
DOMAIN_URL = os.getenv("DOMAIN_URL", "http://localhost:3000")

def get_user_details(user_sub: str):
    print("CLERK_API_KEY:", CLERK_API_KEY)
    url = f"https://api.clerk.dev/v1/users/{user_sub}"
    headers = {
        "Authorization": f"Bearer {CLERK_API_KEY}"
    }
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch user details from Clerk")
    return response.json()

@router.post("/session")
def create_checkout_session(cart: CartSchema, user=Depends(verify_clerk_token), db: Session = Depends(get_db)):
    """Creates a Stripe checkout session"""
    print("🔍 Inside checkout_session function")
    
    # Step 1: Create the Order in DB first
    # user_details = get_user_details(user["sub"])
    # email = user_details.get("email_addresses", [{}])[0].get("email_address", "guest@yourstore.com")
    
    user_id = user["sub"]

    order = Order(user_id=user_id, total_price=0, status="pending")  # Placeholder total_price
    db.add(order)
    db.commit()

    line_items = []
    total_price = 0

    try:
        for item in cart.items:

            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product.id,
                product_name=item.product.name,
                unit_price=item.product.price,
                quantity=item.quantity,
            )
            db.add(order_item)

            # Prepare Stripe line item
            line_items.append({
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": item.product.name,
                        "images": [item.product.image_url],
                    },
                    "unit_amount": int(item.product.price * 100),
                },
                "quantity": item.quantity,
            })

            total_price += item.product.price * item.quantity

        db.commit()

        # Create Stripe Checkout Session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            line_items=line_items,  # Use dynamic line items from the cart
            metadata={"order_id": str(order.id), "user_id": user_id},
            success_url=f"{DOMAIN_URL}/success",  # Your success URL
            cancel_url=f"{DOMAIN_URL}/cart",    # Your cancel URL
            client_reference_id=user_id,  # Pass the order ID to Stripe
        )

        return {"url": checkout_session.url}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {e.user_message}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exception: {e}")