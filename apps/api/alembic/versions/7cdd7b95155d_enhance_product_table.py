"""enhance product table

Revision ID: 7cdd7b95155d
Revises: 2116a1c984f4
Create Date: 2025-08-06 11:33:35.082974

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '7cdd7b95155d'
down_revision: Union[str, None] = '2116a1c984f4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Epic #11 Clean Migration: Only add categories, collections, and enhance products
    Does NOT modify existing working tables (custom_orders, users, cart_items, etc.)
    """
    
    # 1. CREATE CATEGORIES TABLE
    op.create_table('categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        
        # Hierarchy support
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('level', sa.Integer(), default=0),
        sa.Column('sort_order', sa.Integer(), default=0),
        
        # SEO and display
        sa.Column('meta_title', sa.String(length=200), nullable=True),
        sa.Column('meta_description', sa.String(length=500), nullable=True),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('banner_image', sa.String(), nullable=True),
        sa.Column('icon_class', sa.String(length=50), nullable=True),
        
        # Business settings
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('is_featured', sa.Boolean(), default=False),
        sa.Column('is_menu_visible', sa.Boolean(), default=True),
        sa.Column('product_count', sa.Integer(), default=0),
        
        # Admin fields
        sa.Column('created_by', sa.String(length=100), nullable=True),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        
        # Constraints
        sa.ForeignKeyConstraint(['parent_id'], ['categories.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Category indexes
    op.create_index(op.f('ix_categories_id'), 'categories', ['id'], unique=False)
    op.create_index(op.f('ix_categories_name'), 'categories', ['name'], unique=False)
    op.create_index(op.f('ix_categories_slug'), 'categories', ['slug'], unique=True)
    op.create_index(op.f('ix_categories_parent_id'), 'categories', ['parent_id'], unique=False)
    op.create_index('idx_category_parent_active', 'categories', ['parent_id', 'is_active'], unique=False)
    op.create_index('idx_category_featured_active', 'categories', ['is_featured', 'is_active'], unique=False)
    op.create_index('idx_category_hierarchy', 'categories', ['parent_id', 'level', 'sort_order'], unique=False)

    
    # 2. CREATE COLLECTIONS TABLE
    op.create_table('collections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        
        # Collection type
        sa.Column('collection_type', sa.String(length=30), default='manual'),
        sa.Column('purpose', sa.String(length=50), nullable=True),
        
        # Visual and marketing
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('banner_image', sa.String(), nullable=True),
        sa.Column('video_url', sa.String(), nullable=True),
        sa.Column('color_theme', sa.String(length=20), default='default'),
        
        # SEO and marketing
        sa.Column('meta_title', sa.String(length=200), nullable=True),
        sa.Column('meta_description', sa.String(length=500), nullable=True),
        sa.Column('marketing_copy', sa.Text(), nullable=True),
        
        # Business settings
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('is_featured', sa.Boolean(), default=False),
        sa.Column('is_public', sa.Boolean(), default=True),
        sa.Column('requires_password', sa.Boolean(), default=False),
        sa.Column('access_password', sa.String(length=100), nullable=True),
        
        # Sorting and display
        sa.Column('sort_order', sa.Integer(), default=0),
        sa.Column('products_sort_by', sa.String(length=20), default='manual'),
        
        # Smart collection rules
        sa.Column('smart_rules', sa.Text(), nullable=True),
        
        # Campaign tracking
        sa.Column('campaign_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('campaign_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('view_count', sa.Integer(), default=0),
        sa.Column('conversion_rate', sa.Float(), default=0.0),
        
        # Admin fields
        sa.Column('created_by', sa.String(length=100), nullable=True),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        
        sa.PrimaryKeyConstraint('id')
    )
    
    # Collection indexes
    op.create_index(op.f('ix_collections_id'), 'collections', ['id'], unique=False)
    op.create_index(op.f('ix_collections_name'), 'collections', ['name'], unique=False)
    op.create_index(op.f('ix_collections_slug'), 'collections', ['slug'], unique=True)
    op.create_index('idx_collection_featured_active', 'collections', ['is_featured', 'is_active'], unique=False)
    op.create_index('idx_collection_type_active', 'collections', ['collection_type', 'is_active'], unique=False)
    op.create_index('idx_collection_campaign', 'collections', ['campaign_start', 'campaign_end'], unique=False)

    
    # 3. CREATE PRODUCT-COLLECTIONS JUNCTION TABLE
    op.create_table('product_collections',
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('collection_id', sa.Integer(), nullable=False),
        sa.Column('sort_order', sa.Integer(), default=0),
        sa.Column('added_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        
        sa.ForeignKeyConstraint(['collection_id'], ['collections.id']),
        sa.ForeignKeyConstraint(['product_id'], ['products.id']),
        sa.PrimaryKeyConstraint('product_id', 'collection_id')
    )

    
    # 4. ENHANCE PRODUCTS TABLE (Add new columns only)
    
    # Primary identification enhancements
    op.add_column('products', sa.Column('sku', sa.String(length=50), nullable=True))  # Start nullable, update later
    op.add_column('products', sa.Column('slug', sa.String(length=200), nullable=True))  # Start nullable, update later
    
    # Basic information enhancements
    op.add_column('products', sa.Column('short_description', sa.String(length=500), nullable=True))
    op.add_column('products', sa.Column('compare_at_price', sa.Integer(), nullable=True))
    op.add_column('products', sa.Column('cost_price', sa.Integer(), nullable=True))
    
    # Categorization (relationships)
    op.add_column('products', sa.Column('category_id', sa.Integer(), nullable=True))
    op.add_column('products', sa.Column('collection_id', sa.Integer(), nullable=True))
    
    # Inventory management enhancements
    op.add_column('products', sa.Column('inventory_policy', sa.String(length=20), default='deny'))
    op.add_column('products', sa.Column('track_inventory', sa.Boolean(), default=True))
    op.add_column('products', sa.Column('low_stock_threshold', sa.Integer(), default=5))
    
    # Product attributes
    op.add_column('products', sa.Column('weight', sa.Float(), nullable=True))
    op.add_column('products', sa.Column('dimensions', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('products', sa.Column('materials', postgresql.ARRAY(sa.String()), nullable=True))
    op.add_column('products', sa.Column('gemstones', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('products', sa.Column('care_instructions', sa.Text(), nullable=True))
    
    # Images and media enhancements
    op.add_column('products', sa.Column('featured_image', sa.String(), nullable=True))
    op.add_column('products', sa.Column('video_url', sa.String(), nullable=True))
    op.add_column('products', sa.Column('image_alt_texts', postgresql.ARRAY(sa.String()), nullable=True))
    
    # Status and visibility
    op.add_column('products', sa.Column('status', sa.String(length=20), default='draft'))
    op.add_column('products', sa.Column('searchable', sa.Boolean(), default=True))
    op.add_column('products', sa.Column('available_online', sa.Boolean(), default=True))
    op.add_column('products', sa.Column('available_in_store', sa.Boolean(), default=True))
    
    # SEO and marketing
    op.add_column('products', sa.Column('meta_title', sa.String(length=200), nullable=True))
    op.add_column('products', sa.Column('meta_description', sa.String(length=500), nullable=True))
    op.add_column('products', sa.Column('search_keywords', postgresql.ARRAY(sa.String()), nullable=True))
    op.add_column('products', sa.Column('social_share_title', sa.String(length=200), nullable=True))
    op.add_column('products', sa.Column('social_share_description', sa.String(length=500), nullable=True))
    
    # Display and business
    op.add_column('products', sa.Column('product_type', sa.String(length=50), nullable=True))
    op.add_column('products', sa.Column('view_count', sa.Integer(), default=0))
    op.add_column('products', sa.Column('conversion_rate', sa.Float(), default=0.0))
    op.add_column('products', sa.Column('average_rating', sa.Float(), default=0.0))
    op.add_column('products', sa.Column('review_count', sa.Integer(), default=0))
    
    # Timestamps
    op.add_column('products', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    op.add_column('products', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    op.add_column('products', sa.Column('published_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('products', sa.Column('discontinued_at', sa.DateTime(timezone=True), nullable=True))
    
    # Admin fields
    op.add_column('products', sa.Column('created_by', sa.String(length=100), nullable=True))
    op.add_column('products', sa.Column('last_modified_by', sa.String(length=100), nullable=True))
    op.add_column('products', sa.Column('admin_notes', sa.Text(), nullable=True))
    
    # Convert price from Float to Integer (cents) - CRITICAL for financial precision
    op.alter_column('products', 'price',
                   existing_type=sa.Float(),
                   type_=sa.Integer(),
                   existing_nullable=False,
                   comment='Price in cents for precision'
    )
    
    # Create foreign key relationships
    op.create_foreign_key('fk_products_category', 'products', 'categories', ['category_id'], ['id'])
    op.create_foreign_key('fk_products_collection', 'products', 'collections', ['collection_id'], ['id'])
    
    # Create product indexes for performance
    op.create_index(op.f('ix_products_sku'), 'products', ['sku'], unique=False)  # Will make unique after data migration
    op.create_index(op.f('ix_products_slug'), 'products', ['slug'], unique=False)  # Will make unique after data migration
    op.create_index(op.f('ix_products_category_id'), 'products', ['category_id'], unique=False)
    op.create_index(op.f('ix_products_collection_id'), 'products', ['collection_id'], unique=False)
    op.create_index('idx_product_category_status', 'products', ['category_id', 'status'], unique=False)
    op.create_index('idx_product_featured_status', 'products', ['featured', 'status'], unique=False)
    op.create_index('idx_product_price_range', 'products', ['price', 'status'], unique=False)
    op.create_index('idx_product_inventory', 'products', ['inventory_count', 'track_inventory'], unique=False)
    op.create_index('idx_product_published', 'products', ['published_at', 'status'], unique=False)
    op.create_index('idx_product_search', 'products', ['searchable', 'status'], unique=False)


def downgrade() -> None:
    """
    Safely downgrade Epic #11 changes
    """
    
    # Remove product indexes
    op.drop_index('idx_product_search', table_name='products')
    op.drop_index('idx_product_published', table_name='products')
    op.drop_index('idx_product_inventory', table_name='products')
    op.drop_index('idx_product_price_range', table_name='products')
    op.drop_index('idx_product_featured_status', table_name='products')
    op.drop_index('idx_product_category_status', table_name='products')
    op.drop_index(op.f('ix_products_collection_id'), table_name='products')
    op.drop_index(op.f('ix_products_category_id'), table_name='products')
    op.drop_index(op.f('ix_products_slug'), table_name='products')
    op.drop_index(op.f('ix_products_sku'), table_name='products')
    
    # Remove foreign key relationships
    op.drop_constraint('fk_products_collection', 'products', type_='foreignkey')
    op.drop_constraint('fk_products_category', 'products', type_='foreignkey')
    
    # Convert price back to Float
    op.alter_column('products', 'price',
                   existing_type=sa.Integer(),
                   type_=sa.Float(),
                   existing_nullable=False
    )
    
    # Remove all new product columns
    op.drop_column('products', 'admin_notes')
    op.drop_column('products', 'last_modified_by')
    op.drop_column('products', 'created_by')
    op.drop_column('products', 'discontinued_at')
    op.drop_column('products', 'published_at')
    op.drop_column('products', 'updated_at')
    op.drop_column('products', 'created_at')
    op.drop_column('products', 'review_count')
    op.drop_column('products', 'average_rating')
    op.drop_column('products', 'conversion_rate')
    op.drop_column('products', 'view_count')
    op.drop_column('products', 'product_type')
    op.drop_column('products', 'social_share_description')
    op.drop_column('products', 'social_share_title')
    op.drop_column('products', 'search_keywords')
    op.drop_column('products', 'meta_description')
    op.drop_column('products', 'meta_title')
    op.drop_column('products', 'available_in_store')
    op.drop_column('products', 'available_online')
    op.drop_column('products', 'searchable')
    op.drop_column('products', 'status')
    op.drop_column('products', 'image_alt_texts')
    op.drop_column('products', 'video_url')
    op.drop_column('products', 'featured_image')
    op.drop_column('products', 'care_instructions')
    op.drop_column('products', 'gemstones')
    op.drop_column('products', 'materials')
    op.drop_column('products', 'dimensions')
    op.drop_column('products', 'weight')
    op.drop_column('products', 'low_stock_threshold')
    op.drop_column('products', 'track_inventory')
    op.drop_column('products', 'inventory_policy')
    op.drop_column('products', 'collection_id')
    op.drop_column('products', 'category_id')
    op.drop_column('products', 'cost_price')
    op.drop_column('products', 'compare_at_price')
    op.drop_column('products', 'short_description')
    op.drop_column('products', 'slug')
    op.drop_column('products', 'sku')
    
    # Drop junction table
    op.drop_table('product_collections')
    
    # Drop collections table
    op.drop_index('idx_collection_campaign', table_name='collections')
    op.drop_index('idx_collection_type_active', table_name='collections')
    op.drop_index('idx_collection_featured_active', table_name='collections')
    op.drop_index(op.f('ix_collections_slug'), table_name='collections')
    op.drop_index(op.f('ix_collections_name'), table_name='collections')
    op.drop_index(op.f('ix_collections_id'), table_name='collections')
    op.drop_table('collections')
    
    # Drop categories table
    op.drop_index('idx_category_hierarchy', table_name='categories')
    op.drop_index('idx_category_featured_active', table_name='categories')
    op.drop_index('idx_category_parent_active', table_name='categories')
    op.drop_index(op.f('ix_categories_parent_id'), table_name='categories')
    op.drop_index(op.f('ix_categories_slug'), table_name='categories')
    op.drop_index(op.f('ix_categories_name'), table_name='categories')
    op.drop_index(op.f('ix_categories_id'), table_name='categories')
    op.drop_table('categories')
