"""
User factory for generating test user data.
"""
import factory
from factory.alchemy import SQLAlchemyModelFactory
from faker import Faker

from tests.models import TestUser

fake = Faker()


class UserFactory(SQLAlchemyModelFactory):
    """Factory for creating test User instances."""
    
    class Meta:
        model = TestUser
        sqlalchemy_session_persistence = "commit"
    
    # Core user fields
    clerk_id = factory.Sequence(lambda n: f"user_{n:06d}")
    email = factory.LazyAttribute(lambda obj: f"user_{obj.clerk_id}@jasonjewels.com")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")


class LuxuryCustomerFactory(UserFactory):
    """Factory for creating high-value luxury customers."""
    
    first_name = factory.Iterator([
        "Alexander", "Victoria", "Sebastian", "Isabella", 
        "Maximilian", "Anastasia", "Theodore", "Arabella"
    ])
    
    last_name = factory.Iterator([
        "Wellington", "Kensington", "Pemberton", "Worthington",
        "Montgomery", "Carrington", "Huntington", "Remington"
    ])
    
    email = factory.LazyAttribute(
        lambda obj: f"{obj.first_name.lower()}.{obj.last_name.lower()}@luxury-domains.com"
    )


class TestUserFactory(UserFactory):
    """Factory specifically for test users with predictable data."""
    
    clerk_id = "test_user_123"
    email = "test@jasonjewels.com"
    first_name = "Test"
    last_name = "User"