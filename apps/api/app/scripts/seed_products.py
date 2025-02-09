import sys
import os
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Ensure FastAPI app path is added
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

# Load environment variables
load_dotenv()

from app.core.db import SessionLocal, engine, Base
from app.models.product import Product

# Ensure tables are created
Base.metadata.create_all(bind=engine)

# Sample product data
sample_products = [
    {
        "name": "Diamond Necklace",
        "description": "A beautiful 1.5-carat diamond necklace.",
        "price": 2999.99,
        "image_url": "https://themillenniumbride.com/cdn/shop/products/swarovski-crystal-luxury-flower-diamondcrystal-necklace-bridal-necklace-set-bridal-jewelry-statement-necklace-985099.jpg?v=1683824242",
        "category": "necklaces"
    },
    {
        "name": "Gold Bracelet",
        "description": "Elegant 18K gold bracelet.",
        "price": 799.99,
        "image_url": "https://themillenniumbride.com/cdn/shop/products/swarovski-crystal-luxury-flower-diamondcrystal-necklace-bridal-necklace-set-bridal-jewelry-statement-necklace-985099.jpg?v=1683824242",
        "category": "bracelets"
    },
    {
        "name": "Sapphire Ring",
        "description": "A stunning sapphire ring with a white gold band.",
        "price": 1999.99,
        "image_url": "https://themillenniumbride.com/cdn/shop/products/swarovski-crystal-luxury-flower-diamondcrystal-necklace-bridal-necklace-set-bridal-jewelry-statement-necklace-985099.jpg?v=1683824242",
        "category": "rings"
    }
]

# Function to seed data
def seed_products():
    db: Session = SessionLocal()
    try:
        print("Seeding products...")
        for product in sample_products:
            exists = db.query(Product).filter(Product.name == product["name"]).first()
            if not exists:
                new_product = Product(**product)
                db.add(new_product)
        db.commit()
        print("✅ Products seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding products: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_products()
