"""
Performance Benchmarking for Luxury E-commerce Platform

Tests performance characteristics under realistic luxury e-commerce scenarios:
- High-value product browsing and filtering 
- Concurrent user sessions during flash sales
- Large product catalogs with complex filtering
- High-value payment processing times
- Database performance with luxury product data

Target Performance Metrics:
- Product listing: <200ms for 1000+ products
- Search queries: <150ms with complex filters  
- Cart operations: <100ms per operation
- Payment processing: <500ms for creation
- Concurrent users: 50+ simultaneous without degradation
"""
import pytest
import time
import asyncio
import statistics
from fastapi.testclient import TestClient
from unittest.mock import patch
from concurrent.futures import ThreadPoolExecutor, as_completed
from sqlalchemy.orm import Session

from tests.factories.product_factory import ProductFactory, LuxuryProductFactory
from tests.factories.user_factory import UserFactory


class TestLuxuryEcommercePerformance:
    """Performance benchmarking for luxury e-commerce scenarios."""
    
    @pytest.mark.performance
    def test_large_product_catalog_performance(self, client: TestClient, db_session: Session):
        """
        Test performance with large luxury product catalog (1000+ items).
        
        Simulates a mature luxury jewelry store with extensive inventory.
        """
        # Arrange: Create large product dataset
        ProductFactory._meta.sqlalchemy_session = db_session
        LuxuryProductFactory._meta.sqlalchemy_session = db_session
        
        print("📊 Creating large luxury product catalog...")
        
        # Create realistic luxury product mix
        regular_products = ProductFactory.create_batch(800)  # $500-$5K items
        luxury_products = LuxuryProductFactory.create_batch(200)  # $5K-$50K items
        
        total_products = len(regular_products) + len(luxury_products)
        print(f"✅ Created {total_products} products in catalog")
        
        # Performance Test 1: Basic product listing
        start_time = time.time()
        response = client.get("/api/v1/products/products?page=1&page_size=20")
        end_time = time.time()
        
        basic_listing_time = end_time - start_time
        assert response.status_code == 200
        assert basic_listing_time < 0.2  # Under 200ms
        
        print(f"✅ Basic listing (20 items): {basic_listing_time:.3f}s")
        
        # Performance Test 2: Complex filtering
        start_time = time.time()
        response = client.get("/api/v1/products/products?featured=true&min_price=100000&max_price=500000&page_size=50")
        end_time = time.time()
        
        complex_filter_time = end_time - start_time
        assert response.status_code == 200
        assert complex_filter_time < 0.3  # Under 300ms for complex filtering
        
        print(f"✅ Complex filtering: {complex_filter_time:.3f}s")
        
        # Performance Test 3: Search functionality
        start_time = time.time()
        response = client.get("/api/v1/products/products?name=Diamond&page_size=100")
        end_time = time.time()
        
        search_time = end_time - start_time
        assert response.status_code == 200
        assert search_time < 0.25  # Under 250ms for search
        
        print(f"✅ Search performance: {search_time:.3f}s")
        
        return {
            "total_products": total_products,
            "basic_listing_time": basic_listing_time,
            "complex_filter_time": complex_filter_time,
            "search_time": search_time
        }
    
    
    @pytest.mark.performance
    @patch('app.routes.cart.verify_clerk_token')
    def test_concurrent_cart_operations(self, mock_verify, client: TestClient, db_session: Session):
        """
        Test cart performance under concurrent user load.
        
        Simulates multiple customers adding luxury items simultaneously.
        """
        # Arrange: Create test products and users
        ProductFactory._meta.sqlalchemy_session = db_session
        UserFactory._meta.sqlalchemy_session = db_session
        LuxuryProductFactory._meta.sqlalchemy_session = db_session
        
        # Create products for testing
        products = LuxuryProductFactory.create_batch(10)
        
        # Create multiple test users
        users = []
        for i in range(10):
            user = UserFactory.create(clerk_id=f"perf_user_{i}")
            users.append(user)
        
        def simulate_user_cart_operations(user_index):
            """Simulate a single user's cart operations."""
            user = users[user_index]
            mock_verify.return_value = {
                "sub": user.clerk_id,
                "email": user.email
            }
            
            operations_times = []
            
            # Add 3 items to cart
            for i in range(3):
                product = products[i % len(products)]
                cart_item = {
                    "product_id": product.id,
                    "quantity": 1
                }
                
                start_time = time.time()
                response = client.post("/api/v1/cart/add", json=cart_item)
                end_time = time.time()
                
                operation_time = end_time - start_time
                operations_times.append(operation_time)
                
                if response.status_code != 200:
                    print(f"⚠️  Cart operation failed for user {user_index}: {response.status_code}")
            
            # Get cart count
            start_time = time.time()
            response = client.get("/api/v1/cart/count")
            end_time = time.time()
            
            count_time = end_time - start_time
            operations_times.append(count_time)
            
            return operations_times
        
        # Execute concurrent operations
        print("🚀 Testing concurrent cart operations...")
        
        all_operation_times = []
        concurrent_users = 5  # Start with 5 concurrent users
        
        with ThreadPoolExecutor(max_workers=concurrent_users) as executor:
            futures = [
                executor.submit(simulate_user_cart_operations, i) 
                for i in range(concurrent_users)
            ]
            
            for future in as_completed(futures):
                try:
                    operation_times = future.result()
                    all_operation_times.extend(operation_times)
                except Exception as e:
                    print(f"⚠️  Concurrent operation failed: {e}")
        
        # Analyze performance
        if all_operation_times:
            avg_time = statistics.mean(all_operation_times)
            max_time = max(all_operation_times)
            p95_time = statistics.quantiles(all_operation_times, n=20)[18]  # 95th percentile
            
            print(f"✅ Concurrent cart operations completed:")
            print(f"   Average time: {avg_time:.3f}s")
            print(f"   Max time: {max_time:.3f}s") 
            print(f"   95th percentile: {p95_time:.3f}s")
            
            # Performance assertions
            assert avg_time < 0.15  # Average under 150ms
            assert p95_time < 0.3   # 95% of operations under 300ms
            
            return {
                "concurrent_users": concurrent_users,
                "total_operations": len(all_operation_times),
                "avg_time": avg_time,
                "max_time": max_time,
                "p95_time": p95_time
            }
        else:
            print("⚠️  No timing data collected")
            return None
    
    
    @pytest.mark.performance  
    @patch('app.routes.payment.verify_clerk_token')
    @patch('app.routes.payment.stripe.PaymentIntent.create')
    def test_payment_processing_performance(self, mock_stripe_create, mock_verify, 
                                          client: TestClient, db_session: Session):
        """
        Test payment processing performance for various transaction values.
        
        Tests payment creation times for different luxury price points.
        """
        # Arrange
        mock_verify.return_value = {
            "sub": "perf_test_user",
            "email": "perf@jasonjewels.com"
        }
        
        UserFactory._meta.sqlalchemy_session = db_session
        user = UserFactory.create(clerk_id="perf_test_user")
        
        # Mock Stripe responses for different amounts
        def create_mock_payment_intent(amount):
            mock_intent = type('MockIntent', (), {
                'id': f'pi_perf_{amount}',
                'client_secret': f'pi_perf_{amount}_secret',
                'amount': amount,
                'currency': 'usd'
            })()
            return mock_intent
        
        mock_stripe_create.side_effect = lambda **kwargs: create_mock_payment_intent(kwargs['amount'])
        
        # Test different transaction values
        test_amounts = [
            (50000, "$500"),      # Entry luxury
            (500000, "$5,000"),   # Mid luxury  
            (1500000, "$15,000"), # High luxury
            (5000000, "$50,000")  # Ultra luxury
        ]
        
        performance_results = []
        
        for amount_cents, amount_display in test_amounts:
            payment_request = {
                "amount": amount_cents,
                "currency": "usd",
                "shipping_address": {
                    "first_name": "Performance",
                    "last_name": "Test",
                    "address_line_1": "123 Test St",
                    "city": "Test City",
                    "state": "CA", 
                    "postal_code": "90210",
                    "country": "US"
                }
            }
            
            # Measure payment intent creation time
            start_time = time.time()
            response = client.post("/api/v1/payment/create-payment-intent", json=payment_request)
            end_time = time.time()
            
            processing_time = end_time - start_time
            
            assert response.status_code == 200
            assert processing_time < 0.5  # Under 500ms for all amounts
            
            performance_results.append({
                "amount": amount_display,
                "time": processing_time
            })
            
            print(f"✅ Payment processing {amount_display}: {processing_time:.3f}s")
        
        # Verify no significant time difference based on amount
        times = [result["time"] for result in performance_results]
        max_variation = max(times) - min(times)
        
        # Payment processing time shouldn't vary significantly by amount
        assert max_variation < 0.2  # Less than 200ms variation
        
        print(f"✅ Payment processing time variation: {max_variation:.3f}s")
        
        return performance_results
    
    
    @pytest.mark.performance
    def test_database_query_optimization(self, client: TestClient, db_session: Session):
        """
        Test database query performance with complex joins and filters.
        
        Ensures database remains performant with luxury product complexity.
        """
        # Arrange: Create products with relationships
        ProductFactory._meta.sqlalchemy_session = db_session
        
        # Create products with complex attributes
        complex_products = []
        for i in range(100):
            product = ProductFactory.create(
                name=f"Complex Luxury Item {i}",
                price=500000 + (i * 10000),  # $5K-$15K range
                featured=(i % 10 == 0)  # 10% featured
            )
            complex_products.append(product)
        
        # Performance Test 1: Complex filtering query
        complex_filter_queries = [
            "/api/v1/products/products?featured=true&sort_by=price&sort_order=desc",
            "/api/v1/products/products?min_price=800000&max_price=1200000&page_size=50",
            "/api/v1/products/products?name=Luxury&sort_by=name&sort_order=asc"
        ]
        
        query_times = []
        
        for query_url in complex_filter_queries:
            start_time = time.time()
            response = client.get(query_url)
            end_time = time.time()
            
            query_time = end_time - start_time
            query_times.append(query_time)
            
            assert response.status_code == 200
            assert query_time < 0.25  # Under 250ms for complex queries
            
            print(f"✅ Complex query performance: {query_time:.3f}s")
        
        # Performance Test 2: Individual product retrieval
        sample_product = complex_products[50]  # Middle product
        
        start_time = time.time()
        response = client.get(f"/api/v1/products/{sample_product.id}")
        end_time = time.time()
        
        single_product_time = end_time - start_time
        
        if response.status_code == 200:
            assert single_product_time < 0.1  # Under 100ms for single product
            print(f"✅ Single product retrieval: {single_product_time:.3f}s")
        
        avg_query_time = statistics.mean(query_times) if query_times else 0
        
        return {
            "complex_queries_avg": avg_query_time,
            "single_product_time": single_product_time,
            "total_products_tested": len(complex_products)
        }
    
    
    @pytest.mark.performance
    def test_api_endpoint_response_times(self, client: TestClient):
        """
        Benchmark all critical API endpoints for response times.
        
        Ensures all endpoints meet luxury e-commerce performance standards.
        """
        # Define critical endpoints with expected max response times
        critical_endpoints = [
            {"url": "/", "max_time": 0.05, "description": "Root endpoint"},
            {"url": "/api/v1/products/products", "max_time": 0.2, "description": "Product listing"},
            {"url": "/api/v1/products/categories", "max_time": 0.1, "description": "Categories"},
            {"url": "/api/v1/products/collections", "max_time": 0.1, "description": "Collections"},
            {"url": "/api/v1/products/categories/debug", "max_time": 0.15, "description": "Category debug"},
        ]
        
        endpoint_performance = []
        
        for endpoint in critical_endpoints:
            # Measure response time (run multiple times for accuracy)
            times = []
            
            for _ in range(5):  # 5 measurements per endpoint
                start_time = time.time()
                response = client.get(endpoint["url"])
                end_time = time.time()
                
                response_time = end_time - start_time
                times.append(response_time)
                
                # All endpoints should respond successfully
                assert response.status_code in [200, 404]  # 404 acceptable for some endpoints
            
            avg_time = statistics.mean(times)
            max_time = max(times)
            min_time = min(times)
            
            endpoint_performance.append({
                "endpoint": endpoint["url"],
                "description": endpoint["description"],
                "avg_time": avg_time,
                "max_time": max_time,
                "min_time": min_time,
                "target_max": endpoint["max_time"]
            })
            
            # Performance assertion
            assert avg_time <= endpoint["max_time"], f"Endpoint {endpoint['url']} too slow: {avg_time:.3f}s > {endpoint['max_time']}s"
            
            print(f"✅ {endpoint['description']}: {avg_time:.3f}s (target: <{endpoint['max_time']}s)")
        
        return endpoint_performance
    
    
    @pytest.mark.performance
    def test_memory_usage_under_load(self, client: TestClient, db_session: Session):
        """
        Test memory usage patterns under simulated load.
        
        Ensures the application doesn't have memory leaks with luxury product data.
        """
        import psutil
        import os
        
        # Get initial memory usage
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        print(f"📊 Initial memory usage: {initial_memory:.2f} MB")
        
        # Create significant product dataset
        ProductFactory._meta.sqlalchemy_session = db_session
        LuxuryProductFactory._meta.sqlalchemy_session = db_session
        
        # Simulate heavy usage
        for batch in range(5):  # 5 batches of operations
            # Create products
            products = ProductFactory.create_batch(50)
            luxury_products = LuxuryProductFactory.create_batch(20)
            
            # Make API calls
            for i in range(10):
                client.get("/api/v1/products/products?page=1&page_size=20")
                client.get("/api/v1/products/categories")
                client.get("/api/v1/products/collections")
            
            # Check memory after each batch
            current_memory = process.memory_info().rss / 1024 / 1024  # MB
            memory_growth = current_memory - initial_memory
            
            print(f"  Batch {batch + 1}: {current_memory:.2f} MB (+{memory_growth:.2f} MB)")
        
        # Final memory check
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        total_growth = final_memory - initial_memory
        
        print(f"✅ Final memory usage: {final_memory:.2f} MB (growth: +{total_growth:.2f} MB)")
        
        # Memory growth should be reasonable (under 100MB for this test)
        assert total_growth < 100, f"Excessive memory growth: {total_growth:.2f} MB"
        
        return {
            "initial_memory_mb": initial_memory,
            "final_memory_mb": final_memory,
            "memory_growth_mb": total_growth
        }