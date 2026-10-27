from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    environment: str
    timestamp: str


class MatchedInterval(BaseModel):
    start_time: str = Field(
        ..., description="Settlement start timestamp in UTC (ISO 8601)"
    )
    settlement_date: str = Field(..., description="Settlement date (YYYY-MM-DD)")
    settlement_period: int | None = Field(
        None, description="Settlement period number (1-48/50)"
    )
    actual_mw: float | None = Field(
        None, description="Actual wind generation in MW (FUELHH)"
    )
    forecast_mw: float | None = Field(
        None, description="Selected eligible forecast in MW (WINDFOR)"
    )
    error_mw: float | None = Field(
        None, description="Signed error: Forecast - Actual (MW)"
    )
    absolute_error_mw: float | None = Field(
        None, description="Absolute error: |Forecast - Actual| (MW)"
    )
    forecast_publish_time: str | None = Field(
        None, description="Timestamp when selected forecast was published"
    )
    cutoff_time: str = Field(
        ..., description="Decision cutoff applied for this interval"
    )
    is_matched: bool = Field(
        ..., description="True if both actual and forecast were found"
    )


class DailyMetric(BaseModel):
    date: str
    mae_mw: float | None = None
    rmse_mw: float | None = None
    mean_signed_error_mw: float | None = None
    actual_avg_mw: float | None = None
    forecast_avg_mw: float | None = None
    matched_count: int
    expected_count: int = 48
    coverage_percent: float


class MetricSummary(BaseModel):
    mae_mw: float = Field(..., description="Mean Absolute Error in MW")
    rmse_mw: float = Field(..., description="Root Mean Square Error in MW")
    mean_signed_error_mw: float = Field(
        ..., description="Mean Signed Error: mean(Forecast - Actual) in MW"
    )
    matched_intervals: int = Field(
        ..., description="Count of intervals with both actual & forecast"
    )
    total_expected_intervals: int = Field(
        ..., description="Total target half-hour intervals in analysis period"
    )
    coverage_percent: float = Field(
        ..., description="matched_intervals / total_expected_intervals * 100"
    )
    date_range_start: str
    date_range_end: str
    cutoff_hour_utc: int
    cutoff_rule_description: str
    daily_metrics: list[DailyMetric] = []


class GenerationSeriesResponse(BaseModel):
    intervals: list[MatchedInterval]
    total_records: int
    unit: str = "MW"
    time_zone: str = "UTC"


class DataQualityReport(BaseModel):
    total_actual_records: int
    total_forecast_records: int
    matched_intervals: int
    missing_actual_intervals: int
    missing_forecast_intervals: int
    coverage_percent: float
    api_status: str
    data_source_actual: str = "Elexon BMRS FUELHH (fuelType=WIND)"
    data_source_forecast: str = "Elexon BMRS WINDFOR"
    last_fetched_utc: str
    notes: list[str] = []
