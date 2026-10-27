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
  Cell,
} from 'recharts';
import { MatchedInterval } from '../types';

interface ErrorDistributionChartProps {
  intervals: MatchedInterval[];
  loading: boolean;
}

export const ErrorDistributionChart: React.FC<ErrorDistributionChartProps> = ({
  intervals,
  loading,
}) => {
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
        forecast: item.forecast_mw,
      };
    });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const errorVal = data.error;

      return (
        <div className="bg-[#0E1626] border border-[#253249] rounded-lg p-2.5 shadow-panel text-xs space-y-1 font-mono-numbers">
          <div className="text-white font-semibold font-sans">{data.displayLabel} UTC</div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Deviation (F - A):</span>
            <span className={`font-bold ${errorVal >= 0 ? 'text-amber' : 'text-teal'}`}>
              {errorVal > 0 ? `+${errorVal.toLocaleString()}` : `${errorVal.toLocaleString()}`} MW
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-[#253249]">
            <span>Forecast: {data.forecast?.toLocaleString()} MW</span>
            <span>Actual: {data.actual?.toLocaleString()} MW</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="saas-card p-5 space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Forecast Error Distribution (Fᵢ − Aᵢ)</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#0E1626] border border-[#253249] text-slate-300 font-normal">
              MW Error
            </span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Positive error (amber) indicates Over-forecast; Negative error (teal) indicates Under-forecast.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center gap-1.5 text-amber text-[11px]">
            <span className="w-2 h-2 rounded bg-amber"></span> Over-forecast (+MW)
          </span>
          <span className="flex items-center gap-1.5 text-teal text-[11px]">
            <span className="w-2 h-2 rounded bg-teal"></span> Under-forecast (-MW)
          </span>
        </div>
      </div>

      <div
        className="w-full pt-1"
        style={{ height: '220px', minHeight: '220px', minWidth: '0' }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={errorData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              unit=" MW"
              width={65}
              tickLine={false}
              axisLine={{ stroke: '#253249' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
            <Bar dataKey="error">
              {errorData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.error >= 0 ? '#FBBF24' : '#2DD4BF'}
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
