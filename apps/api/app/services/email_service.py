# app/services/email_service.py

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

# STANDALONE FUNCTIONS (for your contact endpoints)
async def send_email(to: str, subject: str, html_content: str, from_email: str = None):
    """Base email sending function using Resend"""
    try:
        from_address = from_email or os.getenv("FROM_EMAIL", "contact@jasonjewels.com")
        
        params = {
            "from": from_address,
            "to": [to],
            "subject": subject,
            "html": html_content,
        }
        
        email = resend.emails.send(params)
        logger.info(f"Email sent successfully to {to}")
        return email
        
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        raise

async def send_contact_inquiry_email(inquiry_data: Dict[str, Any], inquiry_id: int):
    """Send contact inquiry confirmation and admin notification"""
    
    # Customer confirmation email
    customer_template = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Contacting Jason & Co.</h1>
        </div>
        
        <div style="padding: 30px; background: white;">
            <h2 style="color: #333;">Hello {inquiry_data['name']},</h2>
            
            <p style="color: #666; line-height: 1.6;">We've received your inquiry and our team will respond within 2 hours during business hours.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37;">
                <h3 style="color: #333; margin-top: 0;">Your Inquiry Details:</h3>
                <p><strong>Subject:</strong> {inquiry_data['subject']}</p>
                <p><strong>Message:</strong> {inquiry_data['message']}</p>
                {"<p><strong>Budget Range:</strong> " + inquiry_data.get('budget_range', '') + "</p>" if inquiry_data.get('budget_range') else ""}
                <p><strong>Inquiry ID:</strong> #{inquiry_id}</p>
            </div>
            
            <p style="color: #666;">For immediate assistance, call us at <strong style="color: #D4AF37;">(212) 555-GOLD</strong></p>
            
            <p style="color: #333;">Best regards,<br><strong>The Jason & Co. Team</strong></p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>Jason & Co. | Where Ambition Meets Artistry</p>
        </div>
    </div>
    """
    
    # Admin notification email
    admin_template = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D4AF37;">New Contact Inquiry #{inquiry_id}</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> {inquiry_data['name']}</p>
            <p><strong>Email:</strong> {inquiry_data['email']}</p>
            <p><strong>Phone:</strong> {inquiry_data.get('phone', 'Not provided')}</p>
            <p><strong>Company:</strong> {inquiry_data.get('company', 'Not provided')}</p>
            <p><strong>Subject:</strong> {inquiry_data['subject']}</p>
            <p><strong>Budget Range:</strong> {inquiry_data.get('budget_range', 'Not specified')}</p>
            <p><strong>Timeline:</strong> {inquiry_data.get('timeline', 'Not specified')}</p>
            <p><strong>Preferred Location:</strong> {inquiry_data.get('preferred_location', 'Not specified')}</p>
            
            <h3>Message:</h3>
            <p style="background: white; padding: 15px; border-radius: 5px;">{inquiry_data['message']}</p>
            
            <p><strong>Preferred Contact Methods:</strong> {', '.join(inquiry_data.get('preferred_contact', []))}</p>
        </div>
        
        <p><strong>Response Required:</strong> Within 2 hours during business hours</p>
    </div>
    """
    
    try:
        # Send customer confirmation
        await send_email(
            to=inquiry_data['email'],
            subject="Your Jason & Co. Inquiry Received",
            html_content=customer_template
        )
        
        # Send admin notification
        admin_email = os.getenv('SUPPORT_EMAIL', 'jonathan@jasonjewels.com')
        await send_email(
            to=admin_email,
            subject=f"New Contact Inquiry: {inquiry_data['subject']} - #{inquiry_id}",
            html_content=admin_template
        )
        
        logger.info(f"Contact inquiry emails sent for #{inquiry_id}")
        
    except Exception as e:
        logger.error(f"Failed to send contact inquiry emails: {e}")

async def send_consultation_booking_email(booking_data: Dict[str, Any], booking_id: int):
    """Send consultation booking confirmation"""
    
    consultation_types = {
        'virtual': 'Virtual Consultation',
        'in-person': 'In-Person Atelier Visit', 
        'premium': 'Premium Design Session'
    }
    
    consultation_name = consultation_types.get(booking_data['consultation_type'], booking_data['consultation_type'])
    
    customer_template = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Consultation Request Received</h1>
        </div>
        
        <div style="padding: 30px; background: white;">
            <h2 style="color: #333;">Hello {booking_data['name']},</h2>
            
            <p style="color: #666; line-height: 1.6;">Your {consultation_name} request has been received. We'll confirm your appointment within 24 hours.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37;">
                <h3 style="color: #333; margin-top: 0;">Consultation Details:</h3>
                <p><strong>Type:</strong> {consultation_name}</p>
                <p><strong>Booking ID:</strong> #{booking_id}</p>
                {"<p><strong>Preferred Date:</strong> " + str(booking_data.get('preferred_date', 'To be scheduled')) + "</p>" if booking_data.get('preferred_date') else "<p><strong>Scheduling:</strong> To be arranged</p>"}
                {"<p><strong>Budget Range:</strong> " + booking_data.get('budget_range', '') + "</p>" if booking_data.get('budget_range') else ""}
            </div>
            
            <h3 style="color: #333;">What to Expect:</h3>
            <ul style="color: #666; line-height: 1.6;">
                <li>Detailed discussion of your project vision</li>
                <li>Material and design recommendations</li>
                <li>Timeline and investment planning</li>
                <li>Next steps in the creation process</li>
            </ul>
            
            <p style="color: #666;">Questions? Call us at <strong style="color: #D4AF37;">(212) 555-GOLD</strong></p>
            
            <p style="color: #333;">Best regards,<br><strong>The Jason & Co. Design Team</strong></p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>Jason & Co. | Where Ambition Meets Artistry</p>
        </div>
    </div>
    """
    
    try:
        await send_email(
            to=booking_data['email'],
            subject=f"Jason & Co. Consultation Request Confirmed - #{booking_id}",
            html_content=customer_template
        )
        
        # Send admin notification
        admin_email = os.getenv('SUPPORT_EMAIL', 'jonathan@jasonjewels.com')
        admin_template = f"""
        <h2>New Consultation Booking #{booking_id}</h2>
        <p><strong>Type:</strong> {consultation_name}</p>
        <p><strong>Client:</strong> {booking_data['name']} ({booking_data['email']})</p>
        <p><strong>Phone:</strong> {booking_data.get('phone', 'Not provided')}</p>
        <p><strong>Project:</strong> {booking_data.get('project_description', 'Not provided')}</p>
        <p><strong>Budget:</strong> {booking_data.get('budget_range', 'Not specified')}</p>
        """
        
        await send_email(
            to=admin_email,
            subject=f"New Consultation Booking: {consultation_name} - #{booking_id}",
            html_content=admin_template
        )
        
        logger.info(f"Consultation booking emails sent for #{booking_id}")
        
    except Exception as e:
        logger.error(f"Failed to send consultation booking emails: {e}")

async def send_consultation_confirmation_email(email: str, booking_data: Dict[str, Any]):
    """Send consultation confirmation when admin confirms booking"""
    
    confirmation_template = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Consultation Confirmed!</h1>
        </div>
        
        <div style="padding: 30px; background: white;">
            <h2 style="color: #333;">Hello {booking_data['name']},</h2>
            
            <p style="color: #666; line-height: 1.6;">Great news! Your consultation has been confirmed.</p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2d5a2d;">
                <h3 style="color: #2d5a2d; margin-top: 0;">Confirmed Details:</h3>
                <p><strong>Type:</strong> {booking_data['consultation_type']}</p>
                <p><strong>Date & Time:</strong> {booking_data.get('confirmed_date', 'TBD')}</p>
                {"<p><strong>Meeting Link:</strong> <a href='" + booking_data.get('meeting_link', '') + "' style='color: #D4AF37;'>Join Meeting</a></p>" if booking_data.get('meeting_link') else ""}
                <p><strong>Booking ID:</strong> #{booking_data['booking_id']}</p>
            </div>
            
            <h3 style="color: #333;">Preparation:</h3>
            <ul style="color: #666; line-height: 1.6;">
                <li>Gather any inspiration images or references</li>
                <li>Consider your budget and timeline preferences</li>
                <li>Prepare questions about materials and design options</li>
                <li>Think about how you'll use the piece</li>
            </ul>
            
            <p style="color: #666;">We're excited to discuss your vision! Call <strong style="color: #D4AF37;">(212) 555-GOLD</strong> if you need to reschedule.</p>
            
            <p style="color: #333;">Looking forward to our meeting,<br><strong>The Jason & Co. Design Team</strong></p>
        </div>
    </div>
    """
    
    try:
        await send_email(
            to=email,
            subject="Consultation Confirmed - Jason & Co.",
            html_content=confirmation_template
        )
        logger.info(f"Consultation confirmation sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send consultation confirmation: {e}")

# ============================================================================
# EMAIL SERVICE CLASS (for your existing notification system)
# ============================================================================

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