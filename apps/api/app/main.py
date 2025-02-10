from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.product import Product
from app.schemas.product import ProductSchema
from typing import List, Optional
from app.routes.clerk_webhooks import router as clerk_webhook_router
from app.routes.user import router as user_router

app = FastAPI()
app.include_router(clerk_webhook_router, prefix="/webhooks", tags=["Clerk Webhooks"])
app.include_router(user_router, prefix="/api", tags=["User"])

# CORS settings to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to the Jewelry API"}

# Include API routes here (once created)

@app.get("/products", response_model=List[ProductSchema])
def get_products(
    db: Session = Depends(get_db),
    name: Optional[str] = Query(None, description="Filter by product name"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    category: Optional[str] = Query(None, description="Filter by category"),
):
    query = db.query(Product)

    if name:
        query = query.filter(Product.name.ilike(f"%{name}%"))
    if min_price:
        query = query.filter(Product.price >= min_price)
    if max_price:
        query = query.filter(Product.price <= max_price)
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))

    return query.all()
