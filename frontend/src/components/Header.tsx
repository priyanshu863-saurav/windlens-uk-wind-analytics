import React from 'react';
import { Database, HelpCircle } from 'lucide-react';
import { HealthResponse } from '../types';

interface HeaderProps {
  health: HealthResponse | null;
  onOpenMethodology: () => void;
}

export const Header: React.FC<HeaderProps> = ({ health, onOpenMethodology }) => {
  return (
    <header className="h-16 border-b border-[#253249] bg-[#0E1626]/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-20">
      
      {/* Title & Period Badge */}
      <div className="flex items-center space-x-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-base md:text-lg font-bold text-white tracking-tight leading-none">
              Wind Generation Overview
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal/10 text-teal border border-teal/30">
              January 2026
            </span>
          </div>
          <p className="text-xs text-slate-400 font-normal mt-0.5 hidden sm:block">
            UK day-ahead renewable generation intelligence & forecast backtesting
          </p>
        </div>
      </div>

      {/* Right controls: Source, Status, Methodology */}
      <div className="flex items-center space-x-3">
        
        {/* Source badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#111B2E] border border-[#253249] text-xs text-slate-300">
          <Database className="w-3.5 h-3.5 text-teal" />
          <span className="text-slate-400">Source:</span>
          <span className="font-semibold text-slate-200">Elexon BMRS</span>
        </div>

        {/* Backend status indicator */}
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#111B2E] border border-[#253249] text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              health?.status === 'ok' ? 'bg-teal shadow-[0_0_8px_#2DD4BF]' : 'bg-amber'
            }`}
          ></span>
          <span className="text-slate-400 hidden sm:inline">Backend:</span>
          <span
            className={`font-semibold ${
              health?.status === 'ok' ? 'text-teal' : 'text-amber'
            }`}
          >
            {health?.status === 'ok' ? 'Connected' : 'Offline'}
          </span>
        </div>

        {/* Methodology Button */}
        <button
          onClick={onOpenMethodology}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#111B2E] hover:bg-[#1A2740] text-slate-200 hover:text-white border border-[#253249] hover:border-teal/40 text-xs font-medium transition-all"
        >
          <HelpCircle className="w-3.5 h-3.5 text-teal" />
          <span>Methodology</span>
        </button>

      </div>

    </header>
  );
};
