"""
Production Integration Test Configuration

This configuration uses actual production database models for integration testing.
Used in Phase 4 for end-to-end database testing with production schemas.
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
from tests.models_production import ProductionTestBase  # Use production-compatible test models
from tests.factories.user_factory import UserFactory
from tests.factories.product_factory import ProductFactory


# Production integration test database - separate from main database
INTEGRATION_TEST_DATABASE_URL = "sqlite:///./test_integration.db"

# Create integration test engine with persistent SQLite for production model testing
integration_test_engine = create_engine(
    INTEGRATION_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False  # Set to True for debugging SQL
)

IntegrationTestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=integration_test_engine
)


@pytest.fixture(scope="session")
def integration_event_loop():
    """Create an instance of the default event loop for integration test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def setup_integration_database():
    """Set up production-compatible database tables for integration testing."""
    # Create all production-compatible tables using ProductionTestBase
    ProductionTestBase.metadata.create_all(bind=integration_test_engine)
    yield
    # Clean up after all integration tests
    ProductionTestBase.metadata.drop_all(bind=integration_test_engine)
    # Remove test database file
    try:
        os.remove("./test_integration.db")
    except FileNotFoundError:
        pass


@pytest.fixture(scope="function")
def integration_db_session(setup_integration_database) -> Generator[Session, None, None]:
    """Create a fresh database session for each integration test."""
    session = IntegrationTestingSessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


@pytest.fixture(scope="function")
def integration_client(integration_db_session: Session) -> Generator[TestClient, None, None]:
    """Create a test client with production database session override."""
    def override_get_db():
        try:
            yield integration_db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
async def integration_async_client(integration_db_session: Session) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client for integration testing."""
    def override_get_db():
        try:
            yield integration_db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://testserver") as async_test_client:
        yield async_test_client
    
    app.dependency_overrides.clear()


# Production factory fixtures for integration testing
@pytest.fixture
def integration_user_factory(integration_db_session: Session):
    """User factory fixture for integration testing with production models."""
    UserFactory._meta.sqlalchemy_session = integration_db_session
    # Use production User model instead of TestUser
    UserFactory._meta.model = None  # Reset to use declared model
    return UserFactory


@pytest.fixture
def integration_product_factory(integration_db_session: Session):
    """Product factory fixture for integration testing with production models."""
    ProductFactory._meta.sqlalchemy_session = integration_db_session
    # Use production Product model instead of TestProduct  
    ProductFactory._meta.model = None  # Reset to use declared model
    return ProductFactory


# Integration test authentication fixtures
@pytest.fixture
def integration_auth_headers():
    """Authentication headers for integration testing."""
    return {
        "Authorization": "Bearer integration_test_token",
        "clerk-session-id": "sess_integration_test",
        "x-clerk-session-id": "sess_integration_test"
    }


@pytest.fixture
def integration_mock_clerk_user():
    """Mock Clerk user for integration testing."""
    return {
        "id": "user_integration_test",
        "email_addresses": [{"email_address": "integration@jasonjewels.com"}],
        "first_name": "Integration",
        "last_name": "Test",
        "email_verified": True
    }


# Integration test data cleanup
@pytest.fixture(autouse=True)
def integration_cleanup(integration_db_session: Session):
    """Clean up test data after each integration test."""
    yield
    
    # Clean up specific tables in order (respecting foreign key constraints)
    try:
        # Clear data but keep table structure
        from tests.models_production import (
            ProductionTestOrderItem, ProductionTestOrder, 
            ProductionTestCartItem, ProductionTestWishlistItem,
            ProductionTestProductCollection, ProductionTestProduct, 
            ProductionTestUser, ProductionTestCategory, ProductionTestCollection
        )
        
        # Delete in order of dependencies
        integration_db_session.query(ProductionTestOrderItem).delete()
        integration_db_session.query(ProductionTestOrder).delete()
        integration_db_session.query(ProductionTestCartItem).delete()
        integration_db_session.query(ProductionTestWishlistItem).delete()
        integration_db_session.query(ProductionTestProductCollection).delete()
        integration_db_session.query(ProductionTestProduct).delete()
        integration_db_session.query(ProductionTestUser).delete()
        integration_db_session.query(ProductionTestCategory).delete()
        integration_db_session.query(ProductionTestCollection).delete()
        
        integration_db_session.commit()
    except Exception as e:
        integration_db_session.rollback()
        # Don't fail the test if cleanup fails
        print(f"Integration test cleanup warning: {e}")


# Database utilities for integration testing
@pytest.fixture
def integration_db_utils(integration_db_session: Session):
    """Database utility methods for integration testing."""
    class IntegrationDBUtils:
        def __init__(self, session):
            self.session = session
        
        def create_production_user(self, **kwargs):
            """Create a user using production-compatible model."""
            from tests.models_production import ProductionTestUser
            
            defaults = {
                "clerk_id": f"integration_user_{id(kwargs)}",
                "email": f"integration_{id(kwargs)}@jasonjewels.com",
                "first_name": "Integration",
                "last_name": "User"
            }
            defaults.update(kwargs)
            
            user = ProductionTestUser(**defaults)
            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)
            return user
        
        def create_production_product(self, **kwargs):
            """Create a product using production-compatible model."""
            from tests.models_production import ProductionTestProduct
            
            defaults = {
                "name": f"Integration Test Product {id(kwargs)}",
                "description": "Product for integration testing",
                "price": 100000,  # $1000 in cents
                "category_string": "rings",
                "inventory_count": 10,
                "featured": False,
                "status": "active",
                "available_online": True
            }
            defaults.update(kwargs)
            
            product = ProductionTestProduct(**defaults)
            self.session.add(product)
            self.session.commit()
            self.session.refresh(product)
            return product
        
        def verify_table_exists(self, table_name: str) -> bool:
            """Verify that a production table exists."""
            from sqlalchemy import text
            result = self.session.execute(
                text("SELECT name FROM sqlite_master WHERE type='table' AND name=:table_name"),
                {"table_name": table_name}
            ).fetchone()
            return result is not None
    
    return IntegrationDBUtils(integration_db_session)


# Performance monitoring for integration tests
@pytest.fixture
def integration_performance_monitor():
    """Performance monitoring for integration tests."""
    import time
    
    class PerformanceMonitor:
        def __init__(self):
            self.start_time = None
            self.benchmarks = {}
        
        def start_timer(self, operation: str):
            """Start timing an operation."""
            self.start_time = time.time()
            return operation
        
        def end_timer(self, operation: str):
            """End timing and record benchmark."""
            if self.start_time:
                duration = time.time() - self.start_time
                self.benchmarks[operation] = duration
                self.start_time = None
                return duration
            return None
        
        def assert_performance(self, operation: str, max_duration: float):
            """Assert that an operation completed within expected time."""
            if operation in self.benchmarks:
                actual = self.benchmarks[operation]
                assert actual <= max_duration, f"{operation} took {actual:.3f}s, expected <= {max_duration}s"
            else:
                raise ValueError(f"No benchmark recorded for operation: {operation}")
    
    return PerformanceMonitor()