# app/tasks/notification_tasks.py - Background Tasks for Notifications

from celery import Celery
from app.core.db import SessionLocal
from app.services.cart_events import check_abandoned_carts
from app.services.wishlist_events import trigger_price_drop_notifications
import logging

logger = logging.getLogger(__name__)

# If you're using Celery for background tasks
celery_app = Celery('notifications')

@celery_app.task
def check_abandoned_carts_task():
    # \"\"\"Background task to check for abandoned carts\"\"\"
    db = SessionLocal()
    try:
        import asyncio
        asyncio.run(check_abandoned_carts(db))
    finally:
        db.close()

@celery_app.task  
def send_price_drop_notifications_task(product_id: int, old_price: float, new_price: float):
    # \"\"\"Background task to send price drop notifications\"\"\"
    db = SessionLocal()
    try:
        import asyncio
        asyncio.run(trigger_price_drop_notifications(db, product_id, old_price, new_price))
    finally:
        db.close()

# Schedule tasks (if using Celery Beat)
# celery_app.conf.beat_schedule = {
#     'check-abandoned-carts': {
#         'task': 'app.tasks.notification_tasks.check_abandoned_carts_task',
#         'schedule': 3600.0,  # Every hour
#     },
# }