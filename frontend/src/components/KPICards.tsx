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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse p-5 flex flex-col justify-between">
            <div className="h-4 w-24 bg-slate-800 rounded"></div>
            <div className="h-8 w-32 bg-slate-800 rounded"></div>
            <div className="h-3 w-40 bg-slate-800/60 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const isOverForecast = (summary?.mean_signed_error_mw ?? 0) > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      
      {/* 1. MAE Card */}
      <div className="glass-panel p-5 relative overflow-hidden group hover:border-cyan-500/40">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mean Absolute Error</span>
          <Target className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline space-x-1.5 my-1">
          <span className="text-2xl md:text-3xl font-extrabold text-white font-mono-numbers">
            {summary ? summary.mae_mw.toLocaleString() : '—'}
          </span>
          <span className="text-xs font-medium text-cyan-400">MW</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
          <span>Typical magnitude of error</span>
        </p>
      </div>

      {/* 2. RMSE Card */}
      <div className="glass-panel p-5 relative overflow-hidden group hover:border-indigo-500/40">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Root Mean Square Error</span>
          <TrendingUp className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-baseline space-x-1.5 my-1">
          <span className="text-2xl md:text-3xl font-extrabold text-white font-mono-numbers">
            {summary ? summary.rmse_mw.toLocaleString() : '—'}
          </span>
          <span className="text-xs font-medium text-indigo-400">MW</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Penalises large peak deviations
        </p>
      </div>

      {/* 3. Mean Signed Error (Bias) Card */}
      <div className="glass-panel p-5 relative overflow-hidden group hover:border-amber-500/40">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Forecast Bias</span>
          <AlertTriangle className={`w-4 h-4 ${isOverForecast ? 'text-amber-400' : 'text-blue-400'}`} />
        </div>
        <div className="flex items-baseline space-x-1.5 my-1">
          <span className={`text-2xl md:text-3xl font-extrabold font-mono-numbers ${isOverForecast ? 'text-amber-300' : 'text-sky-300'}`}>
            {summary ? `${summary.mean_signed_error_mw > 0 ? '+' : ''}${summary.mean_signed_error_mw.toLocaleString()}` : '—'}
          </span>
          <span className="text-xs font-medium text-slate-400">MW</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          {summary ? (
            isOverForecast ? (
              <span className="text-amber-400 font-medium">Over-forecasted on average</span>
            ) : (
              <span className="text-sky-400 font-medium">Under-forecasted on average</span>
            )
          ) : 'Mean signed error'}
        </p>
      </div>

      {/* 4. Matched Intervals */}
      <div className="glass-panel p-5 relative overflow-hidden group hover:border-emerald-500/40">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Matched Half-Hours</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline space-x-1.5 my-1">
          <span className="text-2xl md:text-3xl font-extrabold text-white font-mono-numbers">
            {summary ? summary.matched_intervals.toLocaleString() : '—'}
          </span>
          <span className="text-xs font-medium text-slate-400">
            / {summary ? summary.total_expected_intervals.toLocaleString() : '—'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          30-minute settlement intervals
        </p>
      </div>

      {/* 5. Coverage Ratio */}
      <div className="glass-panel p-5 relative overflow-hidden group hover:border-cyan-500/40">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Forecast Coverage</span>
          <BarChart2 className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline space-x-1.5 my-1">
          <span className="text-2xl md:text-3xl font-extrabold text-emerald-400 font-mono-numbers">
            {summary ? `${summary.coverage_percent.toFixed(1)}%` : '—'}
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, summary?.coverage_percent || 0)}%` }}
          ></div>
        </div>
      </div>

    </div>
  );
};
