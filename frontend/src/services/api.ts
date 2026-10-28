import {
  MetricSummary,
  GenerationSeriesResponse,
  DataQualityReport,
  HealthResponse
} from '../types';

export const PRODUCTION_API_URL = 'https://windlens-backend.onrender.com';

/**
 * Resolves the target API base URL.
 * Priority:
 * 1. Explicit VITE_API_BASE_URL environment variable if provided.
 * 2. In production builds (Vercel / deployed preview), fallback to the deployed Render backend.
 * 3. In local development, fallback to empty string to use Vite dev proxy (/api -> localhost:8000).
 */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  if (import.meta.env.PROD) {
    return PRODUCTION_API_URL;
  }
  return '';
}

export const API_BASE = getApiBaseUrl();

export const api = {
  async getHealth(): Promise<HealthResponse> {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/health`);
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
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/api/summary?${params}`);
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
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/api/generation?${params}`);
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
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/api/data-quality?${params}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Failed to fetch data quality: ${res.statusText}`);
    }
    return res.json();
  }
};
