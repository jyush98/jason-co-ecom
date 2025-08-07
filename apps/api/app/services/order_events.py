# app/services/order_events.py - Order Event Handlers with Notifications

from sqlalchemy.orm import Session
from app.models.user import User
from app.models.order import Order
from app.services.notification_service import (
    send_order_confirmation,
    send_order_update,
    send_shipping_notification
)
import logging

logger = logging.getLogger(__name__)

class OrderEventHandler:
    """
    Handles order events and triggers appropriate notifications.
    This centralizes all order-related notification logic.
    """
    
    @staticmethod
    async def handle_order_confirmed(db: Session, order: Order, user_clerk_id: str):
        """Handle order confirmation event"""
        try:
            # Get user record
            user = db.query(User).filter(User.clerk_id == user_clerk_id).first()
            if not user:
                logger.error(f"User not found for clerk_id: {user_clerk_id}")
                return
            
            # Prepare notification data
            notification_data = {
                "order_number": getattr(order, 'order_number', f"ORDER-{order.id}"),
                "total": order.total_amount,
                "items": [
                    {
                        "name": item.product_name,
                        "quantity": item.quantity,
                        "price": item.unit_price
                    }
                    for item in order.items
                ],
                "customer_name": f"{order.customer_first_name} {order.customer_last_name}".strip(),
                "order_date": order.created_at.strftime("%B %d, %Y"),
                "estimated_delivery": "3-5 business days"
            }
            
            # Send notification
            result = await send_order_confirmation(user.id, notification_data)
            logger.info(f"Order confirmation sent for order {getattr(order, 'order_number', order.id)}: {result}")
            
        except Exception as e:
            logger.error(f"Failed to handle order confirmed event: {str(e)}")
    
    @staticmethod
    async def handle_order_status_updated(db: Session, order: Order, old_status: str, new_status: str):
        """Handle order status change event"""
        try:
            # Get user by order's customer email
            user = db.query(User).filter(User.email == order.customer_email).first()
            if not user:
                logger.warning(f"User not found for order {getattr(order, 'order_number', order.id)}")
                return
            
            # Prepare status update data
            status_messages = {
                "processing": "Your order is being prepared with care",
                "shipped": "Your order has been shipped and is on its way",
                "delivered": "Your order has been delivered",
                "cancelled": "Your order has been cancelled",
                "confirmed": "Your order has been confirmed and is being processed"
            }
            
            notification_data = {
                "order_number": getattr(order, 'order_number', f"ORDER-{order.id}"),
                "status": new_status,
                "status_message": status_messages.get(new_status, f"Your order status has been updated to {new_status}"),
                "updated_at": order.updated_at.strftime("%B %d, %Y at %I:%M %p") if order.updated_at else "Recently"
            }
            
            # Send appropriate notification based on status
            if new_status == "shipped":
                # Add shipping-specific data
                notification_data.update({
                    "tracking_number": getattr(order, 'tracking_number', ''),
                    "carrier": getattr(order, 'carrier', ''),
                    "estimated_delivery": "2-3 business days"
                })
                result = await send_shipping_notification(user.id, notification_data)
            else:
                result = await send_order_update(user.id, notification_data)
            
            logger.info(f"Order status update sent for order {getattr(order, 'order_number', order.id)}: {result}")
            
        except Exception as e:
            logger.error(f"Failed to handle order status update: {str(e)}")

# Convenience functions for easy integration
async def trigger_order_confirmed(db: Session, order: Order, user_clerk_id: str):
    """Trigger order confirmation notifications"""
    await OrderEventHandler.handle_order_confirmed(db, order, user_clerk_id)

async def trigger_order_status_update(db: Session, order: Order, old_status: str, new_status: str):
    """Trigger order status update notifications"""
    await OrderEventHandler.handle_order_status_updated(db, order, old_status, new_status)