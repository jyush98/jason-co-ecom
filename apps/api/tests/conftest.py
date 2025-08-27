"""
Test configuration and fixtures for Jason & Co. API tests.
"""
import os
import pytest
import asyncio
from typing import Generator, AsyncGenerator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from httpx import AsyncClient

from app.main import app
from app.core.db import get_db
from tests.models import TestBase
from tests.factories.user_factory import UserFactory
from tests.factories.product_factory import ProductFactory


# Test database configuration - use in-memory SQLite for faster tests
TEST_DATABASE_URL = "sqlite:///:memory:"

# Create test engine with in-memory SQLite
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=test_engine
)


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Create a fresh database session for each test."""
    # Create all tables using test models
    TestBase.metadata.create_all(bind=test_engine)
    
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        # Drop all tables after each test for isolation
        TestBase.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """Create a test client with database session override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
async def async_client(db_session: Session) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client for async endpoint testing."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://testserver") as async_test_client:
        yield async_test_client
    
    app.dependency_overrides.clear()


# Factory fixtures
@pytest.fixture
def user_factory(db_session: Session):
    """User factory fixture."""
    UserFactory._meta.sqlalchemy_session = db_session
    return UserFactory


@pytest.fixture
def product_factory(db_session: Session):
    """Product factory fixture."""
    ProductFactory._meta.sqlalchemy_session = db_session
    return ProductFactory


# Authentication fixtures
@pytest.fixture
def mock_clerk_user():
    """Mock Clerk user data for testing authentication."""
    return {
        "id": "user_test_123",
        "email_addresses": [{"email_address": "test@jasonjewels.com"}],
        "first_name": "Test",
        "last_name": "User",
        "email_verified": True
    }


@pytest.fixture
def auth_headers(mock_clerk_user):
    """Mock authentication headers for testing protected endpoints."""
    return {
        "Authorization": "Bearer mock_token_123",
        "clerk-session-id": "sess_test_123",
        "x-clerk-session-id": "sess_test_123"
    }


# Test data fixtures
@pytest.fixture
def sample_product_data():
    """Sample product data for testing."""
    return {
        "name": "Luxury Diamond Necklace",
        "description": "Exquisite 18k gold necklace with premium diamonds",
        "price": 15000.00,
        "category": "necklaces",
        "inventory_count": 5,
        "featured": True,
        "product_details": {
            "material": "18k Gold",
            "stone": "Diamond",
            "weight": "25g",
            "certification": "GIA Certified"
        }
    }


@pytest.fixture
def sample_cart_item_data():
    """Sample cart item data for testing."""
    return {
        "product_id": 1,
        "quantity": 1,
        "price": 15000.00
    }


@pytest.fixture
def sample_order_data():
    """Sample order data for testing."""
    return {
        "items": [
            {
                "product_id": 1,
                "quantity": 1,
                "price": 15000.00
            }
        ],
        "total_amount": 15000.00,
        "shipping_address": {
            "street": "123 Luxury Lane",
            "city": "Beverly Hills",
            "state": "CA",
            "zip_code": "90210",
            "country": "US"
        },
        "billing_address": {
            "street": "123 Luxury Lane",
            "city": "Beverly Hills", 
            "state": "CA",
            "zip_code": "90210",
            "country": "US"
        }
    }


# Payment testing fixtures
@pytest.fixture
def stripe_test_card():
    """Stripe test card data for payment testing."""
    return {
        "number": "4242424242424242",  # Visa test card
        "exp_month": 12,
        "exp_year": 2025,
        "cvc": "123"
    }


@pytest.fixture
def stripe_test_card_declined():
    """Stripe test card that will be declined."""
    return {
        "number": "4000000000000002",  # Declined test card
        "exp_month": 12,
        "exp_year": 2025,
        "cvc": "123"
    }


# Performance testing fixtures
@pytest.fixture
def performance_timer():
    """Timer fixture for performance testing."""
    import time
    
    class Timer:
        def __init__(self):
            self.start_time = None
            self.end_time = None
        
        def start(self):
            self.start_time = time.time()
        
        def stop(self):
            self.end_time = time.time()
            return self.elapsed()
        
        def elapsed(self):
            if self.start_time and self.end_time:
                return self.end_time - self.start_time
            return None
    
    return Timer()


# Database utility fixtures
@pytest.fixture
def db_utils(db_session: Session):
    """Database utility methods for testing."""
    class DBUtils:
        def __init__(self, session):
            self.session = session
        
        def create_test_user(self, **kwargs):
            """Create a test user with default values."""
            from tests.models import TestUser
            
            defaults = {
                "clerk_id": "test_user_123",
                "email": "test@jasonjewels.com",
                "first_name": "Test",
                "last_name": "User"
            }
            defaults.update(kwargs)
            
            user = TestUser(**defaults)
            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)
            return user
        
        def create_test_product(self, **kwargs):
            """Create a test product with default values."""
            from tests.models import TestProduct
            
            defaults = {
                "name": "Test Product",
                "description": "Test product description",
                "price": 100000,  # $1000 in cents
                "category_string": "rings",
                "inventory_count": 10,
                "featured": False
            }
            defaults.update(kwargs)
            
            product = TestProduct(**defaults)
            self.session.add(product)
            self.session.commit()
            self.session.refresh(product)
            return product
    
    return DBUtils(db_session)


# Cleanup fixtures
@pytest.fixture(autouse=True)
def cleanup_test_files():
    """Automatically clean up test files after each test."""
    yield
    
    # Clean up any test database files
    test_db_files = ["test_jason_co.db", "test_jason_co.db-shm", "test_jason_co.db-wal"]
    for file in test_db_files:
        try:
            if os.path.exists(file):
                os.remove(file)
        except Exception:
            pass  # Ignore cleanup errors


# Markers for different test types
pytestmark = pytest.mark.asyncio