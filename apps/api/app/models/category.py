# models/category.py - CORRECTED relationship names

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.db import Base

class Category(Base):
    """
    Product category model with hierarchical structure - CORRECTED.
    Supports subcategories and category management for luxury jewelry.
    
    Examples: Rings > Engagement Rings > Solitaire Rings
             Necklaces > Pendants > Diamond Pendants
    """
    __tablename__ = "categories"

    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Hierarchy support (Self-referencing for subcategories)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)
    level = Column(Integer, default=0)  # 0=top level, 1=subcategory, 2=sub-subcategory
    sort_order = Column(Integer, default=0)  # Display order within same level
    
    # SEO and display
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(String(500), nullable=True)
    image_url = Column(String, nullable=True)  # Category thumbnail
    banner_image = Column(String, nullable=True)  # Category page banner
    icon_class = Column(String(50), nullable=True)  # CSS icon class
    
    # Business settings
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)  # Show on homepage
    is_menu_visible = Column(Boolean, default=True)  # Show in navigation
    product_count = Column(Integer, default=0)  # Cached count for performance
    
    # Admin and tracking
    created_by = Column(String(100), nullable=True)
    admin_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # ==========================================
    # RELATIONSHIPS - CORRECTED NAMES
    # ==========================================
    
    # Self-referencing relationships for hierarchy
    parent = relationship("Category", remote_side=[id], back_populates="children")
    children = relationship("Category", back_populates="parent", order_by="Category.sort_order")
    
    # Product relationship - CORRECTED to match Product model
    products = relationship("Product", back_populates="product_category", foreign_keys="Product.category_id")
    
    # Performance indexes
    __table_args__ = (
        Index('idx_category_parent_active', 'parent_id', 'is_active'),
        Index('idx_category_featured_active', 'is_featured', 'is_active'),
        Index('idx_category_hierarchy', 'parent_id', 'level', 'sort_order'),
    )
    
    def __repr__(self):
        return f"<Category {self.name} (Level {self.level})>"
    
    # ==========================================
    # BUSINESS LOGIC METHODS
    # ==========================================
    
    @property
    def full_path(self):
        """Get full category path: 'Rings > Engagement Rings > Solitaire'"""
        path = [self.name]
        current = self.parent
        while current:
            path.insert(0, current.name)
            current = current.parent
        return " > ".join(path)
    
    @property
    def breadcrumbs(self):
        """Get breadcrumb list for navigation"""
        breadcrumbs = []
        current = self
        while current:
            breadcrumbs.insert(0, {
                'id': current.id,
                'name': current.name,
                'slug': current.slug
            })
            current = current.parent
        return breadcrumbs
    
    def get_all_children(self):
        """Get all descendant categories (recursive)"""
        children = []
        for child in self.children:
            children.append(child)
            children.extend(child.get_all_children())
        return children
    
    def generate_slug(self):
        """Generate URL-friendly slug from category name"""
        import re
        if not self.name:
            return None
        slug = self.name.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'\s+', '-', slug)
        slug = slug.strip('-')
        return slug