"""add user settings table

Revision ID: 361c41754873
Revises: add_user_settings_table
Create Date: 2025-07-24 13:12:22.697004

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '361c41754873'
down_revision: Union[str, None] = 'add_user_settings_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
