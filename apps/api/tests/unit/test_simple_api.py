"""
Simple API tests to verify our testing infrastructure works.
These are the foundational tests I want to make sure always pass.
"""
import pytest
from fastapi.testclient import TestClient


class TestSimpleAPI:
    """Basic API tests to verify our setup."""
    
    @pytest.mark.unit
    def test_root_endpoint(self, client: TestClient):
        """Test the root endpoint works - this should always pass."""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Jewelry API" in data["message"]
    
    
    @pytest.mark.unit
    def test_api_structure_basic(self, client: TestClient):
        """Test that our FastAPI app is set up correctly - basic structure validation."""
        # Test that 404 is returned for non-existent endpoints
        response = client.get("/nonexistent")
        assert response.status_code == 404
        
        # Test that our API follows expected JSON structure
        response = client.get("/")
        assert response.headers["content-type"] == "application/json"