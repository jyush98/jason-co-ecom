"""enhance custom orders with multi step support

Revision ID: a334ca4b7d12
Revises: 9b26ce4ab624
Create Date: 2025-08-04 13:25:52.326411

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'a334ca4b7d12'
down_revision: Union[str, None] = '9b26ce4ab624'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Add new columns to existing custom_orders table
    op.add_column('custom_orders', sa.Column('project_type', sa.String(), nullable=True))
    op.add_column('custom_orders', sa.Column('style_preference', sa.String(), nullable=True))
    op.add_column('custom_orders', sa.Column('room_type', sa.String(), nullable=True))
    op.add_column('custom_orders', sa.Column('project_description', sa.Text(), nullable=True))
    op.add_column('custom_orders', sa.Column('inspiration_notes', sa.Text(), nullable=True))
    
    # JSON fields for structured data
    op.add_column('custom_orders', sa.Column('dimensions', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('custom_orders', sa.Column('materials', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('custom_orders', sa.Column('color_preferences', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('custom_orders', sa.Column('functionality_needs', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('custom_orders', sa.Column('communication_preferences', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('custom_orders', sa.Column('price_breakdown', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    
    # Specification fields
    op.add_column('custom_orders', sa.Column('special_requirements', sa.Text(), nullable=True))
    
    # Investment fields
    op.add_column('custom_orders', sa.Column('budget_range', sa.String(), nullable=True))
    op.add_column('custom_orders', sa.Column('estimated_price', sa.Float(), nullable=True))
    op.add_column('custom_orders', sa.Column('payment_preference', sa.String(), nullable=True))
    
    # Timeline and contact fields
    op.add_column('custom_orders', sa.Column('timeline_preference', sa.String(), nullable=True))
    op.add_column('custom_orders', sa.Column('target_completion', sa.DateTime(timezone=True), nullable=True))
    op.add_column('custom_orders', sa.Column('delivery_address', sa.Text(), nullable=True))
    op.add_column('custom_orders', sa.Column('delivery_requirements', sa.Text(), nullable=True))
    op.add_column('custom_orders', sa.Column('consultation_preference', sa.String(), nullable=True))
    op.add_column('custom_orders', sa.Column('preferred_contact_time', sa.String(), nullable=True))
    
    # Project management fields
    op.add_column('custom_orders', sa.Column('status', sa.String(), nullable=False, server_default='inquiry'))
    op.add_column('custom_orders', sa.Column('priority', sa.String(), nullable=False, server_default='standard'))
    op.add_column('custom_orders', sa.Column('assigned_designer', sa.String(), nullable=True))
    op.add_column('custom_orders', sa.Column('internal_notes', sa.Text(), nullable=True))
    
    # Metadata fields
    op.add_column('custom_orders', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('custom_orders', sa.Column('last_contact_date', sa.DateTime(timezone=True), nullable=True))
    
    # Form tracking fields
    op.add_column('custom_orders', sa.Column('current_step', sa.Integer(), nullable=False, server_default='1'))
    op.add_column('custom_orders', sa.Column('is_draft', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('custom_orders', sa.Column('form_completion_percentage', sa.Float(), nullable=False, server_default='0.0'))
    
    # Communication consent
    op.add_column('custom_orders', sa.Column('marketing_consent', sa.Boolean(), nullable=False, server_default='false'))
    
    # Create custom_order_images table
    op.create_table('custom_order_images',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('custom_order_id', sa.Integer(), nullable=False),
        sa.Column('image_url', sa.String(), nullable=False),
        sa.Column('image_type', sa.String(), nullable=True),
        sa.Column('caption', sa.String(), nullable=True),
        sa.Column('upload_order', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['custom_order_id'], ['custom_orders.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create custom_order_timeline table
    op.create_table('custom_order_timeline',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('custom_order_id', sa.Integer(), nullable=False),
        sa.Column('milestone', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('estimated_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_by', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['custom_order_id'], ['custom_orders.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create design_consultations table
    op.create_table('design_consultations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('custom_order_id', sa.Integer(), nullable=True),
        sa.Column('client_name', sa.String(), nullable=False),
        sa.Column('client_email', sa.String(), nullable=False),
        sa.Column('client_phone', sa.String(), nullable=True),
        sa.Column('consultation_type', sa.String(), nullable=False),
        sa.Column('consultation_method', sa.String(), nullable=False),
        sa.Column('scheduled_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), nullable=True, server_default='60'),
        sa.Column('status', sa.String(), nullable=False, server_default='scheduled'),
        sa.Column('meeting_link', sa.String(), nullable=True),
        sa.Column('meeting_notes', sa.Text(), nullable=True),
        sa.Column('next_steps', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['custom_order_id'], ['custom_orders.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for better performance
    op.create_index('idx_custom_orders_status', 'custom_orders', ['status'])
    op.create_index('idx_custom_orders_priority', 'custom_orders', ['priority'])
    op.create_index('idx_custom_orders_created_at', 'custom_orders', ['created_at'])
    op.create_index('idx_custom_orders_email', 'custom_orders', ['email'])
    op.create_index('idx_custom_orders_is_draft', 'custom_orders', ['is_draft'])
    op.create_index('idx_custom_order_images_order_id', 'custom_order_images', ['custom_order_id'])
    op.create_index('idx_custom_order_timeline_order_id', 'custom_order_timeline', ['custom_order_id'])
    op.create_index('idx_design_consultations_order_id', 'design_consultations', ['custom_order_id'])
    op.create_index('idx_design_consultations_scheduled_date', 'design_consultations', ['scheduled_date'])


def downgrade():
    # Drop indexes
    op.drop_index('idx_design_consultations_scheduled_date')
    op.drop_index('idx_design_consultations_order_id')
    op.drop_index('idx_custom_order_timeline_order_id')
    op.drop_index('idx_custom_order_images_order_id')
    op.drop_index('idx_custom_orders_is_draft')
    op.drop_index('idx_custom_orders_email')
    op.drop_index('idx_custom_orders_created_at')
    op.drop_index('idx_custom_orders_priority')
    op.drop_index('idx_custom_orders_status')
    
    # Drop new tables
    op.drop_table('design_consultations')
    op.drop_table('custom_order_timeline')
    op.drop_table('custom_order_images')
    
    # Remove new columns from custom_orders table
    op.drop_column('custom_orders', 'marketing_consent')
    op.drop_column('custom_orders', 'form_completion_percentage')
    op.drop_column('custom_orders', 'is_draft')
    op.drop_column('custom_orders', 'current_step')
    op.drop_column('custom_orders', 'last_contact_date')
    op.drop_column('custom_orders', 'updated_at')
    op.drop_column('custom_orders', 'internal_notes')
    op.drop_column('custom_orders', 'assigned_designer')
    op.drop_column('custom_orders', 'priority')
    op.drop_column('custom_orders', 'status')
    op.drop_column('custom_orders', 'preferred_contact_time')
    op.drop_column('custom_orders', 'consultation_preference')
    op.drop_column('custom_orders', 'delivery_requirements')
    op.drop_column('custom_orders', 'delivery_address')
    op.drop_column('custom_orders', 'target_completion')
    op.drop_column('custom_orders', 'timeline_preference')
    op.drop_column('custom_orders', 'payment_preference')
    op.drop_column('custom_orders', 'estimated_price')
    op.drop_column('custom_orders', 'budget_range')
    op.drop_column('custom_orders', 'special_requirements')
    op.drop_column('custom_orders', 'price_breakdown')
    op.drop_column('custom_orders', 'communication_preferences')
    op.drop_column('custom_orders', 'functionality_needs')
    op.drop_column('custom_orders', 'color_preferences')
    op.drop_column('custom_orders', 'materials')
    op.drop_column('custom_orders', 'dimensions')
    op.drop_column('custom_orders', 'inspiration_notes')
    op.drop_column('custom_orders', 'project_description')
    op.drop_column('custom_orders', 'room_type')
    op.drop_column('custom_orders', 'style_preference')
    op.drop_column('custom_orders', 'project_type')
