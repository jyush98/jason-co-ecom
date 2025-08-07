# app/services/wishlist_events.py - Wishlist Event Handlers

from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.wishlist import WishlistItem
from app.services.notification_service import send_wishlist_price_drop
import logging

logger = logging.getLogger(__name__)

class WishlistEventHandler:
    # \"\"\"Handle wishlist-related events and notifications\"\"\"
    
    @staticmethod
    async def handle_price_drop(db: Session, product: Product, old_price: float, new_price: float):
        # \"\"\"Handle product price drop - notify users who have it in wishlist\"\"\"
        try:
            # Find all users who have this product in their wishlist
            wishlist_items = db.query(WishlistItem).filter(
                WishlistItem.product_id == product.id
            ).all()
            
            if not wishlist_items:
                return
            
            # Prepare notification data
            savings = old_price - new_price
            notification_data = {
                "product_name": product.name,
                "old_price": old_price,
                "new_price": new_price,
                "savings": savings,
                "product_url": f"https://jasonjewels.com/product/{product.id}",
                "product_image": product.image_url
            }
            
            # Send notifications to all users
            for item in wishlist_items:
                try:
                    result = await send_wishlist_price_drop(item.user_id, notification_data)
                    logger.info(f"Price drop notification sent to user {item.user_id}: {result}")
                except Exception as e:
                    logger.error(f"Failed to send price drop notification to user {item.user_id}: {str(e)}")
            
            logger.info(f"Price drop notifications sent for product {product.id} to {len(wishlist_items)} users")
            
        except Exception as e:
            logger.error(f"Failed to handle price drop event: {str(e)}")

# Convenience function
async def trigger_price_drop_notifications(db: Session, product_id: int, old_price: float, new_price: float):
    # \"\"\"Trigger price drop notifications for a product\"\"\"
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        await WishlistEventHandler.handle_price_drop(db, product, old_price, new_price)