from fastapi import FastAPI, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.product import Product
from app.schemas.product import PaginatedProductsResponse
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

@app.get("/products", response_model=PaginatedProductsResponse)
def get_products(
    db: Session = Depends(get_db),
    name: Optional[str] = Query(None, description="Filter by product name"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    category: Optional[str] = Query(None, description="Filter by category"),
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    page_size: int = Query(10, ge=1, le=100, description="Number of products per page"),
    sort_by: Optional[str] = Query(None, description="Field to sort by (e.g., price, name)"),
    sort_order: Optional[str] = Query("asc", description="Sort order (asc or desc)"),
):
    # Build the query
    query = db.query(Product)

    # Apply filters
    if name:
        query = query.filter(Product.name.ilike(f"%{name}%"))
    if min_price:
        query = query.filter(Product.price >= min_price)
    if max_price:
        query = query.filter(Product.price <= max_price)
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))

    # Apply sorting
    if sort_by in ["price", "name"]:
        order = asc(getattr(Product, sort_by)) if sort_order == "asc" else desc(getattr(Product, sort_by))
        query = query.order_by(order)

    # Get total count BEFORE applying pagination
    total_count = query.count()
    
    # Apply pagination
    products = query.offset((page - 1) * page_size).limit(page_size).all()
    
    # Calculate total pages
    total_pages = (total_count + page_size - 1) // page_size  # Ceiling division
    
    # Return the paginated response
    return PaginatedProductsResponse(
        products=products,
        total=total_count,
        page=page,
        pageSize=page_size,
        totalPages=total_pages
    )