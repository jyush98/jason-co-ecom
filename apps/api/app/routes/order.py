from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.order import Order
from app.auth import verify_clerk_token
from app.schemas.order import OrderSchema

router = APIRouter()

@router.get("/orders/recent", response_model=OrderSchema)
def get_recent_order(user=Depends(verify_clerk_token), db: Session = Depends(get_db)):
    """Returns the most recent order for the authenticated user"""
    order = (
        db.query(Order)
        .filter(Order.user_id == user["sub"])
        .order_by(Order.created_at.desc())
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="No recent order found")

    return order

@router.get("/orders/guest/{email}", response_model=OrderSchema)
def get_guest_order(email: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.guest_email == email).order_by(Order.created_at.desc()).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
