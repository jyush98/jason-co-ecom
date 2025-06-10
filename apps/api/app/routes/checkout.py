import os
from typing import List, Optional
import stripe
import requests
from fastapi import APIRouter, HTTPException, Depends
from app.auth import verify_clerk_token_optional
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
def create_checkout_session(
    cart: CartSchema,
    db: Session = Depends(get_db),
    user: Optional[dict] = Depends(verify_clerk_token_optional),
):
    """Creates a Stripe checkout session"""

    print("🔍 Inside checkout_session function")
    is_guest = user is None

    if is_guest:
        guest_email = cart.guest_email
        if not guest_email:
            raise HTTPException(status_code=400, detail="Guest email is required.")
        user_id = None
    else:
        user_id = user["sub"]

    # Create the Order in DB
    order = Order(
        user_id=user_id,
        total_price=0,
        status="pending",
        guest_email=guest_email if is_guest else None,
    )
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

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            line_items=line_items,
            metadata={
                "order_id": str(order.id),
                "user_id": user_id or "guest",
            },
            success_url=f"{DOMAIN_URL}/success",
            cancel_url=f"{DOMAIN_URL}/cart",
            client_reference_id=user_id or guest_email,
            customer_email=guest_email if is_guest else user["email_addresses"][0]["email_address"],
        )

        return {"url": checkout_session.url}

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {e.user_message}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exception: {e}")
