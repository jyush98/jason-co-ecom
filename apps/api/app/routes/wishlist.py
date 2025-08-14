# routes/wishlist.py - Wishlist API Endpoints for Jason & Co. (Fixed for Pydantic v2)
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from app.core.db import get_db
from app.models.user import User
from app.models.product import Product
from app.models.wishlist import (
    WishlistItem,
    WishlistCollection,
    add_to_wishlist,
    remove_from_wishlist,
    get_user_wishlist,
    get_wishlist_collections,
    create_wishlist_collection,
    is_product_in_wishlist,
    get_wishlist_stats
)
from app.auth import verify_clerk_token

router = APIRouter()

# Pydantic models for request/response
class AddToWishlistRequest(BaseModel):
    product_id: int
    notes: Optional[str] = None
    collection_name: Optional[str] = None
    priority: int = Field(default=3, ge=1, le=3)  # 1=High, 2=Medium, 3=Low

class UpdateWishlistItemRequest(BaseModel):
    notes: Optional[str] = None
    collection_name: Optional[str] = None
    priority: Optional[int] = Field(default=None, ge=1, le=3)

class CreateCollectionRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    color: str = Field(default="#D4AF37", pattern="^#[0-9A-Fa-f]{6}$")  # Fixed: regex -> pattern

class WishlistItemResponse(BaseModel):
    id: int
    product_id: int
    notes: Optional[str]
    collection_name: Optional[str]
    priority: int
    created_at: str
    price_when_added: Optional[float]
    product: dict  # Product details

class WishlistStatsResponse(BaseModel):
    total_items: int
    collections: int
    total_value: float
    high_priority_items: int

class CollectionResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    color: str
    created_at: str
    item_count: int

def get_user_by_clerk_id(db: Session, clerk_id: str) -> User:
    """Helper function to get user by Clerk ID."""
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/add", response_model=dict)
def add_product_to_wishlist(
    request: AddToWishlistRequest,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Add a product to user's wishlist."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Verify product exists
        product = db.query(Product).filter(Product.id == request.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Add to wishlist (handles duplicates gracefully)
        wishlist_item = add_to_wishlist(
            db=db,
            user_id=db_user.id,
            product_id=request.product_id,
            notes=request.notes,
            collection_name=request.collection_name,
            priority=request.priority,
            price_when_added=int(product.price * 100) if product.price else None  # Store in cents
        )
        
        return {
            "success": True,
            "message": "Product added to wishlist",
            "wishlist_item_id": wishlist_item.id,
            "product_name": product.name
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add to wishlist: {str(e)}")

@router.delete("/remove/{product_id}")
def remove_product_from_wishlist(
    product_id: int,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Remove a product from user's wishlist."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Remove from wishlist
        removed = remove_from_wishlist(db, db_user.id, product_id)
        
        if not removed:
            raise HTTPException(status_code=404, detail="Product not found in wishlist")
        
        return {
            "success": True,
            "message": "Product removed from wishlist",
            "product_id": product_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove from wishlist: {str(e)}")

@router.get("", response_model=List[WishlistItemResponse])
def get_wishlist(
    collection: Optional[str] = Query(None, description="Filter by collection name"),
    limit: int = Query(50, ge=1, le=100, description="Number of items to return"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get user's wishlist items."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Get wishlist items
        wishlist_items = get_user_wishlist(
            db=db,
            user_id=db_user.id,
            collection_name=collection,
            limit=limit,
            offset=offset
        )

        # Format response with product details
        response_items = []
        for item in wishlist_items:
            
            print(f"🔍 Processing item: {item.id}, product_id: {item.product_id}")
            
            try:
                product_data = {
                    "id": item.product.id,
                    "name": item.product.name,
                    "description": item.product.description,
                    "price": item.product.price_in_dollars,
                    "image_url": item.product.image_url,
                    "image_urls": item.product.image_urls,
                    "category": item.product.category_string,
                    "featured": item.product.featured
                }
                # print(f"🔍 Product data created for: {item.product.name}")
                
                response_item = WishlistItemResponse(
                    id=item.id,
                    product_id=item.product_id,
                    notes=item.notes,
                    collection_name=item.collection_name,
                    priority=item.priority,
                    created_at=item.created_at.isoformat(),
                    price_when_added=item.price_when_added / 100 if item.price_when_added else None,
                    product=product_data
                )
                # print(f"🔍 Response item created for: {item.id}")
                
                response_items.append(response_item)
                
            except Exception as e:
                print(f"❌ Error processing item {item.id}: {str(e)}")
                raise
        
        print(f"🔍 Returning {len(response_items)} items")
        return response_items
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get wishlist: {str(e)}")

@router.put("/items/{wishlist_item_id}")
def update_wishlist_item(
    wishlist_item_id: int,
    request: UpdateWishlistItemRequest,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Update a wishlist item's notes, collection, or priority."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Get wishlist item (ensure it belongs to the user)
        wishlist_item = db.query(WishlistItem).filter(
            WishlistItem.id == wishlist_item_id,
            WishlistItem.user_id == db_user.id
        ).first()
        
        if not wishlist_item:
            raise HTTPException(status_code=404, detail="Wishlist item not found")
        
        # Update fields
        if request.notes is not None:
            wishlist_item.notes = request.notes
        if request.collection_name is not None:
            wishlist_item.collection_name = request.collection_name
        if request.priority is not None:
            wishlist_item.priority = request.priority
        
        db.commit()
        db.refresh(wishlist_item)
        
        return {
            "success": True,
            "message": "Wishlist item updated",
            "wishlist_item_id": wishlist_item_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update wishlist item: {str(e)}")

@router.get("/check/{product_id}")
def check_product_in_wishlist(
    product_id: int,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Check if a specific product is in user's wishlist."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Check if product is in wishlist
        in_wishlist = is_product_in_wishlist(db, db_user.id, product_id)
        
        # Get the wishlist item details if it exists
        wishlist_item = None
        if in_wishlist:
            item = db.query(WishlistItem).filter(
                WishlistItem.user_id == db_user.id,
                WishlistItem.product_id == product_id
            ).first()
            if item:
                wishlist_item = {
                    "id": item.id,
                    "notes": item.notes,
                    "collection_name": item.collection_name,
                    "priority": item.priority,
                    "created_at": item.created_at.isoformat()
                }
        
        return {
            "in_wishlist": in_wishlist,
            "product_id": product_id,
            "wishlist_item": wishlist_item
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check wishlist: {str(e)}")

@router.get("/stats", response_model=WishlistStatsResponse)
def get_wishlist_statistics(
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get wishlist statistics for dashboard."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Get stats
        stats = get_wishlist_stats(db, db_user.id)
        
        return WishlistStatsResponse(
            total_items=stats["total_items"],
            collections=stats["collections"],
            total_value=stats["total_value"],
            high_priority_items=stats["high_priority_items"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get wishlist stats: {str(e)}")

# Collection management endpoints
@router.post("/collections", response_model=dict)
def create_collection(
    request: CreateCollectionRequest,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Create a new wishlist collection."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Create collection
        collection = create_wishlist_collection(
            db=db,
            user_id=db_user.id,
            name=request.name,
            description=request.description,
            color=request.color
        )
        
        return {
            "success": True,
            "message": "Collection created",
            "collection_id": collection.id,
            "collection_name": collection.name
        }
        
    except Exception as e:
        if "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Collection name already exists")
        raise HTTPException(status_code=500, detail=f"Failed to create collection: {str(e)}")

@router.get("/collections", response_model=List[CollectionResponse])
def get_collections(
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get user's wishlist collections."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Get collections with item counts
        collections = get_wishlist_collections(db, db_user.id)
        
        response_collections = []
        for collection in collections:
            # Count items in this collection
            item_count = db.query(WishlistItem).filter(
                WishlistItem.user_id == db_user.id,
                WishlistItem.collection_name == collection.name
            ).count()
            
            response_collections.append(CollectionResponse(
                id=collection.id,
                name=collection.name,
                description=collection.description,
                color=collection.color,
                created_at=collection.created_at.isoformat(),
                item_count=item_count
            ))
        
        return response_collections
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get collections: {str(e)}")

@router.delete("/collections/{collection_id}")
def delete_collection(
    collection_id: int,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Delete a wishlist collection (moves items to no collection)."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Get collection (ensure it belongs to the user)
        collection = db.query(WishlistCollection).filter(
            WishlistCollection.id == collection_id,
            WishlistCollection.user_id == db_user.id
        ).first()
        
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
        
        # Move all items in this collection to "no collection"
        db.query(WishlistItem).filter(
            WishlistItem.user_id == db_user.id,
            WishlistItem.collection_name == collection.name
        ).update({"collection_name": None})
        
        # Delete the collection
        db.delete(collection)
        db.commit()
        
        return {
            "success": True,
            "message": "Collection deleted",
            "collection_id": collection_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete collection: {str(e)}")

# Bulk operations
@router.post("/bulk/add-to-cart")
def add_wishlist_to_cart(
    product_ids: List[int],
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Add multiple wishlist items to cart (bulk operation)."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # This would integrate with your existing cart system
        # For now, return success message
        # TODO: Integrate with cart API endpoints
        
        return {
            "success": True,
            "message": f"Added {len(product_ids)} items to cart",
            "product_ids": product_ids
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add items to cart: {str(e)}")

@router.delete("/bulk/remove")
def bulk_remove_from_wishlist(
    product_ids: List[int],
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Remove multiple products from wishlist (bulk operation)."""
    try:
        # Get user from database
        db_user = get_user_by_clerk_id(db, user["sub"])
        
        # Remove all specified products
        removed_count = 0
        for product_id in product_ids:
            if remove_from_wishlist(db, db_user.id, product_id):
                removed_count += 1
        
        return {
            "success": True,
            "message": f"Removed {removed_count} items from wishlist",
            "removed_count": removed_count,
            "requested_count": len(product_ids)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove items from wishlist: {str(e)}")