# app/services/email_service.py - Enhanced Email Service with Notification Templates

import os
import resend
from typing import Dict, Any, Optional
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Resend
resend.api_key = os.getenv("RESEND_API_KEY")

class EmailService:
    """Enhanced email service with support for all notification types"""
    
    def __init__(self):
        self.from_email = os.getenv("FROM_EMAIL", "orders@jasonjewels.com")
        self.support_email = os.getenv("SUPPORT_EMAIL", "support@jasonjewels.com")
        self.api_key = os.getenv("RESEND_API_KEY")
        
        if not self.api_key:
            logger.warning("RESEND_API_KEY not set - email service will not work")
    
    def _get_base_template(self, title: str, content: str, cta_text: str = None, cta_link: str = None) -> str:
        """Base email template for consistent branding"""
        
        cta_section = ""
        if cta_text and cta_link:
            cta_section = f"""
            <div style="text-align: center; margin: 30px 0;">
                <a href="{cta_link}" style="background: #D4AF37; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; letter-spacing: 1px; text-transform: uppercase;">
                    {cta_text}
                </a>
            </div>
            """
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{title} | Jason & Co.</title>
        </head>
        <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
            
            <!-- Header -->
            <div style="background: #000; color: #fff; text-align: center; padding: 30px 20px; margin: -20px -20px 30px -20px;">
                <h1 style="color: #D4AF37; font-size: 28px; margin: 0; font-weight: 300; letter-spacing: 3px;">
                    JASON & CO.
                </h1>
                <p style="color: #ccc; margin: 5px 0 0 0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">
                    Where Ambition Meets Artistry
                </p>
            </div>
            
            <!-- Content -->
            <div style="background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <h2 style="color: #D4AF37; margin: 0 0 20px 0; font-size: 24px; text-align: center;">{title}</h2>
                {content}
                {cta_section}
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding: 30px 20px 20px 20px; color: #666; font-size: 14px;">
                <p>Questions? Contact us at <a href="mailto:{self.support_email}" style="color: #D4AF37; text-decoration: none;">{self.support_email}</a></p>
                <p style="margin-top: 20px; font-size: 12px; color: #999;">
                    © 2025 Jason & Co. | Designed without Limits
                </p>
                <p style="font-size: 11px; color: #999; margin-top: 10px;">
                    You're receiving this email because you have an account with Jason & Co.
                </p>
            </div>
            
        </body>
        </html>
        """

    async def send_notification_email(self, template_name: str, email_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send notification email using specified template.
        This is called by the NotificationService.
        """
        try:
            # Get the template function
            template_method = getattr(self, f"_template_{template_name}", None)
            if not template_method:
                logger.error(f"Template {template_name} not found")
                return {"error": f"Template {template_name} not found"}
            
            # Generate email content
            email_content = template_method(email_data)
            
            # Send email
            response = resend.Emails.send(email_content)
            
            logger.info(f"Email sent successfully: {template_name} to {email_data['to']}")
            return {"success": True, "response": response}
            
        except Exception as e:
            logger.error(f"Failed to send email {template_name}: {str(e)}")
            return {"error": str(e)}

    def _template_order_confirmation(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Order confirmation email template"""
        customer_name = data.get("user_name", "Valued Customer")
        order_number = data.get("order_number", "N/A")
        total = data.get("total", 0)
        items = data.get("items", [])
        
        # Build items HTML
        items_html = ""
        for item in items:
            item_total = item["unit_price"] * item["quantity"] 
            items_html += f"""
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">
                    <strong>{item["name"]}</strong><br>
                    <small style="color: #666;">Qty: {item["quantity"]} × ${item["unit_price"]:.2f}</small>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                    <strong>${item_total:.2f}</strong>
                </td>
            </tr>
            """
        
        content = f"""
        <div style="text-align: center; margin-bottom: 30px;">
            <p style="font-size: 16px; margin: 10px 0; color: #666;">
                Thank you for your order, {customer_name}!
            </p>
            <div style="background: #f8f8f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong style="color: #333; font-size: 18px;">Order #{order_number}</strong>
            </div>
        </div>
        
        <div style="margin-bottom: 30px;">
            <h3 style="color: #333; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Your Order</h3>
            <table style="width: 100%; border-collapse: collapse;">
                {items_html}
                <tr style="background: #f8f8f8;">
                    <td style="padding: 15px; font-weight: bold; font-size: 18px;">Total</td>
                    <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #D4AF37;">
                        ${total:.2f}
                    </td>
                </tr>
            </table>
        </div>
        
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
            <p style="margin: 10px 0;">✨ Your order is being prepared with the utmost care</p>
            <p style="margin: 10px 0;">📦 You'll receive shipping confirmation within 1-2 business days</p>
            <p style="margin: 10px 0;">🚚 Estimated delivery: 3-5 business days</p>
        </div>
        """
        
        html_content = self._get_base_template(
            title="Order Confirmed!",
            content=content,
            cta_text="Track Your Order",
            cta_link=f"https://jasonjewels.com/orders/{order_number}"
        )
        
        return {
            "from": self.from_email,
            "to": data["to"],
            "subject": f"Order Confirmation - {order_number} | Jason & Co.",
            "html": html_content
        }

    def _template_order_update(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Order status update email template"""
        customer_name = data.get("user_name", "Valued Customer")
        order_number = data.get("order_number", "N/A")
        status = data.get("status", "updated")
        status_message = data.get("status_message", "Your order status has been updated")
        
        content = f"""
        <p>Dear {customer_name},</p>
        <p>We have an update on your order <strong>#{order_number}</strong>.</p>
        
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #D4AF37; margin: 0;">Order Status: {status.title()}</h3>
            <p style="margin: 10px 0 0 0; color: #666;">{status_message}</p>
        </div>
        
        <p>You can track your order status anytime by visiting your account.</p>
        """
        
        html_content = self._get_base_template(
            title="Order Update",
            content=content,
            cta_text="Track Order",
            cta_link=f"https://jasonjewels.com/orders/{order_number}"
        )
        
        return {
            "from": self.from_email,
            "to": data["to"],
            "subject": f"Order Update - {order_number} | Jason & Co.",
            "html": html_content
        }

    def _template_order_shipped(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Shipping notification email template"""
        customer_name = data.get("user_name", "Valued Customer")
        order_number = data.get("order_number", "N/A")
        tracking_number = data.get("tracking_number", "")
        carrier = data.get("carrier", "")
        estimated_delivery = data.get("estimated_delivery", "3-5 business days")
        
        tracking_section = ""
        if tracking_number and carrier:
            tracking_section = f"""
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2d5a2d; margin: 0 0 10px 0;">Tracking Information</h3>
                <p style="margin: 5px 0;"><strong>Carrier:</strong> {carrier}</p>
                <p style="margin: 5px 0;"><strong>Tracking Number:</strong> {tracking_number}</p>
                <p style="margin: 5px 0;"><strong>Estimated Delivery:</strong> {estimated_delivery}</p>
            </div>
            """
        
        content = f"""
        <p>Great news, {customer_name}!</p>
        <p>Your order <strong>#{order_number}</strong> has shipped and is on its way to you.</p>
        
        {tracking_section}
        
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📦 Your Package is En Route</h3>
            <p style="margin: 10px 0;">We've carefully packaged your jewelry with premium materials to ensure it arrives in perfect condition.</p>
        </div>
        """
        
        html_content = self._get_base_template(
            title="Your Order Has Shipped!",
            content=content,
            cta_text="Track Package",
            cta_link=f"https://jasonjewels.com/orders/{order_number}"
        )
        
        return {
            "from": self.from_email,
            "to": data["to"],
            "subject": f"Your Order Has Shipped - {order_number} | Jason & Co.",
            "html": html_content
        }

    def _template_order_delivered(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Delivery confirmation email template"""
        customer_name = data.get("user_name", "Valued Customer")
        order_number = data.get("order_number", "N/A")
        
        content = f"""
        <p>Congratulations, {customer_name}!</p>
        <p>Your order <strong>#{order_number}</strong> has been successfully delivered.</p>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #2d5a2d; margin: 0;">🎉 Delivery Complete!</h3>
            <p style="margin: 10px 0 0 0;">Your exceptional jewelry pieces are now ready to be enjoyed.</p>
        </div>
        
        <p>We hope you love your new pieces! If you have any questions or concerns, don't hesitate to reach out.</p>
        
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #333; margin-top: 0;">Care Instructions</h4>
            <p style="margin: 5px 0;">• Store in provided jewelry box to prevent scratching</p>
            <p style="margin: 5px 0;">• Clean with soft cloth and mild jewelry cleaner</p>
            <p style="margin: 5px 0;">• Avoid exposure to chemicals and moisture</p>
        </div>
        """
        
        html_content = self._get_base_template(
            title="Order Delivered!",
            content=content,
            cta_text="Leave a Review",
            cta_link="https://jasonjewels.com/reviews"
        )
        
        return {
            "from": self.from_email,
            "to": data["to"],
            "subject": f"Order Delivered - {order_number} | Jason & Co.",
            "html": html_content
        }

    def _template_security_alert(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Security alert email template"""
        customer_name = data.get("user_name", "Valued Customer")
        alert_type = data.get("alert_type", "security event")
        alert_message = data.get("alert_message", "We detected unusual activity on your account")
        timestamp = data.get("timestamp", datetime.now().strftime("%B %d, %Y at %I:%M %p"))
        ip_address = data.get("ip_address", "")
        
        ip_section = f"<p><strong>IP Address:</strong> {ip_address}</p>" if ip_address else ""
        
        content = f"""
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin: 0 0 10px 0;">🔒 Security Alert</h3>
            <p style="margin: 0; color: #856404;">We detected {alert_type} on your account.</p>
        </div>
        
        <p>Dear {customer_name},</p>
        <p>{alert_message}</p>
        
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #333; margin-top: 0;">Event Details</h4>
            <p><strong>Time:</strong> {timestamp}</p>
            {ip_section}
        </div>
        
        <p><strong>If this was you:</strong> No action is needed.</p>
        <p><strong>If this wasn't you:</strong> Please change your password immediately and contact our support team.</p>
        """
        
        html_content = self._get_base_template(
            title="Security Alert",
            content=content,
            cta_text="Review Account Security",
            cta_link="https://jasonjewels.com/account/security"
        )
        
        return {
            "from": self.from_email,
            "to": data["to"],
            "subject": "Security Alert - Jason & Co. Account",
            "html": html_content
        }

    def _template_price_drop(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Price drop alert email template"""
        customer_name = data.get("user_name", "Valued Customer")
        product_name = data.get("product_name", "Product")
        old_price = data.get("old_price", 0)
        new_price = data.get("new_price", 0)
        savings = old_price - new_price
        product_url = data.get("product_url", "https://jasonjewels.com/shop")
        product_image = data.get("product_image", "")
        
        image_section = ""
        if product_image:
            image_section = f"""
            <div style="text-align: center; margin: 20px 0;">
                <img src="{product_image}" alt="{product_name}" style="max-width: 200px; border-radius: 8px;">
            </div>
            """
        
        content = f"""
        <p>Great news, {customer_name}!</p>
        <p>A piece from your wishlist just dropped in price.</p>
        
        {image_section}
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #2d5a2d; margin: 0 0 10px 0;">{product_name}</h3>
            <p style="margin: 5px 0; text-decoration: line-through; color: #999;">${old_price:.2f}</p>
            <p style="margin: 5px 0; font-size: 24px; color: #D4AF37; font-weight: bold;">${new_price:.2f}</p>
            <p style="margin: 10px 0 0 0; color: #2d5a2d; font-weight: bold;">You save ${savings:.2f}!</p>
        </div>
        
        <p>Don't wait too long - this price won't last forever!</p>
        """
        
        html_content = self._get_base_template(
            title="Price Drop Alert! 🎉",
            content=content,
            cta_text="Buy Now",
            cta_link=product_url
        )
        
        return {
            "from": self.from_email,
            "to": data["to"],
            "subject": f"Price Drop Alert: {product_name} | Jason & Co.",
            "html": html_content
        }

    def _template_abandoned_cart(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Abandoned cart reminder email template"""
        customer_name = data.get("user_name", "Valued Customer")
        cart_items = data.get("cart_items", [])
        cart_total = data.get("cart_total", 0)
        
        items_html = ""
        for item in cart_items[:3]:  # Show max 3 items
            items_html += f"""
            <div style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #eee;">
                <div style="flex: 1;">
                    <strong>{item['name']}</strong><br>
                    <small style="color: #666;">Qty: {item['quantity']} × ${item['unit_price']:.2f}</small>
                </div>
            </div>
            """
        
        content = f"""
        <p>Hi {customer_name},</p>
        <p>You left some beautiful pieces in your cart. Don't let them slip away!</p>
        
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Cart ({len(cart_items)} items)</h3>
            {items_html}
            <div style="text-align: right; padding: 15px; font-weight: bold; font-size: 18px; color: #D4AF37;">
                Total: ${cart_total:.2f}
            </div>
        </div>
        
        <p>These exceptional pieces are waiting for someone who appreciates true artistry. Complete your purchase now and make them yours.</p>
        """
        
        html_content = self._get_base_template(
            title="Your Cart is Waiting",
            content=content,
            cta_text="Complete Purchase",
            cta_link="https://jasonjewels.com/cart"
        )
        
        return {
            "from": self.from_email,
            "to": data["to"],
            "subject": "Your Cart is Waiting | Jason & Co.",
            "html": html_content
        }

    def _template_new_product(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """New product launch email template"""
        customer_name = data.get("user_name", "Valued Customer")
        product_name = data.get("product_name", "New Product")
        product_description = data.get("product_description", "")
        product_price = data.get("product_price", 0)
        product_url = data.get("product_url", "https://jasonjewels.com/shop")
        product_image = data.get("product_image", "")
        
        image_section = ""
        if product_image:
            image_section = f"""
            <div style="text-align: center; margin: 20px 0;">
                <img src="{product_image}" alt="{product_name}" style="max-width: 300px; border-radius: 8px;">
            </div>
            """
        
        content = f"""
        <p>Dear {customer_name},</p>
        <p>We're excited to introduce our latest masterpiece, crafted with the precision and artistry you've come to expect from Jason & Co.</p>
        
        {image_section}
        
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #D4AF37; margin: 0 0 10px 0;">{product_name}</h3>
            <p style="color: #666; margin: 10px 0;">{product_description}</p>
            <p style="font-size: 24px; color: #333; font-weight: bold; margin: 15px 0;">${product_price:.2f}</p>
        </div>
        
        <p>This piece embodies our philosophy: <em>Where Ambition Meets Artistry</em>. Be among the first to own this exceptional creation.</p>
        """
        
        html_content = self._get_base_template(
            title="New Arrival: Designed Without Limits",
            content=content,
            cta_text="Shop Now",
            cta_link=product_url
        )
        
        return {
            "from": self.from_email,
            "to": data["to"],
            "subject": f"New Arrival: {product_name} | Jason & Co.",
            "html": html_content
        }

    # Legacy function for backward compatibility
    def send_order_confirmation_email(self, to_email: str, order_number: str, order_details: Dict[str, Any]):
        """Legacy function - kept for backward compatibility"""
        try:
            email_data = {
                "to": to_email,
                "user_name": order_details.get("customer_name", "Valued Customer"),
                "order_number": order_number,
                "total": order_details.get("total", 0),
                "items": order_details.get("items", [])
            }
            
            email_content = self._template_order_confirmation(email_data)
            response = resend.Emails.send(email_content)
            
            logger.info(f"Legacy order confirmation email sent to {to_email}")
            return {"success": True, "message": "Email sent successfully", "response": response}
            
        except Exception as e:
            logger.error(f"Legacy email service error: {str(e)}")
            return {"success": False, "error": str(e)}

    def test_email_service(self):
        """Test function to validate email service configuration"""
        logger.info("Testing email service configuration...")
        
        if not self.api_key:
            logger.error("RESEND_API_KEY is not set")
            return False
        
        logger.info(f"Email service configured: from={self.from_email}, support={self.support_email}")
        return True