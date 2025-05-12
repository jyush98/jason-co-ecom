from fastapi import APIRouter, Depends, HTTPException, Body
from app.core.db import get_db
from app.auth import verify_clerk_token
from sqlalchemy.orm import Session
from app.models.order import Order
from app.schemas.order import OrderResponseSchema
import os
import requests

router = APIRouter()

ADMIN_EMAILS = {"jonathan@jasonjewels.com", "jason@jasonjewels.com", "jyushuvayev98@gmail.com"}

CLERK_API_KEY = os.getenv("CLERK_SECRET_KEY")

def get_user_email_from_clerk(user_id: str) -> str:
    url = f"https://api.clerk.dev/v1/users/{user_id}"
    headers = {"Authorization": f"Bearer {CLERK_API_KEY}"}
    res = requests.get(url, headers=headers)
    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch user info from Clerk")
    data = res.json()
    return data["email_addresses"][0]["email_address"]


@router.get("/orders", response_model=list[OrderResponseSchema])
def get_all_orders(user=Depends(verify_clerk_token), db: Session = Depends(get_db)):
    user_id = user["sub"]
    email = get_user_email_from_clerk(user_id)

    if email not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Access forbidden")

    return db.query(Order).order_by(Order.created_at.desc()).all()

@router.patch("/orders/{order_id}")
def update_order_status(
    order_id: int,
    status: str = Body(...),
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    email = get_user_email_from_clerk(user["sub"])
    if email not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Access forbidden")

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    db.commit()
    return {"message": "Order status updated"}
