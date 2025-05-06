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

# Mapping of product names to their details
product_details_map = {
    "Diamond Necklace": {
        "Metal": "14k White Gold",
        "Diamond Quality": "VS1",
        "Diamond Color": "F–G",
        "Carat Weight": "1.5 ct",
        "Length": "18 inches"
    },
    "Gold Bracelet": {
        "Metal": "18k Yellow Gold",
        "Diamond Quality": "VS2",
        "Carat Weight": "2.0 ct",
        "Length": "7 inches"
    },
    "Sapphire Ring": {
        "Metal": "White Gold",
        "Center Stone": "Blue Sapphire",
        "Diamond Halo": "Yes",
        "Carat Weight": "2.2 ct total"
    },
    "Platinum Pendant": {
        "Metal": "Platinum",
        "Accent Stone": "Diamond",
        "Chain Length": "20 inches"
    },
    "Rolex - Hulk": {
        "Material": "Stainless Steel",
        "Model": "Submariner",
        "Water Resistance": "300m"
    },
    "Emerald Earrings": {
        "Metal": "14k Gold",
        "Stone": "Emerald",
        "Carat Weight": "0.6 ct each",
        "Quality": "SI1"
    },
    "Rose Gold Necklace": {
        "Metal": "14k Rose Gold",
        "Diamond Pendant": "0.8 ct",
        "Length": "18 inches"
    },
    "Diamond Ring": {
        "Metal": "Platinum",
        "Carat Weight": "2.0 ct",
        "Diamond Color": "D",
        "Diamond Quality": "VS+"
    },
    "Gold Hoop Earrings": {
        "Metal": "18k Gold",
        "Diameter": "2 inches",
        "Weight": "4g each"
    },
    "Silver Watch": {
        "Material": "Stainless Steel",
        "Movement": "Quartz",
        "Band Width": "20mm"
    },
    "White Gold Bracelet": {
        "Metal": "14k White Gold",
        "Carat Weight": "1.0 ct",
        "Diamond Color": "G–H"
    },
    "Diamond Stud Earrings": {
        "Metal": "White Gold",
        "Carat Weight": "0.5 ct each",
        "Diamond Color": "F"
    },
    "Silver Pendant": {
        "Material": "Sterling Silver",
        "Design": "Floral Pattern",
        "Length": "20 inches"
    },
    "Gold Cuban Chain": {
        "Metal": "14k Gold",
        "Width": "12mm",
        "Length": "22 inches"
    },
    "Gold Earrings": {
        "Metal": "18k Gold",
        "Style": "Turkish Vintage",
        "Stones": "Diamond accents"
    },
    "Gold Pendant": {
        "Metal": "18k Yellow Gold",
        "Center Stone": "Ruby",
        "Weight": "3.5g"
    }
}

# Function to update existing products with details
def update_product_details():
    db: Session = SessionLocal()
    try:
        print("Updating product details...")
        for name, details in product_details_map.items():
            product = db.query(Product).filter(Product.name == name).first()
            if product:
                product.details = details
                print(f"✅ Updated: {name}")
            else:
                print(f"❌ Not found: {name}")
        db.commit()
        print("🎉 All updates committed!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error updating products: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_product_details()
