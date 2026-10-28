import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getApiBaseUrl, PRODUCTION_API_URL } from '../services/api';

describe('Frontend API URL Configuration', () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // Restore original env state
    (import.meta.env as any).VITE_API_BASE_URL = originalEnv.VITE_API_BASE_URL;
    (import.meta.env as any).PROD = originalEnv.PROD;
  });

  it('uses PRODUCTION_API_URL as default in production mode when VITE_API_BASE_URL is not set', () => {
    delete (import.meta.env as any).VITE_API_BASE_URL;
    (import.meta.env as any).PROD = true;

    const url = getApiBaseUrl();
    expect(url).toBe(PRODUCTION_API_URL);
    expect(url).toBe('https://windlens-backend.onrender.com');
  });

  it('uses empty string in development mode when VITE_API_BASE_URL is not set to leverage Vite proxy', () => {
    delete (import.meta.env as any).VITE_API_BASE_URL;
    (import.meta.env as any).PROD = false;

    const url = getApiBaseUrl();
    expect(url).toBe('');
  });

  it('uses explicit VITE_API_BASE_URL and trims trailing slashes', () => {
    (import.meta.env as any).VITE_API_BASE_URL = 'https://custom-backend.example.com///';
    (import.meta.env as any).PROD = true;

    const url = getApiBaseUrl();
    expect(url).toBe('https://custom-backend.example.com');
  });

  it('ignores empty string or whitespace-only VITE_API_BASE_URL in production', () => {
    (import.meta.env as any).VITE_API_BASE_URL = '   ';
    (import.meta.env as any).PROD = true;

    const url = getApiBaseUrl();
    expect(url).toBe(PRODUCTION_API_URL);
  });
});
