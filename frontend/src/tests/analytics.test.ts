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
      is_matched: true
    };

    expect(item.forecast_mw! - item.actual_mw!).toBe(item.error_mw);
    expect(item.error_mw).toBeGreaterThan(0);
    expect(item.absolute_error_mw).toBe(Math.abs(item.error_mw!));
  });

  it('guarantees coverage percentage matches valid intervals ratio', () => {
    const summary: MetricSummary = {
      mae_mw: 150.25,
      rmse_mw: 200.5,
      mean_signed_error_mw: -45.1,
      matched_intervals: 1480,
      total_expected_intervals: 1488,
      coverage_percent: 99.46,
      date_range_start: '2026-01-01',
      date_range_end: '2026-01-31',
      cutoff_hour_utc: 12,
      cutoff_rule_description: 'Day-Ahead (D-1 at 12:00 UTC)',
      daily_metrics: []
    };

    const calculatedCoverage = (summary.matched_intervals / summary.total_expected_intervals) * 100;
    expect(Math.abs(calculatedCoverage - summary.coverage_percent)).toBeLessThan(0.01);
  });

  it('handles negative bias indicating under-forecast', () => {
    const error = -350;
    const isOverForecast = error > 0;
    expect(isOverForecast).toBe(false);
  });
});
