import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("windlens")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("WindLens API starting up...")
    logger.info(f"Target Elexon Base URL: {settings.ELEXON_BASE_URL}")
    yield
    logger.info("WindLens API shutting down...")


app = FastAPI(
    title="WindLens — UK Wind Generation Forecast Analytics API",
    description=(
        "Production-grade backend for evaluating day-ahead UK wind generation forecasts "
        "against Elexon BMRS actual outturn for January 2026 wholesale market decisions."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
origins = settings.cors_origin_list
origin_regex = settings.CORS_ORIGIN_REGEX if settings.CORS_ORIGIN_REGEX else None
logger.info(f"Configuring CORS for origins: {origins}, regex: {origin_regex}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_origin_regex=origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
