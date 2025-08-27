"""
Production-compatible models for integration testing.

These models use the same schema as production models but with SQLite-compatible types.
They allow us to test production workflows without requiring PostgreSQL.
"""
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func

# Use separate base for production integration tests
ProductionTestBase = declarative_base()


class ProductionTestUser(ProductionTestBase):
    """Production User model compatible with SQLite testing."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    clerk_id = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    
    # Production account management columns
    settings = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    cart_items = relationship("ProductionTestCartItem", back_populates="user")
    wishlist_items = relationship("ProductionTestWishlistItem", back_populates="user", cascade="all, delete-orphan")


class ProductionTestProduct(ProductionTestBase):
    """Production Product model compatible with SQLite testing."""
    __tablename__ = 'products'

    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Pricing (Integer - cents for precision)
    price = Column(Integer, nullable=False, comment='Price in cents')
    compare_at_price = Column(Integer, nullable=True)
    cost_price = Column(Integer, nullable=True)
    
    # Product identification
    sku = Column(String(50), nullable=True, index=True)
    slug = Column(String(200), nullable=True, index=True)
    short_description = Column(String(500), nullable=True)
    
    # Categories
    category_string = Column('category', String, nullable=True)
    category_id = Column(Integer, nullable=True, index=True)  # No FK for simplicity
    collection_id = Column(Integer, nullable=True, index=True)
    
    # Inventory management
    inventory_count = Column(Integer, nullable=True)
    inventory_policy = Column(String(20), nullable=True, default='deny')
    track_inventory = Column(Boolean, nullable=True, default=True)
    low_stock_threshold = Column(Integer, nullable=True, default=5)
    
    # Product attributes (JSON instead of JSONB for SQLite)
    weight = Column(Float, nullable=True)
    dimensions = Column(JSON, nullable=True)  # SQLite compatible
    materials = Column(JSON, nullable=True)   # Store as JSON array
    gemstones = Column(JSON, nullable=True)
    care_instructions = Column(Text, nullable=True)
    
    # Media fields
    image_url = Column(String, nullable=True)
    image_urls = Column(JSON, nullable=True)  # JSON array
    featured_image = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    image_alt_texts = Column(JSON, nullable=True)
    
    # Status and visibility
    status = Column(String(20), nullable=True, default='draft')
    featured = Column(Boolean, nullable=False, default=False)
    searchable = Column(Boolean, nullable=True, default=True)
    available_online = Column(Boolean, nullable=True, default=True)
    available_in_store = Column(Boolean, nullable=True, default=True)
    
    # SEO fields
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(String(500), nullable=True)
    search_keywords = Column(JSON, nullable=True)
    social_share_title = Column(String(200), nullable=True)
    social_share_description = Column(String(500), nullable=True)
    
    # Product classification
    product_type = Column(String(50), nullable=True)
    
    # Business intelligence
    view_count = Column(Integer, nullable=True, default=0)
    conversion_rate = Column(Float, nullable=True, default=0.0)
    average_rating = Column(Float, nullable=True, default=0.0)
    review_count = Column(Integer, nullable=True, default=0)
    
    # Legacy fields
    details = Column(JSON, nullable=True)
    display_theme = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)
    discontinued_at = Column(DateTime(timezone=True), nullable=True)
    
    # Admin fields
    created_by = Column(String(100), nullable=True)
    last_modified_by = Column(String(100), nullable=True)
    admin_notes = Column(Text, nullable=True)
    
    # Relationships
    cart_items = relationship("ProductionTestCartItem", back_populates="product")
    wishlist_items = relationship("ProductionTestWishlistItem", back_populates="product")

    def __repr__(self):
        return f"<ProductionTestProduct {self.id}: {self.name}>"

    # Business logic methods (same as production)
    @property
    def is_in_stock(self):
        """Check if product is available for purchase"""
        if not self.track_inventory:
            return True
        return (self.inventory_count or 0) > 0
    
    @property
    def price_display(self):
        """Format price for display (convert cents to dollars)"""
        return f"${(self.price / 100):.2f}" if self.price else "$0.00"
    
    @property
    def price_in_dollars(self):
        """Convert price from cents to dollars"""
        return (self.price / 100) if self.price else 0
    
    @property
    def is_on_sale(self):
        """Check if product is on sale"""
        return self.compare_at_price and self.price < self.compare_at_price
    
    def can_be_purchased(self):
        """Check if product can be added to cart"""
        return (
            self.status == "active" 
            and self.available_online
            and (not self.track_inventory or (self.inventory_count or 0) > 0)
        )


class ProductionTestCartItem(ProductionTestBase):
    """Production CartItem model compatible with SQLite testing."""
    __tablename__ = "cart_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("ProductionTestUser", back_populates="cart_items")
    product = relationship("ProductionTestProduct", back_populates="cart_items")


class ProductionTestWishlistItem(ProductionTestBase):
    """Production WishlistItem model compatible with SQLite testing."""
    __tablename__ = "wishlist_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("ProductionTestUser", back_populates="wishlist_items")
    product = relationship("ProductionTestProduct", back_populates="wishlist_items")


class ProductionTestCategory(ProductionTestBase):
    """Production Category model compatible with SQLite testing."""
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    slug = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Hierarchy support
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)
    level = Column(Integer, default=0)
    sort_order = Column(Integer, default=0)
    
    # SEO and display
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(String(500), nullable=True)
    image_url = Column(String, nullable=True)
    banner_image = Column(String, nullable=True)
    icon_class = Column(String(50), nullable=True)
    
    # Business settings
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    is_menu_visible = Column(Boolean, default=True)
    product_count = Column(Integer, default=0)
    
    # Admin and tracking
    created_by = Column(String(100), nullable=True)
    admin_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    parent = relationship("ProductionTestCategory", remote_side=[id], back_populates="children")
    children = relationship("ProductionTestCategory", back_populates="parent")


class ProductionTestCollection(ProductionTestBase):
    """Production Collection model compatible with SQLite testing."""
    __tablename__ = "collections"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    
    # Display settings
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ProductionTestProductCollection(ProductionTestBase):
    """Production ProductCollection junction table for SQLite testing."""
    __tablename__ = "product_collections"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=False)
    
    # Relationships
    product = relationship("ProductionTestProduct")
    collection = relationship("ProductionTestCollection")


class ProductionTestOrder(ProductionTestBase):
    """Production Order model compatible with SQLite testing.""" 
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Order details
    total_amount = Column(Integer, nullable=False)  # In cents
    status = Column(String(20), nullable=False, default="pending")
    
    # Addresses (stored as JSON for simplicity)
    shipping_address = Column(JSON, nullable=True)
    billing_address = Column(JSON, nullable=True)
    
    # Payment info
    stripe_payment_intent_id = Column(String, nullable=True)
    payment_status = Column(String(20), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ProductionTestOrderItem(ProductionTestBase):
    """Production OrderItem model compatible with SQLite testing."""
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    quantity = Column(Integer, nullable=False)
    price_at_time = Column(Integer, nullable=False)  # Price when ordered
    
    # Relationships
    product = relationship("ProductionTestProduct")


# Export all models for easy import
__all__ = [
    'ProductionTestBase',
    'ProductionTestUser', 
    'ProductionTestProduct',
    'ProductionTestCartItem',
    'ProductionTestWishlistItem',
    'ProductionTestCategory',
    'ProductionTestCollection',
    'ProductionTestProductCollection', 
    'ProductionTestOrder',
    'ProductionTestOrderItem'
]