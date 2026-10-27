from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "environment" in data
    assert "timestamp" in data


@patch("app.api.routes.elexon_client.get_fuelhh_wind_actuals")
@patch("app.api.routes.elexon_client.get_windfor_forecasts")
def test_summary_endpoint(mock_get_forecasts, mock_get_actuals):
    mock_get_actuals.return_value = [
        {
            "startTime": "2026-01-01T00:00:00Z",
            "publishTime": "2026-01-01T00:30:00Z",
            "generation": 10000,
            "settlementPeriod": 1,
        }
    ]
    mock_get_forecasts.return_value = [
        {
            "startTime": "2026-01-01T00:00:00Z",
            "publishTime": "2025-12-31T11:00:00Z",
            "generation": 9800,
        }
    ]

    response = client.get(
        "/api/summary?start_date=2026-01-01&end_date=2026-01-01&cutoff_hour=12"
    )
    assert response.status_code == 200
    data = response.json()
    assert "mae_mw" in data
    assert "rmse_mw" in data
    assert "mean_signed_error_mw" in data
    assert "matched_intervals" in data
    assert data["matched_intervals"] == 1
    assert data["mae_mw"] == 200.0  # |9800 - 10000|
    assert data["mean_signed_error_mw"] == -200.0


@patch("app.api.routes.elexon_client.get_fuelhh_wind_actuals")
@patch("app.api.routes.elexon_client.get_windfor_forecasts")
def test_generation_series_endpoint(mock_get_forecasts, mock_get_actuals):
    mock_get_actuals.return_value = [
        {
            "startTime": "2026-01-01T00:00:00Z",
            "publishTime": "2026-01-01T00:30:00Z",
            "generation": 8000,
            "settlementPeriod": 1,
        }
    ]
    mock_get_forecasts.return_value = [
        {
            "startTime": "2026-01-01T00:00:00Z",
            "publishTime": "2025-12-31T10:00:00Z",
            "generation": 8200,
        }
    ]

    response = client.get(
        "/api/generation?start_date=2026-01-01&end_date=2026-01-01&cutoff_hour=12"
    )
    assert response.status_code == 200
    data = response.json()
    assert "intervals" in data
    assert len(data["intervals"]) == 48  # 48 half-hour settlement periods in 1 day
    matched_items = [i for i in data["intervals"] if i["is_matched"]]
    assert len(matched_items) == 1
    assert matched_items[0]["actual_mw"] == 8000.0
    assert matched_items[0]["forecast_mw"] == 8200.0


@patch("app.api.routes.elexon_client.get_fuelhh_wind_actuals")
@patch("app.api.routes.elexon_client.get_windfor_forecasts")
def test_data_quality_endpoint(mock_get_forecasts, mock_get_actuals):
    mock_get_actuals.return_value = []
    mock_get_forecasts.return_value = []

    response = client.get("/api/data-quality?start_date=2026-01-01&end_date=2026-01-01")
    assert response.status_code == 200
    data = response.json()
    assert "total_actual_records" in data
    assert "total_forecast_records" in data
    assert "api_status" in data
