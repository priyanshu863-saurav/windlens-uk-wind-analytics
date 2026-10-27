import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { MatchedInterval } from '../types';

interface GenerationChartProps {
  intervals: MatchedInterval[];
  loading: boolean;
}

export const GenerationChart: React.FC<GenerationChartProps> = ({ intervals, loading }) => {
  const [showActual, setShowActual] = useState(true);
  const [showForecast, setShowForecast] = useState(true);
  // View mode: 'matched' (only timestamps with both actual & eligible forecast) vs 'all' (all 1,488 SPs)
  const [viewMode, setViewMode] = useState<'matched' | 'all'>('matched');

  if (loading && intervals.length === 0) {
    return (
      <div
        className="saas-card p-6 flex flex-col items-center justify-center space-y-3"
        style={{ minHeight: '380px' }}
      >
        <div className="w-8 h-8 border-3 border-teal/20 border-t-teal rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Loading wind generation series...</p>
      </div>
    );
  }

  // Filter intervals based on viewMode
  const activeIntervals = viewMode === 'matched'
    ? intervals.filter((item) => item.is_matched)
    : intervals;

  const matchedCount = intervals.filter((item) => item.is_matched).length;
  const missingForecastCount = intervals.filter(
    (item) => !item.is_matched && item.actual_mw !== null && item.actual_mw !== undefined
  ).length;

  // Format data for chart
  const chartData = activeIntervals.map((item) => {
    const dt = new Date(item.start_time);
    const dateLabel = dt.toISOString().slice(5, 10); // MM-DD
    const timeLabel = dt.toISOString().slice(11, 16); // HH:MM
    return {
      rawTime: item.start_time,
      displayLabel: `${dateLabel} ${timeLabel}`,
      actual: item.actual_mw,
      forecast: item.forecast_mw,
      error: item.error_mw,
      settlementPeriod: item.settlement_period,
      publishTime: item.forecast_publish_time,
      cutoffTime: item.cutoff_time,
      isMatched: item.is_matched,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const actualVal = data.actual;
      const forecastVal = data.forecast;
      const errorVal = data.error;

      return (
        <div className="bg-[#0E1626] border border-[#253249] rounded-lg p-3 shadow-panel text-xs space-y-2 min-w-[240px]">
          <div className="border-b border-[#253249] pb-1.5 flex items-center justify-between">
            <span className="font-semibold text-white">{data.displayLabel} UTC</span>
            {data.settlementPeriod && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1A2740] text-slate-300 font-mono-numbers">
                SP {data.settlementPeriod}
              </span>
            )}
          </div>

          <div className="space-y-1 font-mono-numbers">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-teal"></span> Actual Outturn:
              </span>
              <span className="font-bold text-white">
                {actualVal !== null && actualVal !== undefined
                  ? `${actualVal.toLocaleString()} MW`
                  : 'Missing Actual'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-amber"></span> Day-Ahead Forecast:
              </span>
              <span className="font-bold text-white">
                {forecastVal !== null && forecastVal !== undefined
                  ? `${forecastVal.toLocaleString()} MW`
                  : 'No Forecast Published'}
              </span>
            </div>

            {errorVal !== null && errorVal !== undefined && (
              <div className="flex items-center justify-between pt-1 border-t border-[#253249] text-[11px]">
                <span className="text-slate-400">Deviation (F - A):</span>
                <span
                  className={`font-bold ${
                    errorVal >= 0 ? 'text-amber' : 'text-teal'
                  }`}
                >
                  {errorVal > 0 ? `+${errorVal.toLocaleString()}` : `${errorVal.toLocaleString()}`} MW
                </span>
              </div>
            )}
          </div>

          {data.publishTime && (
            <div className="pt-1 border-t border-[#253249] text-[10px] text-slate-400 space-y-0.5 font-mono-numbers">
              <div className="truncate">
                Pub: {new Date(data.publishTime).toISOString().replace('.000Z', 'Z')}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="saas-card p-5 space-y-3">
      {/* Chart Title, Units & Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Actual vs Eligible Day-Ahead Forecast</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#0E1626] border border-[#253249] text-slate-300 font-normal">
              MW · Half-Hourly (UTC)
            </span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Comparing verified FUELHH actuals against the latest WINDFOR publication prior to D-1 12:00 UTC.
          </p>
        </div>

        {/* View mode & Series toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* View mode toggle: Matched Pairs vs Full Timeline */}
          <div className="flex items-center bg-[#0E1626] border border-[#253249] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('matched')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                viewMode === 'matched'
                  ? 'bg-teal/20 text-teal border border-teal/40 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Matched Pairs ({matchedCount})
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-teal/20 text-teal border border-teal/40 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Half-Hours ({intervals.length})
            </button>
          </div>

          {/* Series Visibility Toggles */}
          <button
            onClick={() => setShowActual(!showActual)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-xs transition-colors ${
              showActual
                ? 'bg-teal/15 text-teal border-teal/40 font-medium'
                : 'bg-[#0E1626] text-slate-400 border-[#253249]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal"></span>
            <span>Actual</span>
          </button>

          <button
            onClick={() => setShowForecast(!showForecast)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-xs transition-colors ${
              showForecast
                ? 'bg-amber/15 text-amber border-amber/40 font-medium'
                : 'bg-[#0E1626] text-slate-400 border-[#253249]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber"></span>
            <span>Forecast</span>
          </button>
        </div>
      </div>

      {/* Main Chart Container with explicit height to guarantee non-zero render */}
      <div
        className="w-full pt-1"
        style={{ height: '360px', minHeight: '360px', minWidth: '0' }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#1E2A40" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="displayLabel"
              stroke="#64748B"
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              minTickGap={45}
              tickLine={false}
              axisLine={{ stroke: '#253249' }}
            />
            <YAxis
              stroke="#64748B"
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              unit=" MW"
              width={65}
              tickLine={false}
              axisLine={{ stroke: '#253249' }}
            />
            <Tooltip content={<CustomTooltip />} />

            {showActual && (
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual (FUELHH)"
                stroke="#2DD4BF"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                activeDot={{ r: 4, stroke: '#2DD4BF', strokeWidth: 2, fill: '#0E1626' }}
              />
            )}

            {showForecast && (
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast (WINDFOR)"
                stroke="#FBBF24"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={viewMode === 'all'}
                connectNulls={false}
                activeDot={{ r: 4, stroke: '#FBBF24', strokeWidth: 2, fill: '#0E1626' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Explicit Footer Breakdown Labels */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-[#253249]/80 font-mono-numbers gap-2">
        <div className="flex items-center flex-wrap gap-3">
          <span>
            Timeline Half-Hours: <strong className="text-white font-semibold">{intervals.length}</strong>
          </span>
          <span>·</span>
          <span>
            Matched Pairs: <strong className="text-teal font-semibold">{matchedCount}</strong>
          </span>
          <span>·</span>
          <span>
            Missing Forecast Half-Hours: <strong className="text-slate-300 font-semibold">{missingForecastCount}</strong>
            <span className="text-[10px] text-slate-400 font-sans ml-1">(hourly WINDFOR resolution)</span>
          </span>
        </div>
        <div className="text-slate-400 font-sans text-[10px]">
          No Synthetic Interpolation · Zero Look-Ahead Bias
        </div>
      </div>
    </div>
  );
};
