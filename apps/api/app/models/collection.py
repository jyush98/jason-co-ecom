# models/collection.py - CORRECTED with proper imports and relationships

from sqlalchemy import Column, Float, Integer, String, Text, Boolean, DateTime, ForeignKey, Index, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.db import Base

# Junction table definition - MOVED TO TOP with proper import
product_collections = Table(
    'product_collections',
    Base.metadata,
    Column('product_id', Integer, ForeignKey('products.id'), primary_key=True),
    Column('collection_id', Integer, ForeignKey('collections.id'), primary_key=True),
    Column('sort_order', Integer, default=0),
    Column('added_at', DateTime(timezone=True), server_default=func.now())
)

class Collection(Base):
    """
    Product collections for marketing and organization - CORRECTED.
    Different from categories - collections are curated groups for campaigns.
    
    Examples: "Bridal Collection", "Vintage Inspired", "Holiday 2024", "Best Sellers"
    """
    __tablename__ = "collections"

    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Collection type and purpose
    collection_type = Column(String(30), default="manual")  # manual, smart, seasonal
    purpose = Column(String(50), nullable=True)  # marketing, seasonal, featured, bestsellers
    
    # Visual and marketing
    image_url = Column(String, nullable=True)  # Collection hero image
    banner_image = Column(String, nullable=True)  # Collection page banner
    video_url = Column(String, nullable=True)  # Collection video
    color_theme = Column(String(20), default="default")  # UI color scheme
    
    # SEO and marketing
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(String(500), nullable=True)
    marketing_copy = Column(Text, nullable=True)  # Rich marketing description
    
    # Business settings
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)  # Homepage promotion
    is_public = Column(Boolean, default=True)  # Publicly visible
    requires_password = Column(Boolean, default=False)  # Private collection
    access_password = Column(String(100), nullable=True)  # For exclusive collections
    
    # Sorting and display
    sort_order = Column(Integer, default=0)
    products_sort_by = Column(String(20), default="manual")  # manual, price_low, price_high, newest
    
    # Smart collection rules (for automatic collections)
    smart_rules = Column(Text, nullable=True)  # JSON rules for auto-inclusion
    
    # Campaign tracking
    campaign_start = Column(DateTime(timezone=True), nullable=True)
    campaign_end = Column(DateTime(timezone=True), nullable=True)
    view_count = Column(Integer, default=0)
    conversion_rate = Column(Float, default=0.0)
    
    # Admin and tracking
    created_by = Column(String(100), nullable=True)
    admin_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # ==========================================
    # RELATIONSHIPS - CORRECTED
    # ==========================================
    
    # Many-to-many with products (main relationship)
    products = relationship("Product", secondary=product_collections, back_populates="collections")
    
    # One-to-many for products that have this as primary collection
    primary_products = relationship("Product", back_populates="primary_collection", foreign_keys="Product.collection_id")
    
    # Performance indexes
    __table_args__ = (
        Index('idx_collection_featured_active', 'is_featured', 'is_active'),
        Index('idx_collection_type_active', 'collection_type', 'is_active'),
        Index('idx_collection_campaign', 'campaign_start', 'campaign_end'),
    )
    
    def __repr__(self):
        return f"<Collection {self.name} ({self.collection_type})>"
    
    # ==========================================
    # BUSINESS LOGIC METHODS
    # ==========================================
    
    @property
    def is_campaign_active(self):
        """Check if collection campaign is currently active"""
        if not (self.campaign_start and self.campaign_end):
            return True  # Always active if no campaign dates
        
        from datetime import datetime
        now = datetime.utcnow()
        return self.campaign_start <= now <= self.campaign_end
    
    @property
    def product_count(self):
        """Get count of products in this collection"""
        return len(self.products) if self.products else 0
    
    def generate_slug(self):
        """Generate URL-friendly slug from collection name"""
        import re
        if not self.name:
            return None
        slug = self.name.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'\s+', '-', slug)
        slug = slug.strip('-')
        return slug
    
    def get_featured_products(self, limit=8):
        """Get featured products from this collection"""
        return [p for p in self.products if p.featured and p.status == 'active'][:limit]