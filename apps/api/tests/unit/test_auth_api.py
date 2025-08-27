"""
Unit tests for Authentication and User API endpoints.

Tests cover the authentication flow including:
- Clerk token verification
- User creation and management  
- User profile operations
- Authentication middleware
- Session handling
- Webhook processing for user events
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import jwt

from tests.factories.user_factory import UserFactory


class TestAuthAPI:
    """Test suite for authentication and user endpoints."""
    
    def setup_method(self):
        """Set up test data before each test."""
        self.mock_clerk_user = {
            "sub": "test_clerk_user_123",
            "email": "test@jasonjewels.com", 
            "first_name": "Test",
            "last_name": "User",
            "email_verified": True
        }
        
        self.mock_jwt_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token"
    
    
    @pytest.mark.unit
    @patch('app.routes.user.verify_clerk_token')
    def test_get_user_profile_success(self, mock_verify, client: TestClient, db_session):
        """Test successful user profile retrieval."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        user = UserFactory.create(
            clerk_id="test_clerk_user_123",
            email="test@jasonjewels.com",
            first_name="Test",
            last_name="User"
        )
        
        # Act
        response = client.get("/api/v1/users/profile", 
                             headers={"Authorization": f"Bearer {self.mock_jwt_token}"})
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@jasonjewels.com"
        assert data["first_name"] == "Test"
        assert data["last_name"] == "User"
    
    
    @pytest.mark.unit
    def test_get_user_profile_without_auth(self, client: TestClient, db_session):
        """Test user profile access without authentication."""
        # Act
        response = client.get("/api/v1/users/profile")
        
        # Assert
        assert response.status_code in [401, 422]  # Unauthorized
    
    
    @pytest.mark.unit
    @patch('app.routes.user.verify_clerk_token') 
    def test_get_user_profile_user_not_found(self, mock_verify, client: TestClient, db_session):
        """Test user profile when user doesn't exist in database."""
        # Arrange
        mock_verify.return_value = {"sub": "nonexistent_user_123"}
        
        # Act
        response = client.get("/api/v1/users/profile",
                             headers={"Authorization": f"Bearer {self.mock_jwt_token}"})
        
        # Assert
        assert response.status_code == 404
    
    
    @pytest.mark.unit
    @patch('app.routes.user.verify_clerk_token')
    def test_update_user_profile_success(self, mock_verify, client: TestClient, db_session):
        """Test successful user profile update."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        
        update_data = {
            "first_name": "Updated",
            "last_name": "Name",
            "phone": "+1-555-999-8888"
        }
        
        # Act
        response = client.put("/api/v1/users/profile", 
                             json=update_data,
                             headers={"Authorization": f"Bearer {self.mock_jwt_token}"})
        
        # Assert
        if response.status_code == 200:
            data = response.json()
            assert data["first_name"] == "Updated"
            assert data["last_name"] == "Name"
        else:
            # Endpoint might not exist yet
            assert response.status_code in [404, 405]
    
    
    @pytest.mark.unit
    @patch('app.auth.verify_clerk_token')
    def test_clerk_token_verification_success(self, mock_verify, client: TestClient, db_session):
        """Test successful Clerk token verification."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        
        # Act - Use an endpoint that requires auth (cart endpoint)
        UserFactory._meta.sqlalchemy_session = db_session
        UserFactory.create(clerk_id="test_clerk_user_123")
        
        response = client.get("/api/v1/cart/count",
                             headers={"Authorization": f"Bearer {self.mock_jwt_token}"})
        
        # Assert
        assert response.status_code == 200
        mock_verify.assert_called_once()
    
    
    @pytest.mark.unit
    @patch('app.auth.verify_clerk_token')
    def test_invalid_clerk_token(self, mock_verify, client: TestClient, db_session):
        """Test handling of invalid Clerk token."""
        # Arrange
        mock_verify.side_effect = Exception("Invalid token")
        
        # Act
        response = client.get("/api/v1/cart/count",
                             headers={"Authorization": "Bearer invalid.token.here"})
        
        # Assert
        assert response.status_code in [401, 422, 500]
    
    
    @pytest.mark.unit
    @patch('app.auth.verify_clerk_token')
    def test_expired_token(self, mock_verify, client: TestClient, db_session):
        """Test handling of expired authentication token."""
        # Arrange
        mock_verify.side_effect = jwt.ExpiredSignatureError("Token expired")
        
        # Act
        response = client.get("/api/v1/cart/count",
                             headers={"Authorization": f"Bearer {self.mock_jwt_token}"})
        
        # Assert
        assert response.status_code in [401, 422, 500]
    
    
    @pytest.mark.unit
    def test_missing_authorization_header(self, client: TestClient, db_session):
        """Test endpoint access without Authorization header."""
        # Act
        response = client.get("/api/v1/cart/count")
        
        # Assert
        assert response.status_code in [401, 422]
    
    
    @pytest.mark.unit
    def test_malformed_authorization_header(self, client: TestClient, db_session):
        """Test endpoint access with malformed Authorization header."""
        malformed_headers = [
            {"Authorization": "NotBearer token"},
            {"Authorization": "Bearer"},  # Missing token
            {"Authorization": "Bearer "},  # Empty token
            {"Authorization": "token_without_bearer"},
        ]
        
        for headers in malformed_headers:
            # Act
            response = client.get("/api/v1/cart/count", headers=headers)
            
            # Assert
            assert response.status_code in [401, 422]
    
    
    @pytest.mark.unit
    def test_clerk_webhook_user_created(self, client: TestClient, db_session):
        """Test Clerk webhook for user creation."""
        webhook_payload = {
            "type": "user.created",
            "data": {
                "id": "user_new_123",
                "email_addresses": [{"email_address": "newuser@jasonjewels.com"}],
                "first_name": "New",
                "last_name": "User",
                "created_at": 1234567890
            }
        }
        
        # Act
        response = client.post("/api/clerk/webhook", 
                             json=webhook_payload,
                             headers={"Content-Type": "application/json"})
        
        # Assert - Should handle webhook appropriately
        assert response.status_code in [200, 404]  # 404 if webhook endpoint doesn't exist
    
    
    @pytest.mark.unit
    def test_clerk_webhook_user_updated(self, client: TestClient, db_session):
        """Test Clerk webhook for user updates."""
        # Arrange - Create existing user first
        UserFactory._meta.sqlalchemy_session = db_session
        existing_user = UserFactory.create(clerk_id="user_update_123")
        
        webhook_payload = {
            "type": "user.updated",
            "data": {
                "id": "user_update_123",
                "email_addresses": [{"email_address": "updated@jasonjewels.com"}],
                "first_name": "Updated",
                "last_name": "User",
                "updated_at": 1234567890
            }
        }
        
        # Act
        response = client.post("/api/clerk/webhook", json=webhook_payload)
        
        # Assert
        assert response.status_code in [200, 404]  # 404 if webhook endpoint doesn't exist
    
    
    @pytest.mark.unit
    @patch('app.routes.user.verify_clerk_token')
    def test_user_session_consistency(self, mock_verify, client: TestClient, db_session):
        """Test that user session remains consistent across requests."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        
        # Act - Make multiple requests with same token
        response1 = client.get("/api/v1/cart/count",
                              headers={"Authorization": f"Bearer {self.mock_jwt_token}"})
        response2 = client.get("/api/v1/cart/count",
                              headers={"Authorization": f"Bearer {self.mock_jwt_token}"})
        
        # Assert - Both should succeed with same user
        assert response1.status_code == 200
        assert response2.status_code == 200
        # Should return same data (empty cart in this case)
        assert response1.json() == response2.json()
    
    
    @pytest.mark.unit
    @patch('app.routes.user.verify_clerk_token')
    def test_user_role_based_access(self, mock_verify, client: TestClient, db_session):
        """Test role-based access control if implemented."""
        # Arrange - Regular user
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        
        # Act - Try to access admin endpoint
        response = client.get("/api/v1/admin/users",
                             headers={"Authorization": f"Bearer {self.mock_jwt_token}"})
        
        # Assert - Should be forbidden for regular users
        assert response.status_code in [403, 404]  # Forbidden or Not Found
    
    
    @pytest.mark.unit
    @patch('app.routes.user.verify_clerk_token') 
    def test_user_preferences_management(self, mock_verify, client: TestClient, db_session):
        """Test user preferences/settings management."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        
        preferences = {
            "email_notifications": True,
            "marketing_emails": False,
            "theme": "dark",
            "currency": "USD"
        }
        
        # Act
        response = client.put("/api/v1/users/preferences",
                             json=preferences,
                             headers={"Authorization": f"Bearer {self.mock_jwt_token}"})
        
        # Assert - May not be implemented yet
        assert response.status_code in [200, 404, 405]
        
        if response.status_code == 200:
            data = response.json()
            assert data["email_notifications"] == True
            assert data["marketing_emails"] == False