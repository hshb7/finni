import os
from collections.abc import Generator

from dotenv import load_dotenv
from sqlmodel import Session, create_engine

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]

# Tuned for serverless (Vercel): small pool since each function instance
# is short-lived. Supabase transaction pooler (port 6543) handles
# server-side multiplexing.
engine = create_engine(
    DATABASE_URL,
    pool_size=1,
    max_overflow=2,
    pool_pre_ping=True,
    pool_recycle=300,
)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
