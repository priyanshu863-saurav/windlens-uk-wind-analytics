# WindLens — UK Wind Generation Forecast Analytics

A full-stack analytics platform built for an energy utility team that purchases electricity in the Great Britain Day-Ahead wholesale market.

The dashboard inspects UK-wide wind-generation forecasts that were available when purchasing decisions were made, compares those forecasts with actual wind generation from **Elexon BMRS** for **January 2026**, and quantifies forecast error.

---

## 1. Business Problem & Methodology

### 1.1 The Purchasing Decision Challenge
In the UK Day-Ahead wholesale electricity market, procurement teams make binding purchase decisions before market clearing (traditionally at **12:00 UTC on Day D-1**). Wind generation is weather-dependent and volatile. To bid accurately and manage imbalance penalties, traders need to know:
1. What was the latest forecast available **at decision time**?
2. How accurate was that forecast compared to the actual outturn?
3. Was the forecast system systematically over-predicting or under-predicting wind output?

### 1.2 Strict Cutoff Rule (Zero Look-ahead Bias)
For any half-hour delivery settlement interval on target delivery date $D$:
- The applicable purchasing decision cutoff is computed as:
  $$\text{Cutoff}(D) = (D - 1 \text{ day}) \text{ at } 12:00 \text{ UTC}$$
  *(Configurable in the dashboard between 09:00 and 17:00 UTC)*.
- All candidate WINDFOR forecasts targeting interval $T$ are filtered to include **only** those published strictly on or before $\text{Cutoff}(D)$:
  $$\text{publishTime} \le \text{Cutoff}(D)$$
- The **latest publication** in this eligible window is selected as the day-ahead benchmark.
- Intraday or post-cutoff updates are **strictly excluded** from day-ahead evaluation.

### 1.3 Verified Data Sources
Directly ingested from the public [Elexon BMRS Insights Solution API](https://bmrs.elexon.co.uk/):
- **Actual Generation**: `FUELHH` stream (`/datasets/FUELHH/stream`), filtered for `fuelType = 'WIND'`. Provides half-hourly generation outturn in MW.
- **Forecast Generation**: `WINDFOR` stream (`/datasets/WINDFOR/stream`). Provides UK-wide wind generation forecasts with `publishTime` and `startTime`.

### 1.4 Statistical Metrics Formulas
Given $n$ matched half-hour settlement intervals where both actual $A_i$ and selected forecast $F_i$ exist:

- **Mean Absolute Error (MAE)**:
  $$\text{MAE} = \frac{1}{n} \sum_{i=1}^n |F_i - A_i|$$
- **Root Mean Square Error (RMSE)**:
  $$\text{RMSE} = \sqrt{\frac{1}{n} \sum_{i=1}^n (F_i - A_i)^2}$$
- **Mean Signed Error (Bias)**:
  $$\text{Mean Signed Error} = \frac{1}{n} \sum_{i=1}^n (F_i - A_i)$$
- **Forecast Coverage Ratio**:
  $$\text{Coverage} = \frac{\text{Matched Valid Intervals}}{\text{Total Expected Intervals (1,488 in Jan 2026)}} \times 100\%$$

> **Data Integrity Guarantee**: Zero synthetic records are injected into the production analytics view. Missing intervals are explicitly reported as gaps.

---

## 2. Architecture & Technology Stack

```
gridbricks-energy/
├── frontend/                     # React 18 + Vite + TypeScript + Recharts + Tailwind CSS
│   ├── src/
│   │   ├── components/           # KPICards, GenerationChart, ErrorChart, DailyTable, etc.
│   │   ├── services/api.ts       # Typed REST client
│   │   ├── types/index.ts        # TypeScript schemas
│   │   └── App.tsx               # Main dashboard UI
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── backend/                      # Python 3.12 + FastAPI + Pydantic + pandas + httpx
│   ├── app/
│   │   ├── main.py               # FastAPI entrypoint & CORS middleware
│   │   ├── core/config.py        # Centralized pydantic-settings
│   │   ├── clients/elexon.py     # Async Elexon client with disk caching & retry
│   │   ├── services/analytics.py # Cutoff matcher & statistical metric engine
│   │   ├── schemas/models.py     # Pydantic validation models
│   │   └── api/routes.py         # /health, /api/summary, /api/generation, etc.
│   ├── tests/                    # pytest unit and API integration tests
│   ├── Dockerfile
│   └── requirements.txt
├── docs/
│   ├── architecture.md           # System architecture blueprint
│   └── methodology.md            # Detailed mathematical & market definitions
├── docker-compose.yml            # Multi-container orchestration
├── .env.example                  # Environment variable reference
├── .gitignore
└── README.md
```

---

## 3. Local Setup & Quickstart

### Prerequisites
- Python 3.12+
- Node.js 20+ & npm 10+
- (Optional) Docker & Docker Compose

### 3.1 Running the Backend (PowerShell)
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Documentation (Swagger): `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/health`

### 3.2 Running the Frontend (Second Terminal)
```powershell
cd frontend
npm install
npm run dev
```
- Dashboard URL: `http://localhost:5173`

### 3.3 Running via Docker Compose
```bash
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## 4. Automated Testing

### Backend Unit & Integration Tests (pytest)
```powershell
cd backend
.\.venv\Scripts\pytest.exe -v
```
**Test Coverage Includes:**
- Strict decision cutoff time calculation (`test_calculate_decision_cutoff`)
- Rejection of post-cutoff lookahead forecasts (`test_forecast_selection_strictly_enforces_cutoff`)
- Missing data handling without synthetic substitution (`test_missing_data_handling`)
- Known test vector validation for MAE, RMSE, Mean Signed Error (`test_metric_calculation_known_vectors`)
- API endpoints `/health`, `/api/summary`, `/api/generation`, `/api/data-quality`

---

## 5. API Endpoints Reference

| Endpoint | Method | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | — | Service health and environment status |
| `/api/summary` | `GET` | `start_date`, `end_date`, `cutoff_hour` | High-level KPIs: MAE, RMSE, Bias, Coverage %, Daily breakdown |
| `/api/generation` | `GET` | `start_date`, `end_date`, `cutoff_hour` | Half-hourly time series of actual vs selected eligible forecast |
| `/api/accuracy` | `GET` | `start_date`, `end_date`, `cutoff_hour` | Statistical forecast accuracy report |
| `/api/data-quality` | `GET` | `start_date`, `end_date` | Data completeness audit, missing intervals, and Elexon API status |

---

## 6. AI Development Disclosure

In accordance with challenge requirements, this application was developed with the assistance of **Google Antigravity** for architectural planning, scaffolding, automated test generation, and code quality audits, working alongside developer review.
