import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import {
  MetricSummary,
  MatchedInterval,
  DataQualityReport,
  HealthResponse
} from './types';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { FilterControls } from './components/FilterControls';
import { GenerationChart } from './components/GenerationChart';
import { ErrorDistributionChart } from './components/ErrorDistributionChart';
import { DailySummaryTable } from './components/DailySummaryTable';
import { DataQualityCard } from './components/DataQualityCard';
import { MethodologyModal } from './components/MethodologyModal';
import { AlertCircle, ExternalLink } from 'lucide-react';

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

  // Load health check on mount
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
        api.getDataQuality(startDate, endDate, cutoffHour)
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
    <div className="min-h-screen flex flex-col bg-[#070a12] text-slate-100">
      
      {/* Top Navigation & Status */}
      <Header
        health={health}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
      />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Error Alert if API failed */}
        {error && (
          <div className="bg-rose-950/80 border border-rose-800 rounded-xl p-4 flex items-start space-x-3 text-rose-200">
            <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-sm block text-rose-100">Connection Error</span>
              <span>{error}</span>
              <p className="mt-1 text-rose-300">
                Ensure the FastAPI backend server is running on <code className="bg-rose-900/60 px-1 py-0.5 rounded">http://localhost:8000</code>.
              </p>
            </div>
          </div>
        )}

        {/* 1. Filter & Date Range Selector */}
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

        {/* 2. Primary KPI Cards */}
        <KPICards summary={summary} loading={loading} />

        {/* 3. Main Time Series Chart: Actual vs Forecast */}
        <GenerationChart intervals={intervals} loading={loading} />

        {/* 4. Secondary Chart: Error Distribution */}
        <ErrorDistributionChart intervals={intervals} loading={loading} />

        {/* 5. Daily Breakdown Table & Data Quality Audit */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DailySummaryTable dailyMetrics={summary?.daily_metrics || []} />
          </div>
          <div>
            <DataQualityCard report={dataQuality} loading={loading} />
          </div>
        </div>

      </main>

      {/* Methodology & Rules Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
        cutoffHour={cutoffHour}
      />

      {/* Global Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-6 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">WindLens</span>
            <span>·</span>
            <span>UK Wind Generation Forecast Analytics (Gridbricks SWE Challenge)</span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://bmrs.elexon.co.uk/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>Elexon BMRS Insights</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>·</span>
            <span className="text-slate-400">Strict Day-Ahead Cutoff Backtesting</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
