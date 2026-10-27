# WindLens Methodology & Metric Definitions

## 1. Context & Business Problem
An energy utility purchases electricity in the Great Britain Day-Ahead wholesale market. Wind generation is weather-dependent and volatile. To bid and hedge effectively, the procurement team relies on half-hourly wind generation forecasts that were published **prior** to the market clearing / decision cutoff.

Using forecasts published after the decision cutoff introduces look-ahead bias and invalidates backtesting and trading performance analysis.

## 2. Data Sources
- **Actual Generation**: Elexon BMRS `FUELHH` dataset (`/datasets/FUELHH/stream`), filtered for `fuelType = "WIND"`.
  - Field: `startTime` (half-hour settlement start, UTC)
  - Field: `generation` (average MW generated in the settlement period)
  - Settlement Period: 1 to 48 (or 50 during DST transitions)
- **Forecast Generation**: Elexon BMRS `WINDFOR` dataset (`/datasets/WINDFOR/stream`).
  - Field: `startTime` (target settlement start, UTC)
  - Field: `publishTime` (time the forecast was generated and published, UTC)
  - Field: `generation` (forecasted average MW)

## 3. Forecast Selection Rule
For any target settlement interval starting at $T$ on day $D$:
1. Determine the applicable purchasing decision cutoff $C(D)$.
   - By default in GB Day-Ahead wholesale trading, the market gate closes at **12:00 UTC (12:00 London Time)** on day $D-1$ (the day before delivery).
   - WindLens makes this cutoff parameter configurable by the user (hour and lead time).
2. Filter the set of WINDFOR forecasts targeting interval $T$ to include **only** those records where:
   $$\text{publishTime} \le C(D)$$
3. From this filtered set, select the **latest published forecast** (highest `publishTime` $\le C(D)$).
4. If no forecast was published before $C(D)$ for interval $T$, mark the interval as **Unmatched / Missing Forecast**.

## 4. Error Metrics
Given $n$ matched half-hourly intervals where both actual generation $A_i$ and selected forecast $F_i$ are available:

- **Mean Absolute Error (MAE)**:
  $$\text{MAE} = \frac{1}{n} \sum_{i=1}^n |F_i - A_i|$$
  Measures the average magnitude of errors regardless of direction.

- **Root Mean Square Error (RMSE)**:
  $$\text{RMSE} = \sqrt{\frac{1}{n} \sum_{i=1}^n (F_i - A_i)^2}$$
  Penalizes larger forecast errors more heavily.

- **Mean Signed Error (MSE / Bias)**:
  $$\text{Mean Signed Error} = \frac{1}{n} \sum_{i=1}^n (F_i - A_i)$$
  Indicates whether forecasts systematically over-predicted ($> 0$) or under-predicted ($< 0$) actual wind generation.

- **Forecast Coverage Ratio**:
  $$\text{Coverage} = \frac{\text{Number of Matched Intervals}}{\text{Total Expected Intervals in Window}} \times 100\%$$
  Guarantees that metrics are evaluated in context of data completeness.

## 5. Data Quality and Integrity Principles
- **No Synthetic Observation Substitution**: In production mode, missing data is reported as missing or gaps in coverage, never filled with fake numbers.
- **Timezone Awareness**: All timestamps from Elexon BMRS are parsed as UTC ISO 8601 strings and displayed with explicit timezone labels (UTC / GMT).
