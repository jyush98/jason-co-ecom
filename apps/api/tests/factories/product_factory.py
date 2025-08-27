"""
Product factory for generating test product data.
"""
import factory
import random
from factory.alchemy import SQLAlchemyModelFactory
from faker import Faker

from tests.models import TestProduct

fake = Faker()


class ProductFactory(SQLAlchemyModelFactory):
    """Factory for creating test Product instances."""
    
    class Meta:
        model = TestProduct
        sqlalchemy_session_persistence = "commit"
    
    # Core product fields
    name = factory.Faker("catch_phrase")
    description = factory.Faker("text", max_nb_chars=500)
    price = factory.LazyFunction(lambda: random.randint(10000, 500000))  # Price in cents
    category_string = factory.Iterator(["rings", "necklaces", "bracelets", "earrings", "watches"])
    inventory_count = factory.LazyFunction(lambda: random.randint(1, 50))
    featured = factory.LazyFunction(lambda: random.choice([True, False]))
    
    # Product details as JSONB
    details = factory.LazyFunction(lambda: {
        "material": random.choice(["Gold", "Silver", "Platinum", "Titanium"]),
        "stone": random.choice(["Diamond", "Ruby", "Sapphire", "Emerald", "None"]),
        "weight": f"{random.randint(5, 100)}g",
        "dimensions": f"{random.randint(10, 50)}mm x {random.randint(10, 50)}mm"
    })


class LuxuryProductFactory(ProductFactory):
    """Factory for creating high-end luxury products."""
    
    name = factory.Iterator([
        "Royal Diamond Tiara",
        "Platinum Elite Collection Ring",
        "Emerald Crown Necklace",
        "Vintage Sapphire Bracelet",
        "Imperial Gold Watch",
        "Ruby Princess Earrings",
        "Diamond Eternity Band",
        "Luxury Pearl Collection"
    ])
    
    description = factory.Iterator([
        "Exquisite handcrafted piece featuring premium materials and exceptional attention to detail.",
        "Timeless elegance meets modern sophistication in this stunning luxury creation.",
        "A masterpiece of jewelry artistry, perfect for the most discerning collectors.",
        "Rare and precious stones carefully selected for their exceptional quality and beauty.",
        "Crafted by master jewelers using traditional techniques and the finest materials."
    ])
    
    price = factory.LazyFunction(lambda: random.randint(500000, 5000000))  # $5000-$50000 in cents
    featured = True
    inventory_count = factory.LazyFunction(lambda: random.randint(1, 5))  # Limited stock
    
    details = factory.LazyFunction(lambda: {
        "material": random.choice(["18k Gold", "24k Gold", "Platinum", "White Gold"]),
        "stone": random.choice(["Diamond", "Ruby", "Sapphire", "Emerald"]),
        "certification": "GIA Certified",
        "origin": "Handcrafted",
        "weight": f"{random.randint(20, 150)}g",
        "carat": f"{random.uniform(0.5, 5.0):.2f}ct" if random.choice([True, False]) else None
    })


class RingFactory(ProductFactory):
    """Factory specifically for ring products."""
    
    category_string = "rings"
    name = factory.Iterator([
        "Classic Diamond Ring",
        "Vintage Gold Band",
        "Modern Platinum Ring",
        "Antique Silver Ring",
        "Designer Gemstone Ring"
    ])
    
    details = factory.LazyFunction(lambda: {
        "material": random.choice(["Gold", "Silver", "Platinum"]),
        "stone": random.choice(["Diamond", "Ruby", "Sapphire", "Emerald", "None"]),
        "ring_size": random.choice(["5", "6", "7", "8", "9", "10"]),
        "band_width": f"{random.randint(2, 8)}mm",
        "setting": random.choice(["Prong", "Bezel", "Channel", "Pave"])
    })


class NecklaceFactory(ProductFactory):
    """Factory specifically for necklace products."""
    
    category_string = "necklaces"
    name = factory.Iterator([
        "Elegant Pearl Necklace",
        "Diamond Tennis Necklace",
        "Gold Chain Necklace",
        "Vintage Pendant Necklace",
        "Statement Gemstone Necklace"
    ])
    
    details = factory.LazyFunction(lambda: {
        "material": random.choice(["Gold", "Silver", "Platinum"]),
        "chain_type": random.choice(["Box", "Rope", "Figaro", "Cuban", "Snake"]),
        "length": f"{random.randint(16, 24)} inches",
        "clasp": random.choice(["Lobster", "Spring Ring", "Toggle", "Magnetic"]),
        "pendant": random.choice([True, False])
    })


class TestProductFactory(ProductFactory):
    """Factory for creating predictable test products."""
    
    name = "Test Diamond Ring"
    description = "A test product for automated testing"
    price = 100000  # $1000 in cents
    category_string = "rings"
    inventory_count = 10
    featured = False
    
    details = {
        "material": "Gold",
        "stone": "Diamond",
        "test": True
    }