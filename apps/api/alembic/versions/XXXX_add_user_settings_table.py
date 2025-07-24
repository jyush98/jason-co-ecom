"""Add user_settings table for account settings

Revision ID: add_user_settings_table
Revises: [previous_revision_id]
Create Date: 2024-01-XX XX:XX:XX.XXXXXX

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_user_settings_table'
down_revision = 'b39ea0c1630a'  # Replace with your latest revision ID
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create user_settings table
    op.create_table(
        'user_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('setting_key', sa.String(length=100), nullable=False),
        sa.Column('setting_value', sa.Text(), nullable=True),
        sa.Column('setting_category', sa.String(length=50), nullable=True),
        sa.Column('is_encrypted', sa.String(length=10), nullable=True, default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'setting_key', name='unique_user_setting')
    )
    
    # Create indexes for performance
    op.create_index('idx_user_settings_user_id', 'user_settings', ['user_id'])
    op.create_index('idx_user_settings_setting_key', 'user_settings', ['setting_key'])
    op.create_index('idx_user_settings_category', 'user_settings', ['setting_category'])
    op.create_index('idx_user_settings_user_category', 'user_settings', ['user_id', 'setting_category'])
    op.create_index('idx_user_settings_key_value', 'user_settings', ['setting_key', 'setting_value'])
    
    # Add settings column to users table for backward compatibility (optional)
    # This allows you to keep existing JSON approach while adding the new table
    op.add_column('users', sa.Column('settings', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=True, default=True))
    op.add_column('users', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    
    # Add indexes to users table
    op.create_index('idx_users_is_active', 'users', ['is_active'])
    op.create_index('idx_users_clerk_id', 'users', ['clerk_id'])


def downgrade() -> None:
    # Remove indexes from users table
    op.drop_index('idx_users_clerk_id', table_name='users')
    op.drop_index('idx_users_is_active', table_name='users')
    
    # Remove columns from users table
    op.drop_column('users', 'deleted_at')
    op.drop_column('users', 'is_active')
    op.drop_column('users', 'settings')
    
    # Remove indexes from user_settings table
    op.drop_index('idx_user_settings_key_value', table_name='user_settings')
    op.drop_index('idx_user_settings_user_category', table_name='user_settings')
    op.drop_index('idx_user_settings_category', table_name='user_settings')
    op.drop_index('idx_user_settings_setting_key', table_name='user_settings')
    op.drop_index('idx_user_settings_user_id', table_name='user_settings')
    
    # Drop user_settings table
    op.drop_table('user_settings')