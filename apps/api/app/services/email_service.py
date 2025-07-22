# app/services/email_service.py - Debug and Fix

import os
import resend
from typing import Dict, Any

# Configure Resend
resend.api_key = os.getenv("RESEND_API_KEY")

def send_order_confirmation_email(to_email: str, order_number: str, order_details: Dict[str, Any]):
    """Send order confirmation email with enhanced debugging"""
    
    try:
        # 🔍 DEBUG: Log what we're receiving
        print(f"\n📧 EMAIL SERVICE DEBUG:")
        print(f"   to_email: {to_email}")
        print(f"   order_number: {order_number}")
        print(f"   order_details: {order_details}")
        print(f"   RESEND_API_KEY: {'SET' if os.getenv('RESEND_API_KEY') else 'NOT SET'}")
        print(f"   FROM_EMAIL: {os.getenv('FROM_EMAIL', 'NOT SET')}")
        
        # Validate inputs
        if not to_email:
            raise ValueError("to_email is required")
        if not order_number:
            raise ValueError("order_number is required")
        if not order_details:
            raise ValueError("order_details is required")
        
        # Get environment variables
        from_email = os.getenv("FROM_EMAIL", "orders@jasonjewels.com")
        
        # Build the email content
        customer_name = order_details.get("customer_name", "Valued Customer")
        total = order_details.get("total", 0)
        items = order_details.get("items", [])
        
        # Create HTML email content
        items_html = ""
        for item in items:
            item_total = item["price"] * item["quantity"]
            items_html += f"""
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">
                    <strong>{item["name"]}</strong><br>
                    <small>Qty: {item["quantity"]} × ${item["price"]:.2f}</small>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                    <strong>${item_total:.2f}</strong>
                </td>
            </tr>
            """
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation - {order_number}</title>
        </head>
        <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <!-- Header -->
            <div style="text-align: center; border-bottom: 3px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="color: #000; font-size: 28px; margin: 0; font-weight: 300; letter-spacing: 2px;">
                    JASON & CO.
                </h1>
                <p style="color: #666; margin: 5px 0 0 0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">
                    Where Ambition Meets Artistry
                </p>
            </div>
            
            <!-- Order Confirmation -->
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #D4AF37; margin: 0; font-size: 24px;">Order Confirmed!</h2>
                <p style="font-size: 16px; margin: 10px 0; color: #666;">
                    Thank you for your order, {customer_name}
                </p>
                <div style="background: #f8f8f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <strong style="color: #333; font-size: 18px;">Order #{order_number}</strong>
                </div>
            </div>
            
            <!-- Order Items -->
            <div style="margin-bottom: 30px;">
                <h3 style="color: #333; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Your Order</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    {items_html}
                    <tr style="background: #f8f8f8;">
                        <td style="padding: 15px; font-weight: bold; font-size: 18px;">
                            Total
                        </td>
                        <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #D4AF37;">
                            ${total:.2f}
                        </td>
                    </tr>
                </table>
            </div>
            
            <!-- What's Next -->
            <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
                <p style="margin: 10px 0;">✨ Your order is being prepared with the utmost care</p>
                <p style="margin: 10px 0;">📦 You'll receive shipping confirmation within 1-2 business days</p>
                <p style="margin: 10px 0;">🚚 Estimated delivery: 3-5 business days</p>
            </div>
            
            <!-- Contact -->
            <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
                <p>Questions about your order?</p>
                <p>
                    <a href="mailto:support@jasonjewels.com" style="color: #D4AF37; text-decoration: none;">
                        support@jasonjewels.com
                    </a>
                </p>
                <p style="margin-top: 20px; font-size: 12px;">
                    © 2025 Jason & Co. | Designed without Limits
                </p>
            </div>
            
        </body>
        </html>
        """
        
        # Prepare email parameters
        email_params = {
            "from": from_email,
            "to": to_email,
            "subject": f"Order Confirmation - {order_number} | Jason & Co.",
            "html": html_content,
        }
        
        print(f"📧 Sending email with params:")
        print(f"   from: {email_params['from']}")
        print(f"   to: {email_params['to']}")
        print(f"   subject: {email_params['subject']}")
        
        # Send the email
        response = resend.Emails.send(email_params)
        
        print(f"✅ Email sent successfully!")
        print(f"   Response: {response}")
        
        return {"success": True, "message": "Email sent successfully", "response": response}
        
    except Exception as e:
        error_msg = f"Failed to send order confirmation email: {str(e)}"
        print(f"❌ EMAIL ERROR: {error_msg}")
        print(f"   Exception type: {type(e).__name__}")
        print(f"   Exception details: {e}")
        
        # Don't re-raise the exception - we don't want to break order creation
        return {"success": False, "error": error_msg}

# Test function to validate email service setup
def test_email_service():
    """Test function to validate email service configuration"""
    
    print("\n🧪 TESTING EMAIL SERVICE:")
    
    # Check environment variables
    api_key = os.getenv("RESEND_API_KEY")
    from_email = os.getenv("FROM_EMAIL")
    
    print(f"   RESEND_API_KEY: {'✅ SET' if api_key else '❌ NOT SET'}")
    print(f"   FROM_EMAIL: {'✅ SET' if from_email else '❌ NOT SET'} ({from_email})")
    
    if not api_key:
        print("❌ RESEND_API_KEY is not set in environment variables")
        return False
    
    # Test with sample data
    test_order = {
        "customer_name": "Test Customer",
        "total": 99.99,
        "items": [
            {"name": "Test Product", "quantity": 1, "price": 99.99}
        ]
    }
    
    print("   Attempting to send test email...")
    
    try:
        result = send_order_confirmation_email(
            "test@example.com",
            "TEST-12345", 
            test_order
        )
        
        if result["success"]:
            print("✅ Email service test passed!")
            return True
        else:
            print(f"❌ Email service test failed: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ Email service test exception: {e}")
        return False

# You can call this function to test your email setup:
# test_email_service()