# WindLens System Architecture

## Overview
WindLens is a decoupled full-stack analytics application designed to inspect and evaluate UK wind-generation forecasts for January 2026 day-ahead wholesale electricity procurement.

```
                      +-----------------------------+
                      |       React + Vite UI       |
                      |  (TypeScript + TailwindCSS  |
                      |       + Recharts)           |
                      +--------------+--------------+
                                     |
                          REST API   |  HTTP / JSON
                                     v
                      +-----------------------------+
                      |     FastAPI Backend (Py312) |
                      |    - Routes: /api/...       |
                      |    - Pydantic Validations   |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
+-------------------------------+           +-------------------------------+
|   Analytics & Matching Engine |           |     Elexon BMRS Client        |
|  - Cutoff enforcement         |           |  - FUELHH (Actuals)           |
|  - MAE, RMSE, Signed Error    |           |  - WINDFOR (Forecasts)        |
|  - Quality & coverage audits  |           |  - Resilient async HTTP       |
+-------------------------------+           |  - File-backed local caching  |
                                            +---------------+---------------+
                                                            |
                                                            v
                                            +-------------------------------+
                                            |  Elexon Insights Solution     |
                                            |  (https://data.elexon.co.uk)  |
                                            +-------------------------------+
```

## Backend Components (`backend/app/`)
1. **`core/config.py`**: Centralized application configuration using `pydantic-settings`.
2. **`clients/elexon.py`**:
   - Asynchronous HTTP client using `httpx`.
   - Fetches `/datasets/FUELHH/stream` and `/datasets/WINDFOR/stream`.
   - Caches responses in local cache directory (`data_cache/`) to minimize external API calls and rate-limiting.
3. **`services/analytics.py`**:
   - Filters forecasts published $\le$ decision cutoff for each target delivery interval.
   - Computes aligned pairs $(A_i, F_i)$.
   - Calculates statistical metrics: MAE, RMSE, Mean Signed Error, Coverage, and daily time-series summaries.
4. **`schemas/`**: Pydantic schemas validating API inputs and outputs.
5. **`api/`**: Clean modular FastAPI routes:
   - `GET /health`
   - `GET /api/summary`
   - `GET /api/generation`
   - `GET /api/accuracy`
   - `GET /api/data-quality`

## Frontend Architecture (`frontend/src/`)
1. **`components/`**:
   - `KPICardGrid`: MAE, RMSE, Mean Signed Error, Matched Count, Coverage.
   - `GenerationChart`: Interactive time-series showing Actual vs Selected Forecast (MW).
   - `ErrorChart`: Signed forecast error ($F_i - A_i$) over time and daily distribution.
   - `FilterControls`: Date picker (January 2026), Day-Ahead cutoff hour selector.
   - `DataQualityCard`: Gaps, unmatched intervals, API health status.
   - `MethodologyDrawer`: In-app explainability for procurement teams.
2. **`services/api.ts`**: Typed API client using Axios / Fetch with error handling.
3. **`types/`**: Shared TypeScript definitions matching backend Pydantic models.
