# models/wishlist.py - Wishlist Database Model for Jason & Co.
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.db import Base

class WishlistItem(Base):
    """
    Wishlist model for saving products that users want to purchase later.
    Each user can save products with optional notes and collections.
    """
    __tablename__ = "wishlist_items"

    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    
    # User customization
    notes = Column(Text, nullable=True)  # Personal notes about the item
    collection_name = Column(String(100), nullable=True)  # Group items (e.g., "Wedding Set", "Birthday List")
    priority = Column(Integer, default=3)  # 1=High, 2=Medium, 3=Low priority
    
    # Tracking information
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Price tracking (optional feature)
    price_when_added = Column(Integer, nullable=True)  # Store price in cents when added
    notify_price_drop = Column(Boolean, default=False)  # Email when price drops
    
    # Relationships
    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product")
    
    # Ensure one product per user (no duplicates)
    __table_args__ = (
        UniqueConstraint('user_id', 'product_id', name='unique_user_product_wishlist'),
    )
    
    def __repr__(self):
        return f"<WishlistItem user_id={self.user_id} product_id={self.product_id}>"

class WishlistCollection(Base):
    """
    Optional: Collections to group wishlist items (like "Engagement Ring Set", "Anniversary Gift")
    This allows users to organize their wishlist into themed groups.
    """
    __tablename__ = "wishlist_collections"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Collection details
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(7), default="#D4AF37")  # Hex color for visual organization (default gold)
    
    # Privacy settings
    is_public = Column(Boolean, default=False)  # Future: Share collections with others
    is_active = Column(Boolean, default=True)  # Soft delete collections
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    
    # Ensure unique collection names per user
    __table_args__ = (
        UniqueConstraint('user_id', 'name', name='unique_user_collection_name'),
    )
    
    def __repr__(self):
        return f"<WishlistCollection {self.name} by user_id={self.user_id}>"

# Database utility functions for wishlist operations
from sqlalchemy.orm import Session
from typing import List, Optional

def add_to_wishlist(
    db: Session, 
    user_id: int, 
    product_id: int, 
    notes: str = None,
    collection_name: str = None,
    priority: int = 3,
    price_when_added: int = None
) -> WishlistItem:
    """
    Add a product to user's wishlist.
    Returns existing item if already in wishlist, otherwise creates new one.
    """
    # Check if item already exists
    existing_item = db.query(WishlistItem).filter(
        WishlistItem.user_id == user_id,
        WishlistItem.product_id == product_id
    ).first()
    
    if existing_item:
        # Update existing item
        if notes:
            existing_item.notes = notes
        if collection_name:
            existing_item.collection_name = collection_name
        if priority:
            existing_item.priority = priority
        existing_item.updated_at = func.now()
        db.commit()
        db.refresh(existing_item)
        return existing_item
    
    # Create new wishlist item
    new_item = WishlistItem(
        user_id=user_id,
        product_id=product_id,
        notes=notes,
        collection_name=collection_name,
        priority=priority,
        price_when_added=price_when_added
    )
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

def remove_from_wishlist(db: Session, user_id: int, product_id: int) -> bool:
    """Remove a product from user's wishlist."""
    item = db.query(WishlistItem).filter(
        WishlistItem.user_id == user_id,
        WishlistItem.product_id == product_id
    ).first()
    
    if item:
        db.delete(item)
        db.commit()
        return True
    return False

def get_user_wishlist(
    db: Session, 
    user_id: int, 
    collection_name: str = None,
    limit: int = 50,
    offset: int = 0
) -> List[WishlistItem]:
    """Get user's wishlist items, optionally filtered by collection."""
    query = db.query(WishlistItem).filter(WishlistItem.user_id == user_id)
    
    if collection_name:
        query = query.filter(WishlistItem.collection_name == collection_name)
    
    return query.order_by(WishlistItem.created_at.desc()).offset(offset).limit(limit).all()

def get_wishlist_collections(db: Session, user_id: int) -> List[WishlistCollection]:
    """Get user's wishlist collections."""
    return db.query(WishlistCollection).filter(
        WishlistCollection.user_id == user_id,
        WishlistCollection.is_active == True
    ).order_by(WishlistCollection.name).all()

def create_wishlist_collection(
    db: Session,
    user_id: int,
    name: str,
    description: str = None,
    color: str = "#D4AF37"
) -> WishlistCollection:
    """Create a new wishlist collection."""
    collection = WishlistCollection(
        user_id=user_id,
        name=name,
        description=description,
        color=color
    )
    
    db.add(collection)
    db.commit()
    db.refresh(collection)
    return collection

def is_product_in_wishlist(db: Session, user_id: int, product_id: int) -> bool:
    """Check if a product is in user's wishlist."""
    item = db.query(WishlistItem).filter(
        WishlistItem.user_id == user_id,
        WishlistItem.product_id == product_id
    ).first()
    return item is not None

def get_wishlist_stats(db: Session, user_id: int) -> dict:
    """Get wishlist statistics for dashboard."""
    total_items = db.query(WishlistItem).filter(WishlistItem.user_id == user_id).count()
    
    collections = db.query(WishlistCollection).filter(
        WishlistCollection.user_id == user_id,
        WishlistCollection.is_active == True
    ).count()
    
    # Calculate total value of wishlist items
    wishlist_items = db.query(WishlistItem).filter(WishlistItem.user_id == user_id).all()
    total_value = 0
    
    for item in wishlist_items:
        if item.product and item.product.price:
            total_value += item.product.price
    
    return {
        "total_items": total_items,
        "collections": collections,
        "total_value": total_value,
        "high_priority_items": db.query(WishlistItem).filter(
            WishlistItem.user_id == user_id,
            WishlistItem.priority == 1
        ).count()
    }

# Update User model to include wishlist relationship
# Add this to your existing User model:
"""
# In models/user.py, add this relationship:
wishlist_items = relationship("WishlistItem", back_populates="user", cascade="all, delete-orphan")
"""

# Database migration script (run this to create the tables)
def create_wishlist_tables(engine):
    """Create wishlist tables in the database."""
    Base.metadata.create_all(bind=engine, tables=[
        WishlistItem.__table__,
        WishlistCollection.__table__
    ])

# Example usage:
"""
from models.wishlist import add_to_wishlist, get_user_wishlist, is_product_in_wishlist

# Add product to wishlist
add_to_wishlist(
    db=db_session,
    user_id=1,
    product_id=123,
    notes="Perfect for anniversary gift",
    collection_name="Anniversary Collection",
    priority=1
)

# Check if product is in wishlist
is_in_wishlist = is_product_in_wishlist(db_session, user_id=1, product_id=123)

# Get user's wishlist
wishlist = get_user_wishlist(db_session, user_id=1)
"""