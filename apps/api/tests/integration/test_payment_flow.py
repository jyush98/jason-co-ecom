"""
Integration tests for payment flow - Critical Path Testing

These tests cover the complete payment flow for high-value transactions ($500-$50K),
ensuring reliability of the most business-critical functionality.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
# Removed decimal import - using cents (int) for prices

from tests.factories.user_factory import TestUserFactory
from tests.factories.product_factory import LuxuryProductFactory


class TestPaymentFlow:
    """Test complete payment flows for luxury e-commerce transactions."""
    
    @pytest.mark.payment
    @pytest.mark.integration
    def test_successful_high_value_payment(self, client: TestClient, db_session, auth_headers):
        """Test successful payment flow for high-value transaction ($10,000+)."""
        # Arrange: Create test user and luxury product
        user = TestUserFactory.create()
        luxury_product = LuxuryProductFactory.create(
            name="Diamond Engagement Ring",
            price=1250000,  # $12500 in cents
            inventory_count=3
        )
        
        # Add product to cart
        cart_response = client.post(
            "/api/v1/cart/add",
            json={
                "product_id": luxury_product.id,
                "quantity": 1
            },
            headers=auth_headers
        )
        assert cart_response.status_code == 200
        
        # Mock Stripe payment intent creation
        with patch('stripe.PaymentIntent.create') as mock_payment_intent:
            mock_payment_intent.return_value = Mock(
                id="pi_test_12345",
                client_secret="pi_test_12345_secret",
                status="requires_payment_method",
                amount=1250000,  # $12,500 in cents
                currency="usd"
            )
            
            # Create payment intent
            payment_response = client.post(
                "/api/v1/payment/create-intent",
                json={
                    "amount": 12500.00,
                    "currency": "usd"
                },
                headers=auth_headers
            )
            
            assert payment_response.status_code == 200
            payment_data = payment_response.json()
            assert "client_secret" in payment_data
            assert payment_data["amount"] == 1250000
            
        # Mock successful payment confirmation
        with patch('stripe.PaymentIntent.retrieve') as mock_retrieve:
            mock_retrieve.return_value = Mock(
                id="pi_test_12345",
                status="succeeded",
                amount=1250000,
                currency="usd",
                charges=Mock(
                    data=[Mock(
                        id="ch_test_12345",
                        paid=True,
                        amount=1250000
                    )]
                )
            )
            
            # Complete checkout
            checkout_response = client.post(
                "/api/v1/checkout/complete",
                json={
                    "payment_intent_id": "pi_test_12345",
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
                },
                headers=auth_headers
            )
            
            assert checkout_response.status_code == 200
            order_data = checkout_response.json()
            assert order_data["status"] == "confirmed"
            assert float(order_data["total_amount"]) == 12500.00
    
    
    @pytest.mark.payment
    @pytest.mark.integration
    def test_payment_failure_handling(self, client: TestClient, db_session, auth_headers):
        """Test payment failure scenarios and proper error handling."""
        # Arrange
        user = TestUserFactory.create()
        product = LuxuryProductFactory.create(price=500000)  # $5000 in cents
        
        # Add to cart
        client.post(
            "/api/v1/cart/add",
            json={"product_id": product.id, "quantity": 1},
            headers=auth_headers
        )
        
        # Mock failed payment
        with patch('stripe.PaymentIntent.create') as mock_payment_intent:
            mock_payment_intent.return_value = Mock(
                id="pi_test_failed",
                client_secret="pi_test_failed_secret",
                status="requires_payment_method",
                amount=500000,
                currency="usd"
            )
            
            # Create payment intent
            payment_response = client.post(
                "/api/v1/payment/create-intent",
                json={"amount": 5000.00, "currency": "usd"},
                headers=auth_headers
            )
            assert payment_response.status_code == 200
            
        # Mock payment failure
        with patch('stripe.PaymentIntent.retrieve') as mock_retrieve:
            mock_retrieve.return_value = Mock(
                id="pi_test_failed",
                status="requires_payment_method",
                last_payment_error=Mock(
                    code="card_declined",
                    message="Your card was declined."
                )
            )
            
            # Attempt checkout with failed payment
            checkout_response = client.post(
                "/api/v1/checkout/complete",
                json={
                    "payment_intent_id": "pi_test_failed",
                    "shipping_address": {
                        "street": "123 Test St",
                        "city": "Test City",
                        "state": "CA",
                        "zip_code": "12345",
                        "country": "US"
                    }
                },
                headers=auth_headers
            )
            
            assert checkout_response.status_code == 400
            error_data = checkout_response.json()
            assert "payment" in error_data["detail"].lower()
    
    
    @pytest.mark.payment
    @pytest.mark.integration  
    def test_3d_secure_payment_flow(self, client: TestClient, db_session, auth_headers):
        """Test 3D Secure authentication for high-value payments."""
        # Arrange
        user = TestUserFactory.create()
        high_value_product = LuxuryProductFactory.create(
            name="Luxury Watch Collection",
            price=2500000  # $25000 in cents
        )
        
        client.post(
            "/api/v1/cart/add", 
            json={"product_id": high_value_product.id, "quantity": 1},
            headers=auth_headers
        )
        
        # Mock 3D Secure required payment
        with patch('stripe.PaymentIntent.create') as mock_payment_intent:
            mock_payment_intent.return_value = Mock(
                id="pi_test_3ds",
                client_secret="pi_test_3ds_secret", 
                status="requires_action",
                next_action=Mock(
                    type="use_stripe_sdk",
                    use_stripe_sdk=Mock(
                        type="three_d_secure_redirect"
                    )
                ),
                amount=2500000,
                currency="usd"
            )
            
            payment_response = client.post(
                "/api/v1/payment/create-intent",
                json={"amount": 25000.00, "currency": "usd"},
                headers=auth_headers
            )
            
            assert payment_response.status_code == 200
            payment_data = payment_response.json()
            assert payment_data.get("requires_action") is True
    
    
    @pytest.mark.payment
    @pytest.mark.integration
    def test_inventory_management_during_payment(self, client: TestClient, db_session, auth_headers):
        """Test that inventory is properly managed during payment flow."""
        # Arrange: Create product with limited inventory
        user = TestUserFactory.create()
        limited_product = LuxuryProductFactory.create(
            name="Limited Edition Ring",
            price=800000,  # $8000 in cents
            inventory_count=1  # Only 1 in stock
        )
        
        # Add to cart
        cart_response = client.post(
            "/api/v1/cart/add",
            json={"product_id": limited_product.id, "quantity": 1},
            headers=auth_headers
        )
        assert cart_response.status_code == 200
        
        # Mock successful payment
        with patch('stripe.PaymentIntent.create') as mock_create, \
             patch('stripe.PaymentIntent.retrieve') as mock_retrieve:
            
            mock_create.return_value = Mock(
                id="pi_test_inventory",
                client_secret="pi_test_inventory_secret",
                status="requires_payment_method"
            )
            
            mock_retrieve.return_value = Mock(
                id="pi_test_inventory",
                status="succeeded",
                amount=800000
            )
            
            # Complete purchase
            checkout_response = client.post(
                "/api/v1/checkout/complete",
                json={
                    "payment_intent_id": "pi_test_inventory",
                    "shipping_address": {
                        "street": "123 Test St",
                        "city": "Test City",
                        "state": "CA",
                        "zip_code": "12345",
                        "country": "US"
                    }
                },
                headers=auth_headers
            )
            
            assert checkout_response.status_code == 200
            
        # Verify inventory was decremented
        db_session.refresh(limited_product)
        assert limited_product.inventory_count == 0
        
        # Try to add the same product again (should fail)
        cart_response_2 = client.post(
            "/api/v1/cart/add",
            json={"product_id": limited_product.id, "quantity": 1},
            headers=auth_headers
        )
        assert cart_response_2.status_code == 400  # Out of stock
    
    
    @pytest.mark.payment
    @pytest.mark.integration
    @pytest.mark.performance
    def test_payment_flow_performance(self, client: TestClient, db_session, auth_headers, performance_timer):
        """Test that payment flow completes within acceptable time limits."""
        # Arrange
        user = TestUserFactory.create()
        product = LuxuryProductFactory.create(price=100000)  # $1000 in cents
        
        # Add to cart
        client.post(
            "/api/v1/cart/add",
            json={"product_id": product.id, "quantity": 1},
            headers=auth_headers
        )
        
        performance_timer.start()
        
        # Mock fast payment processing
        with patch('stripe.PaymentIntent.create') as mock_create, \
             patch('stripe.PaymentIntent.retrieve') as mock_retrieve:
            
            mock_create.return_value = Mock(
                id="pi_test_perf",
                client_secret="pi_test_perf_secret",
                status="requires_payment_method"
            )
            
            mock_retrieve.return_value = Mock(
                id="pi_test_perf", 
                status="succeeded",
                amount=100000
            )
            
            # Complete checkout
            checkout_response = client.post(
                "/api/v1/checkout/complete",
                json={
                    "payment_intent_id": "pi_test_perf",
                    "shipping_address": {
                        "street": "123 Test St",
                        "city": "Test City",
                        "state": "CA",
                        "zip_code": "12345",
                        "country": "US"
                    }
                },
                headers=auth_headers
            )
        
        elapsed_time = performance_timer.stop()
        
        # Assertions
        assert checkout_response.status_code == 200
        assert elapsed_time < 2.0  # Payment flow should complete in under 2 seconds
    
    
    @pytest.mark.payment
    @pytest.mark.integration
    def test_guest_checkout_payment(self, client: TestClient, db_session):
        """Test payment flow for guest users (no authentication)."""
        # Arrange: Create product
        product = LuxuryProductFactory.create(price=75000)  # $750 in cents
        
        # Mock successful payment for guest
        with patch('stripe.PaymentIntent.create') as mock_create, \
             patch('stripe.PaymentIntent.retrieve') as mock_retrieve:
            
            mock_create.return_value = Mock(
                id="pi_test_guest",
                client_secret="pi_test_guest_secret", 
                status="requires_payment_method"
            )
            
            mock_retrieve.return_value = Mock(
                id="pi_test_guest",
                status="succeeded",
                amount=75000
            )
            
            # Guest checkout
            checkout_response = client.post(
                "/api/v1/checkout/guest",
                json={
                    "items": [{
                        "product_id": product.id,
                        "quantity": 1,
                        "price": 750.00
                    }],
                    "payment_intent_id": "pi_test_guest",
                    "guest_email": "guest@example.com",
                    "guest_name": "Guest User",
                    "shipping_address": {
                        "street": "123 Guest St",
                        "city": "Guest City",
                        "state": "CA",
                        "zip_code": "12345",
                        "country": "US"
                    }
                }
            )
            
            assert checkout_response.status_code == 200
            order_data = checkout_response.json()
            assert order_data["guest_email"] == "guest@example.com"
            assert float(order_data["total_amount"]) == 750.00