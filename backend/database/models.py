from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .connection import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True
    )

    input_type: Mapped[str] = mapped_column(
        String(20),
        index=True
    )

    title: Mapped[str] = mapped_column(
        String(300),
        default=""
    )

    source: Mapped[str] = mapped_column(
        String(2000),
        default=""
    )

    prediction: Mapped[str] = mapped_column(
        String(40),
        index=True
    )

    fake_probability: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    real_probability: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    word_count: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    article_count: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    fake_count: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    real_count: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    uncertain_count: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    text_preview: Mapped[str] = mapped_column(
        Text,
        default=""
    )

    result_json: Mapped[str] = mapped_column(
        Text
    )