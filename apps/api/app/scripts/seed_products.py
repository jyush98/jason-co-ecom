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
    "image_url": "https://media.istockphoto.com/id/163122066/photo/round-diamonds-necklace.jpg?s=612x612&w=0&k=20&c=WGZd7NPAX1FyYPrjjnIM-c8jinMHT-GAIF4BLMYjtD4=",
    "category": "necklaces",
    "featured": True
  },
  {
    "name": "Gold Bracelet",
    "description": "Elegant 18K gold bracelet.",
    "price": 799.99,
    "image_url": "https://media.istockphoto.com/id/625240370/photo/golden-bracelet-isolated-on-black.jpg?s=612x612&w=0&k=20&c=ikZShXv-jywucnJIvAvCuTEd4QSEMd2lrZ41Nw1x1ZY=",
    "category": "bracelets",
    "featured": True
  },
  {
    "name": "Sapphire Ring",
    "description": "A stunning sapphire ring with a white gold band.",
    "price": 1999.99,
    "image_url": "https://www.nathanalanjewelers.com/engagement-rings/gemstone/images/z13310241-13310241---Blue-Sapphire-Engagement-Ring-with-Flower-Shaped-Halo-of-Pave-Diamonds---Left-UPDATED.png",
    "category": "rings",
    "featured": True
  },
  {
    "name": "Platinum Pendant",
    "description": "A sleek platinum pendant with a diamond accent.",
    "price": 2499.99,
    "image_url": "https://www.longsjewelers.com/cdn/shop/files/ESCH4009A_1200x.jpg?v=1714781409",
    "category": "pendants",
    "featured": True
  },
  {
    "name": "Rolex - Hulk",
    "description": "A classic luxury watch with a stainless steel band.",
    "price": 5000.00,
    "image_url": "https://img.goodfon.com/original/5120x2880/9/fd/rolex-green-hulk-clock-steel-black-background.jpg",
    "category": "watches",
    "featured": False
  },
  {
    "name": "Emerald Earrings",
    "description": "Stunning emerald earrings set in 14K gold.",
    "price": 1599.99,
    "image_url": "https://media.istockphoto.com/id/1388541248/photo/beautiful-gold-earrings-with-precious-stones-diamonds-and-emeralds-on-a-black-background.jpg?s=612x612&w=0&k=20&c=2IAl0OMRrFW_Kh_zgA29lYI-7KetipXNWrqsNIjiw_Y=",
    "category": "earrings",
    "featured": True
  },
  {
    "name": "Rose Gold Necklace",
    "description": "A delicate rose gold necklace with a diamond pendant.",
    "price": 2299.99,
    "image_url": "https://hannahnaomi.com/cdn/shop/products/INTR-TN-3-BOX-CHAINS-SET-DSC09297.jpg?v=1678035899&width=1445",
    "category": "necklaces",
    "featured": True
  },
  {
    "name": "Diamond Ring",
    "description": "A 2-carat diamond ring with a platinum band.",
    "price": 6999.99,
    "image_url": "https://www.nathanalanjewelers.com/engagement-rings/images/z1011663.jpg",
    "category": "rings",
    "featured": True
  },
  {
    "name": "Gold Hoop Earrings",
    "description": "Classic 18K gold hoop earrings.",
    "price": 599.99,
    "image_url": "https://shrinejewelry.com/cdn/shop/files/goldhoop_300x300.jpg?v=1695786629",
    "category": "earrings",
    "featured": False
  },
  {
    "name": "Silver Watch",
    "description": "Elegant silver watch with minimalistic design.",
    "price": 1200.00,
    "image_url": "https://media.gettyimages.com/id/1674225613/photo/precious-silver-metal-mens-chronograph-wrist-watch-on-black-background.jpg?s=612x612&w=gi&k=20&c=H0Ge24qbKnm-KpKRQOCWRKEiT0dwOxBA4cskD6IngC0=",
    "category": "watches",
    "featured": False
  },
  {
    "name": "White Gold Bracelet",
    "description": "A stunning white gold bracelet with a diamond inlay.",
    "price": 3200.00,
    "image_url": "https://media.istockphoto.com/id/1356557199/photo/white-gold-bracelet-with-diamonds.jpg?s=612x612&w=0&k=20&c=Ffvm-8UU8U9fsVrq9R8LSS-Um3C6NKiKNJeCisqzCPg=",
    "category": "bracelets",
    "featured": True
  },
  {
    "name": "Diamond Stud Earrings",
    "description": "Classic diamond stud earrings in white gold.",
    "price": 999.99,
    "image_url": "https://royalparadisejewelry.com/cdn/shop/files/preview_images/ScreenShot2023-12-18at11.30.29AM.png?v=1702935117",
    "category": "earrings",
    "featured": True
  },
  {
    "name": "Silver Pendant",
    "description": "A beautifully designed silver pendant with an intricate pattern.",
    "price": 799.99,
    "image_url": "https://cdn11.bigcommerce.com/s-e68muojepk/images/stencil/1280x1280/products/213/13740/JPDIVC_STD2_4x5__26915.1740764686.jpg?c=2",
    "category": "pendants",
    "featured": False
  },
  {
    "name": "Gold Cuban Chain",
    "description": "A sleek and bold gold chain necklace.",
    "price": 1200.00,
    "image_url": "https://faithheart-jewelry.com/cdn/shop/files/N3537K.jpg?v=1713514240&width=1946",
    "category": "necklaces",
    "featured": True
  },
  {
    "name": "Gold Earrings",
    "description": "Elegant 18K gold earrings with diamond detailing.",
    "price": 2499.99,
    "image_url": "https://www.shutterstock.com/image-photo/beautiful-vintage-oriental-gold-turkish-260nw-731457892.jpg",
    "category": "earrings",
    "featured": False
  },
  {
    "name": "Gold Pendant",
    "description": "A radiant gold pendant with a central ruby.",
    "price": 2000.00,
    "image_url": "https://johnnysaintstudio.com/cdn/shop/files/cross-01_cbc4c12a-7826-4309-a7af-9cf1543c5e1e.jpg?v=1728490469",
    "category": "pendants",
    "featured": True
  },
];

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
