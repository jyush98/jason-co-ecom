"""add notification settings

Revision ID: 5f403194546a
Revises: 361c41754873
Create Date: 2025-07-24 13:56:28.532840

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '5f403194546a'
down_revision: Union[str, None] = '361c41754873'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create notification_preferences table
    op.create_table(
        'notification_preferences',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('email_notifications', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('marketing_notifications', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('account_notifications', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('sms_notifications', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('notification_frequency', sa.String(length=20), nullable=False),
        sa.Column('quiet_hours', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', name='uq_notification_preferences_user_id')
    )
    
    # Create indexes for performance
    op.create_index('idx_notification_preferences_user_id', 'notification_preferences', ['user_id'])
    op.create_index('idx_notification_preferences_frequency', 'notification_preferences', ['notification_frequency'])

def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_notification_preferences_frequency', table_name='notification_preferences')
    op.drop_index('idx_notification_preferences_user_id', table_name='notification_preferences')
    
    # Drop table
    op.drop_table('notification_preferences')