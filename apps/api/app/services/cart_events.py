# app/services/cart_events.py - Cart Event Handlers

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.cart import CartItem
from app.services.notification_service import send_abandoned_cart_reminder
import logging

logger = logging.getLogger(__name__)

class CartEventHandler:
    # \"\"\"Handle cart-related events and notifications\"\"\"
    
    @staticmethod
    async def handle_abandoned_cart(db: Session, user_id: int):
        # \"\"\"Handle abandoned cart - send reminder email\"\"\"
        try:
            # Get user
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return
            
            # Get cart items
            cart_items = db.query(CartItem).filter(CartItem.user_id == user.clerk_id).all()
            
            if not cart_items:
                return
            
            # Calculate cart total
            cart_total = sum(item.product.price * item.quantity for item in cart_items)
            
            # Prepare notification data
            notification_data = {
                "cart_items": [
                    {
                        "name": item.product.name,
                        "quantity": item.quantity,
                        "price": item.product.price,
                        "image": item.product.image_url
                    }
                    for item in cart_items
                ],
                "cart_total": cart_total,
                "cart_url": "https://jasonjewels.com/cart"
            }
            
            # Send notification
            result = await send_abandoned_cart_reminder(user.id, notification_data)
            logger.info(f"Abandoned cart reminder sent to user {user.id}: {result}")
            
        except Exception as e:
            logger.error(f"Failed to handle abandoned cart event: {str(e)}")

# Function to check for abandoned carts (could be run as a scheduled task)
async def check_abandoned_carts(db: Session):
    # \"\"\"Check for abandoned carts and send reminders\"\"\"
    try:
        # Find carts that haven't been updated in 24 hours
        cutoff_time = datetime.now() - timedelta(hours=24)
        
        # This is a simplified example - you'd need to implement based on your cart tracking
        abandoned_users = db.query(User).join(CartItem).filter(
            CartItem.created_at < cutoff_time
        ).distinct().all()
        
        for user in abandoned_users:
            await CartEventHandler.handle_abandoned_cart(db, user.id)
        
        logger.info(f"Checked {len(abandoned_users)} abandoned carts")
        
    except Exception as e:
        logger.error(f"Failed to check abandoned carts: {str(e)}")

