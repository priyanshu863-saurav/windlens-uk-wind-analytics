import React, { useState, useEffect } from 'react';
import { api, getApiBaseUrl } from './services/api';
import {
  MetricSummary,
  MatchedInterval,
  DataQualityReport,
  HealthResponse,
} from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { FilterControls } from './components/FilterControls';
import { GenerationChart } from './components/GenerationChart';
import { ErrorDistributionChart } from './components/ErrorDistributionChart';
import { DailySummaryTable } from './components/DailySummaryTable';
import { DataQualityCard } from './components/DataQualityCard';
import { MethodologyModal } from './components/MethodologyModal';
import { AlertCircle, ExternalLink, Menu, X } from 'lucide-react';

export const App: React.FC = () => {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-31');
  const [cutoffHour, setCutoffHour] = useState(12);

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [summary, setSummary] = useState<MetricSummary | null>(null);
  const [intervals, setIntervals] = useState<MatchedInterval[]>([]);
  const [dataQuality, setDataQuality] = useState<DataQualityReport | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initial health check
  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch((err) => console.warn('Health check error:', err));
  }, []);

  // Fetch analytics data when parameters change
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, genRes, qualRes] = await Promise.all([
        api.getSummary(startDate, endDate, cutoffHour),
        api.getGenerationSeries(startDate, endDate, cutoffHour),
        api.getDataQuality(startDate, endDate, cutoffHour),
      ]);

      setSummary(sumRes);
      setIntervals(genRes.intervals);
      setDataQuality(qualRes);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to connect to the analytics backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate, cutoffHour]);

  return (
    <div className="min-h-screen flex bg-[#0B1120] text-slate-100 overflow-x-hidden">
      
      {/* 1. Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          onOpenMethodology={() => setIsMethodologyOpen(true)}
          health={health}
        />
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative z-10 w-64 bg-[#0E1626] border-r border-[#253249] flex flex-col justify-between">
            <div className="p-4 flex items-center justify-between border-b border-[#253249]">
              <span className="font-bold text-white text-sm">Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                activeSection={activeSection}
                onSelectSection={(sec) => {
                  setActiveSection(sec);
                  setMobileMenuOpen(false);
                }}
                onOpenMethodology={() => {
                  setIsMethodologyOpen(true);
                  setMobileMenuOpen(false);
                }}
                health={health}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile menu trigger bar (only on small screens) */}
        <div className="md:hidden flex items-center justify-between px-4 py-2 bg-[#0E1626] border-b border-[#253249]">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-2 text-xs text-slate-300 font-medium p-1 rounded hover:bg-[#1A2740]"
          >
            <Menu className="w-4 h-4 text-teal" />
            <span>Menu</span>
          </button>
          <span className="text-xs font-bold text-white">WindLens UK</span>
          <span className="text-[11px] text-teal font-mono-numbers">Jan 2026</span>
        </div>

        {/* 2. Top Header */}
        <Header
          health={health}
          onOpenMethodology={() => setIsMethodologyOpen(true)}
        />

        {/* Dashboard Sections Container */}
        <main className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Connection Error Banner (if any) */}
          {error && (
            <div className="bg-rose-950/80 border border-rose-800/80 rounded-xl p-4 flex items-start space-x-3 text-rose-200">
              <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <div className="text-xs flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-rose-100">Connection Error</span>
                  <button
                    onClick={() => {
                      api.getHealth().then(setHealth).catch(console.warn);
                      loadData();
                    }}
                    className="px-2.5 py-1 bg-rose-900/80 hover:bg-rose-800 text-rose-100 text-[11px] font-semibold rounded-md border border-rose-700 transition-colors cursor-pointer"
                  >
                    Retry Connection
                  </button>
                </div>
                <span className="block mt-1 font-mono text-[11px] text-rose-200">{error}</span>
                <p className="mt-2 text-rose-300">
                  Target API:{' '}
                  <code className="bg-rose-900/60 px-1.5 py-0.5 rounded font-mono text-[11px] text-white">
                    {getApiBaseUrl() || 'http://localhost:8000 (Vite dev proxy)'}
                  </code>
                </p>
                {getApiBaseUrl().includes('onrender.com') && (
                  <p className="mt-1 text-slate-300 text-[11px]">
                    Note: The backend is hosted on Render free tier, which sleeps when idle. Cold start may take 30–60 seconds on initial wake.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* SECTION: Overview & Filter Toolbar */}
          <section id="overview" className="space-y-4 scroll-mt-20">
            {/* 3. Filter Toolbar */}
            <FilterControls
              startDate={startDate}
              endDate={endDate}
              cutoffHour={cutoffHour}
              loading={loading}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onCutoffHourChange={setCutoffHour}
              onRefresh={loadData}
            />

            {/* 4. KPI Cards */}
            <KPICards summary={summary} loading={loading} />
          </section>

          {/* SECTION: Forecast Analysis (Main Charts) */}
          <section id="forecast-analysis" className="space-y-4 scroll-mt-20">
            {/* 5. Main Generation Chart */}
            <GenerationChart intervals={intervals} loading={loading} />

            {/* 6. Forecast Error Chart */}
            <ErrorDistributionChart intervals={intervals} loading={loading} />
          </section>

          {/* SECTION: Accuracy Breakdown & Data Quality */}
          <section id="accuracy-breakdown" className="scroll-mt-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* 7. Daily Accuracy Table */}
              <div className="lg:col-span-2">
                <DailySummaryTable dailyMetrics={summary?.daily_metrics || []} />
              </div>

              {/* 8. Data Quality Panel */}
              <div id="data-quality" className="scroll-mt-20">
                <DataQualityCard report={dataQuality} loading={loading} />
              </div>

            </div>
          </section>

        </main>

        {/* 9. Global Footer */}
        <footer className="border-t border-[#253249] bg-[#0E1626]/80 py-4 px-6 text-xs text-slate-400 mt-10">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white">WindLens</span>
              <span>·</span>
              <span>UK Wind Generation Forecast Analytics (Gridbricks Challenge)</span>
            </div>

            <div className="flex items-center space-x-3 text-slate-400">
              <span className="font-mono-numbers">Window: {startDate} to {endDate} (UTC)</span>
              <span>·</span>
              <a
                href="https://bmrs.elexon.co.uk/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-teal transition-colors flex items-center gap-1"
              >
                <span>Elexon BMRS Insights</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>·</span>
              <button
                onClick={() => setIsMethodologyOpen(true)}
                className="hover:text-teal transition-colors underline underline-offset-2"
              >
                Methodology
              </button>
            </div>
          </div>
        </footer>

      </div>

      {/* Methodology Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
        cutoffHour={cutoffHour}
      />

    </div>
  );
};

export default App;
