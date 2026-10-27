import React from 'react';
import { Wind, HelpCircle, Database } from 'lucide-react';
import { HealthResponse } from '../types';

interface HeaderProps {
  health: HealthResponse | null;
  onOpenMethodology: () => void;
}

export const Header: React.FC<HeaderProps> = ({ health, onOpenMethodology }) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950">
            <Wind className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                WindLens <span className="text-cyan-400 font-medium text-sm md:text-base ml-1">UK Wind Analytics</span>
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                Jan 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal">
              Day-Ahead Wholesale Electricity Purchasing & Forecast Error Backtesting
            </p>
          </div>
        </div>

        {/* Status badges & Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Elexon BMRS Source */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Source:</span>
            <span className="font-semibold text-slate-200">Elexon BMRS (FUELHH & WINDFOR)</span>
          </div>

          {/* API Health */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${health?.status === 'ok' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${health?.status === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-slate-400">Backend:</span>
            <span className={`font-semibold ${health?.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {health?.status === 'ok' ? 'Connected' : 'Connecting...'}
            </span>
          </div>

          {/* Methodology Button */}
          <button
            onClick={onOpenMethodology}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Methodology & Cutoff</span>
          </button>
        </div>

      </div>
    </header>
  );
};
