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
  cutoffHour,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-[#0E1626] border border-[#253249] rounded-xl shadow-2xl p-6 text-slate-200 space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#253249] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal/15 border border-teal/30 text-teal flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Forecasting Methodology & Cutoff Rules</h2>
              <p className="text-xs text-slate-400">UK Day-Ahead Wholesale Electricity Market Backtesting Principles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2740] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Decision Cutoff Rule */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber" />
            <span>1. Day-Ahead Decision Cutoff Rule</span>
          </h3>
          <div className="bg-[#0B1120] border border-[#253249] rounded-lg p-3.5 text-xs leading-relaxed space-y-2">
            <p className="text-slate-300">
              In the Great Britain wholesale electricity market, day-ahead power contracts clear before delivery (<strong className="text-amber">D-1 at 12:00 UTC</strong>).
            </p>
            <p className="text-slate-300">
              To accurately reflect information available to procurement analysts at decision time:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>
                For any target settlement interval on day <strong className="text-white">D</strong>, only WINDFOR forecasts published <strong className="text-white">on or before {cutoffHour.toString().padStart(2, '0')}:00 UTC on day D-1</strong> are eligible.
              </li>
              <li>
                From the eligible set, the <strong className="text-white">latest publication</strong> is selected as the day-ahead benchmark.
              </li>
              <li>
                <strong className="text-rose-400">Zero Look-ahead Bias:</strong> Forecasts published after the cutoff are strictly excluded from Day-Ahead metrics.
              </li>
            </ul>
          </div>
        </div>

        {/* 2. Metric Formulas */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Calculator className="w-3.5 h-3.5 text-teal" />
            <span>2. Evaluation Metrics Formulas</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            
            <div className="bg-[#0B1120] border border-[#253249] rounded-lg p-3 space-y-1">
              <span className="font-bold text-white">Mean Absolute Error (MAE)</span>
              <div className="font-mono-numbers text-teal bg-[#111B2E] p-1.5 rounded border border-[#253249] text-[11px]">
                MAE = (1/n) * Σ |Fᵢ − Aᵢ|
              </div>
              <p className="text-slate-400 text-[10px]">
                Measures typical error magnitude in MW without penalizing direction.
              </p>
            </div>

            <div className="bg-[#0B1120] border border-[#253249] rounded-lg p-3 space-y-1">
              <span className="font-bold text-white">Root Mean Square Error (RMSE)</span>
              <div className="font-mono-numbers text-slate-300 bg-[#111B2E] p-1.5 rounded border border-[#253249] text-[11px]">
                RMSE = √((1/n) * Σ (Fᵢ − Aᵢ)²)
              </div>
              <p className="text-slate-400 text-[10px]">
                Heavily penalizes extreme forecast errors during storm ramps or wind drops.
              </p>
            </div>

            <div className="bg-[#0B1120] border border-[#253249] rounded-lg p-3 space-y-1">
              <span className="font-bold text-white">Mean Signed Error (Bias)</span>
              <div className="font-mono-numbers text-amber bg-[#111B2E] p-1.5 rounded border border-[#253249] text-[11px]">
                Bias = (1/n) * Σ (Fᵢ − Aᵢ)
              </div>
              <p className="text-slate-400 text-[10px]">
                Positive value indicates systemic over-forecasting; negative indicates under-forecasting.
              </p>
            </div>

            <div className="bg-[#0B1120] border border-[#253249] rounded-lg p-3 space-y-1">
              <span className="font-bold text-white">Forecast Coverage Ratio</span>
              <div className="font-mono-numbers text-teal bg-[#111B2E] p-1.5 rounded border border-[#253249] text-[11px]">
                Coverage = (Matched Intervals / Total Expected) * 100%
              </div>
              <p className="text-slate-400 text-[10px]">
                Measures data completeness across the 1,488 expected settlement half-hours.
              </p>
            </div>

          </div>
        </div>

        {/* 3. Data Integrity & Verification */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-teal" />
            <span>3. Data Authenticity & Verification</span>
          </h3>
          <div className="bg-[#0B1120] border border-[#253249] rounded-lg p-3.5 text-xs space-y-1.5 text-slate-300">
            <p>
              • <strong>Verified Elexon BMRS Source:</strong> Actual wind generation is ingested directly from the <code className="text-teal">FUELHH</code> stream (filtering for <code className="text-teal">fuelType = 'WIND'</code>). Forecasts are ingested from <code className="text-amber">WINDFOR</code>.
            </p>
            <p>
              • <strong>Zero Synthetic Fillers:</strong> If a half-hour interval lacks actual outturn or eligible forecast records, it is reported as missing or incomplete. Synthetic data is never fabricated.
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
            className="px-4 py-1.5 bg-[#1A2740] hover:bg-[#253249] text-white font-medium text-xs rounded-lg transition-colors border border-[#253249]"
          >
            Close & Return to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};
