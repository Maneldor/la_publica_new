'use client';

import { useState, useEffect, useCallback } from 'react';
import { settingsAPI, GlobalSettings } from '@/lib/api/settings';

export function useSettings() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await settingsAPI.get();
      setSettings(result.data);
      console.log('✅ Settings loaded successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error loading settings';
      setError(errorMessage);
      console.error('❌ Error loading settings:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<GlobalSettings>) => {
    try {
      setSaving(true);
      setError(null);
      const result = await settingsAPI.update(updates);
      setSettings(result.data);
      console.log('✅', result.message || 'Settings updated successfully');
      return result.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error updating settings';
      setError(errorMessage);
      console.error('❌ Error updating settings:', errorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // Reset settings to defaults
  const resetSettings = useCallback(async () => {
    try {
      setResetting(true);
      setError(null);
      const result = await settingsAPI.reset();
      setSettings(result.data);
      console.log('✅', result.message || 'Settings reset to defaults');
      return result.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error resetting settings';
      setError(errorMessage);
      console.error('❌ Error resetting settings:', errorMessage);
      throw err;
    } finally {
      setResetting(false);
    }
  }, []);

  // Health check
  const checkHealth = useCallback(async () => {
    try {
      const result = await settingsAPI.healthCheck();
      console.log('✅ Health check completed:', result.data.status);
      return result.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error checking health';
      console.error('❌ Error checking health:', errorMessage);
      throw err;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    saving,
    resetting,
    error,
    fetchSettings,
    updateSettings,
    resetSettings,
    checkHealth,
  };
}