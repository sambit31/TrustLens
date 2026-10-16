import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase

ROOT = Path(__file__).resolve().parents[2]

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{ROOT / 'trustlens.db'}"
)

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False
    } if DATABASE_URL.startswith("sqlite") else {},
)


class Base(DeclarativeBase):
    pass



def init_db():
    # Import the models so their tables are registered before creating them
    from . import models  # noqa: F401

    Base.metadata.create_all(engine)