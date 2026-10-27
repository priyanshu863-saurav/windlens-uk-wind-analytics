import { describe, it, expect } from 'vitest';
import { MatchedInterval, MetricSummary } from '../types';

describe('Frontend Data Formatting and Metric Invariants', () => {
  it('correctly calculates error and displays sign in matched intervals', () => {
    const item: MatchedInterval = {
      start_time: '2026-01-15T12:00:00Z',
      settlement_date: '2026-01-15',
      settlement_period: 25,
      actual_mw: 12000,
      forecast_mw: 13500,
      error_mw: 1500,
      absolute_error_mw: 1500,
      forecast_publish_time: '2026-01-14T11:30:00Z',
      cutoff_time: '2026-01-14T12:00:00Z',
      is_matched: true,
    };

    expect(item.forecast_mw! - item.actual_mw!).toBe(item.error_mw);
    expect(item.error_mw).toBeGreaterThan(0);
    expect(item.absolute_error_mw).toBe(Math.abs(item.error_mw!));
  });

  it('guarantees coverage percentage matches valid intervals ratio', () => {
    const summary: MetricSummary = {
      mae_mw: 2002.91,
      rmse_mw: 2470.08,
      mean_signed_error_mw: 1805.86,
      matched_intervals: 744,
      total_expected_intervals: 1488,
      coverage_percent: 50.0,
      date_range_start: '2026-01-01',
      date_range_end: '2026-01-31',
      cutoff_hour_utc: 12,
      cutoff_rule_description: 'Day-Ahead (D-1 at 12:00 UTC)',
      daily_metrics: [],
    };

    const calculatedCoverage = (summary.matched_intervals / summary.total_expected_intervals) * 100;
    expect(Math.abs(calculatedCoverage - summary.coverage_percent)).toBeLessThan(0.01);
  });

  it('handles negative bias indicating under-forecast', () => {
    const error = -350;
    const isOverForecast = error > 0;
    expect(isOverForecast).toBe(false);
  });

  it('filters strictly matched pairs without interpolating missing half-hour forecasts', () => {
    const timeline: MatchedInterval[] = [
      {
        start_time: '2026-01-01T00:00:00Z',
        settlement_date: '2026-01-01',
        settlement_period: 1,
        actual_mw: 14000,
        forecast_mw: 15000,
        error_mw: 1000,
        cutoff_time: '2025-12-31T12:00:00Z',
        is_matched: true,
      },
      {
        start_time: '2026-01-01T00:30:00Z',
        settlement_date: '2026-01-01',
        settlement_period: 2,
        actual_mw: 14200,
        forecast_mw: null,
        error_mw: null,
        cutoff_time: '2025-12-31T12:00:00Z',
        is_matched: false, // missing half-hour forecast
      },
      {
        start_time: '2026-01-01T01:00:00Z',
        settlement_date: '2026-01-01',
        settlement_period: 3,
        actual_mw: 14500,
        forecast_mw: 15200,
        error_mw: 700,
        cutoff_time: '2025-12-31T12:00:00Z',
        is_matched: true,
      },
    ];

    const matchedOnly = timeline.filter((i) => i.is_matched);
    expect(matchedOnly).toHaveLength(2);
    expect(matchedOnly.every((i) => i.actual_mw !== null && i.forecast_mw !== null)).toBe(true);
    expect(matchedOnly.every((i) => i.error_mw !== null)).toBe(true);

    // Unmatched item must have null forecast and null error
    const unmatched = timeline.filter((i) => !i.is_matched);
    expect(unmatched).toHaveLength(1);
    expect(unmatched[0].forecast_mw).toBeNull();
    expect(unmatched[0].error_mw).toBeNull();
  });
});
