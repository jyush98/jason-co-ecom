import os
from typing import List
import stripe
import requests
from fastapi import APIRouter, HTTPException, Depends
from app.auth import verify_clerk_token
from dotenv import load_dotenv

from ..schemas.cart import CartSchema
from ..schemas.cartItem import CartItemSchema  # Keep CartSchema to validate basic fields like product_id and quantity

load_dotenv()  # Load the .env file variables

router = APIRouter()

# ✅ Initialize Stripe with Secret Key
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
CLERK_API_KEY = os.getenv("CLERK_SECRET_KEY")

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
    #cart: List[CartItemSchema],  # CartSchema expects the basic fields, the product info will be extracted in the backend
    cart: CartSchema,
    user=Depends(verify_clerk_token)
):
    
    """Creates a Stripe checkout session"""
    try:
        # Fetch full user details from Clerk using `sub`
        user_details = get_user_details(user['sub'])
        # Extract email from user details
        email = user_details.get("email_addresses", [{}])[0].get("email_address")
        if not email:
            raise HTTPException(status_code=400, detail="Email address not found")
        line_items = []
        for item in cart.items:
            # Extract product information from the 'product' field
            product_name = item.product.name
            product_price = item.product.price
            product_image_url = item.product.image_url
            quantity = item.quantity

            if not all([product_name, product_price, quantity]):
                raise HTTPException(status_code=400, detail="Missing product information")

            # Create the line item for Stripe checkout
            line_items.append({
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": product_name,
                        "images": [product_image_url],
                    },
                    "unit_amount": int(product_price * 100),  # Stripe expects the price in cents
                },
                "quantity": quantity,
            })

        # Create Stripe Checkout Session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            line_items=line_items,  # Use dynamic line items from the cart
            success_url="http://localhost:3000/success",  # Your success URL
            cancel_url="http://localhost:3000/cart",    # Your cancel URL
            customer_email=email,
        )

        return {"url": checkout_session.url}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {e.user_message}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exception: {e}")
