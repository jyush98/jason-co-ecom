# routes/products.py - CORRECTED relationship loading and response format

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, asc
from typing import Optional, List
from app.core.db import get_db
from app.models.product import Product
from app.models.category import Category
from app.models.collection import Collection
from app.schemas.product import (
    # Legacy schemas
    ProductSchemaLegacy, PaginatedProductsResponseLegacy,
    convert_product_to_legacy,
    
    # New enhanced schemas
    ProductOut, ProductCreate, ProductUpdate, ProductSummary, ProductListResponse,
    CategoryOut, CollectionOut
)

router = APIRouter()

# ==========================================
# LEGACY ENDPOINTS
# ==========================================

@router.get("/products/legacy", response_model=PaginatedProductsResponseLegacy)
async def get_products_legacy(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),  # Keep original naming
    name: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    minPrice: Optional[float] = Query(None),  # Keep as float (dollars)
    maxPrice: Optional[float] = Query(None),  # Keep as float (dollars)
    sortBy: Optional[str] = Query("created_at"),
    sortOrder: Optional[str] = Query("desc")
):
    """
    LEGACY ENDPOINT - Keep your existing API contract working
    Returns products in original format with prices in dollars
    """
    # FIXED: Use correct relationship name
    query = db.query(Product).options(joinedload(Product.product_category))
    
    # Apply filters
    if name:
        query = query.filter(Product.name.ilike(f"%{name}%"))
    
    if category and category.lower() not in ["all", ""]:
        # Handle both old string categories and new category relationships
        category_obj = db.query(Category).filter(Category.name.ilike(f"%{category}%")).first()
        if category_obj:
            query = query.filter(Product.category_id == category_obj.id)
        else:
            # Fallback to old string category field if it still exists
            query = query.filter(Product.category_string.ilike(f"%{category}%"))
    
    if minPrice is not None:
        query = query.filter(Product.price >= int(minPrice * 100))  # Convert to cents
    if maxPrice is not None:
        query = query.filter(Product.price <= int(maxPrice * 100))  # Convert to cents
    
    # Sorting
    sort_column = getattr(Product, sortBy, Product.created_at)
    if sortOrder.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))
    
    # Count and paginate
    total = query.count()
    offset = (page - 1) * pageSize
    products = query.offset(offset).limit(pageSize).all()
    
    # Convert to legacy format
    legacy_products = [convert_product_to_legacy(p) for p in products]
    
    totalPages = (total + pageSize - 1) // pageSize
    
    return PaginatedProductsResponseLegacy(
        products=legacy_products,
        total=total,
        page=page,
        pageSize=pageSize,
        totalPages=totalPages
    )

@router.get("/products/{product_id}/legacy", response_model=ProductSchemaLegacy)
async def get_product_legacy(product_id: int, db: Session = Depends(get_db)):
    """Legacy single product endpoint"""
    # FIXED: Use correct relationship name
    product = db.query(Product).options(joinedload(Product.product_category)).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return convert_product_to_legacy(product)

# ==========================================
# NEW ENHANCED ENDPOINTS - CORRECTED
# ==========================================

@router.get("/products", response_model=ProductListResponse)
async def get_products(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    name: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),  # Legacy support
    collection_id: Optional[int] = Query(None),
    min_price: Optional[int] = Query(None),  # Price in cents
    max_price: Optional[int] = Query(None),  # Price in cents
    featured: Optional[bool] = Query(None),
    status: Optional[str] = Query("active"),
    sort_by: Optional[str] = Query("created_at"),
    sort_order: Optional[str] = Query("desc")
):
    """
    NEW ENHANCED ENDPOINT - with categories, collections, and price in cents
    """
    # FIXED: Use correct relationship names
    query = db.query(Product).options(
        joinedload(Product.product_category),
        joinedload(Product.collections)
    )

    # Status filter
    if status:
        query = query.filter(Product.status == status)

    # Name search
    if name:
        query = query.filter(Product.name.ilike(f"%{name}%"))

    # Category filtering
    if category_id:
        query = query.filter(Product.category_id == category_id)
    elif category and category.lower() not in ["all", ""]:
        category_obj = db.query(Category).filter(Category.name.ilike(f"%{category}%")).first()
        if category_obj:
            query = query.filter(Product.category_id == category_obj.id)
    
    # Collection filtering
    if collection_id:
        query = query.join(Product.collections).filter(Collection.id == collection_id)
    
    # Price filtering (in cents)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    # Featured filter
    if featured is not None:
        query = query.filter(Product.featured == featured)
    
    # Sorting
    sort_column = getattr(Product, sort_by, Product.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))
    
    # Count and paginate
    total = query.count()
    offset = (page - 1) * page_size
    products = query.offset(offset).limit(page_size).all()
    
    # CORRECTED: Create proper ProductSummary objects
    product_summaries = []
    for product in products:
        # Handle potential None values safely
        inventory_count = getattr(product, 'inventory_count', 0) or 0
        track_inventory = getattr(product, 'track_inventory', True)
        
        summary = ProductSummary(
            id=product.id,
            name=product.name,
            price=product.price or 0,
            price_display=f"${(product.price or 0) / 100:.2f}",
            image_url=product.image_url,
            slug=product.slug,
            category_name=product.product_category.name if product.product_category else None,
            featured=product.featured or False,
            in_stock=inventory_count > 0 if track_inventory else True,
            average_rating=getattr(product, 'average_rating', 0.0) or 0.0,
            display_theme=product.display_theme or "dark"
        )
        product_summaries.append(summary)
    
    total_pages = (total + page_size - 1) // page_size
    
    return ProductListResponse(
        products=product_summaries,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1
    )

@router.get("/products/{product_id}", response_model=ProductOut)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Enhanced single product endpoint with full details"""
    product = db.query(Product).options(
        joinedload(Product.product_category),
        joinedload(Product.collections)
    ).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product

# ==========================================
# CATEGORY ENDPOINTS - CORRECTED
# ==========================================

@router.get("/categories", response_model=List[CategoryOut])
async def get_categories(
    db: Session = Depends(get_db),
    featured_only: bool = Query(False),
    parent_id: Optional[int] = Query(None),
    include_inactive: bool = Query(False)  # ADDED missing parameter
):
    """Get categories for frontend dropdown/navigation"""
    query = db.query(Category)
    
    # CORRECTED: Handle include_inactive parameter
    if not include_inactive:
        query = query.filter(Category.is_active == True)
    
    if featured_only:
        query = query.filter(Category.is_featured == True)
    
    if parent_id is not None:
        query = query.filter(Category.parent_id == parent_id)
    else:
        query = query.filter(Category.parent_id.is_(None))
    
    categories = query.order_by(Category.sort_order, Category.name).all()
    
    # Add computed fields
    for category in categories:
        category.children_count = db.query(Category).filter(Category.parent_id == category.id).count()
        category.products_count = db.query(Product).filter(Product.category_id == category.id).count()
    
    return categories

@router.get("/categories/{category_id}", response_model=CategoryOut)
async def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get single category with details"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Add computed fields
    category.children_count = db.query(Category).filter(Category.parent_id == category.id).count()
    category.products_count = db.query(Product).filter(Product.category_id == category.id).count()
    
    return category

# ==========================================
# COLLECTIONS ENDPOINTS - CORRECTED
# ==========================================

@router.get("/collections", response_model=List[CollectionOut])
async def get_collections(
    db: Session = Depends(get_db),
    featured_only: bool = Query(False),
    collection_type: Optional[str] = Query(None),  # ADDED missing parameter
    include_inactive: bool = Query(False)  # ADDED missing parameter
):
    """Get collections for frontend"""
    query = db.query(Collection)
    
    # CORRECTED: Handle include_inactive parameter
    if not include_inactive:
        query = query.filter(Collection.is_active == True)
    
    if featured_only:
        query = query.filter(Collection.is_featured == True)
    
    # ADDED: Filter by collection type
    if collection_type:
        query = query.filter(Collection.collection_type == collection_type)
    
    collections = query.order_by(Collection.sort_order, Collection.name).all()
    
    # Add computed fields
    for collection in collections:
        # CORRECTED: Safely get products count
        collection.products_count = len(collection.products) if hasattr(collection, 'products') and collection.products else 0

    return collections

@router.get("/collections/{collection_id}", response_model=CollectionOut)
async def get_collection(collection_id: int, db: Session = Depends(get_db)):
    """Get single collection with details"""
    collection = db.query(Collection).options(joinedload(Collection.products)).filter(Collection.id == collection_id).first()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    # Add computed fields
    collection.products_count = len(collection.products) if collection.products else 0
    
    return collection

@router.get("/collections/{collection_id}/products", response_model=ProductListResponse)
async def get_collection_products(
    collection_id: int,
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """Get products in a specific collection"""
    collection = db.query(Collection).filter(Collection.id == collection_id).first()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    # CORRECTED: Use the main products endpoint with collection filter
    return await get_products(
        db=db, page=page, page_size=page_size, 
        collection_id=collection_id, status="active"
    )

# ==========================================
# ADMIN ENDPOINTS - NEW
# ==========================================

@router.post("/products", response_model=ProductOut)
async def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db)
):
    """Create a new product"""
    # Convert dollars to cents for price
    product_dict = product_data.dict()
    if 'price' in product_dict and product_dict['price']:
        product_dict['price'] = int(product_dict['price'] * 100)
    
    product = Product(**product_dict)
    db.add(product)
    db.commit()
    db.refresh(product)
    
    return product

@router.put("/products/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing product"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Convert dollars to cents for price if provided
    update_dict = product_data.dict(exclude_unset=True)
    if 'price' in update_dict and update_dict['price']:
        update_dict['price'] = int(update_dict['price'] * 100)
    
    for field, value in update_dict.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    
    return product