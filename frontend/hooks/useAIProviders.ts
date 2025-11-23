'use client';

import { useState, useEffect, useCallback } from 'react';
import { aiProvidersAPI, AIProvider, CreateAIProviderData, UpdateAIProviderData } from '@/lib/api/aiProviders';

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

export function useAIProviders() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch providers
  const fetchProviders = useCallback(async (filters?: { isActive?: boolean; type?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await aiProvidersAPI.getAll(filters);
      setProviders(result.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error loading AI providers';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create provider
  const createProvider = useCallback(async (data: CreateAIProviderData) => {
    try {
      const result = await aiProvidersAPI.create(data);
      setProviders(prev => [...prev, result.data]);
      showToast(result.message || 'AI Provider created successfully');
      return result.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error creating provider';
      showToast(errorMessage, 'error');
      throw err;
    }
  }, []);

  // Update provider
  const updateProvider = useCallback(async (id: string, data: UpdateAIProviderData) => {
    try {
      const result = await aiProvidersAPI.update(id, data);
      setProviders(prev => prev.map(p => p.id === id ? result.data : p));
      showToast(result.message || 'AI Provider updated successfully');
      return result.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error updating provider';
      showToast(errorMessage, 'error');
      throw err;
    }
  }, []);

  // Delete provider
  const deleteProvider = useCallback(async (id: string) => {
    try {
      const result = await aiProvidersAPI.delete(id);
      setProviders(prev => prev.filter(p => p.id !== id));
      showToast(result.message || 'AI Provider deleted successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error deleting provider';
      showToast(errorMessage, 'error');
      throw err;
    }
  }, []);

  // Test provider
  const testProvider = useCallback(async (id: string) => {
    try {
      const result = await aiProvidersAPI.test(id);
      if (result.data.success) {
        showToast(result.data.message || 'Connection test successful');
      } else {
        showToast(result.data.message || 'Connection test failed', 'error');
      }
      return result.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error testing provider';
      showToast(errorMessage, 'error');
      throw err;
    }
  }, []);

  // Toggle provider
  const toggleProvider = useCallback(async (id: string) => {
    try {
      const result = await aiProvidersAPI.toggle(id);
      setProviders(prev => prev.map(p => p.id === id ? result.data : p));
      showToast(result.message);
      return result.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error toggling provider';
      showToast(errorMessage, 'error');
      throw err;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return {
    providers,
    loading,
    error,
    fetchProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    testProvider,
    toggleProvider,
  };
}