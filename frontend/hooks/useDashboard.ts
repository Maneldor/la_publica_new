'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardAPI, DashboardStats, QuickStats } from '@/lib/api/dashboard';

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch full stats
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardAPI.getStats();
      setStats(result.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error loading dashboard stats';
      setError(errorMessage);
      console.error('❌ Error loading stats:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch quick stats (més lleuger)
  const fetchQuickStats = useCallback(async () => {
    try {
      const result = await dashboardAPI.getQuickStats();
      setQuickStats(result.data);
    } catch (err: any) {
      console.error('❌ Error loading quick stats:', err.response?.data?.error || err.message);
    }
  }, []);

  // Auto-refresh quick stats cada 30 segons
  useEffect(() => {
    fetchQuickStats();

    const interval = setInterval(() => {
      fetchQuickStats();
    }, 30000); // 30s

    return () => clearInterval(interval);
  }, [fetchQuickStats]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    quickStats,
    loading,
    error,
    refreshStats: fetchStats,
    refreshQuickStats: fetchQuickStats,
  };
}