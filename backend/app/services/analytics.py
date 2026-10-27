from datetime import datetime, date, time, timedelta, timezone
from typing import Dict, List, Optional, Tuple
import math
import pandas as pd
import numpy as np

from app.schemas.models import (
    MatchedInterval,
    MetricSummary,
    DailyMetric,
    DataQualityReport,
    GenerationSeriesResponse,
)

def parse_utc_timestamp(ts_str: str) -> datetime:
    """Safely parse ISO 8601 timestamp and ensure it has UTC timezone."""
    dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
    return dt

def calculate_decision_cutoff(
    target_dt: datetime,
    cutoff_hour: int = 12,
    cutoff_minute: int = 0
) -> datetime:
    """
    Day-Ahead decision cutoff calculation.
    For a target delivery interval on delivery day D,
    the purchasing decision is made on day D - 1 at the specified cutoff time (UTC).
    """
    delivery_date = target_dt.date()
    decision_date = delivery_date - timedelta(days=1)
    return datetime(
        decision_date.year,
        decision_date.month,
        decision_date.day,
        cutoff_hour,
        cutoff_minute,
        0,
        tzinfo=timezone.utc
    )

class AnalyticsService:
    @staticmethod
    def match_actuals_and_forecasts(
        actual_records: List[Dict],
        forecast_records: List[Dict],
        start_date: date,
        end_date: date,
        cutoff_hour: int = 12,
        cutoff_minute: int = 0
    ) -> Tuple[List[MatchedInterval], DataQualityReport]:
        """
        Match actual wind generation with the latest forecast published
        strictly on or before the day-ahead decision cutoff.
        """
        # 1. Index actual generation by normalized UTC startTime string
        actual_map: Dict[str, Dict] = {}
        for rec in actual_records:
            st = rec.get("startTime")
            if not st:
                continue
            dt_st = parse_utc_timestamp(st)
            # Only index if within target date range
            if start_date <= dt_st.date() <= end_date:
                iso_key = dt_st.isoformat()
                # Deduplicate if duplicate interval appears: take latest published
                if iso_key not in actual_map:
                    actual_map[iso_key] = rec
                else:
                    curr_pub = actual_map[iso_key].get("publishTime", "")
                    new_pub = rec.get("publishTime", "")
                    if new_pub > curr_pub:
                        actual_map[iso_key] = rec

        # 2. Group forecasts by target delivery startTime
        forecast_by_start: Dict[str, List[Dict]] = {}
        for rec in forecast_records:
            st = rec.get("startTime")
            if not st:
                continue
            dt_st = parse_utc_timestamp(st)
            if start_date <= dt_st.date() <= end_date:
                iso_key = dt_st.isoformat()
                if iso_key not in forecast_by_start:
                    forecast_by_start[iso_key] = []
                forecast_by_start[iso_key].append(rec)

        # 3. Generate all expected half-hour intervals in the window
        matched_intervals: List[MatchedInterval] = []
        curr_dt = datetime(start_date.year, start_date.month, start_date.day, 0, 0, 0, tzinfo=timezone.utc)
        end_dt = datetime(end_date.year, end_date.month, end_date.day, 23, 30, 0, tzinfo=timezone.utc)

        total_expected = 0
        matched_count = 0
        missing_actual_count = 0
        missing_forecast_count = 0

        while curr_dt <= end_dt:
            total_expected += 1
            iso_key = curr_dt.isoformat()
            settlement_d_str = curr_dt.date().isoformat()
            
            # Day-ahead purchasing cutoff for this interval
            cutoff_dt = calculate_decision_cutoff(curr_dt, cutoff_hour, cutoff_minute)
            cutoff_iso = cutoff_dt.isoformat()

            # Find actual
            actual_rec = actual_map.get(iso_key)
            actual_mw = float(actual_rec["generation"]) if actual_rec and "generation" in actual_rec else None
            settlement_period = actual_rec.get("settlementPeriod") if actual_rec else None

            # Find eligible forecasts: published <= cutoff_dt
            candidate_forecasts = forecast_by_start.get(iso_key, [])
            eligible = []
            for f in candidate_forecasts:
                pub_str = f.get("publishTime")
                if pub_str:
                    pub_dt = parse_utc_timestamp(pub_str)
                    if pub_dt <= cutoff_dt:
                        eligible.append((pub_dt, f))

            selected_forecast = None
            if eligible:
                # Pick the latest publication on or before cutoff
                eligible.sort(key=lambda x: x[0], reverse=True)
                selected_forecast = eligible[0][1]

            forecast_mw = float(selected_forecast["generation"]) if selected_forecast and "generation" in selected_forecast else None
            forecast_pub_time = selected_forecast.get("publishTime") if selected_forecast else None

            is_matched = (actual_mw is not None) and (forecast_mw is not None)
            if is_matched:
                matched_count += 1
                error_mw = round(forecast_mw - actual_mw, 2)
                abs_error_mw = round(abs(forecast_mw - actual_mw), 2)
            else:
                error_mw = None
                abs_error_mw = None
                if actual_mw is None:
                    missing_actual_count += 1
                if forecast_mw is None:
                    missing_forecast_count += 1

            matched_intervals.append(
                MatchedInterval(
                    start_time=iso_key,
                    settlement_date=settlement_d_str,
                    settlement_period=settlement_period,
                    actual_mw=actual_mw,
                    forecast_mw=forecast_mw,
                    error_mw=error_mw,
                    absolute_error_mw=abs_error_mw,
                    forecast_publish_time=forecast_pub_time,
                    cutoff_time=cutoff_iso,
                    is_matched=is_matched
                )
            )

            curr_dt += timedelta(minutes=30)

        coverage_pct = round((matched_count / total_expected * 100.0) if total_expected > 0 else 0.0, 2)

        quality_report = DataQualityReport(
            total_actual_records=len(actual_records),
            total_forecast_records=len(forecast_records),
            matched_intervals=matched_count,
            missing_actual_intervals=missing_actual_count,
            missing_forecast_intervals=missing_forecast_count,
            coverage_percent=coverage_pct,
            api_status="Operational",
            last_fetched_utc=datetime.now(timezone.utc).isoformat(),
            notes=[
                f"Evaluated {total_expected} half-hour intervals from {start_date} to {end_date}.",
                f"Cutoff rule: Day-Ahead D-1 at {cutoff_hour:02d}:{cutoff_minute:02d} UTC strictly enforced.",
                "Zero synthetic records injected; genuine Elexon observations only."
            ]
        )

        return matched_intervals, quality_report

    @staticmethod
    def compute_metrics(
        matched_intervals: List[MatchedInterval],
        start_date: date,
        end_date: date,
        cutoff_hour: int = 12
    ) -> MetricSummary:
        """
        Compute overall MAE, RMSE, Mean Signed Error, and daily summaries.
        """
        valid_pairs = [
            (item.actual_mw, item.forecast_mw)
            for item in matched_intervals
            if item.is_matched and item.actual_mw is not None and item.forecast_mw is not None
        ]

        total_expected = len(matched_intervals)
        n = len(valid_pairs)

        if n > 0:
            actuals = np.array([p[0] for p in valid_pairs])
            forecasts = np.array([p[1] for p in valid_pairs])
            errors = forecasts - actuals

            mae = float(np.mean(np.abs(errors)))
            rmse = float(np.sqrt(np.mean(errors ** 2)))
            mean_signed_error = float(np.mean(errors))
        else:
            mae = 0.0
            rmse = 0.0
            mean_signed_error = 0.0

        coverage_pct = round((n / total_expected * 100.0) if total_expected > 0 else 0.0, 2)

        # Compute daily metrics
        df = pd.DataFrame([m.model_dump() for m in matched_intervals])
        daily_metrics: List[DailyMetric] = []

        if not df.empty:
            for d_str, group in df.groupby("settlement_date"):
                matched_grp = group[group["is_matched"] == True]
                grp_n = len(matched_grp)
                exp_n = len(group)

                if grp_n > 0:
                    d_act = matched_grp["actual_mw"].to_numpy()
                    d_fc = matched_grp["forecast_mw"].to_numpy()
                    d_err = d_fc - d_act

                    d_mae = float(round(np.mean(np.abs(d_err)), 2))
                    d_rmse = float(round(np.sqrt(np.mean(d_err ** 2)), 2))
                    d_m_err = float(round(np.mean(d_err), 2))
                    d_act_avg = float(round(np.mean(d_act), 2))
                    d_fc_avg = float(round(np.mean(d_fc), 2))
                else:
                    d_mae = None
                    d_rmse = None
                    d_m_err = None
                    d_act_avg = None
                    d_fc_avg = None

                d_cov = round((grp_n / exp_n * 100.0) if exp_n > 0 else 0.0, 1)

                daily_metrics.append(
                    DailyMetric(
                        date=str(d_str),
                        mae_mw=d_mae,
                        rmse_mw=d_rmse,
                        mean_signed_error_mw=d_m_err,
                        actual_avg_mw=d_act_avg,
                        forecast_avg_mw=d_fc_avg,
                        matched_count=grp_n,
                        expected_count=exp_n,
                        coverage_percent=d_cov
                    )
                )

        daily_metrics.sort(key=lambda x: x.date)

        return MetricSummary(
            mae_mw=round(mae, 2),
            rmse_mw=round(rmse, 2),
            mean_signed_error_mw=round(mean_signed_error, 2),
            matched_intervals=n,
            total_expected_intervals=total_expected,
            coverage_percent=coverage_pct,
            date_range_start=start_date.isoformat(),
            date_range_end=end_date.isoformat(),
            cutoff_hour_utc=cutoff_hour,
            cutoff_rule_description=f"Day-Ahead (D-1 at {cutoff_hour:02d}:00 UTC). Latest published forecast <= cutoff.",
            daily_metrics=daily_metrics
        )
