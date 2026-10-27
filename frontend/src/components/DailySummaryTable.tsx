import React, { useState } from 'react';
import { DailyMetric } from '../types';
import { ChevronDown, ChevronUp, Table } from 'lucide-react';

interface DailySummaryTableProps {
  dailyMetrics: DailyMetric[];
}

export const DailySummaryTable: React.FC<DailySummaryTableProps> = ({ dailyMetrics }) => {
  const [sortField, setSortField] = useState<keyof DailyMetric>('date');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: keyof DailyMetric) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for numbers
    }
  };

  const sorted = [...dailyMetrics].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (typeof aVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
    }
    return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  return (
    <div className="glass-panel p-5 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
            <Table className="w-4 h-4 text-cyan-400" />
            <span>Daily Aggregations & Accuracy Breakdown</span>
          </h3>
          <p className="text-xs text-slate-400">
            Day-by-day analysis for January 2026. Click any column header to sort.
          </p>
        </div>
        <span className="text-xs font-mono-numbers text-slate-400">
          {dailyMetrics.length} days recorded
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-800/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  {sortField === 'date' && (sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                </div>
              </th>

              <th
                onClick={() => handleSort('mae_mw')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>MAE (MW)</span>
                  {sortField === 'mae_mw' && (sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                </div>
              </th>

              <th
                onClick={() => handleSort('rmse_mw')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>RMSE (MW)</span>
                  {sortField === 'rmse_mw' && (sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                </div>
              </th>

              <th
                onClick={() => handleSort('mean_signed_error_mw')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Bias (MW)</span>
                  {sortField === 'mean_signed_error_mw' && (sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                </div>
              </th>

              <th
                onClick={() => handleSort('actual_avg_mw')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Actual Avg</span>
                  {sortField === 'actual_avg_mw' && (sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                </div>
              </th>

              <th
                onClick={() => handleSort('forecast_avg_mw')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Forecast Avg</span>
                  {sortField === 'forecast_avg_mw' && (sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                </div>
              </th>

              <th
                onClick={() => handleSort('coverage_percent')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Coverage</span>
                  {sortField === 'coverage_percent' && (sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 font-mono-numbers bg-slate-950/40">
            {sorted.map((row) => (
              <tr key={row.date} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-slate-200">
                  {row.date}
                </td>

                <td className="py-2.5 px-4 text-right text-cyan-300 font-bold">
                  {row.mae_mw !== null && row.mae_mw !== undefined ? row.mae_mw.toLocaleString() : '—'}
                </td>

                <td className="py-2.5 px-4 text-right text-indigo-300">
                  {row.rmse_mw !== null && row.rmse_mw !== undefined ? row.rmse_mw.toLocaleString() : '—'}
                </td>

                <td className="py-2.5 px-4 text-right">
                  {row.mean_signed_error_mw !== null && row.mean_signed_error_mw !== undefined ? (
                    <span className={row.mean_signed_error_mw >= 0 ? 'text-amber-400' : 'text-sky-400'}>
                      {row.mean_signed_error_mw > 0 ? `+${row.mean_signed_error_mw.toLocaleString()}` : `${row.mean_signed_error_mw.toLocaleString()}`}
                    </span>
                  ) : '—'}
                </td>

                <td className="py-2.5 px-4 text-right text-slate-300">
                  {row.actual_avg_mw !== null && row.actual_avg_mw !== undefined ? `${row.actual_avg_mw.toLocaleString()} MW` : '—'}
                </td>

                <td className="py-2.5 px-4 text-right text-slate-300">
                  {row.forecast_avg_mw !== null && row.forecast_avg_mw !== undefined ? `${row.forecast_avg_mw.toLocaleString()} MW` : '—'}
                </td>

                <td className="py-2.5 px-4 text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    row.coverage_percent >= 95
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                      : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                  }`}>
                    {row.coverage_percent.toFixed(1)}% ({row.matched_count}/{row.expected_count})
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
