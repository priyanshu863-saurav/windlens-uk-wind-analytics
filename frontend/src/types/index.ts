export interface MatchedInterval {
  start_time: string;
  settlement_date: string;
  settlement_period?: number | null;
  actual_mw?: number | null;
  forecast_mw?: number | null;
  error_mw?: number | null;
  absolute_error_mw?: number | null;
  forecast_publish_time?: string | null;
  cutoff_time: string;
  is_matched: boolean;
}

export interface DailyMetric {
  date: string;
  mae_mw?: number | null;
  rmse_mw?: number | null;
  mean_signed_error_mw?: number | null;
  actual_avg_mw?: number | null;
  forecast_avg_mw?: number | null;
  matched_count: number;
  expected_count: number;
  coverage_percent: number;
}

export interface MetricSummary {
  mae_mw: number;
  rmse_mw: number;
  mean_signed_error_mw: number;
  matched_intervals: number;
  total_expected_intervals: number;
  coverage_percent: number;
  date_range_start: string;
  date_range_end: string;
  cutoff_hour_utc: number;
  cutoff_rule_description: string;
  daily_metrics: DailyMetric[];
}

export interface GenerationSeriesResponse {
  intervals: MatchedInterval[];
  total_records: number;
  unit: string;
  time_zone: string;
}

export interface DataQualityReport {
  total_actual_records: number;
  total_forecast_records: number;
  matched_intervals: number;
  missing_actual_intervals: number;
  missing_forecast_intervals: number;
  coverage_percent: number;
  api_status: string;
  data_source_actual: string;
  data_source_forecast: string;
  last_fetched_utc: string;
  notes: string[];
}

export interface HealthResponse {
  status: string;
  environment: string;
  timestamp: string;
}
