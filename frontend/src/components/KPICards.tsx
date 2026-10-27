import React from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, BarChart2 } from 'lucide-react';
import { MetricSummary } from '../types';

interface KPICardsProps {
  summary: MetricSummary | null;
  loading: boolean;
}

export const KPICards: React.FC<KPICardsProps> = ({ summary, loading }) => {
  if (loading && !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="kpi-card h-28 animate-pulse bg-[#111B2E] border border-[#253249]"
          >
            <div className="h-3.5 w-24 bg-[#1A2740] rounded"></div>
            <div className="h-7 w-28 bg-[#1A2740] rounded my-2"></div>
            <div className="h-3 w-36 bg-[#1A2740]/60 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const isOverForecast = (summary?.mean_signed_error_mw ?? 0) > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      
      {/* 1. MAE Card */}
      <div className="kpi-card">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Mean Absolute Error
          </span>
          <Target className="w-4 h-4 text-teal" />
        </div>
        <div className="flex items-baseline space-x-1.5 my-0.5">
          <span className="text-2xl font-bold text-white font-mono-numbers tracking-tight">
            {summary ? summary.mae_mw.toLocaleString() : '—'}
          </span>
          <span className="text-xs font-semibold text-teal">MW</span>
        </div>
        <p className="text-[11px] text-slate-400 truncate">
          Typical error magnitude
        </p>
      </div>

      {/* 2. RMSE Card */}
      <div className="kpi-card">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Root Mean Square Error
          </span>
          <TrendingUp className="w-4 h-4 text-slate-300" />
        </div>
        <div className="flex items-baseline space-x-1.5 my-0.5">
          <span className="text-2xl font-bold text-white font-mono-numbers tracking-tight">
            {summary ? summary.rmse_mw.toLocaleString() : '—'}
          </span>
          <span className="text-xs font-semibold text-slate-400">MW</span>
        </div>
        <p className="text-[11px] text-slate-400 truncate">
          Penalises large deviations
        </p>
      </div>

      {/* 3. Forecast Bias (Mean Signed Error) Card */}
      <div className="kpi-card">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Forecast Bias
          </span>
          <AlertTriangle
            className={`w-4 h-4 ${isOverForecast ? 'text-amber' : 'text-teal'}`}
          />
        </div>
        <div className="flex items-baseline space-x-1.5 my-0.5">
          <span
            className={`text-2xl font-bold font-mono-numbers tracking-tight ${
              isOverForecast ? 'text-amber' : 'text-teal'
            }`}
          >
            {summary
              ? `${summary.mean_signed_error_mw > 0 ? '+' : ''}${summary.mean_signed_error_mw.toLocaleString()}`
              : '—'}
          </span>
          <span className="text-xs font-semibold text-slate-400">MW</span>
        </div>
        <p className="text-[11px] text-slate-400 truncate">
          {summary ? (
            isOverForecast ? (
              <span className="text-amber font-medium">Over-forecast on avg</span>
            ) : (
              <span className="text-teal font-medium">Under-forecast on avg</span>
            )
          ) : (
            'Mean signed error'
          )}
        </p>
      </div>

      {/* 4. Matched Intervals */}
      <div className="kpi-card">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Matched Pairs (≤ Cutoff)
          </span>
          <CheckCircle2 className="w-4 h-4 text-teal" />
        </div>
        <div className="flex items-baseline space-x-1.5 my-0.5">
          <span className="text-2xl font-bold text-white font-mono-numbers tracking-tight">
            {summary ? summary.matched_intervals.toLocaleString() : '—'}
          </span>
          <span className="text-xs font-medium text-slate-400">
            / {summary ? summary.total_expected_intervals.toLocaleString() : '—'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 truncate" title="744 hourly forecasts across 1,488 half-hour settlement periods">
          744 hourly forecasts (24/48 SPs daily)
        </p>
      </div>

      {/* 5. Forecast Coverage */}
      <div className="kpi-card">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Forecast Coverage
          </span>
          <BarChart2 className="w-4 h-4 text-teal" />
        </div>
        <div className="flex items-baseline space-x-1.5 my-0.5">
          <span className="text-2xl font-bold text-white font-mono-numbers tracking-tight">
            {summary ? `${summary.coverage_percent.toFixed(1)}%` : '—'}
          </span>
          <span className="text-xs font-medium text-slate-400">SP coverage</span>
        </div>
        <div className="w-full bg-[#0E1626] rounded-full h-1.5 mt-2 overflow-hidden border border-[#253249]/60">
          <div
            className="bg-teal h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, summary?.coverage_percent || 0)}%` }}
          ></div>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 truncate">
          100% of hourly forecast intervals
        </p>
      </div>

    </div>
  );
};
