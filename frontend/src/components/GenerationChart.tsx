import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { MatchedInterval } from '../types';

interface GenerationChartProps {
  intervals: MatchedInterval[];
  loading: boolean;
}

export const GenerationChart: React.FC<GenerationChartProps> = ({ intervals, loading }) => {
  const [showActual, setShowActual] = useState(true);
  const [showForecast, setShowForecast] = useState(true);

  if (loading && intervals.length === 0) {
    return (
      <div className="glass-panel p-6 h-96 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Loading half-hourly wind generation series...</p>
      </div>
    );
  }

  // Format data for chart
  const chartData = intervals.map((item) => {
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
      cutoffTime: item.cutoff_time
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const actualVal = data.actual;
      const forecastVal = data.forecast;
      const errorVal = data.error;

      return (
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[240px]">
          <div className="border-b border-slate-800 pb-2">
            <div className="font-semibold text-white flex items-center justify-between">
              <span>{data.displayLabel} UTC</span>
              {data.settlementPeriod && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  SP {data.settlementPeriod}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">UK Wind Generation Outturn vs Day-Ahead</p>
          </div>

          <div className="space-y-1.5 font-mono-numbers">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Actual (FUELHH):
              </span>
              <span className="font-bold text-white">
                {actualVal !== null && actualVal !== undefined ? `${actualVal.toLocaleString()} MW` : 'Missing'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Forecast (WINDFOR):
              </span>
              <span className="font-bold text-white">
                {forecastVal !== null && forecastVal !== undefined ? `${forecastVal.toLocaleString()} MW` : 'No Eligible Forecast'}
              </span>
            </div>

            {errorVal !== null && errorVal !== undefined && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Error (F - A):</span>
                <span className={`font-bold ${errorVal >= 0 ? 'text-amber-400' : 'text-sky-400'}`}>
                  {errorVal > 0 ? `+${errorVal.toLocaleString()}` : `${errorVal.toLocaleString()}`} MW
                </span>
              </div>
            )}
          </div>

          {data.publishTime && (
            <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 space-y-0.5">
              <div>
                Published: <span className="text-slate-200">{new Date(data.publishTime).toISOString().replace('.000Z', 'Z')}</span>
              </div>
              <div>
                Cutoff (D-1): <span className="text-slate-200">{new Date(data.cutoffTime).toISOString().replace('.000Z', 'Z')}</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
            <span>Actual vs Day-Ahead Wind Generation</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/40 text-cyan-300 font-normal">
              MW · Half-Hourly (UTC)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Comparing verified FUELHH actuals against the latest WINDFOR forecast published prior to the D-1 cutoff.
          </p>
        </div>

        {/* Legend toggles */}
        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => setShowActual(!showActual)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              showActual
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40 font-semibold'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Actual Generation</span>
          </button>

          <button
            onClick={() => setShowForecast(!showForecast)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              showForecast
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/40 font-semibold'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Eligible Forecast</span>
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-[360px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="displayLabel"
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              minTickGap={40}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              unit=" MW"
              width={65}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {showActual && (
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual (FUELHH)"
                stroke="#00f2fe"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: '#00f2fe', strokeWidth: 2, fill: '#090d16' }}
              />
            )}

            {showForecast && (
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast (WINDFOR)"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={false}
                activeDot={{ r: 4, stroke: '#f59e0b', strokeWidth: 2, fill: '#090d16' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
        <div>
          Total Aligned Intervals: <span className="font-mono-numbers text-white font-semibold">{intervals.length}</span>
        </div>
        <div>
          Data Guarantee: <span className="text-emerald-400 font-medium">No look-ahead information or synthetic observations</span>
        </div>
      </div>

    </div>
  );
};
