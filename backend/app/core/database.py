from collections.abc import Generator

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    pass


engine: Engine | None = (
    create_engine(settings.database_url, pool_pre_ping=True)
    if settings.database_url
    else None
)

SessionLocal = sessionmaker(
    class_=Session,
    autoflush=False,
    autocommit=False,
)


def get_db() -> Generator[Session, None, None]:
    if engine is None:
        raise RuntimeError(
            "DATABASE_URL is not configured. Set it before using the database."
        )

    db = SessionLocal(bind=engine)
    try:
        yield db
    finally:
        db.close()
