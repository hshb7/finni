import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_redoc_html, get_swagger_ui_html
from sqlmodel import text

from app.database import engine
from app.routes import (
    appointments,
    immunizations,
    patients,
    pharmacies,
    prescriptions,
    stats,
    visits,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Verify DB connection on startup
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Database connection verified.")
    except Exception as exc:
        print(f"WARNING: Database connection failed: {exc}")
        print("The server will start, but database operations will fail.")
        print("Check DATABASE_URL in server/.env")
    yield


app = FastAPI(
    title="Hshb Health API",
    description="Patient Management Dashboard API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
)


@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=f"{app.title} - Swagger UI",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
    )


@app.get("/redoc", include_in_schema=False)
async def custom_redoc():
    return get_redoc_html(
        openapi_url=app.openapi_url,
        title=f"{app.title} - ReDoc",
        redoc_js_url="https://cdn.jsdelivr.net/npm/redoc@2.1.5/bundles/redoc.standalone.js",
    )

# CORS – allow local dev and production origins
_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://finni-three.vercel.app",
]
_frontend_url = os.getenv("FRONTEND_URL", "")
for url in _frontend_url.split(","):
    url = url.strip()
    if url and url not in _origins:
        _origins.append(url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(patients.router, prefix="/api", tags=["Patients"])
app.include_router(appointments.router, prefix="/api", tags=["Appointments"])
app.include_router(visits.router, prefix="/api", tags=["Visits"])
app.include_router(immunizations.router, prefix="/api", tags=["Immunizations"])
app.include_router(prescriptions.router, prefix="/api", tags=["Prescriptions"])
app.include_router(pharmacies.router, prefix="/api", tags=["Pharmacies"])
app.include_router(stats.router, prefix="/api", tags=["Stats"])


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/seedData", tags=["Seed"])
def seed_data():
    from app.seed import seed_database

    return seed_database()
