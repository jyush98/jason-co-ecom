"""add inventory count

Revision ID: 425685c12d7d
Revises: 5d98ea31c05e
Create Date: 2025-07-31 14:51:51.134285

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '425685c12d7d'
down_revision: Union[str, None] = '5d98ea31c05e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
