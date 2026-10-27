import logging
from datetime import UTC, date, datetime

from fastapi import APIRouter, HTTPException, Query

from app.clients.elexon import ElexonClient
from app.core.config import settings
from app.schemas.models import (
    DataQualityReport,
    GenerationSeriesResponse,
    HealthResponse,
    MetricSummary,
)
from app.services.analytics import AnalyticsService

logger = logging.getLogger(__name__)
router = APIRouter()
elexon_client = ElexonClient()

DEFAULT_START = date(2026, 1, 1)
DEFAULT_END = date(2026, 1, 31)


async def get_aligned_data(
    start_date: date, end_date: date, cutoff_hour: int, use_cache: bool = True
):
    """
    Helper to fetch actuals and forecasts from Elexon and run matching pipeline.
    """
    if start_date > end_date:
        raise HTTPException(
            status_code=400, detail="start_date must be on or before end_date"
        )

    # Day-Ahead decisions for start_date need forecasts published from start_date - 2 days
    # (to ensure we capture all relevant day-ahead publications)
    # Query ranges in ISO format
    start_iso = f"{start_date.isoformat()}T00:00:00Z"
    end_iso = f"{end_date.isoformat()}T23:59:59Z"

    # For forecast publishTime, Day-Ahead 12:00 for Jan 1 would have been published on Dec 31
    forecast_start_iso = "2025-12-30T00:00:00Z"
    forecast_end_iso = end_iso

    try:
        actuals = await elexon_client.get_fuelhh_wind_actuals(
            start_iso, end_iso, use_cache=use_cache
        )
        forecasts = await elexon_client.get_windfor_forecasts(
            forecast_start_iso, forecast_end_iso, use_cache=use_cache
        )
    except Exception as e:
        logger.error(f"Failed to fetch data from Elexon: {e}")
        raise HTTPException(
            status_code=502, detail=f"Failed to fetch Elexon BMRS data: {e!s}"
        ) from e

    matched_intervals, quality_report = AnalyticsService.match_actuals_and_forecasts(
        actual_records=actuals,
        forecast_records=forecasts,
        start_date=start_date,
        end_date=end_date,
        cutoff_hour=cutoff_hour,
        cutoff_minute=0,
    )

    return matched_intervals, quality_report


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint confirming API availability and operational environment."""
    return HealthResponse(
        status="ok",
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(UTC).isoformat(),
    )


@router.get("/api/summary", response_model=MetricSummary, tags=["Analytics"])
async def get_summary(
    start_date: date = Query(
        DEFAULT_START, description="Analysis window start date (YYYY-MM-DD)"
    ),
    end_date: date = Query(
        DEFAULT_END, description="Analysis window end date (YYYY-MM-DD)"
    ),
    cutoff_hour: int = Query(
        settings.DEFAULT_DECISION_CUTOFF_HOUR,
        ge=0,
        le=23,
        description="Day-Ahead purchasing decision cutoff hour in UTC (0-23)",
    ),
    use_cache: bool = Query(True, description="Use disk cached data if available"),
):
    """
    Calculate high-level KPIs: MAE, RMSE, Mean Signed Error, Sample Count, Coverage %,
    and daily aggregations for the selected date range and cutoff.
    """
    matched_intervals, _ = await get_aligned_data(
        start_date, end_date, cutoff_hour, use_cache
    )
    summary = AnalyticsService.compute_metrics(
        matched_intervals, start_date, end_date, cutoff_hour
    )
    return summary


@router.get(
    "/api/generation", response_model=GenerationSeriesResponse, tags=["Analytics"]
)
async def get_generation_series(
    start_date: date = Query(
        DEFAULT_START, description="Analysis window start date (YYYY-MM-DD)"
    ),
    end_date: date = Query(
        DEFAULT_END, description="Analysis window end date (YYYY-MM-DD)"
    ),
    cutoff_hour: int = Query(
        settings.DEFAULT_DECISION_CUTOFF_HOUR,
        ge=0,
        le=23,
        description="Day-Ahead purchasing decision cutoff hour in UTC (0-23)",
    ),
    use_cache: bool = Query(True, description="Use disk cached data if available"),
):
    """
    Retrieve full 30-minute time-series of actual wind generation vs the eligible forecast
    available at the purchasing decision cutoff.
    """
    matched_intervals, _ = await get_aligned_data(
        start_date, end_date, cutoff_hour, use_cache
    )
    return GenerationSeriesResponse(
        intervals=matched_intervals,
        total_records=len(matched_intervals),
        unit="MW",
        time_zone="UTC",
    )


@router.get("/api/accuracy", response_model=MetricSummary, tags=["Analytics"])
async def get_accuracy(
    start_date: date = Query(DEFAULT_START),
    end_date: date = Query(DEFAULT_END),
    cutoff_hour: int = Query(settings.DEFAULT_DECISION_CUTOFF_HOUR, ge=0, le=23),
    use_cache: bool = Query(True),
):
    """
    Accuracy metrics alias returning statistical metrics and daily error distributions.
    """
    matched_intervals, _ = await get_aligned_data(
        start_date, end_date, cutoff_hour, use_cache
    )
    return AnalyticsService.compute_metrics(
        matched_intervals, start_date, end_date, cutoff_hour
    )


@router.get(
    "/api/data-quality", response_model=DataQualityReport, tags=["Data Quality"]
)
async def get_data_quality(
    start_date: date = Query(DEFAULT_START),
    end_date: date = Query(DEFAULT_END),
    cutoff_hour: int = Query(settings.DEFAULT_DECISION_CUTOFF_HOUR, ge=0, le=23),
    use_cache: bool = Query(True),
):
    """
    Audit data completeness, missing actuals, missing forecasts, and live API status.
    """
    _, quality_report = await get_aligned_data(
        start_date, end_date, cutoff_hour, use_cache
    )
    return quality_report
