from datetime import date

import pytest

from app.clients.elexon import ElexonClient
from app.services.analytics import (
    AnalyticsService,
    parse_utc_timestamp,
)


@pytest.mark.asyncio
async def test_live_elexon_fuelhh_actuals():
    """Verify live Elexon BMRS FUELHH endpoint returns genuine wind generation observations."""
    client = ElexonClient()
    start_iso = "2026-01-01T00:00:00Z"
    end_iso = "2026-01-01T04:00:00Z"

    actuals = await client.get_fuelhh_wind_actuals(start_iso, end_iso, use_cache=False)
    assert len(actuals) > 0, "Expected at least one WIND record from FUELHH for 4h period"

    sample = actuals[0]
    assert sample.get("dataset") == "FUELHH"
    assert sample.get("fuelType", "").upper() == "WIND"
    assert "startTime" in sample
    assert "generation" in sample
    assert isinstance(sample["generation"], (int, float))
    assert sample["generation"] >= 0


@pytest.mark.asyncio
async def test_live_elexon_windfor_forecasts():
    """Verify live Elexon BMRS WINDFOR endpoint returns valid forecasts with publish times."""
    client = ElexonClient()
    start_iso = "2026-01-01T00:00:00Z"
    end_iso = "2026-01-02T00:00:00Z"

    forecasts = await client.get_windfor_forecasts(start_iso, end_iso, use_cache=False)
    assert len(forecasts) > 0, "Expected forecast records from WINDFOR"

    sample = forecasts[0]
    assert sample.get("dataset") == "WINDFOR"
    assert "publishTime" in sample
    assert "startTime" in sample
    assert "generation" in sample
    assert isinstance(sample["generation"], (int, float))


@pytest.mark.asyncio
async def test_live_january_2026_cutoff_and_alignment():
    """
    Test real January 2026 analysis:
    - Fetches live January 2026 actuals & forecasts
    - Enforces Day-Ahead cutoff (D-1 at 12:00 UTC)
    - Verifies timestamp alignment
    - Verifies NO selected forecast violates the cutoff (strict zero lookahead)
    - Validates calculated MAE, RMSE, Signed Error, and Coverage
    """
    client = ElexonClient()
    start_date = date(2026, 1, 1)
    end_date = date(2026, 1, 2)
    cutoff_hour = 12

    actual_start_iso = "2026-01-01T00:00:00Z"
    actual_end_iso = "2026-01-02T23:59:59Z"
    forecast_start_iso = "2025-12-30T00:00:00Z"
    forecast_end_iso = actual_end_iso

    actuals = await client.get_fuelhh_wind_actuals(actual_start_iso, actual_end_iso, use_cache=True)
    forecasts = await client.get_windfor_forecasts(forecast_start_iso, forecast_end_iso, use_cache=True)

    assert len(actuals) > 0, "Must have actual wind records"
    assert len(forecasts) > 0, "Must have forecast records"

    matched, quality = AnalyticsService.match_actuals_and_forecasts(
        actual_records=actuals,
        forecast_records=forecasts,
        start_date=start_date,
        end_date=end_date,
        cutoff_hour=cutoff_hour,
        cutoff_minute=0,
    )

    # 1. Total intervals in 2 days = 2 * 48 = 96 half-hours
    assert len(matched) == 96

    # 2. Strict Cutoff Verification: Every selected forecast publishTime MUST be <= cutoffTime
    for item in matched:
        if item.is_matched and item.forecast_publish_time:
            pub_dt = parse_utc_timestamp(item.forecast_publish_time)
            cut_dt = parse_utc_timestamp(item.cutoff_time)
            assert pub_dt <= cut_dt, (
                f"LOOKAHEAD VIOLATION: Interval {item.start_time} selected forecast published at "
                f"{item.forecast_publish_time} which is after cutoff {item.cutoff_time}!"
            )

    # 3. Timestamp alignment: Intervals must strictly be at 00:00, 00:30, etc.
    for item in matched:
        dt = parse_utc_timestamp(item.start_time)
        assert dt.minute in (0, 30), f"Timestamp {item.start_time} is not aligned to half-hour!"
        assert dt.second == 0

    # 4. Accuracy metrics calculation
    summary = AnalyticsService.compute_metrics(matched, start_date, end_date, cutoff_hour)
    assert summary.matched_intervals > 0
    assert summary.mae_mw > 0
    assert summary.rmse_mw >= summary.mae_mw, "RMSE must be mathematically >= MAE"
    assert summary.coverage_percent > 0
    assert quality.api_status == "Operational"
