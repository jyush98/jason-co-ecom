# models/product.py - CORRECTED for post-migration database

from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from app.core.db import Base

class Product(Base):
    """
    Enhanced Product model matching your Epic #11 migrated database schema.
    All fields now exist in database after migration.
    """
    __tablename__ = 'products'

    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Pricing (Integer - cents for precision, as per your migration)
    price = Column(Integer, nullable=False, comment='Price in cents')
    compare_at_price = Column(Integer, nullable=True)
    cost_price = Column(Integer, nullable=True)
    
    # Product identification
    sku = Column(String(50), nullable=True, index=True)
    slug = Column(String(200), nullable=True, index=True)
    short_description = Column(String(500), nullable=True)
    
    # Categories - FIXED NAMING CONFLICT
    category_string = Column('category', String, nullable=True)  # Legacy field - map to 'category' column
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=True, index=True)
    collection_id = Column(Integer, ForeignKey('collections.id'), nullable=True, index=True)
    
    # Inventory management
    inventory_count = Column(Integer, nullable=True)
    inventory_policy = Column(String(20), nullable=True, default='deny')
    track_inventory = Column(Boolean, nullable=True, default=True)
    low_stock_threshold = Column(Integer, nullable=True, default=5)
    
    # Product attributes
    weight = Column(Float, nullable=True)
    dimensions = Column(JSONB, nullable=True)
    materials = Column(ARRAY(String), nullable=True)
    gemstones = Column(JSONB, nullable=True)
    care_instructions = Column(Text, nullable=True)
    
    # Media fields
    image_url = Column(String, nullable=True)  # Existing field
    image_urls = Column(ARRAY(String), nullable=True)  # Existing field
    featured_image = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    image_alt_texts = Column(ARRAY(String), nullable=True)
    
    # Status and visibility
    status = Column(String(20), nullable=True, default='draft')
    featured = Column(Boolean, nullable=False, default=False)  # Existing field
    searchable = Column(Boolean, nullable=True, default=True)
    available_online = Column(Boolean, nullable=True, default=True)
    available_in_store = Column(Boolean, nullable=True, default=True)
    
    # SEO fields
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(String(500), nullable=True)
    search_keywords = Column(ARRAY(String), nullable=True)
    social_share_title = Column(String(200), nullable=True)
    social_share_description = Column(String(500), nullable=True)
    
    # Product classification
    product_type = Column(String(50), nullable=True)
    
    # Business intelligence
    view_count = Column(Integer, nullable=True, default=0)
    conversion_rate = Column(Float, nullable=True, default=0.0)
    average_rating = Column(Float, nullable=True, default=0.0)
    review_count = Column(Integer, nullable=True, default=0)
    
    # Legacy fields (keep for backward compatibility)
    details = Column(JSONB, nullable=True)  # Existing field
    display_theme = Column(String, nullable=True)  # Existing field
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)
    discontinued_at = Column(DateTime(timezone=True), nullable=True)
    
    # Admin fields
    created_by = Column(String(100), nullable=True)
    last_modified_by = Column(String(100), nullable=True)
    admin_notes = Column(Text, nullable=True)
    
    # ==========================================
    # RELATIONSHIPS - FIXED NAMING CONFLICTS
    # ==========================================
    
    # Core relationships (existing)
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    
    # Epic #11 relationships - CORRECTED NAMES
    product_category = relationship("Category", back_populates="products", foreign_keys=[category_id])
    primary_collection = relationship("Collection", back_populates="primary_products", foreign_keys=[collection_id])
    
    # Many-to-many collections
    collections = relationship("Collection", secondary="product_collections", back_populates="products")
    wishlist_items = relationship("WishlistItem", back_populates="product")
    
    def __repr__(self):
        return f"<Product {self.id}: {self.name}>"
    
    # ==========================================
    # BUSINESS LOGIC METHODS
    # ==========================================
    
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
    def compare_price_display(self):
        """Format compare price for display"""
        return f"${(self.compare_at_price / 100):.2f}" if self.compare_at_price else None
    
    @property
    def is_on_sale(self):
        """Check if product is on sale"""
        return self.compare_at_price and self.price < self.compare_at_price
    
    @property
    def discount_percentage(self):
        """Calculate discount percentage"""
        if not self.is_on_sale:
            return 0
        return int(((self.compare_at_price - self.price) / self.compare_at_price) * 100)
    
    def can_be_purchased(self):
        """Check if product can be added to cart"""
        return (
            self.status == "active" 
            and self.available_online
            and (not self.track_inventory or (self.inventory_count or 0) > 0)
        )
    
    def generate_slug(self):
        """Generate URL-friendly slug from product name"""
        import re
        if not self.name:
            return None
        slug = self.name.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'\s+', '-', slug)
        slug = slug.strip('-')
        return slug
    
    def generate_sku(self):
        """Generate SKU if not provided"""
        if not self.sku and self.id:
            return f"PROD-{self.id:06d}"
        return self.sku