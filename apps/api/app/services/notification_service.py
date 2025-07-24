# services/notification_service.py - Core notification delivery service
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import asyncio
from enum import Enum
import json
import logging

from app.models.user import User
from app.models.notification_preferences import NotificationPreferenceManager
from app.services.email_service import EmailService
from app.core.db import SessionLocal

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NotificationType(Enum):
    """Enum for different types of notifications"""
    # Order notifications
    ORDER_CONFIRMATION = "order_confirmation"
    ORDER_UPDATE = "order_update"
    SHIPPING_NOTIFICATION = "shipping_notification"
    DELIVERY_CONFIRMATION = "delivery_confirmation"
    PAYMENT_RECEIPT = "payment_receipt"
    RETURN_REFUND = "return_refund"
    
    # Marketing notifications
    NEW_PRODUCT = "new_product"
    SALES_PROMOTION = "sales_promotion"
    EXCLUSIVE_OFFER = "exclusive_offer"
    COLLECTION_LAUNCH = "collection_launch"
    WISHLIST_UPDATE = "wishlist_update"
    PRICE_DROP = "price_drop"
    ABANDONED_CART = "abandoned_cart"
    
    # Account notifications
    SECURITY_ALERT = "security_alert"
    PASSWORD_CHANGE = "password_change"
    PROFILE_UPDATE = "profile_update"
    PRIVACY_UPDATE = "privacy_update"

class NotificationChannel(Enum):
    """Enum for notification delivery channels"""
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"  # Future
    IN_APP = "in_app"  # Future

class NotificationPriority(Enum):
    """Enum for notification priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class NotificationService:
    """
    Core notification service that handles delivery across all channels.
    Integrates with user preferences and respects quiet hours.
    """
    
    def __init__(self):
        self.email_service = EmailService()
        
        # Mapping of notification types to their categories and channels
        self.notification_mapping = {
            # Order notifications -> email_notifications category
            NotificationType.ORDER_CONFIRMATION: {
                "category": "email_notifications",
                "key": "order_confirmations",
                "channels": [NotificationChannel.EMAIL, NotificationChannel.SMS],
                "priority": NotificationPriority.HIGH,
                "required": True
            },
            NotificationType.ORDER_UPDATE: {
                "category": "email_notifications", 
                "key": "order_updates",
                "channels": [NotificationChannel.EMAIL, NotificationChannel.SMS],
                "priority": NotificationPriority.MEDIUM
            },
            NotificationType.SHIPPING_NOTIFICATION: {
                "category": "email_notifications",
                "key": "shipping_notifications", 
                "channels": [NotificationChannel.EMAIL, NotificationChannel.SMS],
                "priority": NotificationPriority.MEDIUM
            },
            NotificationType.DELIVERY_CONFIRMATION: {
                "category": "email_notifications",
                "key": "delivery_confirmations",
                "channels": [NotificationChannel.EMAIL, NotificationChannel.SMS], 
                "priority": NotificationPriority.MEDIUM
            },
            NotificationType.PAYMENT_RECEIPT: {
                "category": "email_notifications",
                "key": "payment_receipts",
                "channels": [NotificationChannel.EMAIL],
                "priority": NotificationPriority.HIGH,
                "required": True
            },
            NotificationType.RETURN_REFUND: {
                "category": "email_notifications",
                "key": "returns_refunds",
                "channels": [NotificationChannel.EMAIL],
                "priority": NotificationPriority.MEDIUM
            },
            
            # Marketing notifications -> marketing_notifications category  
            NotificationType.NEW_PRODUCT: {
                "category": "marketing_notifications",
                "key": "new_products",
                "channels": [NotificationChannel.EMAIL],
                "priority": NotificationPriority.LOW
            },
            NotificationType.SALES_PROMOTION: {
                "category": "marketing_notifications", 
                "key": "sales_promotions",
                "channels": [NotificationChannel.EMAIL],
                "priority": NotificationPriority.LOW
            },
            NotificationType.EXCLUSIVE_OFFER: {
                "category": "marketing_notifications",
                "key": "exclusive_offers", 
                "channels": [NotificationChannel.EMAIL],
                "priority": NotificationPriority.MEDIUM
            },
            NotificationType.COLLECTION_LAUNCH: {
                "category": "marketing_notifications",
                "key": "collection_launches",
                "channels": [NotificationChannel.EMAIL], 
                "priority": NotificationPriority.LOW
            },
            NotificationType.WISHLIST_UPDATE: {
                "category": "marketing_notifications",
                "key": "wishlist_updates",
                "channels": [NotificationChannel.EMAIL],
                "priority": NotificationPriority.LOW
            },
            NotificationType.PRICE_DROP: {
                "category": "marketing_notifications",
                "key": "price_drops",
                "channels": [NotificationChannel.EMAIL],
                "priority": NotificationPriority.MEDIUM
            },
            NotificationType.ABANDONED_CART: {
                "category": "marketing_notifications", 
                "key": "abandoned_cart",
                "channels": [NotificationChannel.EMAIL],
                "priority": NotificationPriority.LOW
            },
            
            # Account notifications -> account_notifications category
            NotificationType.SECURITY_ALERT: {
                "category": "account_notifications",
                "key": "security_alerts",
                "channels": [NotificationChannel.EMAIL, NotificationChannel.SMS],
                "priority": NotificationPriority.CRITICAL,
                "required": True
            },
            NotificationType.PASSWORD_CHANGE: {
                "category": "account_notifications",
                "key": "password_changes", 
                "channels": [NotificationChannel.EMAIL],
                "priority": NotificationPriority.HIGH,
                "required": True
            },
            NotificationType.PROFILE_UPDATE: {
                "category": "account_notifications",
                "key": "profile_updates",
                "channels": [NotificationChannel.EMAIL],
                "priority": NotificationPriority.LOW
            },
            NotificationType.PRIVACY_UPDATE: {
                "category": "account_notifications",
                "key": "privacy_updates",
                "channels": [NotificationChannel.EMAIL], 
                "priority": NotificationPriority.MEDIUM
            }
        }
    
    async def send_notification(
        self,
        user_id: int,
        notification_type: NotificationType,
        template_data: Dict[str, Any],
        override_preferences: bool = False,
        force_channels: Optional[List[NotificationChannel]] = None
    ) -> Dict[str, Any]:
        """
        Send a notification to a user across appropriate channels.
        
        Args:
            user_id: Database user ID
            notification_type: Type of notification to send
            template_data: Data for email/SMS templates
            override_preferences: Force send regardless of user preferences (for critical notifications)
            force_channels: Force specific channels (overrides preference checking)
            
        Returns:
            Dictionary with delivery results for each channel
        """
        try:
            db = SessionLocal()
            
            # Get user
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                logger.error(f"User {user_id} not found")
                return {"error": "User not found"}
            
            # Get notification configuration
            notification_config = self.notification_mapping.get(notification_type)
            if not notification_config:
                logger.error(f"Unknown notification type: {notification_type}")
                return {"error": "Unknown notification type"}
            
            # Check if notification is allowed (unless overriding)
            if not override_preferences and not notification_config.get("required", False):
                is_allowed = NotificationPreferenceManager.check_notification_allowed(
                    db, user_id, notification_config["key"], notification_config["category"]
                )
                
                if not is_allowed:
                    logger.info(f"Notification {notification_type} not allowed for user {user_id}")
                    return {"skipped": "User preferences disabled this notification"}
                
                # Check quiet hours
                is_quiet_hours = NotificationPreferenceManager.is_quiet_hours_active(db, user_id)
                if is_quiet_hours and notification_config["priority"] not in [NotificationPriority.HIGH, NotificationPriority.CRITICAL]:
                    logger.info(f"Notification {notification_type} delayed due to quiet hours for user {user_id}")
                    # TODO: Queue for later delivery
                    return {"delayed": "Notification delayed due to quiet hours"}
            
            # Determine channels to use
            channels_to_use = force_channels or notification_config["channels"]
            
            # Send to each channel
            results = {}
            
            for channel in channels_to_use:
                try:
                    if channel == NotificationChannel.EMAIL:
                        result = await self._send_email_notification(
                            user, notification_type, template_data, db
                        )
                        results["email"] = result
                        
                    elif channel == NotificationChannel.SMS:
                        result = await self._send_sms_notification(
                            user, notification_type, template_data, db
                        )
                        results["sms"] = result
                        
                    elif channel == NotificationChannel.PUSH:
                        # TODO: Implement push notifications
                        results["push"] = {"status": "not_implemented"}
                        
                    elif channel == NotificationChannel.IN_APP:
                        # TODO: Implement in-app notifications
                        results["in_app"] = {"status": "not_implemented"}
                        
                except Exception as e:
                    logger.error(f"Failed to send {channel.value} notification: {str(e)}")
                    results[channel.value] = {"error": str(e)}
            
            # Log successful delivery
            logger.info(f"Notification {notification_type} sent to user {user_id}: {results}")
            
            return {
                "success": True,
                "notification_type": notification_type.value,
                "user_id": user_id,
                "results": results
            }
            
        except Exception as e:
            logger.error(f"Failed to send notification {notification_type} to user {user_id}: {str(e)}")
            return {"error": str(e)}
        finally:
            db.close()
    
    async def _send_email_notification(
        self, 
        user: User, 
        notification_type: NotificationType, 
        template_data: Dict[str, Any],
        db: Session
    ) -> Dict[str, Any]:
        """Send email notification using the email service."""
        try:
            # Map notification types to email templates
            template_mapping = {
                NotificationType.ORDER_CONFIRMATION: "order_confirmation",
                NotificationType.ORDER_UPDATE: "order_update", 
                NotificationType.SHIPPING_NOTIFICATION: "order_shipped",
                NotificationType.DELIVERY_CONFIRMATION: "order_delivered",
                NotificationType.PAYMENT_RECEIPT: "payment_receipt",
                NotificationType.RETURN_REFUND: "return_refund",
                NotificationType.NEW_PRODUCT: "new_product",
                NotificationType.SALES_PROMOTION: "sales_promotion",
                NotificationType.EXCLUSIVE_OFFER: "exclusive_offer",
                NotificationType.COLLECTION_LAUNCH: "collection_launch", 
                NotificationType.WISHLIST_UPDATE: "wishlist_update",
                NotificationType.PRICE_DROP: "price_drop",
                NotificationType.ABANDONED_CART: "abandoned_cart",
                NotificationType.SECURITY_ALERT: "security_alert",
                NotificationType.PASSWORD_CHANGE: "password_change",
                NotificationType.PROFILE_UPDATE: "profile_update",
                NotificationType.PRIVACY_UPDATE: "privacy_update"
            }
            
            template_name = template_mapping.get(notification_type)
            if not template_name:
                return {"error": f"No email template for {notification_type}"}
            
            # Prepare email data
            email_data = {
                "to": user.email,
                "user_name": f"{user.first_name} {user.last_name}".strip() or user.email,
                **template_data
            }
            
            # Send email using your existing email service
            result = await self.email_service.send_notification_email(
                template_name=template_name,
                email_data=email_data
            )
            
            return result
            
        except Exception as e:
            return {"error": f"Email delivery failed: {str(e)}"}
    
    async def _send_sms_notification(
        self, 
        user: User, 
        notification_type: NotificationType, 
        template_data: Dict[str, Any],
        db: Session
    ) -> Dict[str, Any]:
        """Send SMS notification (placeholder for future SMS service)."""
        try:
            # Get user's SMS preferences and phone number
            phone_number = NotificationPreferenceManager.get_sms_phone_number(db, user.id)
            
            if not phone_number:
                return {"skipped": "SMS not enabled or no phone number"}
            
            # Check if this specific SMS notification type is enabled
            notification_config = self.notification_mapping.get(notification_type)
            if notification_config and notification_config["category"] == "email_notifications":
                sms_key = notification_config["key"].replace("_notifications", "_alerts").replace("_confirmations", "_notifications")
            else:
                return {"skipped": "SMS not supported for this notification type"}
            
            is_sms_enabled = NotificationPreferenceManager.check_notification_allowed(
                db, user.id, sms_key, "sms_notifications"
            )
            
            if not is_sms_enabled:
                return {"skipped": "SMS notifications disabled for this type"}
            
            # TODO: Implement actual SMS sending with Twilio
            # For now, return placeholder
            logger.info(f"SMS notification {notification_type} would be sent to {phone_number}")
            
            return {
                "status": "placeholder", 
                "phone_number": phone_number,
                "message": f"SMS for {notification_type.value} would be sent here"
            }
            
        except Exception as e:
            return {"error": f"SMS delivery failed: {str(e)}"}
    
    # Convenience methods for common notification types
    async def send_order_confirmation(self, user_id: int, order_data: Dict[str, Any]):
        """Send order confirmation notification."""
        return await self.send_notification(
            user_id=user_id,
            notification_type=NotificationType.ORDER_CONFIRMATION,
            template_data=order_data,
            override_preferences=True  # Always send order confirmations
        )
    
    async def send_order_update(self, user_id: int, order_data: Dict[str, Any]):
        """Send order status update notification.""" 
        return await self.send_notification(
            user_id=user_id,
            notification_type=NotificationType.ORDER_UPDATE,
            template_data=order_data
        )
    
    async def send_shipping_notification(self, user_id: int, shipping_data: Dict[str, Any]):
        """Send shipping notification."""
        return await self.send_notification(
            user_id=user_id, 
            notification_type=NotificationType.SHIPPING_NOTIFICATION,
            template_data=shipping_data
        )
    
    async def send_security_alert(self, user_id: int, security_data: Dict[str, Any]):
        """Send security alert notification."""
        return await self.send_notification(
            user_id=user_id,
            notification_type=NotificationType.SECURITY_ALERT, 
            template_data=security_data,
            override_preferences=True  # Always send security alerts
        )
    
    async def send_wishlist_price_drop(self, user_id: int, price_drop_data: Dict[str, Any]):
        """Send price drop alert for wishlist item."""
        return await self.send_notification(
            user_id=user_id,
            notification_type=NotificationType.PRICE_DROP,
            template_data=price_drop_data
        )
    
    async def send_abandoned_cart_reminder(self, user_id: int, cart_data: Dict[str, Any]):
        """Send abandoned cart reminder."""
        return await self.send_notification(
            user_id=user_id,
            notification_type=NotificationType.ABANDONED_CART,
            template_data=cart_data
        )
    
    async def send_bulk_notification(
        self,
        user_ids: List[int],
        notification_type: NotificationType, 
        template_data: Dict[str, Any],
        batch_size: int = 50
    ) -> Dict[str, Any]:
        """
        Send notifications to multiple users in batches.
        Useful for marketing campaigns and announcements.
        """
        results = {"success": [], "failed": [], "total": len(user_ids)}
        
        # Process in batches to avoid overwhelming email service
        for i in range(0, len(user_ids), batch_size):
            batch = user_ids[i:i + batch_size]
            
            # Send to each user in the batch
            batch_tasks = []
            for user_id in batch:
                task = self.send_notification(user_id, notification_type, template_data)
                batch_tasks.append(task)
            
            # Wait for batch to complete
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            
            # Process results
            for j, result in enumerate(batch_results):
                user_id = batch[j]
                if isinstance(result, Exception):
                    results["failed"].append({"user_id": user_id, "error": str(result)})
                elif result.get("success"):
                    results["success"].append({"user_id": user_id, "result": result})
                else:
                    results["failed"].append({"user_id": user_id, "error": result.get("error", "Unknown error")})
            
            # Small delay between batches to be respectful to email service limits
            await asyncio.sleep(0.1)
        
        logger.info(f"Bulk notification {notification_type} sent to {len(results['success'])} users, {len(results['failed'])} failed")
        
        return results

# Global notification service instance
notification_service = NotificationService()

# Convenience functions for easy import
async def send_order_confirmation(user_id: int, order_data: Dict[str, Any]):
    return await notification_service.send_order_confirmation(user_id, order_data)

async def send_order_update(user_id: int, order_data: Dict[str, Any]):
    return await notification_service.send_order_update(user_id, order_data)

async def send_shipping_notification(user_id: int, shipping_data: Dict[str, Any]):
    return await notification_service.send_shipping_notification(user_id, shipping_data)

async def send_security_alert(user_id: int, security_data: Dict[str, Any]):
    return await notification_service.send_security_alert(user_id, security_data)

async def send_wishlist_price_drop(user_id: int, price_drop_data: Dict[str, Any]):
    return await notification_service.send_wishlist_price_drop(user_id, price_drop_data)

async def send_abandoned_cart_reminder(user_id: int, cart_data: Dict[str, Any]):
    return await notification_service.send_abandoned_cart_reminder(user_id, cart_data)