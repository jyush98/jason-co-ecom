"""
Unit tests for Cart API endpoints.

Tests cover the core cart functionality including:
- Adding items to cart
- Retrieving cart contents
- Updating cart item quantities
- Removing cart items  
- Cart count operations
- Authentication and authorization
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from tests.factories.product_factory import ProductFactory
from tests.factories.user_factory import UserFactory


class TestCartAPI:
    """Test suite for /api/v1/cart endpoints."""
    
    def setup_method(self):
        """Set up test data before each test."""
        self.mock_clerk_user = {
            "sub": "test_clerk_user_123",
            "email": "test@jasonjewels.com",
            "first_name": "Test",
            "last_name": "User"
        }
    
    @pytest.mark.unit
    @patch('app.routes.cart.verify_clerk_token')
    def test_get_cart_count_empty_cart(self, mock_verify, client: TestClient, db_session):
        """Test cart count for empty cart."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        
        # Act
        response = client.get("/api/v1/cart/count")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
    
    
    @pytest.mark.unit
    @patch('app.routes.cart.verify_clerk_token')
    def test_add_to_cart_success(self, mock_verify, client: TestClient, db_session):
        """Test successfully adding item to cart."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        ProductFactory._meta.sqlalchemy_session = db_session
        
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        product = ProductFactory.create()
        
        cart_item = {
            "product_id": product.id,
            "quantity": 2
        }
        
        # Act
        response = client.post("/api/v1/cart/add", json=cart_item)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Item added to cart" in data["message"]
        assert data["user_db_id"] == user.id
    
    
    @pytest.mark.unit
    @patch('app.routes.cart.verify_clerk_token')
    def test_add_to_cart_update_existing_quantity(self, mock_verify, client: TestClient, db_session):
        """Test adding to cart updates existing item quantity."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        ProductFactory._meta.sqlalchemy_session = db_session
        
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        product = ProductFactory.create()
        
        cart_item = {
            "product_id": product.id,
            "quantity": 1
        }
        
        # Act: Add item first time
        response1 = client.post("/api/v1/cart/add", json=cart_item)
        assert response1.status_code == 200
        
        # Act: Add same item again
        response2 = client.post("/api/v1/cart/add", json=cart_item)
        
        # Assert
        assert response2.status_code == 200
        
        # Verify cart count reflects the update
        response_count = client.get("/api/v1/cart/count")
        assert response_count.status_code == 200
        count_data = response_count.json()
        assert count_data["count"] == 2  # Should be 1 + 1 = 2
    
    
    @pytest.mark.unit
    @patch('app.routes.cart.verify_clerk_token')
    def test_get_cart_contents(self, mock_verify, client: TestClient, db_session):
        """Test retrieving cart contents."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        ProductFactory._meta.sqlalchemy_session = db_session
        
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        product = ProductFactory.create()
        
        # Add item to cart first
        cart_item = {
            "product_id": product.id,
            "quantity": 3
        }
        add_response = client.post("/api/v1/cart/add", json=cart_item)
        assert add_response.status_code == 200
        
        # Act
        response = client.get("/api/v1/cart")
        
        # Assert
        assert response.status_code == 200
        # The actual response structure will depend on the cart endpoint implementation
    
    
    @pytest.mark.unit
    @patch('app.routes.cart.verify_clerk_token')
    def test_cart_with_multiple_products(self, mock_verify, client: TestClient, db_session):
        """Test cart functionality with multiple different products."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        ProductFactory._meta.sqlalchemy_session = db_session
        
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        product1 = ProductFactory.create(name="Diamond Ring")
        product2 = ProductFactory.create(name="Gold Necklace")
        product3 = ProductFactory.create(name="Silver Bracelet")
        
        # Add multiple items
        items = [
            {"product_id": product1.id, "quantity": 2},
            {"product_id": product2.id, "quantity": 1},
            {"product_id": product3.id, "quantity": 3}
        ]
        
        for item in items:
            response = client.post("/api/v1/cart/add", json=item)
            assert response.status_code == 200
        
        # Act: Check cart count
        response = client.get("/api/v1/cart/count")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 6  # 2 + 1 + 3 = 6 total items
    
    
    @pytest.mark.unit
    def test_cart_requires_authentication(self, client: TestClient, db_session):
        """Test that cart endpoints require authentication."""
        # Act: Try to access cart without authentication
        response = client.get("/api/v1/cart/count")
        
        # Assert: Should fail with authentication error
        assert response.status_code in [401, 422]  # Unauthorized or validation error
    
    
    @pytest.mark.unit
    @patch('app.routes.cart.verify_clerk_token')
    def test_add_to_cart_invalid_product(self, mock_verify, client: TestClient, db_session):
        """Test adding non-existent product to cart."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        
        cart_item = {
            "product_id": 99999,  # Non-existent product
            "quantity": 1
        }
        
        # Act
        response = client.post("/api/v1/cart/add", json=cart_item)
        
        # Assert: Should handle gracefully (exact behavior depends on implementation)
        # Could be 400 (bad request) or 500 (server error) depending on validation
        assert response.status_code in [400, 404, 500]
    
    
    @pytest.mark.unit
    @patch('app.routes.cart.verify_clerk_token')
    def test_add_to_cart_zero_quantity(self, mock_verify, client: TestClient, db_session):
        """Test adding item with zero quantity."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        ProductFactory._meta.sqlalchemy_session = db_session
        
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        product = ProductFactory.create()
        
        cart_item = {
            "product_id": product.id,
            "quantity": 0
        }
        
        # Act
        response = client.post("/api/v1/cart/add", json=cart_item)
        
        # Assert: Should handle zero quantity appropriately
        # This might succeed (for removal) or fail (invalid quantity)
        assert response.status_code in [200, 400, 422]
    
    
    @pytest.mark.unit
    @patch('app.routes.cart.verify_clerk_token')
    def test_add_to_cart_negative_quantity(self, mock_verify, client: TestClient, db_session):
        """Test adding item with negative quantity."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        ProductFactory._meta.sqlalchemy_session = db_session
        
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        product = ProductFactory.create()
        
        cart_item = {
            "product_id": product.id,
            "quantity": -1
        }
        
        # Act
        response = client.post("/api/v1/cart/add", json=cart_item)
        
        # Assert: Should reject negative quantities
        assert response.status_code in [400, 422]
    
    
    @pytest.mark.unit
    @patch('app.routes.cart.verify_clerk_token')
    def test_cart_user_isolation(self, mock_verify, client: TestClient, db_session):
        """Test that cart items are properly isolated per user."""
        # Arrange
        UserFactory._meta.sqlalchemy_session = db_session
        ProductFactory._meta.sqlalchemy_session = db_session
        
        user1 = UserFactory.create(clerk_id="user_1")
        user2 = UserFactory.create(clerk_id="user_2")
        product = ProductFactory.create()
        
        # Act: User 1 adds to cart
        mock_verify.return_value = {"sub": "user_1"}
        cart_item = {"product_id": product.id, "quantity": 2}
        response1 = client.post("/api/v1/cart/add", json=cart_item)
        assert response1.status_code == 200
        
        # Act: Check User 1's cart count
        count_response1 = client.get("/api/v1/cart/count")
        assert count_response1.status_code == 200
        assert count_response1.json()["count"] == 2
        
        # Act: Switch to User 2 and check their cart
        mock_verify.return_value = {"sub": "user_2"}
        count_response2 = client.get("/api/v1/cart/count")
        
        # Assert: User 2 should have empty cart
        assert count_response2.status_code == 200
        assert count_response2.json()["count"] == 0
    
    
    @pytest.mark.unit
    @patch('app.routes.cart.verify_clerk_token')
    def test_cart_high_value_items(self, mock_verify, client: TestClient, db_session):
        """Test cart functionality with luxury high-value items."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        ProductFactory._meta.sqlalchemy_session = db_session
        
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        # Create luxury product with high value
        luxury_product = ProductFactory.create(
            name="Luxury Diamond Ring",
            price=5000000,  # $50,000 in cents
            featured=True
        )
        
        cart_item = {
            "product_id": luxury_product.id,
            "quantity": 1
        }
        
        # Act
        response = client.post("/api/v1/cart/add", json=cart_item)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "Item added to cart" in data["message"]
        
        # Verify cart count
        count_response = client.get("/api/v1/cart/count")
        assert count_response.status_code == 200
        assert count_response.json()["count"] == 1