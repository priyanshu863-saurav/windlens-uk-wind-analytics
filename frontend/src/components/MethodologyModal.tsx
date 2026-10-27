import React from 'react';
import { X, BookOpen, Clock, ShieldAlert, Calculator } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  cutoffHour: number;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({
  isOpen,
  onClose,
  cutoffHour
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Forecasting Methodology & Cutoff Rules</h2>
              <p className="text-xs text-slate-400">UK Day-Ahead Wholesale Electricity Market Backtesting Principles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Decision Cutoff Rule */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>1. Day-Ahead Decision Cutoff Rule</span>
          </h3>
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 text-xs leading-relaxed space-y-2">
            <p>
              In the Great Britain wholesale electricity market, day-ahead power contracts clear at noon on the day preceding delivery (<strong className="text-amber-300">D-1 at 12:00 UTC</strong>).
            </p>
            <p className="text-slate-300">
              To accurately evaluate the information available to procurement analysts at decision time:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>
                For any target settlement interval on day <strong className="text-white">D</strong>, only WINDFOR forecasts published <strong className="text-white">on or before {cutoffHour.toString().padStart(2, '0')}:00 UTC on day D-1</strong> are eligible.
              </li>
              <li>
                From the eligible set, the <strong className="text-white">latest publication</strong> is selected as the day-ahead benchmark.
              </li>
              <li>
                <strong className="text-rose-400">Strict Look-ahead Protection:</strong> Forecasts published after the cutoff (e.g. intraday updates) are strictly excluded from Day-Ahead metrics.
              </li>
            </ul>
          </div>
        </div>

        {/* 2. Metric Formulas */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span>2. Evaluation Metrics Formulas</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5">
              <span className="font-bold text-white">Mean Absolute Error (MAE)</span>
              <div className="font-mono-numbers text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800">
                MAE = (1/n) * Σ |Fᵢ − Aᵢ|
              </div>
              <p className="text-slate-400 text-[11px]">
                Measures typical error magnitude in MW without penalizing direction.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5">
              <span className="font-bold text-white">Root Mean Square Error (RMSE)</span>
              <div className="font-mono-numbers text-indigo-300 bg-slate-950 p-2 rounded border border-slate-800">
                RMSE = √((1/n) * Σ (Fᵢ − Aᵢ)²)
              </div>
              <p className="text-slate-400 text-[11px]">
                Heavily penalizes extreme forecast errors during storm ramps or wind drops.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5">
              <span className="font-bold text-white">Mean Signed Error (Bias)</span>
              <div className="font-mono-numbers text-amber-300 bg-slate-950 p-2 rounded border border-slate-800">
                Bias = (1/n) * Σ (Fᵢ − Aᵢ)
              </div>
              <p className="text-slate-400 text-[11px]">
                Positive value indicates systemic over-forecasting; negative indicates under-forecasting.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5">
              <span className="font-bold text-white">Forecast Coverage Ratio</span>
              <div className="font-mono-numbers text-emerald-300 bg-slate-950 p-2 rounded border border-slate-800">
                Coverage = (Matched Intervals / Total Intervals) * 100%
              </div>
              <p className="text-slate-400 text-[11px]">
                Measures data completeness across the 1,488 expected settlement half-hours.
              </p>
            </div>

          </div>
        </div>

        {/* 3. Data Integrity & Verification */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>3. Data Authenticity & Verification</span>
          </h3>
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 text-xs space-y-1.5 text-slate-300">
            <p>
              • <strong>Verified Elexon BMRS Source:</strong> Actual wind generation is ingested directly from the <code className="text-cyan-300">FUELHH</code> stream (filtering for <code className="text-cyan-300">fuelType = 'WIND'</code>). Forecasts are ingested from <code className="text-amber-300">WINDFOR</code>.
            </p>
            <p>
              • <strong>Zero Synthetic Fillers:</strong> If a half-hour interval lacks actual outturn or eligible forecast records, it is reported as missing or incomplete. Synthetic data is never fabricated in the production dashboard.
            </p>
            <p>
              • <strong>Timezone Normalization:</strong> All timestamps are treated as UTC ISO 8601 strings and mapped directly to 30-minute settlement periods (SP 1–48).
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors"
          >
            Close & Return to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};
