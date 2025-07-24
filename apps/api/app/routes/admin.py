# app/routes/admin.py - Fixed with notification integration

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Body
from app.core.db import get_db
from app.auth import verify_clerk_token
from sqlalchemy.orm import Session
from app.models.order import Order
from app.schemas.order import OrderResponseSchema
import os
import requests
import logging
import asyncio

# Import the notification services
from app.services.order_events import trigger_order_status_update

router = APIRouter()
logger = logging.getLogger(__name__)

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

def verify_admin_token(user=Depends(verify_clerk_token)):
    """Admin verification function - reuses your existing auth"""
    user_id = user["sub"]
    email = get_user_email_from_clerk(user_id)
    
    if email not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Access forbidden - Admin only")
    
    return user

@router.get("/orders", response_model=list[OrderResponseSchema])
def get_all_orders(user=Depends(verify_clerk_token), db: Session = Depends(get_db)):
    user_id = user["sub"]
    email = get_user_email_from_clerk(user_id)

    if email not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Access forbidden")

    return db.query(Order).order_by(Order.created_at.desc()).all()

# Remove the duplicate function and keep this enhanced version
@router.patch("/orders/{order_id}")
async def update_order_status(
    order_id: int,
    status: str = Body(...),
    user=Depends(verify_admin_token),  # Use the verify_admin_token function
    db: Session = Depends(get_db)
):
    """Update order status and trigger notifications"""
    try:
        # Get order
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        old_status = order.status
        
        # Update status
        order.status = status
        order.updated_at = datetime.now()
        db.commit()
        
        # Trigger notification asynchronously
        try:
            asyncio.create_task(
                trigger_order_status_update(db, order, old_status, status)
            )
            logger.info(f"Order status notification queued for order {order.order_number}")
        except Exception as e:
            logger.error(f"Failed to queue order notification: {str(e)}")
            # Don't fail the status update if notification fails
        
        return {
            "success": True,
            "message": f"Order {order.order_number if hasattr(order, 'order_number') else order.id} status updated to {status}",
            "old_status": old_status,
            "new_status": status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update order status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update order status")

# Optional: Add a test notification endpoint
@router.post("/orders/{order_id}/test-notification")
async def test_order_notification(
    order_id: int,
    notification_type: str = Body(..., description="Type: confirmation, update, shipping"),
    user=Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Test sending order notifications (admin only)"""
    try:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Import notification functions
        from app.services.notification_service import (
            send_order_confirmation, 
            send_order_update, 
            send_shipping_notification
        )
        
        # Get user by order (you might need to adjust this based on your order model)
        from app.models.user import User
        user_record = db.query(User).filter(User.email == order.customer_email).first()
        
        if not user_record:
            raise HTTPException(status_code=404, detail="User not found for this order")
        
        # Prepare test data
        test_data = {
            "order_number": getattr(order, 'order_number', f"ORDER-{order.id}"),
            "total": order.total_amount,
            "status": order.status,
            "status_message": f"Test notification for order status: {order.status}"
        }
        
        # Send appropriate notification
        if notification_type == "confirmation":
            result = await send_order_confirmation(user_record.id, test_data)
        elif notification_type == "update":
            result = await send_order_update(user_record.id, test_data)
        elif notification_type == "shipping":
            test_data.update({
                "tracking_number": "TEST123456789",
                "carrier": "Test Carrier",
                "estimated_delivery": "2-3 business days"
            })
            result = await send_shipping_notification(user_record.id, test_data)
        else:
            raise HTTPException(status_code=400, detail="Invalid notification type")
        
        return {
            "success": True,
            "message": f"Test {notification_type} notification sent",
            "result": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to send test notification: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send test notification: {str(e)}")