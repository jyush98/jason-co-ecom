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
from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy import func, or_, and_
from sqlalchemy.orm import joinedload
from app.services.order_events import trigger_order_status_update

class OrderStatsResponse(BaseModel):
    total_orders: int
    status_counts: dict
    total_revenue: float
    recent_orders: int
    generated_at: datetime

class OrderFilterParams(BaseModel):
    status: Optional[str] = None
    search: Optional[str] = None
    limit: int = 50
    offset: int = 0

class BulkStatusUpdate(BaseModel):
    order_ids: List[int]
    status: str
    notes: Optional[str] = None

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
    
@router.get("/orders/stats/summary", response_model=OrderStatsResponse)
def get_order_stats(
    user=Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get order statistics for admin dashboard"""
    try:
        # Total orders
        total_orders = db.query(Order).count()
        
        # Orders by status
        status_counts = {}
        valid_statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
        
        for status in valid_statuses:
            count = db.query(Order).filter(Order.status == status).count()
            status_counts[status] = count
        
        # Total revenue
        total_revenue_result = db.query(func.sum(Order.total_price)).scalar()
        total_revenue = float(total_revenue_result) if total_revenue_result else 0.0
        
        # Recent orders (last 30 days)
        from datetime import timedelta
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_orders = db.query(Order).filter(Order.created_at >= thirty_days_ago).count()
        
        return OrderStatsResponse(
            total_orders=total_orders,
            status_counts=status_counts,
            total_revenue=total_revenue,
            recent_orders=recent_orders,
            generated_at=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Failed to fetch order stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch order stats: {str(e)}")

@router.get("/orders/filtered")
def get_filtered_orders(
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    user=Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get orders with filtering, search, and pagination for admin dashboard"""
    try:
        # Build query
        query = db.query(Order).options(joinedload(Order.items))
        
        # Apply status filter
        if status and status != "all":
            query = query.filter(Order.status == status)
        
        # Apply search filter
        if search:
            search_term = f"%{search.lower()}%"
            query = query.filter(
                or_(
                    func.lower(Order.order_number).like(search_term),
                    func.lower(Order.customer_name).like(search_term) if hasattr(Order, 'customer_name') else False,
                    func.lower(Order.customer_email).like(search_term) if hasattr(Order, 'customer_email') else False,
                    func.lower(Order.guest_name).like(search_term) if hasattr(Order, 'guest_name') else False,
                    func.lower(Order.guest_email).like(search_term) if hasattr(Order, 'guest_email') else False
                )
            )
        
        # Get total count for pagination
        total_count = query.count()
        
        # Apply pagination and ordering
        orders = query.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()
        
        # Transform orders for response
        result = []
        for order in orders:
            # Handle JSON fields safely
            shipping_address = None
            billing_address = None
            
            try:
                if hasattr(order, 'shipping_address') and order.shipping_address:
                    if isinstance(order.shipping_address, str):
                        import json
                        shipping_address = json.loads(order.shipping_address)
                    else:
                        shipping_address = order.shipping_address
            except Exception:
                pass
                
            try:
                if hasattr(order, 'billing_address') and order.billing_address:
                    if isinstance(order.billing_address, str):
                        import json
                        billing_address = json.loads(order.billing_address)
                    else:
                        billing_address = order.billing_address
            except Exception:
                pass
            
            # Transform order items
            items_data = []
            if hasattr(order, 'items') and order.items:
                for item in order.items:
                    items_data.append({
                        "id": item.id,
                        "product_id": item.product_id,
                        "product_name": item.product_name,
                        "unit_price": float(item.unit_price),
                        "quantity": item.quantity
                    })
            
            # Build order data
            order_data = {
                "id": order.id,
                "order_number": getattr(order, 'order_number', f"ORD-{order.id}"),
                "customer_name": getattr(order, 'customer_name', None) or getattr(order, 'guest_name', 'Guest'),
                "customer_email": getattr(order, 'customer_email', None) or getattr(order, 'guest_email', 'N/A'),
                "total_price": float(order.total_price),
                "status": order.status,
                "payment_status": getattr(order, 'payment_status', 'completed'),
                "created_at": order.created_at.isoformat(),
                "shipping_address": shipping_address,
                "billing_address": billing_address,
                "items": items_data,
                "notes": getattr(order, 'notes', None)
            }
            
            result.append(order_data)
        
        return {
            "orders": result,
            "total_count": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": offset + len(result) < total_count
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch filtered orders: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch orders: {str(e)}")

@router.get("/orders/{order_id}/details")
def get_order_details(
    order_id: int,
    user=Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get detailed information for a specific order"""
    try:
        order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Handle JSON fields safely
        shipping_address = None
        billing_address = None
        
        try:
            if hasattr(order, 'shipping_address') and order.shipping_address:
                if isinstance(order.shipping_address, str):
                    import json
                    shipping_address = json.loads(order.shipping_address)
                else:
                    shipping_address = order.shipping_address
        except Exception:
            pass
            
        try:
            if hasattr(order, 'billing_address') and order.billing_address:
                if isinstance(order.billing_address, str):
                    import json
                    billing_address = json.loads(order.billing_address)
                else:
                    billing_address = order.billing_address
        except Exception:
            pass
        
        # Transform order items
        items_data = []
        if hasattr(order, 'items') and order.items:
            for item in order.items:
                items_data.append({
                    "id": item.id,
                    "product_id": item.product_id,
                    "product_name": item.product_name,
                    "unit_price": float(item.unit_price),
                    "quantity": item.quantity
                })
        
        return {
            "id": order.id,
            "order_number": getattr(order, 'order_number', f"ORD-{order.id}"),
            "customer_name": getattr(order, 'customer_name', None) or getattr(order, 'guest_name', 'Guest'),
            "customer_email": getattr(order, 'customer_email', None) or getattr(order, 'guest_email', 'N/A'),
            "total_price": float(order.total_price),
            "status": order.status,
            "payment_status": getattr(order, 'payment_status', 'completed'),
            "created_at": order.created_at.isoformat(),
            "shipping_address": shipping_address,
            "billing_address": billing_address,
            "items": items_data,
            "notes": getattr(order, 'notes', None)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch order details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch order: {str(e)}")

@router.post("/orders/bulk/status-update")
async def bulk_update_order_status(
    bulk_update: BulkStatusUpdate,
    user=Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Bulk update status for multiple orders"""
    try:
        valid_statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
        if bulk_update.status not in valid_statuses:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid status. Must be one of: {valid_statuses}"
            )
        
        updated_count = 0
        failed_orders = []
        
        for order_id in bulk_update.order_ids:
            try:
                order = db.query(Order).filter(Order.id == order_id).first()
                if order:
                    old_status = order.status
                    order.status = bulk_update.status
                    order.updated_at = datetime.now()
                    
                    # Queue notification for each order
                    try:
                        asyncio.create_task(
                            trigger_order_status_update(db, order, old_status, bulk_update.status)
                        )
                    except Exception as e:
                        logger.error(f"Failed to queue notification for order {order_id}: {str(e)}")
                    
                    updated_count += 1
                else:
                    failed_orders.append(order_id)
                    
            except Exception as e:
                failed_orders.append(order_id)
                logger.error(f"Failed to update order {order_id}: {str(e)}")
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Updated {updated_count} orders to {bulk_update.status}",
            "updated_count": updated_count,
            "failed_orders": failed_orders,
            "total_requested": len(bulk_update.order_ids)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Bulk update failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Bulk update failed: {str(e)}")

@router.get("/customers/summary")
def get_customer_summary(
    user=Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get customer summary statistics"""
    try:
        # This assumes you have a User model or can extract from orders
        total_customers = db.query(Order.customer_email).distinct().count()
        
        # Recent customers (last 30 days)
        from datetime import timedelta
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_customers = db.query(Order.customer_email).filter(
            Order.created_at >= thirty_days_ago
        ).distinct().count()
        
        # Top customers by order count
        top_customers = db.query(
            Order.customer_email,
            func.count(Order.id).label('order_count'),
            func.sum(Order.total_price).label('total_spent')
        ).group_by(Order.customer_email).order_by(
            func.count(Order.id).desc()
        ).limit(10).all()
        
        top_customers_data = []
        for customer in top_customers:
            if customer.customer_email:  # Skip null emails
                top_customers_data.append({
                    "email": customer.customer_email,
                    "order_count": customer.order_count,
                    "total_spent": float(customer.total_spent)
                })
        
        return {
            "total_customers": total_customers,
            "recent_customers": recent_customers,
            "top_customers": top_customers_data,
            "generated_at": datetime.now()
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch customer summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch customer data: {str(e)}")

# ============================================================================
# OPTIONAL: ADD ENHANCED STATUS UPDATE (if you want to replace your existing one)
# This includes better error handling and response formatting
# ============================================================================

@router.put("/orders/{order_id}/status")
async def update_order_status_enhanced(
    order_id: int,
    status: str = Body(...),
    notes: Optional[str] = Body(None),
    user=Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Enhanced update order status with better response formatting"""
    try:
        # Validate status
        valid_statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
        if status not in valid_statuses:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid status. Must be one of: {valid_statuses}"
            )
        
        # Get order
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        old_status = order.status
        
        # Update status
        order.status = status
        order.updated_at = datetime.now()
        
        # Add notes if provided
        if notes:
            current_notes = getattr(order, 'notes', '') or ''
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M')
            new_note = f"[{timestamp}] {notes}"
            order.notes = f"{current_notes}\n{new_note}" if current_notes else new_note
        
        db.commit()
        
        # Trigger notification asynchronously (keep your existing notification system)
        try:
            asyncio.create_task(
                trigger_order_status_update(db, order, old_status, status)
            )
            logger.info(f"Order status notification queued for order {getattr(order, 'order_number', order.id)}")
        except Exception as e:
            logger.error(f"Failed to queue order notification: {str(e)}")
            # Don't fail the status update if notification fails
        
        return {
            "success": True,
            "message": f"Order {getattr(order, 'order_number', order.id)} status updated to {status}",
            "order": {
                "id": order.id,
                "order_number": getattr(order, 'order_number', f"ORD-{order.id}"),
                "old_status": old_status,
                "new_status": status,
                "updated_at": order.updated_at.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update order status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update order status")