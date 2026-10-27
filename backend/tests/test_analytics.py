from datetime import UTC, date, datetime

from app.schemas.models import MatchedInterval
from app.services.analytics import (
    AnalyticsService,
    calculate_decision_cutoff,
    parse_utc_timestamp,
)


def test_parse_utc_timestamp():
    dt = parse_utc_timestamp("2026-01-15T12:30:00Z")
    assert dt.year == 2026
    assert dt.month == 1
    assert dt.day == 15
    assert dt.hour == 12
    assert dt.minute == 30
    assert dt.tzinfo == UTC


def test_calculate_decision_cutoff():
    # For target interval on Jan 5 at 14:30 UTC:
    target_dt = datetime(2026, 1, 5, 14, 30, tzinfo=UTC)
    cutoff = calculate_decision_cutoff(target_dt, cutoff_hour=12, cutoff_minute=0)

    # Must be Jan 4 at 12:00 UTC (D-1 at 12:00)
    assert cutoff == datetime(2026, 1, 4, 12, 0, 0, tzinfo=UTC)


def test_forecast_selection_strictly_enforces_cutoff():
    """
    Verify that forecasts published AFTER the day-ahead cutoff are NEVER selected,
    and the latest forecast published ON OR BEFORE the cutoff IS selected.
    """
    target_start = "2026-01-02T10:00:00Z"

    # Decision cutoff for Jan 2 delivery is Jan 1 at 12:00:00 UTC
    actual_records = [
        {
            "startTime": target_start,
            "publishTime": "2026-01-02T10:30:00Z",
            "generation": 5000,
            "settlementPeriod": 20,
        }
    ]

    forecast_records = [
        # Older forecast before cutoff (eligible)
        {
            "startTime": target_start,
            "publishTime": "2026-01-01T09:00:00Z",
            "generation": 4200,
        },
        # Latest forecast before cutoff (eligible & latest)
        {
            "startTime": target_start,
            "publishTime": "2026-01-01T11:59:00Z",
            "generation": 4600,
        },
        # Look-ahead forecast published after cutoff (MUST BE REJECTED)
        {
            "startTime": target_start,
            "publishTime": "2026-01-01T12:05:00Z",
            "generation": 4900,
        },
        {
            "startTime": target_start,
            "publishTime": "2026-01-02T08:00:00Z",
            "generation": 4990,
        },
    ]

    matched, _ = AnalyticsService.match_actuals_and_forecasts(
        actual_records=actual_records,
        forecast_records=forecast_records,
        start_date=date(2026, 1, 2),
        end_date=date(2026, 1, 2),
        cutoff_hour=12,
        cutoff_minute=0,
    )

    interval = next(m for m in matched if m.start_time == "2026-01-02T10:00:00+00:00")
    assert interval.is_matched is True
    assert interval.actual_mw == 5000.0
    # Must pick the 4600 MW forecast published at 11:59, NOT 4900 or 4990 MW
    assert interval.forecast_mw == 4600.0
    assert interval.forecast_publish_time == "2026-01-01T11:59:00Z"
    assert interval.error_mw == -400.0  # 4600 - 5000
    assert interval.absolute_error_mw == 400.0


def test_missing_data_handling():
    """Missing actuals or forecasts must be recorded with null values and not fabricate numbers."""
    target_start = "2026-01-03T00:00:00Z"

    # Only actual is present, no forecast
    actual_records = [
        {"startTime": target_start, "generation": 3000, "settlementPeriod": 1}
    ]
    forecast_records = []

    matched, quality = AnalyticsService.match_actuals_and_forecasts(
        actual_records=actual_records,
        forecast_records=forecast_records,
        start_date=date(2026, 1, 3),
        end_date=date(2026, 1, 3),
        cutoff_hour=12,
    )

    interval = next(m for m in matched if m.start_time == "2026-01-03T00:00:00+00:00")
    assert interval.is_matched is False
    assert interval.actual_mw == 3000.0
    assert interval.forecast_mw is None
    assert interval.error_mw is None
    assert quality.missing_forecast_intervals > 0


def test_metric_calculation_known_vectors():
    """
    Test known vectors:
    Pair 1: Actual = 100, Forecast = 110 (Error = +10, Abs = 10, Sq = 100)
    Pair 2: Actual = 200, Forecast = 180 (Error = -20, Abs = 20, Sq = 400)
    MAE = (10 + 20) / 2 = 15.0
    RMSE = sqrt((100 + 400) / 2) = sqrt(250) = 15.811388... -> 15.81
    Mean Signed Error = (+10 - 20) / 2 = -5.0
    """
    intervals = [
        MatchedInterval(
            start_time="2026-01-01T00:00:00+00:00",
            settlement_date="2026-01-01",
            settlement_period=1,
            actual_mw=100.0,
            forecast_mw=110.0,
            error_mw=10.0,
            absolute_error_mw=10.0,
            forecast_publish_time="2025-12-31T11:00:00Z",
            cutoff_time="2025-12-31T12:00:00+00:00",
            is_matched=True,
        ),
        MatchedInterval(
            start_time="2026-01-01T00:30:00+00:00",
            settlement_date="2026-01-01",
            settlement_period=2,
            actual_mw=200.0,
            forecast_mw=180.0,
            error_mw=-20.0,
            absolute_error_mw=20.0,
            forecast_publish_time="2025-12-31T11:00:00Z",
            cutoff_time="2025-12-31T12:00:00+00:00",
            is_matched=True,
        ),
        # Unmatched interval
        MatchedInterval(
            start_time="2026-01-01T01:00:00+00:00",
            settlement_date="2026-01-01",
            settlement_period=3,
            actual_mw=150.0,
            forecast_mw=None,
            error_mw=None,
            absolute_error_mw=None,
            forecast_publish_time=None,
            cutoff_time="2025-12-31T12:00:00+00:00",
            is_matched=False,
        ),
    ]

    summary = AnalyticsService.compute_metrics(
        matched_intervals=intervals,
        start_date=date(2026, 1, 1),
        end_date=date(2026, 1, 1),
        cutoff_hour=12,
    )

    assert summary.mae_mw == 15.0
    assert summary.rmse_mw == 15.81
    assert summary.mean_signed_error_mw == -5.0
    assert summary.matched_intervals == 2
    assert summary.total_expected_intervals == 3
    assert summary.coverage_percent == 66.67
