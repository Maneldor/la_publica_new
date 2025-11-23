'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  jobsAPI,
  ScrapingJob,
  JobStats,
  JobStatus,
  JobPriority,
  JobHistoryOptions
} from '@/lib/api/jobs';

export function useJobs() {
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [activeJobs, setActiveJobs] = useState<ScrapingJob[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all jobs
  const fetchJobs = useCallback(async (filters?: {
    status?: JobStatus | JobStatus[];
    priority?: JobPriority;
    sourceId?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await jobsAPI.getAll(filters);
      setJobs(result.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error loading jobs';
      setError(errorMessage);
      console.error('❌ Error loading jobs:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch active jobs
  const fetchActiveJobs = useCallback(async () => {
    try {
      const result = await jobsAPI.getActive();
      setActiveJobs(result.data);
    } catch (err: any) {
      console.error('❌ Error loading active jobs:', err.response?.data?.error || err.message);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async (filters?: {
    sourceId?: string;
    since?: Date;
  }) => {
    try {
      const result = await jobsAPI.getStats(filters);
      setStats(result.data);
    } catch (err: any) {
      console.error('❌ Error loading stats:', err.response?.data?.error || err.message);
    }
  }, []);

  // Fetch job by ID
  const fetchJobById = useCallback(async (id: string) => {
    try {
      const result = await jobsAPI.getById(id);
      return result.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error loading job';
      console.error('❌', errorMessage);
      throw err;
    }
  }, []);

  // Fetch history with pagination
  const fetchHistory = useCallback(async (options: JobHistoryOptions) => {
    try {
      const result = await jobsAPI.getHistory(options);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error loading history';
      console.error('❌', errorMessage);
      throw err;
    }
  }, []);

  // Cancel job
  const cancelJob = useCallback(async (id: string) => {
    try {
      const result = await jobsAPI.cancel(id);
      setJobs(prev => prev.map(j => j.id === id ? result.data : j));
      setActiveJobs(prev => prev.filter(j => j.id !== id));
      console.log('✅', result.message || 'Job cancelled');
      return result.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error cancelling job';
      console.error('❌', errorMessage);
      throw err;
    }
  }, []);

  // Retry job
  const retryJob = useCallback(async (id: string) => {
    try {
      const result = await jobsAPI.retry(id);
      console.log('✅', result.message || 'Job retry scheduled');
      // Refrescar jobs per veure el nou job
      await fetchJobs();
      return result.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error retrying job';
      console.error('❌', errorMessage);
      throw err;
    }
  }, [fetchJobs]);

  // Delete job
  const deleteJob = useCallback(async (id: string) => {
    try {
      const result = await jobsAPI.delete(id);
      setJobs(prev => prev.filter(j => j.id !== id));
      console.log('✅', result.message || 'Job deleted');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error deleting job';
      console.error('❌', errorMessage);
      throw err;
    }
  }, []);

  // Cleanup old jobs
  const cleanupOldJobs = useCallback(async (olderThanDays: number = 30) => {
    try {
      const result = await jobsAPI.cleanup(olderThanDays);
      console.log('✅', result.data.message);
      // Refrescar jobs
      await fetchJobs();
      return result.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error cleaning up jobs';
      console.error('❌', errorMessage);
      throw err;
    }
  }, [fetchJobs]);

  // Auto-refresh per jobs actius (cada 10 segons)
  useEffect(() => {
    fetchActiveJobs();

    const interval = setInterval(() => {
      fetchActiveJobs();
    }, 10000); // 10s

    return () => clearInterval(interval);
  }, [fetchActiveJobs]);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, [fetchJobs, fetchStats]);

  return {
    jobs,
    activeJobs,
    stats,
    loading,
    error,
    fetchJobs,
    fetchActiveJobs,
    fetchStats,
    fetchJobById,
    fetchHistory,
    cancelJob,
    retryJob,
    deleteJob,
    cleanupOldJobs,
  };
}