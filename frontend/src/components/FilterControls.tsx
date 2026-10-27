import React from 'react';
import { Calendar, Clock, RefreshCw } from 'lucide-react';

interface FilterControlsProps {
  startDate: string;
  endDate: string;
  cutoffHour: number;
  loading: boolean;
  onStartDateChange: (d: string) => void;
  onEndDateChange: (d: string) => void;
  onCutoffHourChange: (h: number) => void;
  onRefresh: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  startDate,
  endDate,
  cutoffHour,
  loading,
  onStartDateChange,
  onEndDateChange,
  onCutoffHourChange,
  onRefresh,
}) => {
  const setQuickRange = (start: string, end: string) => {
    onStartDateChange(start);
    onEndDateChange(end);
  };

  return (
    <div className="glass-panel p-4 md:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      
      {/* Date & Cutoff inputs */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* Start Date */}
        <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 font-medium">From:</span>
          <input
            type="date"
            value={startDate}
            min="2026-01-01"
            max="2026-01-31"
            onChange={(e) => onStartDateChange(e.target.value)}
            className="bg-transparent text-white font-mono-numbers focus:outline-none cursor-pointer"
          />
        </div>

        {/* End Date */}
        <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 font-medium">To:</span>
          <input
            type="date"
            value={endDate}
            min="2026-01-01"
            max="2026-01-31"
            onChange={(e) => onEndDateChange(e.target.value)}
            className="bg-transparent text-white font-mono-numbers focus:outline-none cursor-pointer"
          />
        </div>

        {/* Day-Ahead Cutoff Hour */}
        <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400 font-medium">Cutoff (D-1):</span>
          <select
            value={cutoffHour}
            onChange={(e) => onCutoffHourChange(Number(e.target.value))}
            className="bg-transparent text-amber-300 font-mono-numbers font-semibold focus:outline-none cursor-pointer"
          >
            <option value={9} className="bg-slate-900 text-white">09:00 UTC</option>
            <option value={10} className="bg-slate-900 text-white">10:00 UTC</option>
            <option value={11} className="bg-slate-900 text-white">11:00 UTC</option>
            <option value={12} className="bg-slate-900 text-white">12:00 UTC (Market Gate)</option>
            <option value={14} className="bg-slate-900 text-white">14:00 UTC</option>
            <option value={17} className="bg-slate-900 text-white">17:00 UTC</option>
          </select>
        </div>

      </div>

      {/* Preset range shortcuts & Refresh */}
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-xs text-slate-500 hidden sm:inline">Presets:</span>
        <button
          onClick={() => setQuickRange('2026-01-01', '2026-01-31')}
          className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
            startDate === '2026-01-01' && endDate === '2026-01-31'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-medium'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Full Jan 2026
        </button>
        <button
          onClick={() => setQuickRange('2026-01-01', '2026-01-07')}
          className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
            startDate === '2026-01-01' && endDate === '2026-01-07'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-medium'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Week 1
        </button>
        <button
          onClick={() => setQuickRange('2026-01-08', '2026-01-14')}
          className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
            startDate === '2026-01-08' && endDate === '2026-01-14'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-medium'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Week 2
        </button>
        <button
          onClick={() => setQuickRange('2026-01-15', '2026-01-21')}
          className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
            startDate === '2026-01-15' && endDate === '2026-01-21'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-medium'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Week 3
        </button>
        <button
          onClick={() => setQuickRange('2026-01-22', '2026-01-31')}
          className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
            startDate === '2026-01-22' && endDate === '2026-01-31'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-medium'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Week 4
        </button>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="ml-auto sm:ml-2 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-cyan-600/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Apply'}</span>
        </button>
      </div>

    </div>
  );
};
