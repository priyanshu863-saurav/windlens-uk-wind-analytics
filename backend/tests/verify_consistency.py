import asyncio
from datetime import date

from app.clients.elexon import ElexonClient
from app.services.analytics import AnalyticsService, parse_utc_timestamp


async def audit_consistency():
    client = ElexonClient()
    start_date = date(2026, 1, 1)
    end_date = date(2026, 1, 31)
    cutoff_hour = 12

    actuals = await client.get_fuelhh_wind_actuals("2026-01-01T00:00:00Z", "2026-01-31T23:59:59Z", use_cache=True)
    forecasts = await client.get_windfor_forecasts("2025-12-30T00:00:00Z", "2026-01-31T23:59:59Z", use_cache=True)

    matched, quality = AnalyticsService.match_actuals_and_forecasts(
        actual_records=actuals,
        forecast_records=forecasts,
        start_date=start_date,
        end_date=end_date,
        cutoff_hour=cutoff_hour,
        cutoff_minute=0,
    )
    summary = AnalyticsService.compute_metrics(matched, start_date, end_date, cutoff_hour)

    print("=== DATA CONSISTENCY AUDIT REPORT ===")
    print(f"Total intervals in timeline: {len(matched)}")

    # 1. Check matched intervals
    matched_items = [m for m in matched if m.is_matched]
    unmatched_items = [m for m in matched if not m.is_matched]
    print(f"Matched intervals (is_matched=True): {len(matched_items)}")
    print(f"Unmatched intervals (is_matched=False): {len(unmatched_items)}")

    assert len(matched_items) == quality.matched_intervals == summary.matched_intervals
    print("[OK] INVARIANT 1: Matched count is identical across timeline, quality report, and summary metrics.")

    # 2. Check that all matched intervals have both actual_mw and forecast_mw
    for m in matched_items:
        assert m.actual_mw is not None, f"Matched interval {m.start_time} has None actual_mw"
        assert m.forecast_mw is not None, f"Matched interval {m.start_time} has None forecast_mw"
        assert m.error_mw is not None, f"Matched interval {m.start_time} has None error_mw"
        assert m.error_mw == round(m.forecast_mw - m.actual_mw, 2)
    print("[OK] INVARIANT 2: Every matched interval contains valid actual, forecast, and error.")

    # 3. Check unmatched intervals
    for m in unmatched_items:
        assert m.forecast_mw is None or m.actual_mw is None
        assert m.error_mw is None, f"Unmatched interval {m.start_time} has an error value!"
    print("[OK] INVARIANT 3: Every unmatched interval has error_mw=None (no silent calculation).")

    # 4. Check hourly vs half-hourly breakdown
    on_the_hour = [m for m in matched if parse_utc_timestamp(m.start_time).minute == 0]
    half_past = [m for m in matched if parse_utc_timestamp(m.start_time).minute == 30]

    matched_on_the_hour = [m for m in on_the_hour if m.is_matched]
    matched_half_past = [m for m in half_past if m.is_matched]

    print(f"Total on-the-hour (:00) intervals: {len(on_the_hour)}, Matched: {len(matched_on_the_hour)}")
    print(f"Total half-past (:30) intervals: {len(half_past)}, Matched: {len(matched_half_past)}")

    assert len(matched_on_the_hour) == 744
    assert len(matched_half_past) == 0
    print(
        "[OK] INVARIANT 4: 100% of :00 intervals are matched (744/744). "
        "0% of :30 intervals have forecasts because WINDFOR is published hourly."
    )

    # 5. Check daily metrics sum
    daily_matched_sum = sum(d.matched_count for d in summary.daily_metrics)
    assert daily_matched_sum == len(matched_items)
    print(
        f"[OK] INVARIANT 5: Daily matched count sum ({daily_matched_sum}) "
        f"equals total matched count ({len(matched_items)})."
    )

    # 6. Check duplicates in timeline
    timestamps = [m.start_time for m in matched]
    assert len(timestamps) == len(set(timestamps)), "Duplicate timestamps found!"
    print(f"[OK] INVARIANT 6: Zero duplicate timestamps in timeline ({len(timestamps)} unique).")

    print("\n=== ALL INVARIANTS VERIFIED MATHEMATICALLY ===")


if __name__ == "__main__":
    asyncio.run(audit_consistency())
