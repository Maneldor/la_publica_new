'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { GlobalSettings } from '@/lib/api/settings';
import GeneralSettings from './components/GeneralSettings';
import LimitsSettings from './components/LimitsSettings';
import NotificationsSettings from './components/NotificationsSettings';
import MaintenanceSettings from './components/MaintenanceSettings';

// Types
interface SystemSettings {
  general: {
    systemName: string;
    defaultLanguage: string;
    timezone: string;
    autoApprove: boolean;
    autoApproveThreshold: number;
    autoAssign: boolean;
    assignmentMethod: string;
    strictEmailValidation: boolean;
    requirePhone: boolean;
    avoidDuplicates: boolean;
    duplicateCriteria: string;
  };
  limits: {
    maxConcurrentJobs: number;
    maxLeadsPerJob: number;
    maxJobDuration: number;
    requestDelay: number;
    maxAIRequestsPerMinute: number;
    maxDailyAICost: number;
    costAlertThreshold: number;
    maxDailyLeads: number;
    maxWeeklyLeads: number;
    deleteJobsAfterDays: number;
    deleteLogsAfterDays: number;
    archiveRejectedAfterDays: number;
  };
  notifications: {
    adminEmail: string;
    additionalEmails: string[];
    alerts: {
      jobFailed: { enabled: boolean; method: string };
      costExceeded: { enabled: boolean; method: string };
      rateLimitReached: { enabled: boolean; method: string };
      jobStuck: { enabled: boolean; method: string };
      sourceDown: { enabled: boolean; method: string };
      lowSuccessRate: { enabled: boolean; threshold: number };
      manyLowScores: { enabled: boolean; threshold: number };
    };
    summaries: {
      daily: { enabled: boolean; time: string };
      weekly: { enabled: boolean; day: string; time: string };
      content: {
        totalLeads: boolean;
        approvalRate: boolean;
        aiCost: boolean;
        topSources: boolean;
        errorsWarnings: boolean;
        scheduledJobs: boolean;
      };
    };
  };
  maintenance: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    autoCleanup: boolean;
    cleanupFrequency: string;
    autoBackup: boolean;
    backupFrequency: string;
    backupTime: string;
    lastBackup: string;
    logLevel: string;
    realtimeLogs: boolean;
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [localSettings, setLocalSettings] = useState<SystemSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<SystemSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Real API integration
  const {
    settings: globalSettings,
    loading,
    saving,
    error,
    updateSettings,
    resetSettings,
  } = useSettings();

  // Mock data
  const mockSettings: SystemSettings = {
    general: {
      systemName: 'La Pública - Lead Generation',
      defaultLanguage: 'ca',
      timezone: 'Europe/Madrid',
      autoApprove: false,
      autoApproveThreshold: 85,
      autoAssign: false,
      assignmentMethod: 'round-robin',
      strictEmailValidation: true,
      requirePhone: false,
      avoidDuplicates: true,
      duplicateCriteria: 'email-name',
    },
    limits: {
      maxConcurrentJobs: 3,
      maxLeadsPerJob: 100,
      maxJobDuration: 30,
      requestDelay: 1000,
      maxAIRequestsPerMinute: 50,
      maxDailyAICost: 50,
      costAlertThreshold: 80,
      maxDailyLeads: 500,
      maxWeeklyLeads: 2000,
      deleteJobsAfterDays: 30,
      deleteLogsAfterDays: 14,
      archiveRejectedAfterDays: 90,
    },
    notifications: {
      adminEmail: 'admin@lapublica.cat',
      additionalEmails: ['tech@lapublica.cat'],
      alerts: {
        jobFailed: { enabled: true, method: 'email' },
        costExceeded: { enabled: true, method: 'email' },
        rateLimitReached: { enabled: true, method: 'toast' },
        jobStuck: { enabled: true, method: 'email' },
        sourceDown: { enabled: true, method: 'email' },
        lowSuccessRate: { enabled: true, threshold: 60 },
        manyLowScores: { enabled: true, threshold: 50 },
      },
      summaries: {
        daily: { enabled: true, time: '09:00' },
        weekly: { enabled: true, day: 'monday', time: '10:00' },
        content: {
          totalLeads: true,
          approvalRate: true,
          aiCost: true,
          topSources: true,
          errorsWarnings: true,
          scheduledJobs: true,
        },
      },
    },
    maintenance: {
      maintenanceMode: false,
      maintenanceMessage: 'El sistema està en manteniment. Tornarà aviat.',
      autoCleanup: true,
      cleanupFrequency: 'weekly',
      autoBackup: true,
      backupFrequency: 'daily',
      backupTime: '02:00',
      lastBackup: '2024-11-21T02:00:00Z',
      logLevel: 'info',
      realtimeLogs: false,
    },
  };

  // Convert GlobalSettings to SystemSettings format
  const convertToSystemSettings = (global: GlobalSettings): SystemSettings => {
    return {
      general: {
        systemName: global.systemName,
        defaultLanguage: 'ca',
        timezone: 'Europe/Madrid',
        autoApprove: global.leadGeneration.enabled,
        autoApproveThreshold: global.leadGeneration.autoApprovalThreshold,
        autoAssign: false,
        assignmentMethod: 'round-robin',
        strictEmailValidation: true,
        requirePhone: false,
        avoidDuplicates: global.leadGeneration.duplicateCheckEnabled,
        duplicateCriteria: 'email-name',
      },
      limits: {
        maxConcurrentJobs: global.maxConcurrentJobs,
        maxLeadsPerJob: global.leadGeneration.maxLeadsPerJob,
        maxJobDuration: Math.round(global.defaultJobTimeout / 60), // Convert seconds to minutes
        requestDelay: global.scraping.defaultDelay,
        maxAIRequestsPerMinute: global.ai.maxRequestsPerMinute,
        maxDailyAICost: global.ai.costLimitPerDay,
        costAlertThreshold: global.ai.costLimitPerDay * 0.8, // 80% of max
        maxDailyLeads: 500,
        maxWeeklyLeads: 2000,
        deleteJobsAfterDays: global.leadGeneration.retentionDays,
        deleteLogsAfterDays: 14,
        archiveRejectedAfterDays: 90,
      },
      notifications: {
        adminEmail: global.email.fromEmail,
        additionalEmails: [],
        alerts: {
          jobFailed: { enabled: global.notifications.notifyOnJobFailed, method: 'email' },
          costExceeded: { enabled: global.notifications.notifyOnHighCosts, method: 'email' },
          rateLimitReached: { enabled: true, method: 'toast' },
          jobStuck: { enabled: true, method: 'email' },
          sourceDown: { enabled: true, method: 'email' },
          lowSuccessRate: { enabled: true, threshold: 60 },
          manyLowScores: { enabled: true, threshold: global.leadGeneration.qualityScoreThreshold },
        },
        summaries: {
          daily: { enabled: true, time: '09:00' },
          weekly: { enabled: true, day: 'monday', time: '10:00' },
          content: {
            totalLeads: true,
            approvalRate: true,
            aiCost: true,
            topSources: true,
            errorsWarnings: true,
            scheduledJobs: true,
          },
        },
      },
      maintenance: {
        maintenanceMode: global.maintenanceMode,
        maintenanceMessage: 'El sistema està en manteniment. Tornarà aviat.',
        autoCleanup: true,
        cleanupFrequency: 'weekly',
        autoBackup: global.backup.enabled,
        backupFrequency: global.backup.interval,
        backupTime: '02:00',
        lastBackup: new Date().toISOString(),
        logLevel: global.logLevel,
        realtimeLogs: false,
      },
    };
  };

  // Convert SystemSettings back to GlobalSettings
  const convertToGlobalSettings = (system: SystemSettings): Partial<GlobalSettings> => {
    return {
      systemName: system.general.systemName,
      maintenanceMode: system.maintenance.maintenanceMode,
      maxConcurrentJobs: system.limits.maxConcurrentJobs,
      defaultJobTimeout: system.limits.maxJobDuration * 60, // Convert minutes to seconds
      logLevel: system.maintenance.logLevel as 'error' | 'warn' | 'info' | 'debug',

      leadGeneration: {
        enabled: system.general.autoApprove,
        maxLeadsPerJob: system.limits.maxLeadsPerJob,
        autoApprovalThreshold: system.general.autoApproveThreshold,
        duplicateCheckEnabled: system.general.avoidDuplicates,
        qualityScoreThreshold: system.notifications.alerts.manyLowScores.threshold,
        retentionDays: system.limits.deleteJobsAfterDays,
      },

      ai: {
        maxRequestsPerMinute: system.limits.maxAIRequestsPerMinute,
        costLimitPerDay: system.limits.maxDailyAICost,
        timeoutSeconds: 30,
        retryAttempts: 3,
        defaultProvider: 'openai',
      },

      scraping: {
        defaultDelay: system.limits.requestDelay,
        maxRetries: 3,
        userAgent: 'LaPublica-Bot/1.0',
        respectRobotsTxt: true,
        enableCaching: true,
        cacheExpiryHours: 24,
      },

      notifications: {
        emailEnabled: true,
        notifyOnJobFailed: system.notifications.alerts.jobFailed.enabled,
        notifyOnHighCosts: system.notifications.alerts.costExceeded.enabled,
        notifyOnJobComplete: true,
        costThreshold: system.limits.costAlertThreshold,
        slackEnabled: false,
        slackWebhookUrl: '',
        discordEnabled: false,
        discordWebhookUrl: '',
      },

      backup: {
        enabled: system.maintenance.autoBackup,
        interval: system.maintenance.backupFrequency as 'daily' | 'weekly' | 'monthly',
        retentionDays: 30,
        location: '/backups',
        includeFiles: true,
        compression: true,
      },
    };
  };

  // Initialize local settings when global settings are loaded
  useEffect(() => {
    if (globalSettings) {
      const systemSettings = convertToSystemSettings(globalSettings);
      setLocalSettings(systemSettings);
      setOriginalSettings(JSON.parse(JSON.stringify(systemSettings)));
    }
  }, [globalSettings]);

  // Handle API errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error carregant configuració',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Detect changes
  useEffect(() => {
    if (localSettings && originalSettings) {
      const changed = JSON.stringify(localSettings) !== JSON.stringify(originalSettings);
      setHasChanges(changed);
    }
  }, [localSettings, originalSettings]);

  // Prevent navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  const validateSettings = (settings: SystemSettings): string[] => {
    const errors: string[] = [];

    // General validations
    if (settings.general.systemName.length < 3) {
      errors.push('Nom del sistema mínim 3 caràcters');
    }

    if (settings.general.autoApprove && (
      settings.general.autoApproveThreshold < 70 ||
      settings.general.autoApproveThreshold > 95
    )) {
      errors.push('Threshold d\'auto-aprovació entre 70-95');
    }

    // Limits validations
    if (settings.limits.maxJobDuration < 5 || settings.limits.maxJobDuration > 60) {
      errors.push('Durada màxima de job entre 5-60 minuts');
    }

    if (settings.limits.maxDailyAICost < settings.limits.costAlertThreshold) {
      errors.push('Cost màxim diari ha de ser >= threshold d\'alerta');
    }

    if (settings.limits.deleteJobsAfterDays < 7) {
      errors.push('Eliminar jobs després de mínim 7 dies');
    }

    // Notifications validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.notifications.adminEmail)) {
      errors.push('Email d\'administrador no vàlid');
    }

    for (const email of settings.notifications.additionalEmails) {
      if (!emailRegex.test(email)) {
        errors.push(`Email addicional no vàlid: ${email}`);
      }
    }

    // Maintenance validations
    if (settings.maintenance.maintenanceMessage.length > 200) {
      errors.push('Missatge de manteniment màxim 200 caràcters');
    }

    return errors;
  };

  const handleSaveSettings = async () => {
    if (!localSettings) return;

    try {
      // Validate
      const errors = validateSettings(localSettings);
      if (errors.length > 0) {
        toast({
          title: 'Errors de validació',
          description: errors.join(', '),
          variant: 'destructive',
        });
        return;
      }

      // Convert to GlobalSettings format and save
      const globalUpdates = convertToGlobalSettings(localSettings);
      await updateSettings(globalUpdates);

      setOriginalSettings(JSON.parse(JSON.stringify(localSettings)));
      setHasChanges(false);

      toast({
        title: '✅ Configuració desada',
        description: 'Els canvis s\'han aplicat correctament',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No s\'ha pogut desar la configuració',
        variant: 'destructive',
      });
    }
  };

  const handleDiscardChanges = () => {
    if (!originalSettings) return;

    const confirmed = confirm('Estàs segur que vols descartar tots els canvis?');
    if (confirmed) {
      setLocalSettings(JSON.parse(JSON.stringify(originalSettings)));
      setHasChanges(false);
      toast({
        title: 'Canvis descartats',
        description: 'S\'ha restaurat la configuració anterior',
      });
    }
  };

  const handleSettingsChange = (section: keyof SystemSettings, newSectionSettings: any) => {
    if (!localSettings) return;

    setLocalSettings(prev => ({
      ...prev!,
      [section]: newSectionSettings,
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'limits', label: 'Límits i Quotes', icon: AlertTriangle },
    { id: 'notifications', label: 'Notificacions', icon: Settings },
    { id: 'maintenance', label: 'Manteniment', icon: Settings },
  ];

  const getSystemStatus = () => {
    if (!localSettings) return { label: '⚙️ Carregant...', color: 'bg-gray-100 text-gray-700' };

    const hasBasicConfig = localSettings.general.systemName && localSettings.notifications.adminEmail;
    const hasLimitsConfig = localSettings.limits.maxDailyLeads > 0;

    if (hasBasicConfig && hasLimitsConfig) {
      return { label: '✅ Tot configurat', color: 'bg-green-100 text-green-700' };
    } else {
      return { label: '⚙️ En configuració', color: 'bg-yellow-100 text-yellow-700' };
    }
  };

  const systemStatus = getSystemStatus();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="flex space-x-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded w-32"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!localSettings) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="h-6 w-6" />
              Configuració del Sistema
            </h1>
            <p className="text-gray-600 mt-1">
              Paràmetres globals de generació automàtica de leads
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${systemStatus.color}`}>
            {systemStatus.label}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[600px]">
            {activeTab === 'general' && (
              <GeneralSettings
                settings={localSettings.general}
                onChange={(newSettings) => handleSettingsChange('general', newSettings)}
              />
            )}

            {activeTab === 'limits' && (
              <LimitsSettings
                settings={localSettings.limits}
                onChange={(newSettings) => handleSettingsChange('limits', newSettings)}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsSettings
                settings={localSettings.notifications}
                onChange={(newSettings) => handleSettingsChange('notifications', newSettings)}
              />
            )}

            {activeTab === 'maintenance' && (
              <MaintenanceSettings
                settings={localSettings.maintenance}
                onChange={(newSettings) => handleSettingsChange('maintenance', newSettings)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between shadow-lg z-50">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Canvis sense desar</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDiscardChanges}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              <RotateCcw className="h-4 w-4" />
              Descartar Canvis
            </button>

            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Desant...' : 'Desar Configuració'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}