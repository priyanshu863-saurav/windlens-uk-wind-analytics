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
      <div className="saas-card p-5 h-48 animate-pulse bg-[#111B2E] border border-[#253249]"></div>
    );
  }

  return (
    <div className="saas-card p-5 space-y-3.5">
      {/* Title & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-teal" />
          <h3 className="text-sm font-bold text-white">
            Data Quality & Integrity Audit
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal/15 text-teal border border-teal/40 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal"></span>
          {report?.api_status || 'Operational'}
        </span>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono-numbers">
        <div className="bg-[#0E1626] border border-[#253249] rounded-lg p-2.5">
          <div className="text-slate-400 text-[11px] font-sans">Actuals (FUELHH)</div>
          <div className="text-sm font-bold text-white mt-0.5">
            {report ? report.total_actual_records.toLocaleString() : '—'}
          </div>
          <div className="text-[10px] text-teal mt-0.5 font-sans">fuelType = WIND</div>
        </div>

        <div className="bg-[#0E1626] border border-[#253249] rounded-lg p-2.5">
          <div className="text-slate-400 text-[11px] font-sans">Forecasts (WINDFOR)</div>
          <div className="text-sm font-bold text-white mt-0.5">
            {report ? report.total_forecast_records.toLocaleString() : '—'}
          </div>
          <div className="text-[10px] text-amber mt-0.5 font-sans">Candidate pubs</div>
        </div>

        <div className="bg-[#0E1626] border border-[#253249] rounded-lg p-2.5">
          <div className="text-slate-400 text-[11px] font-sans">Missing Actuals</div>
          <div className="text-sm font-bold text-slate-200 mt-0.5">
            {report ? report.missing_actual_intervals.toLocaleString() : '—'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-sans">Reported as gap</div>
        </div>

        <div className="bg-[#0E1626] border border-[#253249] rounded-lg p-2.5">
          <div className="text-slate-400 text-[11px] font-sans">Missing Forecasts</div>
          <div className="text-sm font-bold text-slate-200 mt-0.5">
            {report ? report.missing_forecast_intervals.toLocaleString() : '—'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-sans">≤ Cutoff applied</div>
        </div>
      </div>

      {/* Audit Notes */}
      {report?.notes && report.notes.length > 0 && (
        <div className="space-y-1.5 pt-1 text-[11px] text-slate-400 border-t border-[#253249]/60">
          {report.notes.map((note, idx) => (
            <div key={idx} className="flex items-start space-x-1.5 leading-tight">
              <Info className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
