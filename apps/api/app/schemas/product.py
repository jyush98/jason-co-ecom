# schemas/product.py

from pydantic import BaseModel, Field, ConfigDict, computed_field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ==========================================
# LEGACY SCHEMAS (KEEP FOR COMPATIBILITY)
# ==========================================

class ProductSchemaLegacy(BaseModel):
    """Original schema - keep for backward compatibility"""
    id: int
    name: str
    description: Optional[str] = None
    price: float  # Keep as float (dollars) for legacy compatibility
    image_url: Optional[str]
    image_urls: Optional[List[str]] = []
    category: Optional[str] = None  # Keep as string
    featured: Optional[bool] = None
    details: Optional[Dict[str, str]] = {}
    display_theme: Optional[str] = "dark"

    class Config:
        from_attributes = True

class PaginatedProductsResponseLegacy(BaseModel):
    """Original paginated response - keep for compatibility"""
    products: List[ProductSchemaLegacy]
    total: int
    page: int
    pageSize: int
    totalPages: int

    class Config:
        from_attributes = True

# ==========================================
# ENHANCED SCHEMAS (MATCH YOUR DATABASE)
# ==========================================

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: Optional[str] = None
    description: Optional[str] = None
    meta_title: Optional[str] = Field(None, max_length=200)
    meta_description: Optional[str] = Field(None, max_length=500)  # 500 in your DB
    parent_id: Optional[int] = None
    sort_order: int = Field(default=0)
    is_active: bool = Field(default=True)
    is_featured: bool = Field(default=False)

class CategoryOut(CategoryBase):
    id: int
    full_path: Optional[str] = None
    children_count: int = Field(default=0)
    products_count: int = Field(default=0)
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class CollectionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: Optional[str] = None
    description: Optional[str] = None
    collection_type: str = Field(default="manual")
    is_active: bool = Field(default=True)
    is_featured: bool = Field(default=False)

class CollectionOut(CollectionBase):
    id: int
    products_count: int = Field(default=0)
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    """Base product schema matching your database fields"""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    price: int = Field(..., gt=0)  # Price in cents (matches your DB)
    
    # Product identification
    sku: Optional[str] = Field(None, max_length=50)
    slug: Optional[str] = Field(None, max_length=200)
    short_description: Optional[str] = Field(None, max_length=500)
    
    # Pricing
    compare_at_price: Optional[int] = None
    cost_price: Optional[int] = None
    
    # Categories
    category_id: Optional[int] = None
    category: Optional[str] = None  # Legacy field
    
    # Inventory - FIXED field names to match your DB
    inventory_count: Optional[int] = Field(default=0)
    track_inventory: Optional[bool] = Field(default=True)
    inventory_policy: Optional[str] = Field(default="deny")
    low_stock_threshold: Optional[int] = None
    
    # Product attributes
    weight: Optional[float] = None
    dimensions: Optional[Dict[str, Any]] = None  # JSONB in DB
    materials: Optional[List[str]] = None
    gemstones: Optional[Dict[str, Any]] = None  # JSONB in DB, not List
    care_instructions: Optional[str] = None
    product_type: Optional[str] = Field(None, max_length=50)
    
    # Media - FIXED field names to match your DB
    image_url: Optional[str] = None
    image_urls: Optional[List[str]] = None
    featured_image: Optional[str] = None
    video_url: Optional[str] = None
    image_alt_texts: Optional[List[str]] = None  # NOT alt_texts
    
    # Status and visibility
    status: Optional[str] = Field(default="active")
    featured: bool = Field(default=False)
    searchable: Optional[bool] = Field(default=True)
    available_online: Optional[bool] = Field(default=True)
    available_in_store: Optional[bool] = Field(default=True)
    
    # SEO - FIXED field names to match your DB
    meta_title: Optional[str] = Field(None, max_length=200)
    meta_description: Optional[str] = Field(None, max_length=500)  # 500 in your DB
    search_keywords: Optional[List[str]] = None  # NOT meta_keywords
    social_share_title: Optional[str] = Field(None, max_length=200)
    social_share_description: Optional[str] = Field(None, max_length=500)
    
    # Business intelligence
    view_count: Optional[int] = Field(default=0)
    conversion_rate: Optional[float] = Field(default=0.0)
    average_rating: Optional[float] = Field(default=0.0)
    review_count: Optional[int] = Field(default=0)
    
    # Legacy fields
    details: Optional[Dict[str, Any]] = {}
    display_theme: Optional[str] = "dark"
    
    # Admin fields
    admin_notes: Optional[str] = None
    created_by: Optional[str] = None
    last_modified_by: Optional[str] = None

class ProductOut(ProductBase):
    """Enhanced product schema for API responses - Let Pydantic handle it"""
    id: int
    
    # Category handling - FIXED for both legacy and new
    category_string: Optional[str] = Field(None, alias="category")  # Legacy string field
    category_id: Optional[int] = None
    product_category: Optional[CategoryOut] = None  # New Category object
    
    # Collections relationship
    collections: Optional[List[CollectionOut]] = None
    
    # Timestamps
    created_at: datetime
    updated_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    discontinued_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)
    
    # Computed fields - Let Pydantic calculate these
    @computed_field
    @property
    def price_display(self) -> str:
        """Format price for display (convert cents to dollars)"""
        return f"${(self.price or 0) / 100:.2f}"
    
    @computed_field
    @property
    def compare_price_display(self) -> Optional[str]:
        """Format compare price for display"""
        return f"${(self.compare_at_price or 0) / 100:.2f}" if self.compare_at_price else None
    
    @computed_field
    @property
    def is_on_sale(self) -> bool:
        """Check if product is on sale"""
        return bool(self.compare_at_price and self.price and self.price < self.compare_at_price)
    
    @computed_field
    @property
    def discount_percentage(self) -> int:
        """Calculate discount percentage"""
        if not self.is_on_sale or not self.compare_at_price:
            return 0
        return int(((self.compare_at_price - self.price) / self.compare_at_price) * 100)
    
    @computed_field
    @property
    def in_stock(self) -> bool:
        """Check if product is available for purchase"""
        if not self.track_inventory:
            return True
        return (self.inventory_count or 0) > 0
    
    @computed_field
    @property
    def category_name(self) -> Optional[str]:
        """Get category name from either source"""
        if self.product_category:
            return self.product_category.name
        return self.category_string

class ProductCreate(BaseModel):
    """Schema for creating products - required fields only"""
    name: str = Field(..., min_length=1, max_length=200)
    price: int = Field(..., gt=0)  # Required
    description: Optional[str] = None
    category_id: Optional[int] = None
    sku: Optional[str] = Field(None, max_length=50)
    image_url: Optional[str] = None
    featured: bool = Field(default=False)
    status: str = Field(default="active")

class ProductUpdate(BaseModel):
    """Schema for updating products - all optional"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    price: Optional[int] = Field(None, gt=0)
    sku: Optional[str] = Field(None, max_length=50)
    slug: Optional[str] = None
    category_id: Optional[int] = None
    inventory_count: Optional[int] = None
    track_inventory: Optional[bool] = None
    weight: Optional[float] = None
    materials: Optional[List[str]] = None
    image_url: Optional[str] = None
    image_urls: Optional[List[str]] = None
    status: Optional[str] = None
    featured: Optional[bool] = None
    details: Optional[Dict[str, Any]] = None
    display_theme: Optional[str] = None

class ProductSummary(BaseModel):
    """Lightweight schema for product lists"""
    id: int
    name: str
    price: int  # Cents
    price_display: str  # $24.99
    image_url: Optional[str] = None
    slug: Optional[str] = None
    category_name: Optional[str] = None
    featured: bool = Field(default=False)
    in_stock: bool = Field(default=True)
    average_rating: Optional[float] = Field(default=0.0)
    display_theme: Optional[str] = "dark"
    
    model_config = ConfigDict(from_attributes=True)

class ProductListResponse(BaseModel):
    """New paginated response format"""
    products: List[ProductSummary]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool

# ==========================================
# CONVERSION HELPERS (UPDATED)
# ==========================================

def convert_product_to_legacy(product) -> ProductSchemaLegacy:
    """Convert enhanced product to legacy format"""
    return ProductSchemaLegacy(
        id=product.id,
        name=product.name,
        description=product.description,
        price=(product.price / 100) if product.price else 0,  # Convert cents to dollars
        image_url=product.image_url,
        image_urls=product.image_urls or [],
        category=getattr(product.category_obj, 'name', None) if hasattr(product, 'category_obj') else product.category,
        featured=product.featured,
        details=product.details or {},
        display_theme=product.display_theme
    )

def create_product_summary(product) -> ProductSummary:
    """Create ProductSummary from Product model"""
    return ProductSummary(
        id=product.id,
        name=product.name,
        price=product.price or 0,
        price_display=f"${(product.price / 100):.2f}" if product.price else "$0.00",
        image_url=product.image_url,
        slug=product.slug,
        category_name=getattr(product.category_obj, 'name', None) if hasattr(product, 'category_obj') else product.category,
        featured=product.featured or False,
        in_stock=product.is_in_stock if hasattr(product, 'is_in_stock') else True,
        average_rating=product.average_rating or 0.0
    )