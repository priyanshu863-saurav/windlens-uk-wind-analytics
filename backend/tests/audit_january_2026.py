import asyncio
from datetime import date
import json

from app.clients.elexon import ElexonClient
from app.services.analytics import AnalyticsService, parse_utc_timestamp

async def run_full_audit():
    client = ElexonClient()
    start_date = date(2026, 1, 1)
    end_date = date(2026, 1, 31)
    cutoff_hour = 12

    print("[AUDIT] 1. Ingesting January 2026 FUELHH actual wind generation...")
    actuals = await client.get_fuelhh_wind_actuals(
        "2026-01-01T00:00:00Z", "2026-01-31T23:59:59Z", use_cache=True
    )
    print(f"       -> Retrieved {len(actuals)} FUELHH wind records")

    print("[AUDIT] 2. Ingesting WINDFOR forecasts (including D-1 publications)...")
    forecasts = await client.get_windfor_forecasts(
        "2025-12-30T00:00:00Z", "2026-01-31T23:59:59Z", use_cache=True
    )
    print(f"       -> Retrieved {len(forecasts)} WINDFOR forecast candidate records")

    print("[AUDIT] 3. Running Interval Matching & Cutoff Backtesting Engine...")
    matched, quality = AnalyticsService.match_actuals_and_forecasts(
        actual_records=actuals,
        forecast_records=forecasts,
        start_date=start_date,
        end_date=end_date,
        cutoff_hour=cutoff_hour,
        cutoff_minute=0
    )
    print(f"       -> Evaluated {len(matched)} total expected half-hour settlement intervals")
    print(f"       -> Matched intervals: {quality.matched_intervals}")
    print(f"       -> Coverage: {quality.coverage_percent}%")
    print(f"       -> Missing actual intervals: {quality.missing_actual_intervals}")
    print(f"       -> Missing forecast intervals (<= cutoff): {quality.missing_forecast_intervals}")

    print("[AUDIT] 4. Auditing Look-ahead Violation Protection...")
    lookahead_violations = 0
    for item in matched:
        if item.is_matched and item.forecast_publish_time:
            pub_dt = parse_utc_timestamp(item.forecast_publish_time)
            cut_dt = parse_utc_timestamp(item.cutoff_time)
            if pub_dt > cut_dt:
                lookahead_violations += 1

    print(f"       -> Lookahead violations detected: {lookahead_violations} (MUST BE 0)")
    assert lookahead_violations == 0, "CRITICAL: Look-ahead forecast was matched!"

    print("[AUDIT] 5. Auditing Timestamp Alignment...")
    unaligned = 0
    for item in matched:
        dt = parse_utc_timestamp(item.start_time)
        if dt.minute not in (0, 30) or dt.second != 0:
            unaligned += 1
    print(f"       -> Unaligned intervals: {unaligned} (MUST BE 0)")
    assert unaligned == 0, "CRITICAL: Timestamp misalignment detected!"

    print("[AUDIT] 6. Computing Overall Statistical Metrics...")
    summary = AnalyticsService.compute_metrics(matched, start_date, end_date, cutoff_hour)
    print(f"       -> MAE: {summary.mae_mw} MW")
    print(f"       -> RMSE: {summary.rmse_mw} MW")
    print(f"       -> Mean Signed Error (Bias): {summary.mean_signed_error_mw} MW")
    print(f"       -> Daily aggregations recorded: {len(summary.daily_metrics)} days")

    print("[AUDIT] 7. Zero Synthetic Observation Audit...")
    for item in matched:
        if not item.is_matched:
            assert item.actual_mw is None or item.forecast_mw is None, (
                "Unmatched interval contains fabricated values!"
            )
    print("       -> Zero synthetic values confirmed across all missing intervals.")

    print("\n[AUDIT] === ALL 7 AUDIT CRITERIA SATISFIED SUCCESSFULLY ===")

if __name__ == '__main__':
    asyncio.run(run_full_audit())
