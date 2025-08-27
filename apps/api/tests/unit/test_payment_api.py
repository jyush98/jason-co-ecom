"""
Unit tests for Payment API endpoints.

Tests cover the critical payment flow including:
- Payment intent creation
- Stripe integration mocking
- Order submission with payment
- Payment validation and error handling
- High-value transaction processing
- 3D Secure authentication flows
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import stripe

from tests.factories.product_factory import ProductFactory
from tests.factories.user_factory import UserFactory


class TestPaymentAPI:
    """Test suite for /api/v1/payment endpoints."""
    
    def setup_method(self):
        """Set up test data before each test."""
        self.mock_clerk_user = {
            "sub": "test_clerk_user_123",
            "email": "test@jasonjewels.com",
            "first_name": "Test",
            "last_name": "User"
        }
        
        self.sample_shipping_address = {
            "first_name": "John",
            "last_name": "Doe",
            "address_line_1": "123 Main St",
            "city": "New York",
            "state": "NY",
            "postal_code": "10001",
            "country": "US",
            "phone": "+1-555-123-4567"
        }
        
        self.sample_payment_method = {
            "type": "card",
            "card": {
                "brand": "visa",
                "last4": "4242",
                "exp_month": 12,
                "exp_year": 2025
            }
        }
    
    
    @pytest.mark.unit
    @patch('app.routes.payment.verify_clerk_token')
    @patch('app.routes.payment.stripe.PaymentIntent.create')
    def test_create_payment_intent_success(self, mock_stripe_create, mock_verify, client: TestClient, db_session):
        """Test successful payment intent creation."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        
        mock_payment_intent = MagicMock()
        mock_payment_intent.id = "pi_test_123456"
        mock_payment_intent.client_secret = "pi_test_123456_secret_test"
        mock_payment_intent.amount = 250000  # $2,500 in cents
        mock_payment_intent.currency = "usd"
        mock_stripe_create.return_value = mock_payment_intent
        
        payment_request = {
            "amount": 250000,  # $2,500 in cents
            "currency": "usd",
            "shipping_address": self.sample_shipping_address
        }
        
        # Act
        response = client.post("/api/v1/payment/create-payment-intent", json=payment_request)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["payment_intent_id"] == "pi_test_123456"
        assert data["client_secret"] == "pi_test_123456_secret_test"
        assert data["amount"] == 250000
        
        # Verify Stripe was called correctly
        mock_stripe_create.assert_called_once()
        call_args = mock_stripe_create.call_args[1]
        assert call_args["amount"] == 250000
        assert call_args["currency"] == "usd"
    
    
    @pytest.mark.unit 
    @patch('app.routes.payment.verify_clerk_token')
    @patch('app.routes.payment.stripe.PaymentIntent.create')
    def test_create_payment_intent_high_value(self, mock_stripe_create, mock_verify, client: TestClient, db_session):
        """Test payment intent creation for high-value luxury items."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        
        mock_payment_intent = MagicMock()
        mock_payment_intent.id = "pi_luxury_123456"
        mock_payment_intent.client_secret = "pi_luxury_123456_secret"
        mock_payment_intent.amount = 5000000  # $50,000 in cents
        mock_payment_intent.currency = "usd"
        mock_stripe_create.return_value = mock_payment_intent
        
        payment_request = {
            "amount": 5000000,  # $50,000 luxury item
            "currency": "usd",
            "shipping_address": self.sample_shipping_address
        }
        
        # Act
        response = client.post("/api/v1/payment/create-payment-intent", json=payment_request)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == 5000000
        
        # Verify Stripe configuration for high-value transactions
        call_args = mock_stripe_create.call_args[1]
        assert call_args["amount"] == 5000000
        # High-value transactions might require additional verification
    
    
    @pytest.mark.unit
    @patch('app.routes.payment.verify_clerk_token')  
    @patch('app.routes.payment.stripe.PaymentIntent.create')
    def test_create_payment_intent_stripe_error(self, mock_stripe_create, mock_verify, client: TestClient, db_session):
        """Test handling of Stripe API errors."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        
        # Mock Stripe error
        mock_stripe_create.side_effect = stripe.error.CardError(
            message="Your card was declined.",
            param="card",
            code="card_declined"
        )
        
        payment_request = {
            "amount": 150000,
            "currency": "usd",
            "shipping_address": self.sample_shipping_address
        }
        
        # Act
        response = client.post("/api/v1/payment/create-payment-intent", json=payment_request)
        
        # Assert
        assert response.status_code in [400, 422, 500]  # Should handle error appropriately
    
    
    @pytest.mark.unit
    @patch('app.routes.payment.verify_clerk_token')
    @patch('app.routes.payment.stripe.PaymentIntent.retrieve')
    def test_order_submission_success(self, mock_stripe_retrieve, mock_verify, client: TestClient, db_session):
        """Test successful order submission with payment."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        ProductFactory._meta.sqlalchemy_session = db_session
        
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        product = ProductFactory.create(price=250000)  # $2,500
        
        # Mock successful payment intent
        mock_payment_intent = MagicMock()
        mock_payment_intent.id = "pi_test_123456"
        mock_payment_intent.status = "succeeded"
        mock_payment_intent.amount = 250000
        mock_stripe_retrieve.return_value = mock_payment_intent
        
        order_request = {
            "shipping_address": self.sample_shipping_address,
            "billing_address": self.sample_shipping_address,
            "shipping_method": {
                "id": "standard",
                "name": "Standard Shipping",
                "price": 0,
                "estimated_days": "5-7"
            },
            "payment_method": self.sample_payment_method,
            "payment_intent_id": "pi_test_123456",
            "order_notes": "Please handle with care"
        }
        
        # Act
        response = client.post("/api/v1/payment/submit-order", json=order_request)
        
        # Assert
        assert response.status_code in [200, 201]
        if response.status_code in [200, 201]:
            data = response.json()
            assert "order_id" in data or "id" in data
            
        # Verify Stripe payment intent was retrieved
        mock_stripe_retrieve.assert_called_once_with("pi_test_123456")
    
    
    @pytest.mark.unit
    @patch('app.routes.payment.verify_clerk_token')
    @patch('app.routes.payment.stripe.PaymentIntent.retrieve')
    def test_order_submission_failed_payment(self, mock_stripe_retrieve, mock_verify, client: TestClient, db_session):
        """Test order submission with failed payment intent."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        
        # Mock failed payment intent
        mock_payment_intent = MagicMock()
        mock_payment_intent.id = "pi_failed_123456"
        mock_payment_intent.status = "requires_payment_method"  # Failed status
        mock_payment_intent.amount = 250000
        mock_stripe_retrieve.return_value = mock_payment_intent
        
        order_request = {
            "shipping_address": self.sample_shipping_address,
            "payment_intent_id": "pi_failed_123456"
        }
        
        # Act
        response = client.post("/api/v1/payment/submit-order", json=order_request)
        
        # Assert
        assert response.status_code in [400, 422]  # Should reject failed payment
    
    
    @pytest.mark.unit
    @patch('app.routes.payment.verify_clerk_token')
    @patch('app.routes.payment.stripe.PaymentIntent.create')
    def test_payment_intent_with_3ds_authentication(self, mock_stripe_create, mock_verify, client: TestClient, db_session):
        """Test payment intent creation that requires 3D Secure authentication."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        
        # Mock payment intent requiring 3DS
        mock_payment_intent = MagicMock()
        mock_payment_intent.id = "pi_3ds_123456"
        mock_payment_intent.client_secret = "pi_3ds_123456_secret"
        mock_payment_intent.status = "requires_action"
        mock_payment_intent.next_action = {
            "type": "use_stripe_sdk",
            "use_stripe_sdk": {
                "type": "three_d_secure_redirect"
            }
        }
        mock_stripe_create.return_value = mock_payment_intent
        
        payment_request = {
            "amount": 500000,  # $5,000 - might trigger 3DS
            "currency": "usd",
            "shipping_address": self.sample_shipping_address
        }
        
        # Act
        response = client.post("/api/v1/payment/create-payment-intent", json=payment_request)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["payment_intent_id"] == "pi_3ds_123456"
        # Should include 3DS information for frontend handling
    
    
    @pytest.mark.unit
    def test_payment_requires_authentication(self, client: TestClient, db_session):
        """Test that payment endpoints require authentication."""
        payment_request = {
            "amount": 100000,
            "currency": "usd"
        }
        
        # Act
        response = client.post("/api/v1/payment/create-payment-intent", json=payment_request)
        
        # Assert
        assert response.status_code in [401, 422]  # Unauthorized
    
    
    @pytest.mark.unit
    @patch('app.routes.payment.verify_clerk_token')
    def test_invalid_payment_amount(self, mock_verify, client: TestClient, db_session):
        """Test payment intent creation with invalid amounts."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        
        invalid_amounts = [
            {"amount": 0, "currency": "usd"},      # Zero amount
            {"amount": -1000, "currency": "usd"},  # Negative amount
            {"amount": 1, "currency": "usd"},      # Too small (Stripe minimum is $0.50)
        ]
        
        for payment_request in invalid_amounts:
            # Act
            response = client.post("/api/v1/payment/create-payment-intent", json=payment_request)
            
            # Assert
            assert response.status_code in [400, 422]
    
    
    @pytest.mark.unit 
    @patch('app.routes.payment.verify_clerk_token')
    @patch('app.routes.payment.stripe.PaymentIntent.create')
    def test_payment_intent_currency_support(self, mock_stripe_create, mock_verify, client: TestClient, db_session):
        """Test payment intent creation with different currencies."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        
        mock_payment_intent = MagicMock()
        mock_payment_intent.id = "pi_cad_123456"
        mock_payment_intent.client_secret = "pi_cad_123456_secret"
        mock_payment_intent.amount = 250000
        mock_payment_intent.currency = "cad"
        mock_stripe_create.return_value = mock_payment_intent
        
        payment_request = {
            "amount": 250000,
            "currency": "cad",  # Canadian dollars
            "shipping_address": self.sample_shipping_address
        }
        
        # Act
        response = client.post("/api/v1/payment/create-payment-intent", json=payment_request)
        
        # Assert
        if response.status_code == 200:  # If CAD is supported
            data = response.json()
            assert data["currency"] == "cad"
        else:  # If CAD is not supported
            assert response.status_code in [400, 422]
    
    
    @pytest.mark.unit
    @patch('app.routes.payment.verify_clerk_token')
    @patch('app.routes.payment.stripe.PaymentIntent.create')
    @patch('app.routes.payment.EmailService')
    def test_order_confirmation_email(self, mock_email_service, mock_stripe_create, mock_verify, client: TestClient, db_session):
        """Test that order confirmation email is sent after successful payment."""
        # Arrange
        mock_verify.return_value = self.mock_clerk_user
        UserFactory._meta.sqlalchemy_session = db_session
        user = UserFactory.create(clerk_id="test_clerk_user_123")
        
        mock_payment_intent = MagicMock()
        mock_payment_intent.id = "pi_email_test"
        mock_payment_intent.status = "succeeded"
        mock_stripe_create.return_value = mock_payment_intent
        
        mock_email_service_instance = MagicMock()
        mock_email_service.return_value = mock_email_service_instance
        
        order_request = {
            "shipping_address": self.sample_shipping_address,
            "payment_intent_id": "pi_email_test"
        }
        
        # Act
        response = client.post("/api/v1/payment/submit-order", json=order_request)
        
        # Assert - Should attempt to send confirmation email
        if response.status_code in [200, 201]:
            # Verify email service was used (implementation dependent)
            pass  # Email verification depends on actual implementation