"""
Unit tests for Products API endpoints.

Tests cover the core product management functionality including:
- Product listing and search
- Individual product retrieval  
- Product filtering and pagination
- Error handling
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from tests.factories.product_factory import ProductFactory, LuxuryProductFactory


class TestProductsAPI:
    """Test suite for /api/v1/products endpoints."""
    
    @pytest.mark.unit
    def test_get_all_products_success(self, client: TestClient, db_session):
        """Test successful retrieval of all products."""
        # Set up factory session
        ProductFactory._meta.sqlalchemy_session = db_session
        
        # Arrange: Create test products
        products = ProductFactory.create_batch(5)
        
        # Act - Updated URL based on actual routing structure
        response = client.get("/api/v1/products/products")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5
        assert all("id" in product for product in data)
        assert all("name" in product for product in data)
        assert all("price" in product for product in data)
    
    
    @pytest.mark.unit
    def test_get_products_pagination(self, client: TestClient, db_session):
        """Test product listing with pagination."""
        # Arrange: Create many products
        ProductFactory.create_batch(15)
        
        # Act: Request first page
        response = client.get("/api/v1/products/products?page=1&page_size=10")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 10  # Should return 10 items max
        
        # Act: Request second page
        response_page2 = client.get("/api/v1/products/products?page=2&page_size=10")
        
        # Assert
        assert response_page2.status_code == 200
        data_page2 = response_page2.json()
        assert len(data_page2) == 5  # Remaining 5 items
    
    
    @pytest.mark.unit
    def test_get_product_by_id_success(self, client: TestClient, db_session):
        """Test successful retrieval of specific product by ID."""
        # Arrange
        product = LuxuryProductFactory.create(
            name="Diamond Luxury Ring",
            price=15000.00,
            category="rings"
        )
        
        # Act
        response = client.get(f"/api/v1/products/{product.id}")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == product.id
        assert data["name"] == "Diamond Luxury Ring"
        assert float(data["price"]) == 15000.00
        assert data["category"] == "rings"
    
    
    @pytest.mark.unit
    def test_get_product_by_id_not_found(self, client: TestClient, db_session):
        """Test product retrieval with non-existent ID."""
        # Act
        response = client.get("/api/v1/products/99999")
        
        # Assert
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"].lower()
    
    
    @pytest.mark.unit
    def test_search_products_by_name(self, client: TestClient, db_session):
        """Test product search functionality by name."""
        # Arrange
        ProductFactory.create(name="Diamond Engagement Ring")
        ProductFactory.create(name="Gold Wedding Band")
        ProductFactory.create(name="Silver Bracelet")
        
        # Act: Search for "Diamond"
        response = client.get("/api/v1/products/products?name=Diamond")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert "Diamond" in data[0]["name"]
    
    
    @pytest.mark.unit
    def test_filter_products_by_category(self, client: TestClient, db_session):
        """Test product filtering by category."""
        # Arrange
        ProductFactory.create_batch(3, category="rings")
        ProductFactory.create_batch(2, category="necklaces") 
        ProductFactory.create_batch(1, category="bracelets")
        
        # Act: Filter by rings category
        response = client.get("/api/v1/products/products?category=rings")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        assert all(product["category"] == "rings" for product in data)
    
    
    @pytest.mark.unit
    def test_filter_products_by_price_range(self, client: TestClient, db_session):
        """Test product filtering by price range."""
        # Arrange
        ProductFactory.create(price=500.00)   # Below range
        ProductFactory.create(price=1500.00)  # In range
        ProductFactory.create(price=2500.00)  # In range
        ProductFactory.create(price=5500.00)  # Above range
        
        # Act: Filter by price range $1000-$3000 (in cents)
        response = client.get("/api/v1/products/products?min_price=100000&max_price=300000")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        for product in data:
            assert 1000 <= float(product["price"]) <= 3000
    
    
    @pytest.mark.unit
    def test_get_featured_products(self, client: TestClient, db_session):
        """Test retrieval of featured products only."""
        # Arrange
        ProductFactory.create_batch(3, featured=True)
        ProductFactory.create_batch(5, featured=False)
        
        # Act
        response = client.get("/api/v1/products/products?featured=true")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        assert all(product["featured"] is True for product in data)
    
    
    @pytest.mark.unit
    def test_products_response_structure(self, client: TestClient, db_session):
        """Test that product API responses have correct structure."""
        # Arrange
        product = LuxuryProductFactory.create(
            product_details={
                "material": "18k Gold",
                "stone": "Diamond", 
                "certification": "GIA"
            }
        )
        
        # Act
        response = client.get(f"/api/v1/products/{product.id}")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        required_fields = ["id", "name", "description", "price", "category", 
                          "inventory_count", "featured", "created_at"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Check product details structure
        assert "product_details" in data
        assert isinstance(data["product_details"], dict)
        assert data["product_details"]["material"] == "18k Gold"
    
    
    @pytest.mark.unit
    @pytest.mark.performance
    def test_products_api_performance(self, client: TestClient, db_session, performance_timer):
        """Test that products API responds within acceptable time limits."""
        # Arrange: Create realistic product dataset
        ProductFactory.create_batch(50)
        
        # Act & Assert: Test various endpoints for performance
        performance_timer.start()
        response = client.get("/api/v1/products")
        elapsed_time = performance_timer.stop()
        
        assert response.status_code == 200
        assert elapsed_time < 0.5  # Should respond in under 500ms
        
        # Test search performance
        performance_timer.start()
        search_response = client.get("/api/v1/products/search?q=ring")
        search_elapsed = performance_timer.stop()
        
        assert search_response.status_code == 200
        assert search_elapsed < 0.3  # Search should be faster
    
    
    @pytest.mark.unit
    def test_products_api_error_handling(self, client: TestClient, db_session):
        """Test proper error handling for products API."""
        # Test invalid product ID format
        response = client.get("/api/v1/products/invalid-id")
        assert response.status_code == 422  # Validation error
        
        # Test invalid query parameters
        response = client.get("/api/v1/products?page=-1")
        assert response.status_code == 422
        
        response = client.get("/api/v1/products?limit=0")
        assert response.status_code == 422
        
        response = client.get("/api/v1/products?min_price=-100")
        assert response.status_code == 422
    
    
    @pytest.mark.unit
    def test_product_inventory_display(self, client: TestClient, db_session):
        """Test that product inventory is properly displayed/hidden."""
        # Arrange: Products with different inventory levels
        in_stock_product = ProductFactory.create(inventory_count=10)
        low_stock_product = ProductFactory.create(inventory_count=2)
        out_of_stock_product = ProductFactory.create(inventory_count=0)
        
        # Act & Assert: In stock product
        response = client.get(f"/api/v1/products/{in_stock_product.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["inventory_count"] == 10
        assert data.get("in_stock", True) is True
        
        # Low stock product
        response = client.get(f"/api/v1/products/{low_stock_product.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["inventory_count"] == 2
        
        # Out of stock product
        response = client.get(f"/api/v1/products/{out_of_stock_product.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["inventory_count"] == 0
        assert data.get("in_stock", False) is False
    
    
    @pytest.mark.unit
    def test_product_sorting(self, client: TestClient, db_session):
        """Test product sorting functionality."""
        # Arrange: Products with different prices and names
        ProductFactory.create(name="Alpha Ring", price=1000.00)
        ProductFactory.create(name="Beta Necklace", price=500.00) 
        ProductFactory.create(name="Gamma Bracelet", price=1500.00)
        
        # Act: Sort by price ascending
        response = client.get("/api/v1/products/products?sort_by=price&sort_order=asc")
        assert response.status_code == 200
        data = response.json()
        products = data.get("products", data)
        prices = [p["price"] for p in products]
        assert prices == sorted(prices)
        
        # Act: Sort by price descending
        response = client.get("/api/v1/products/products?sort_by=price&sort_order=desc")
        assert response.status_code == 200
        data = response.json()
        products = data.get("products", data)
        prices = [p["price"] for p in products]
        assert prices == sorted(prices, reverse=True)
        
        # Act: Sort by name
        response = client.get("/api/v1/products/products?sort_by=name&sort_order=asc")
        assert response.status_code == 200
        data = response.json()
        products = data.get("products", data)
        names = [p["name"] for p in products]
        assert names == sorted(names)
    
    
    @pytest.mark.unit
    def test_get_categories_endpoint(self, client: TestClient, db_session):
        """Test categories endpoint returns properly structured data."""
        response = client.get("/api/v1/products/categories")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    
    @pytest.mark.unit
    def test_get_collections_endpoint(self, client: TestClient, db_session):
        """Test collections endpoint returns properly structured data."""
        response = client.get("/api/v1/products/collections")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    
    @pytest.mark.unit
    def test_categories_debug_endpoint(self, client: TestClient, db_session):
        """Test debug endpoint for category information."""
        response = client.get("/api/v1/products/categories/debug")
        
        assert response.status_code == 200
        data = response.json()
        assert "total_categories" in data
        assert "categories" in data
        assert isinstance(data["categories"], list)
    
    
    @pytest.mark.unit
    def test_products_api_response_format(self, client: TestClient, db_session):
        """Test that the enhanced products API returns proper response format."""
        # Arrange
        ProductFactory.create_batch(3)
        
        # Act
        response = client.get("/api/v1/products/products")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        if "products" in data:  # Enhanced endpoint format
            assert "total" in data
            assert "page" in data
            assert "page_size" in data
            assert "total_pages" in data
            assert "has_next" in data
            assert "has_prev" in data
            assert isinstance(data["products"], list)
        else:  # Legacy format
            assert isinstance(data, list)
    
    
    @pytest.mark.unit
    def test_product_creation_endpoint(self, client: TestClient, db_session):
        """Test product creation endpoint."""
        product_data = {
            "name": "Test Diamond Ring",
            "description": "A beautiful test diamond ring",
            "price": 2500.00,  # Will be converted to cents
            "category_id": 1,
            "featured": True,
            "inventory_count": 5
        }
        
        response = client.post("/api/v1/products/products", json=product_data)
        
        # Expect 201 for creation or 200 for success
        assert response.status_code in [200, 201]
        
        if response.status_code in [200, 201]:
            data = response.json()
            assert data["name"] == product_data["name"]
            assert data["price"] == 250000  # Should be in cents