import React from 'react';
import {
  Wind,
  LayoutDashboard,
  LineChart,
  TableProperties,
  ShieldCheck,
  BookOpen,
  Activity,
} from 'lucide-react';
import { HealthResponse } from '../types';

interface SidebarProps {
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  onOpenMethodology: () => void;
  health: HealthResponse | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  onOpenMethodology,
  health,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'forecast-analysis', label: 'Forecast Analysis', icon: LineChart },
    { id: 'accuracy-breakdown', label: 'Accuracy Breakdown', icon: TableProperties },
    { id: 'data-quality', label: 'Data Quality', icon: ShieldCheck },
  ];

  const handleNavClick = (id: string) => {
    onSelectSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className="w-60 bg-[#0E1626] border-r border-[#253249] flex flex-col justify-between shrink-0 min-h-screen select-none">
      {/* Top Branding */}
      <div>
        <div className="h-16 px-5 flex items-center space-x-3 border-b border-[#253249]">
          <div className="w-8 h-8 rounded-lg bg-teal/15 border border-teal/40 flex items-center justify-center text-teal">
            <Wind className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-tight leading-none flex items-center gap-1.5">
              <span>WindLens</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-teal/10 text-teal border border-teal/30">
                UK
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Energy Intelligence</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Analytics
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-teal/10 text-teal border border-teal/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-[#16223B]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Reference
          </div>

          <button
            onClick={onOpenMethodology}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[#16223B] transition-colors text-left"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Methodology</span>
          </button>
        </nav>
      </div>

      {/* Bottom Source & Connection Status */}
      <div className="p-4 border-t border-[#253249] bg-[#0B1120]/70 space-y-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            Backend
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                health?.status === 'ok' ? 'bg-teal shadow-[0_0_8px_#2DD4BF]' : 'bg-amber'
              }`}
            ></span>
            <span
              className={`font-semibold ${
                health?.status === 'ok' ? 'text-teal' : 'text-amber'
              }`}
            >
              {health?.status === 'ok' ? 'Connected' : 'Offline'}
            </span>
          </span>
        </div>

        <div className="pt-2 border-t border-[#253249]/60 text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>Market Data:</span>
            <span className="font-semibold text-slate-200">Elexon BMRS</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Target Period:</span>
            <span className="text-teal font-medium">January 2026</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
