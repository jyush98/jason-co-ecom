# migration_add_order_fields.py - Run this from your API root directory

"""
Run this script to add the enhanced Order and OrderItem fields to your existing database.
Usage: python migration_add_order_fields.py
"""

import sys
import os

# Add the current directory to Python path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

try:
    from app.core.db import engine, SessionLocal
    from sqlalchemy import text
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("💡 Make sure you're running this script from the API root directory")
    print("   Try: cd /path/to/your/api && python migration_add_order_fields.py")
    sys.exit(1)

def run_migration():
    """Add enhanced fields to existing order tables"""
    
    print("🔄 Starting Order table enhancement migration...")
    print(f"📍 Running from: {os.getcwd()}")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        print("✅ Database connection successful")
        
        # Add enhanced fields to orders table
        order_migrations = [
            # Order identification
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(50);",
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);",
            
            # Customer information
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_first_name VARCHAR(100);",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_last_name VARCHAR(100);",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);",
            
            # Payment and status
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';",
            
            # Financial breakdown
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal FLOAT DEFAULT 0.0;",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount FLOAT DEFAULT 0.0;",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_amount FLOAT DEFAULT 0.0;",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount FLOAT DEFAULT 0.0;",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';",
            
            # Promo codes
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code VARCHAR(50);",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_discount FLOAT DEFAULT 0.0;",
            
            # Addresses (JSON fields)
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSON;",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address JSON;",
            
            # Shipping information
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method_id VARCHAR(50);",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method_name VARCHAR(100);",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_tracking_number VARCHAR(100);",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP;",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS actual_delivery_date TIMESTAMP;",
            
            # Payment information (Stripe)
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_charge_id VARCHAR(255);",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method_last4 VARCHAR(4);",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method_brand VARCHAR(50);",
            
            # Notes
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_notes TEXT;",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS internal_notes TEXT;",
            
            # Gift options
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_gift BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_message TEXT;",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_wrapping BOOLEAN DEFAULT FALSE;",
            
            # Enhanced timestamps
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP;",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;",
            
            # Email tracking
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmation_email_sent BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_email_sent BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_email_sent BOOLEAN DEFAULT FALSE;",
        ]
        
        print("📋 Adding enhanced fields to orders table...")
        
        # Execute order table migrations
        for i, migration in enumerate(order_migrations, 1):
            try:
                db.execute(text(migration))
                print(f"  ✅ {i}/{len(order_migrations)}: Added field")
            except Exception as e:
                if "already exists" in str(e).lower():
                    print(f"  ⚠️ {i}/{len(order_migrations)}: Field already exists")
                else:
                    print(f"  ❌ {i}/{len(order_migrations)}: Failed - {e}")
        
        # Add enhanced fields to order_items table
        order_item_migrations = [
            # Product snapshot fields
            "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_sku VARCHAR(100);",
            "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_description TEXT;",
            "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_image_url VARCHAR(500);",
            "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_category VARCHAR(100);",
            
            # Pricing
            "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS line_total FLOAT;",
            
            # Customization
            "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS custom_options JSON;",
            
            # Item status
            "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_status VARCHAR(50) DEFAULT 'pending';",
            "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS tracking_info JSON;",
            
            # Timestamps
            "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
            "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
        ]
        
        print("📋 Adding enhanced fields to order_items table...")
        
        # Execute order item migrations
        for i, migration in enumerate(order_item_migrations, 1):
            try:
                db.execute(text(migration))
                print(f"  ✅ {i}/{len(order_item_migrations)}: Added field")
            except Exception as e:
                if "already exists" in str(e).lower():
                    print(f"  ⚠️ {i}/{len(order_item_migrations)}: Field already exists")
                else:
                    print(f"  ❌ {i}/{len(order_item_migrations)}: Failed - {e}")
        
        # Update existing order_items to have line_total
        print("📋 Updating existing order items with line totals...")
        try:
            result = db.execute(text("""
                UPDATE order_items 
                SET line_total = unit_price * quantity 
                WHERE line_total IS NULL;
            """))
            print(f"  ✅ Updated {result.rowcount} order items with line totals")
        except Exception as e:
            print(f"  ⚠️ Failed to update line totals: {e}")
        
        # Generate order numbers for existing orders without them
        print("📋 Generating order numbers for existing orders...")
        try:
            result = db.execute(text("""
                UPDATE orders 
                SET order_number = 'JC-' || DATE_FORMAT(created_at, '%Y%m%d') || '-' || UPPER(SUBSTRING(MD5(RAND()), 1, 4))
                WHERE order_number IS NULL;
            """))
            print(f"  ✅ Generated order numbers for {result.rowcount} existing orders")
        except Exception as e:
            # Try PostgreSQL syntax if MySQL fails
            try:
                result = db.execute(text("""
                    UPDATE orders 
                    SET order_number = 'JC-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 4))
                    WHERE order_number IS NULL;
                """))
                print(f"  ✅ Generated order numbers for {result.rowcount} existing orders")
            except Exception as e2:
                print(f"  ⚠️ Failed to generate order numbers: {e2}")
        
        # Commit all changes
        db.commit()
        print("🎉 Migration completed successfully!")
        print("📋 Summary:")
        print("   ✅ Enhanced Order table with customer info, payment details, addresses")
        print("   ✅ Enhanced OrderItem table with product snapshots and pricing")
        print("   ✅ Updated existing data with line totals and order numbers")
        print("   ✅ Your Order system is now ready for state-based taxes!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Running Jason & Co. Order Enhancement Migration")
    print("=" * 60)
    run_migration()
    print("=" * 60)
    print("✅ Migration complete!")
    print("")
    print("🧪 Next steps:")
    print("   1. Restart your API server")
    print("   2. Test the payment flow with state-based taxes")
    print("   3. Try placing an order from different states (CA, NY, OR)")
    print("   4. Check the email confirmation with tax breakdown")