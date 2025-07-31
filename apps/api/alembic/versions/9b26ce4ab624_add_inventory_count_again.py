"""add inventory count again

Revision ID: 9b26ce4ab624
Revises: 425685c12d7d
Create Date: 2025-07-31 14:58:34.431868

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9b26ce4ab624'
down_revision: Union[str, None] = '425685c12d7d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('products', sa.Column('inventory_count', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('products', 'inventory_count')
