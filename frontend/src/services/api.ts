import {
  MetricSummary,
  GenerationSeriesResponse,
  DataQualityReport,
  HealthResponse
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const api = {
  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  },

  async getSummary(startDate: string, endDate: string, cutoffHour: number): Promise<MetricSummary> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      cutoff_hour: cutoffHour.toString(),
      use_cache: 'true'
    });
    const res = await fetch(`${API_BASE}/api/summary?${params}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Failed to fetch summary: ${res.statusText}`);
    }
    return res.json();
  },

  async getGenerationSeries(
    startDate: string,
    endDate: string,
    cutoffHour: number
  ): Promise<GenerationSeriesResponse> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      cutoff_hour: cutoffHour.toString(),
      use_cache: 'true'
    });
    const res = await fetch(`${API_BASE}/api/generation?${params}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Failed to fetch generation series: ${res.statusText}`);
    }
    return res.json();
  },

  async getDataQuality(startDate: string, endDate: string, cutoffHour: number): Promise<DataQualityReport> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      cutoff_hour: cutoffHour.toString(),
      use_cache: 'true'
    });
    const res = await fetch(`${API_BASE}/api/data-quality?${params}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Failed to fetch data quality: ${res.statusText}`);
    }
    return res.json();
  }
};
