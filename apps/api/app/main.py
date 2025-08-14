from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
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
from app.routes.admin_analytics import router as admin_analytics_router

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

# In your main.py file, you already have:
API_V1 = "/api/v1"

app.include_router(user_router, prefix=f"{API_V1}/users", tags=["Users"])
app.include_router(cart_router, prefix=f"{API_V1}/cart", tags=["Cart"])
app.include_router(checkout_router, prefix=f"{API_V1}/checkout", tags=["Checkout"])
app.include_router(products_router, prefix=f"{API_V1}/products", tags=["Products"])
app.include_router(order_router, prefix=f"{API_V1}/orders", tags=["Orders"])
app.include_router(custom_order_router, prefix=f"{API_V1}/custom-orders", tags=["Custom Orders"])
app.include_router(payment_router, prefix=f"{API_V1}/payment", tags=["Payment"])
app.include_router(wishlist_router, prefix=f"{API_V1}/wishlist", tags=["Wishlist"])
app.include_router(account_router, prefix=f"{API_V1}/account", tags=["Account"])
app.include_router(account_settings_router, prefix=f"{API_V1}/account/settings", tags=["Account Settings"])
app.include_router(notification_preferences_router, prefix=f"{API_V1}/notifications", tags=["Notifications"])
app.include_router(contact_router, prefix=f"{API_V1}/contact", tags=["Contact"])
app.include_router(admin_router, prefix=f"{API_V1}/admin", tags=["Admin"])
app.include_router(admin_analytics_router, prefix=f"{API_V1}/admin/analytics", tags=["Admin Analytics"])

# Legacy routes for backward compatibility:
app.include_router(cart_router, prefix="/cart", tags=["Cart (Legacy)"])
app.include_router(checkout_router, prefix="/checkout", tags=["Checkout (Legacy)"])
app.include_router(products_router, prefix="/api", tags=["Products (Legacy)"])
# app.include_router(wishlist_router, prefix="/wishlist", tags=["Wishlist (Legacy)"])


@app.get("/")
def root():
    return {"message": "Welcome to the Jewelry API"}

# Include API routes here (once created)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"🔍 Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    return response