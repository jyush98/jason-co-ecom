from fastapi import FastAPI, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.product import Product
from typing import Optional
from app.routes.clerk_webhooks import router as clerk_webhook_router
from app.routes.stripe_webhooks import router as stripe_webhook_router
from app.routes.user import router as user_router
from app.routes.cart import router as cart_router
from app.routes.checkout import router as checkout_router
from app.routes.products import router as products_router
from app.routes.order import router as order_router
from app.routes.custom_order import router as custom_order_router
from app.routes.admin import router as admin_router
from app.routes.payment import router as payment_router
from app.routes.wishlist import router as wishlist_router
from app.routes.account import router as account_router
from app.routes.account_settings import router as account_settings_router
from app.routes.notification_preferences import router as notification_preferences_router
from app.routes.contact import router as contact_router

# Then add these two lines where you include your other routers
app = FastAPI()

# CORS settings to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://jason-co-ecom-production.up.railway.app",
        "https://jason-co-ecom-web.vercel.app",
        ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(clerk_webhook_router, tags=["Clerk Webhooks"])
app.include_router(stripe_webhook_router, tags=["Stripe Webhooks"])
app.include_router(user_router, prefix="/api", tags=["User"])
app.include_router(cart_router, prefix="/cart", tags=["Cart"])
app.include_router(checkout_router, prefix="/checkout", tags=["Checkout"])
app.include_router(products_router, prefix="/api", tags=["Products"])
app.include_router(order_router, prefix="/api", tags=["Orders"])
app.include_router(custom_order_router)
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
app.include_router(payment_router, prefix="/payment", tags=["Payment"])
app.include_router(wishlist_router, prefix="/wishlist", tags=["Wishlist"])
app.include_router(account_router, prefix="/account", tags=["Account"])
app.include_router(account_settings_router, prefix="/account", tags=["Account Settings"])
app.include_router(notification_preferences_router, prefix="/account", tags=["Notification Preferences"])
app.include_router(contact_router, tags=["Contact"])

@app.get("/")
def root():
    return {"message": "Welcome to the Jewelry API"}

# Include API routes here (once created)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"🔍 Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    return response