"""
Production-compatible factories for integration testing.

These factories can work with both test models and production models
by dynamically switching the model class.
"""
import factory
from factory.alchemy import SQLAlchemyModelFactory
from faker import Faker
import random

fake = Faker()


class ProductionUserFactory(SQLAlchemyModelFactory):
    """Factory for creating User instances with production models."""
    
    class Meta:
        # This will be dynamically set to either TestUser or production User
        model = None
        sqlalchemy_session_persistence = "commit"
    
    # Core user fields matching production User model
    clerk_id = factory.Sequence(lambda n: f"prod_user_{n:06d}")
    email = factory.LazyAttribute(lambda obj: f"user_{obj.clerk_id}@jasonjewels.com")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    
    # Production model fields
    is_active = True
    deleted_at = None

    @classmethod
    def _setup_model(cls, use_production=True):
        """Setup the model class dynamically."""
        if use_production:
            from tests.models_production import ProductionTestUser
            cls._meta.model = ProductionTestUser
            cls._meta.abstract = False
        else:
            from tests.models import TestUser
            cls._meta.model = TestUser
            cls._meta.abstract = False


class ProductionProductFactory(SQLAlchemyModelFactory):
    """Factory for creating Product instances with production models."""
    
    class Meta:
        # This will be dynamically set to either TestProduct or production Product
        model = None
        sqlalchemy_session_persistence = "commit"
    
    # Core product fields matching production Product model
    name = factory.Faker("word")
    description = factory.Faker("text", max_nb_chars=500)
    price = factory.LazyFunction(lambda: random.randint(50000, 500000))  # $500-$5000
    
    # Production-specific fields
    sku = factory.Sequence(lambda n: f"PROD-{n:06d}")
    slug = factory.LazyAttribute(lambda obj: obj.name.lower().replace(" ", "-"))
    short_description = factory.Faker("text", max_nb_chars=200)
    
    # Category and classification
    category_string = factory.Iterator(["rings", "necklaces", "earrings", "bracelets"])
    product_type = factory.Iterator(["jewelry", "accessory", "luxury"])
    
    # Inventory
    inventory_count = factory.LazyFunction(lambda: random.randint(1, 20))
    inventory_policy = "deny"
    track_inventory = True
    low_stock_threshold = 5
    
    # Status and visibility
    status = "active"
    featured = factory.LazyFunction(lambda: random.choice([True, False]))
    searchable = True
    available_online = True
    available_in_store = True
    
    # Media
    image_url = factory.LazyAttribute(
        lambda obj: f"https://images.jasonjewels.com/products/{obj.name.lower().replace(' ', '-')}.jpg"
    )
    
    # SEO
    meta_title = factory.LazyAttribute(lambda obj: f"{obj.name} | Jason & Co.")
    meta_description = factory.LazyAttribute(
        lambda obj: f"Luxury {obj.category_string.rstrip('s')} - {obj.name}. {obj.short_description}"
    )
    
    # Business intelligence
    view_count = 0
    conversion_rate = 0.0
    average_rating = 0.0
    review_count = 0
    
    # Admin
    created_by = "integration_test"
    last_modified_by = "integration_test"

    @classmethod
    def _setup_model(cls, use_production=True):
        """Setup the model class dynamically."""
        if use_production:
            from tests.models_production import ProductionTestProduct
            cls._meta.model = ProductionTestProduct
            cls._meta.abstract = False
        else:
            from tests.models import TestProduct
            cls._meta.model = TestProduct
            cls._meta.abstract = False


class LuxuryProductionProductFactory(ProductionProductFactory):
    """Factory for creating luxury products with high values."""
    
    name = factory.Iterator([
        "Diamond Eternity Ring", "Platinum Wedding Band", "Sapphire Necklace",
        "Gold Tennis Bracelet", "Pearl Drop Earrings", "Emerald Cocktail Ring",
        "Ruby Pendant Necklace", "White Gold Chain", "Diamond Stud Earrings"
    ])
    
    price = factory.LazyFunction(lambda: random.randint(500000, 5000000))  # $5K-$50K
    
    description = factory.LazyAttribute(
        lambda obj: f"Exquisite {obj.name.lower()} crafted from the finest materials. "
                   f"This luxury piece represents the pinnacle of jewelry craftsmanship."
    )
    
    featured = True
    inventory_count = factory.LazyFunction(lambda: random.randint(1, 5))  # Limited luxury inventory
    
    # Luxury product details
    materials = factory.LazyFunction(lambda: ["18k Gold", "Platinum", "Diamonds"])
    care_instructions = "Professional cleaning recommended. Store in provided luxury box."


class ProductionCustomerFactory(ProductionUserFactory):
    """Factory for creating luxury customers."""
    
    first_name = factory.Iterator([
        "Alexander", "Victoria", "Sebastian", "Isabella", 
        "Maximilian", "Anastasia", "Theodore", "Arabella",
        "Christopher", "Katherine", "Jonathan", "Elizabeth"
    ])
    
    last_name = factory.Iterator([
        "Wellington", "Kensington", "Pemberton", "Worthington",
        "Montgomery", "Carrington", "Huntington", "Remington"
    ])
    
    email = factory.LazyAttribute(
        lambda obj: f"{obj.first_name.lower()}.{obj.last_name.lower()}@luxury-clients.com"
    )


# Convenience functions to set up factories for different test types
def setup_production_factories(session, use_production_models=True):
    """Set up all factories for production integration testing."""
    ProductionUserFactory._meta.sqlalchemy_session = session
    ProductionProductFactory._meta.sqlalchemy_session = session
    LuxuryProductionProductFactory._meta.sqlalchemy_session = session
    ProductionCustomerFactory._meta.sqlalchemy_session = session
    
    if use_production_models:
        ProductionUserFactory._setup_model(True)
        ProductionProductFactory._setup_model(True)
        LuxuryProductionProductFactory._setup_model(True)
        ProductionCustomerFactory._setup_model(True)
    else:
        ProductionUserFactory._setup_model(False)
        ProductionProductFactory._setup_model(False)
        LuxuryProductionProductFactory._setup_model(False)
        ProductionCustomerFactory._setup_model(False)
    
    return {
        'user': ProductionUserFactory,
        'product': ProductionProductFactory,
        'luxury_product': LuxuryProductionProductFactory,
        'customer': ProductionCustomerFactory
    }