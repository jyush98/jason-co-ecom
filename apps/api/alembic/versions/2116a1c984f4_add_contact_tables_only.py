"""Add contact tables only

Revision ID: 2116a1c984f4
Revises: 1da41e0fbbbf
Create Date: 2025-08-05 19:38:45.876387

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '2116a1c984f4'
down_revision: Union[str, None] = '1da41e0fbbbf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create contact_inquiries table
    op.create_table('contact_inquiries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('company', sa.String(length=255), nullable=True),
        sa.Column('subject', sa.String(length=100), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('budget_range', sa.String(length=50), nullable=True),
        sa.Column('timeline', sa.String(length=50), nullable=True),
        sa.Column('preferred_location', sa.String(length=100), nullable=True),
        sa.Column('preferred_contact', sa.JSON(), nullable=True),
        sa.Column('source', sa.String(length=50), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('assigned_to', sa.String(length=255), nullable=True),
        sa.Column('response_sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_contact_inquiries_id'), 'contact_inquiries', ['id'], unique=False)

    # Create consultation_bookings table
    op.create_table('consultation_bookings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('consultation_type', sa.String(length=50), nullable=False),
        sa.Column('preferred_date', sa.DateTime(), nullable=True),
        sa.Column('alternative_dates', sa.JSON(), nullable=True),
        sa.Column('duration_requested', sa.Integer(), nullable=True),
        sa.Column('project_description', sa.Text(), nullable=True),
        sa.Column('budget_range', sa.String(length=50), nullable=True),
        sa.Column('timeline', sa.String(length=50), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('confirmed_date', sa.DateTime(), nullable=True),
        sa.Column('meeting_link', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_consultation_bookings_id'), 'consultation_bookings', ['id'], unique=False)

    # Create location_notifications table
    op.create_table('location_notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('location_id', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('notified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_location_notifications_id'), 'location_notifications', ['id'], unique=False)


def downgrade() -> None:
    # Drop contact tables
    op.drop_index(op.f('ix_location_notifications_id'), table_name='location_notifications')
    op.drop_table('location_notifications')
    
    op.drop_index(op.f('ix_consultation_bookings_id'), table_name='consultation_bookings')
    op.drop_table('consultation_bookings')
    
    op.drop_index(op.f('ix_contact_inquiries_id'), table_name='contact_inquiries')
    op.drop_table('contact_inquiries')
