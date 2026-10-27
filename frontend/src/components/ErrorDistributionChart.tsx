import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell
} from 'recharts';
import { MatchedInterval } from '../types';

interface ErrorDistributionChartProps {
  intervals: MatchedInterval[];
  loading: boolean;
}

export const ErrorDistributionChart: React.FC<ErrorDistributionChartProps> = ({ intervals, loading }) => {
  if (loading && intervals.length === 0) {
    return null;
  }

  // Filter for intervals with valid error
  const errorData = intervals
    .filter((item) => item.error_mw !== null && item.error_mw !== undefined)
    .map((item) => {
      const dt = new Date(item.start_time);
      const dateLabel = dt.toISOString().slice(5, 10);
      const timeLabel = dt.toISOString().slice(11, 16);
      return {
        displayLabel: `${dateLabel} ${timeLabel}`,
        error: item.error_mw as number,
        actual: item.actual_mw,
        forecast: item.forecast_mw
      };
    });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const errorVal = data.error;

      return (
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 font-mono-numbers">
          <div className="text-white font-semibold font-sans">{data.displayLabel} UTC</div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Forecast Error (F - A):</span>
            <span className={`font-bold ${errorVal >= 0 ? 'text-amber-400' : 'text-sky-400'}`}>
              {errorVal > 0 ? `+${errorVal.toLocaleString()}` : `${errorVal.toLocaleString()}`} MW
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            <span>Forecast: {data.forecast?.toLocaleString()} MW</span>
            <span>Actual: {data.actual?.toLocaleString()} MW</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-5 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
            <span>Half-Hourly Forecast Deviation (Fᵢ − Aᵢ)</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">
              MW Error
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Positive error (amber) indicates Over-forecast; Negative error (sky) indicates Under-forecast.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded bg-amber-400"></span> Over-forecast (+MW)
          </span>
          <span className="flex items-center gap-1.5 text-sky-400">
            <span className="w-2 h-2 rounded bg-sky-400"></span> Under-forecast (-MW)
          </span>
        </div>
      </div>

      <div className="h-[220px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={errorData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="displayLabel"
              stroke="#64748b"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              minTickGap={40}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              unit=" MW"
              width={65}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
            <Bar dataKey="error">
              {errorData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.error >= 0 ? '#f59e0b' : '#38bdf8'}
                  opacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
