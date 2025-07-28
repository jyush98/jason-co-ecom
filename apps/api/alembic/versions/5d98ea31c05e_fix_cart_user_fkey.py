"""fix_cart_user_fkey

Revision ID: 5d98ea31c05e
Revises: 5f403194546a
Create Date: 2025-07-28 12:20:38.777953

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text


# revision identifiers, used by Alembic.
revision: str = '5d98ea31c05e'
down_revision: Union[str, None] = '5f403194546a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Migrate cart_items.user_id from String(clerk_id) to Integer(users.id)
    This is a data migration that preserves existing cart items.
    """
    
    # Create a connection for raw SQL execution
    connection = op.get_bind()
    
    # Step 1: Add temporary column for new user_id (integer)
    op.add_column('cart_items', sa.Column('user_id_new', sa.Integer(), nullable=True))
    
    # Step 2: Populate the new column with correct user.id values
    # This maps clerk_id -> user.id for existing cart items
    connection.execute(text("""
        UPDATE cart_items 
        SET user_id_new = users.id 
        FROM users 
        WHERE cart_items.user_id = users.clerk_id
    """))
    
    # Step 3: Verify all cart items were successfully mapped
    result = connection.execute(text("""
        SELECT 
            COUNT(*) as total,
            COUNT(user_id_new) as mapped
        FROM cart_items
    """)).fetchone()
    
    print(f"✅ Cart Migration: {result.mapped}/{result.total} items successfully mapped")
    
    # Step 4: Check for any unmapped items (should be 0)
    unmapped = connection.execute(text("""
        SELECT COUNT(*) as unmapped 
        FROM cart_items 
        WHERE user_id_new IS NULL
    """)).fetchone()
    
    if unmapped.unmapped > 0:
        print(f"⚠️  WARNING: {unmapped.unmapped} cart items could not be mapped!")
        print("These items will be deleted. Run this query to see them:")
        print("SELECT * FROM cart_items WHERE user_id_new IS NULL;")
        
        # Delete unmapped items (orphaned cart items)
        connection.execute(text("DELETE FROM cart_items WHERE user_id_new IS NULL"))
    
    # Step 5: Drop the old foreign key constraint
    op.drop_constraint('cart_items_user_id_fkey', 'cart_items', type_='foreignkey')
    
    # Step 6: Drop the old user_id column
    op.drop_column('cart_items', 'user_id')
    
    # Step 7: Rename new column to user_id
    op.alter_column('cart_items', 'user_id_new', new_column_name='user_id')
    
    # Step 8: Make the column NOT NULL (all items should be mapped now)
    op.alter_column('cart_items', 'user_id', nullable=False)
    
    # Step 9: Create new foreign key constraint to users.id
    op.create_foreign_key(
        'cart_items_user_id_fkey', 
        'cart_items', 
        'users', 
        ['user_id'], 
        ['id']
    )
    
    # Step 10: Add index for performance
    op.create_index('idx_cart_items_user_id', 'cart_items', ['user_id'])
    
    print("✅ CartItem foreign key migration completed successfully!")


def downgrade() -> None:
    """
    Rollback the migration (convert back to clerk_id foreign key)
    WARNING: This is complex and may lose data if clerk_ids have changed!
    """
    
    connection = op.get_bind()
    
    # Step 1: Add temporary column for clerk_id
    op.add_column('cart_items', sa.Column('user_id_old', sa.String(), nullable=True))
    
    # Step 2: Populate with clerk_id values
    connection.execute(text("""
        UPDATE cart_items 
        SET user_id_old = users.clerk_id 
        FROM users 
        WHERE cart_items.user_id = users.id
    """))
    
    # Step 3: Drop current foreign key and index
    op.drop_constraint('cart_items_user_id_fkey', 'cart_items', type_='foreignkey')
    op.drop_index('idx_cart_items_user_id', 'cart_items')
    
    # Step 4: Drop current user_id column
    op.drop_column('cart_items', 'user_id')
    
    # Step 5: Rename old column back
    op.alter_column('cart_items', 'user_id_old', new_column_name='user_id')
    
    # Step 6: Make NOT NULL
    op.alter_column('cart_items', 'user_id', nullable=False)
    
    # Step 7: Recreate old foreign key to users.clerk_id
    op.create_foreign_key(
        'cart_items_user_id_fkey', 
        'cart_items', 
        'users', 
        ['user_id'], 
        ['clerk_id']
    )
    
    print("⚠️  CartItem foreign key migration rolled back!")
