'use client';

import { useState, useEffect, useCallback } from 'react';
import { leadSourcesAPI, LeadSource, CreateLeadSourceData, UpdateLeadSourceData } from '@/lib/api/leadSources';

// Simple toast function - replace with your toast system
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  if (typeof window !== 'undefined') {
    // You can replace this with your actual toast system (sonner, react-hot-toast, etc.)
    console.log(`[${type.toUpperCase()}] ${message}`);
    // For now, just show browser notification
    if (type === 'error') {
      alert(`Error: ${message}`);
    }
  }
};

export function useLeadSources() {
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch lead sources
  const fetchSources = useCallback(async (filters?: { isActive?: boolean; type?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await leadSourcesAPI.getAll(filters);
      setSources(result.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error loading lead sources';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create lead source
  const createSource = useCallback(async (data: CreateLeadSourceData) => {
    try {
      const result = await leadSourcesAPI.create(data);
      setSources(prev => [...prev, result.data]);
      showToast(result.message || 'Lead source created successfully');
      return result.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error creating lead source';
      showToast(errorMessage, 'error');
      throw err;
    }
  }, []);

  // Update lead source
  const updateSource = useCallback(async (id: string, data: UpdateLeadSourceData) => {
    try {
      const result = await leadSourcesAPI.update(id, data);
      setSources(prev => prev.map(s => s.id === id ? result.data : s));
      showToast(result.message || 'Lead source updated successfully');
      return result.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error updating lead source';
      showToast(errorMessage, 'error');
      throw err;
    }
  }, []);

  // Delete lead source
  const deleteSource = useCallback(async (id: string) => {
    try {
      const result = await leadSourcesAPI.delete(id);
      setSources(prev => prev.filter(s => s.id !== id));
      showToast(result.message || 'Lead source deleted successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error deleting lead source';
      showToast(errorMessage, 'error');
      throw err;
    }
  }, []);

  // Test lead source
  const testSource = useCallback(async (id: string) => {
    try {
      const result = await leadSourcesAPI.test(id);
      if (result.data.success) {
        showToast(result.data.message || 'Source test successful');
      } else {
        showToast(result.data.message || 'Source test failed', 'error');
      }
      return result.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error testing source';
      showToast(errorMessage, 'error');
      throw err;
    }
  }, []);

  // Execute lead source
  const executeSource = useCallback(async (id: string) => {
    try {
      const result = await leadSourcesAPI.execute(id);
      showToast(result.data.message || 'Source execution started');

      // Refresh the sources to update status
      await fetchSources();

      return result.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error executing source';
      showToast(errorMessage, 'error');
      throw err;
    }
  }, [fetchSources]);

  // Toggle lead source
  const toggleSource = useCallback(async (id: string) => {
    try {
      const result = await leadSourcesAPI.toggle(id);
      setSources(prev => prev.map(s => s.id === id ? result.data : s));
      showToast(result.message);
      return result.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error toggling source';
      showToast(errorMessage, 'error');
      throw err;
    }
  }, []);

  // Get source status
  const getSourceStatus = useCallback(async (id: string) => {
    try {
      const result = await leadSourcesAPI.getStatus(id);
      return result.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error getting source status';
      showToast(errorMessage, 'error');
      throw err;
    }
  }, []);

  // Get source by ID
  const getSourceById = useCallback(async (id: string) => {
    try {
      const result = await leadSourcesAPI.getById(id);
      return result.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error getting source';
      showToast(errorMessage, 'error');
      throw err;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  return {
    sources,
    loading,
    error,
    fetchSources,
    createSource,
    updateSource,
    deleteSource,
    testSource,
    executeSource,
    toggleSource,
    getSourceStatus,
    getSourceById,
  };
}