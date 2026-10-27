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

  const presets = [
    { label: 'Full January', start: '2026-01-01', end: '2026-01-31' },
    { label: 'Week 1', start: '2026-01-01', end: '2026-01-07' },
    { label: 'Week 2', start: '2026-01-08', end: '2026-01-14' },
    { label: 'Week 3', start: '2026-01-15', end: '2026-01-21' },
    { label: 'Week 4', start: '2026-01-22', end: '2026-01-31' },
  ];

  return (
    <div className="bg-[#111B2E] border border-[#253249] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-panel">
      
      {/* Inputs Group: Dates & Cutoff */}
      <div className="flex flex-wrap items-center gap-2.5">
        
        {/* From Date */}
        <div className="flex items-center space-x-1.5 bg-[#0E1626] border border-[#253249] rounded-lg px-2.5 h-9 text-xs">
          <Calendar className="w-3.5 h-3.5 text-teal shrink-0" />
          <span className="text-slate-400 font-medium">From:</span>
          <input
            type="date"
            value={startDate}
            min="2026-01-01"
            max="2026-01-31"
            onChange={(e) => onStartDateChange(e.target.value)}
            className="!border-0 !p-0 !h-auto font-mono-numbers focus:ring-0 cursor-pointer text-white"
          />
        </div>

        {/* To Date */}
        <div className="flex items-center space-x-1.5 bg-[#0E1626] border border-[#253249] rounded-lg px-2.5 h-9 text-xs">
          <Calendar className="w-3.5 h-3.5 text-teal shrink-0" />
          <span className="text-slate-400 font-medium">To:</span>
          <input
            type="date"
            value={endDate}
            min="2026-01-01"
            max="2026-01-31"
            onChange={(e) => onEndDateChange(e.target.value)}
            className="!border-0 !p-0 !h-auto font-mono-numbers focus:ring-0 cursor-pointer text-white"
          />
        </div>

        {/* Decision Cutoff Selector */}
        <div className="flex items-center space-x-1.5 bg-[#0E1626] border border-[#253249] rounded-lg px-2.5 h-9 text-xs">
          <Clock className="w-3.5 h-3.5 text-amber shrink-0" />
          <span className="text-slate-400 font-medium">Cutoff (D-1):</span>
          <select
            value={cutoffHour}
            onChange={(e) => onCutoffHourChange(Number(e.target.value))}
            className="!border-0 !p-0 !h-auto font-mono-numbers font-semibold text-amber cursor-pointer focus:ring-0"
          >
            <option value={9}>09:00 UTC</option>
            <option value={10}>10:00 UTC</option>
            <option value={11}>11:00 UTC</option>
            <option value={12}>12:00 UTC (Market Gate)</option>
            <option value={14}>14:00 UTC</option>
            <option value={17}>17:00 UTC</option>
          </select>
        </div>

      </div>

      {/* Presets & Apply Button */}
      <div className="flex items-center flex-wrap gap-1.5 ml-auto">
        <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400 mr-1">
          <span>Presets:</span>
        </div>

        {presets.map((preset) => {
          const isSelected = startDate === preset.start && endDate === preset.end;
          return (
            <button
              key={preset.label}
              onClick={() => setQuickRange(preset.start, preset.end)}
              className={`h-9 px-2.5 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-teal/15 text-teal border border-teal/40 font-semibold'
                  : 'bg-[#0E1626] hover:bg-[#16223B] text-slate-300 border border-[#253249]'
              }`}
            >
              {preset.label}
            </button>
          );
        })}

        {/* Apply Filters Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="h-9 px-3.5 rounded-lg bg-teal hover:bg-[#25BFA8] text-navy-950 font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50 ml-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Loading...' : 'Apply Filters'}</span>
        </button>

      </div>

    </div>
  );
};
