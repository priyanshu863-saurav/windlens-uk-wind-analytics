import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { DataQualityReport } from '../types';

interface DataQualityCardProps {
  report: DataQualityReport | null;
  loading: boolean;
}

export const DataQualityCard: React.FC<DataQualityCardProps> = ({ report, loading }) => {
  if (loading && !report) {
    return (
      <div className="glass-panel p-5 h-44 animate-pulse bg-slate-900/60 border border-slate-800"></div>
    );
  }

  return (
    <div className="glass-panel p-5 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm md:text-base font-bold text-white">
            Data Quality & Integrity Audit
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          {report?.api_status || 'Operational'}
        </span>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3">
          <div className="text-slate-400">Actual Outturn (FUELHH)</div>
          <div className="text-base font-bold text-white font-mono-numbers mt-1">
            {report ? report.total_actual_records.toLocaleString() : '—'}
          </div>
          <div className="text-[10px] text-cyan-400 mt-0.5">fuelType = WIND</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3">
          <div className="text-slate-400">Forecast Pubs (WINDFOR)</div>
          <div className="text-base font-bold text-white font-mono-numbers mt-1">
            {report ? report.total_forecast_records.toLocaleString() : '—'}
          </div>
          <div className="text-[10px] text-amber-400 mt-0.5">Candidate publications</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3">
          <div className="text-slate-400">Missing Actual Intervals</div>
          <div className="text-base font-bold font-mono-numbers mt-1 text-slate-200">
            {report ? report.missing_actual_intervals.toLocaleString() : '—'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Reported as gaps</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3">
          <div className="text-slate-400">Missing Forecasts (≤ Cutoff)</div>
          <div className="text-base font-bold font-mono-numbers mt-1 text-slate-200">
            {report ? report.missing_forecast_intervals.toLocaleString() : '—'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">No lookahead allowed</div>
        </div>
      </div>

      {/* Audit Notes */}
      {report?.notes && report.notes.length > 0 && (
        <div className="space-y-1 pt-1">
          {report.notes.map((note, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-[11px] text-slate-400">
              <Info className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
