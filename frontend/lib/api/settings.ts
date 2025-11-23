import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
};

const api = axios.create({
  baseURL: `${API_BASE}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface GlobalSettings {
  // Sistema General
  systemName: string;
  systemDescription: string;
  maintenanceMode: boolean;
  maxConcurrentJobs: number;
  defaultJobTimeout: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';

  // Configuració Lead Generation
  leadGeneration: {
    enabled: boolean;
    maxLeadsPerJob: number;
    autoApprovalThreshold: number;
    duplicateCheckEnabled: boolean;
    qualityScoreThreshold: number;
    retentionDays: number;
  };

  // Configuració IA
  ai: {
    defaultProvider: string;
    maxRequestsPerMinute: number;
    timeoutSeconds: number;
    retryAttempts: number;
    costLimitPerDay: number;
  };

  // Configuració Scraping
  scraping: {
    defaultDelay: number;
    maxRetries: number;
    userAgent: string;
    respectRobotsTxt: boolean;
    enableCaching: boolean;
    cacheExpiryHours: number;
  };

  // Configuració Email
  email: {
    enabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    enableTLS: boolean;
  };

  // Configuració Notificacions
  notifications: {
    emailEnabled: boolean;
    slackEnabled: boolean;
    slackWebhookUrl: string;
    discordEnabled: boolean;
    discordWebhookUrl: string;
    notifyOnJobComplete: boolean;
    notifyOnJobFailed: boolean;
    notifyOnHighCosts: boolean;
    costThreshold: number;
  };

  // Configuració Seguretat
  security: {
    enableApiKeyRotation: boolean;
    apiKeyExpiryDays: number;
    enableRateLimit: boolean;
    rateLimitPerMinute: number;
    enableIpWhitelist: boolean;
    ipWhitelist: string[];
    sessionTimeoutMinutes: number;
  };

  // Configuració Monitoring
  monitoring: {
    enableMetrics: boolean;
    metricsRetentionDays: number;
    enableHealthChecks: boolean;
    healthCheckInterval: number;
    enableAlerting: boolean;
    alertThresholds: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      errorRate: number;
    };
  };

  // Configuració Backup
  backup: {
    enabled: boolean;
    interval: 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
    location: string;
    includeFiles: boolean;
    compression: boolean;
  };
}

// API Functions
export const settingsAPI = {
  // GET /api/admin/settings
  get: async () => {
    const response = await api.get<{
      success: boolean;
      data: GlobalSettings;
    }>('/settings');
    return response.data;
  },

  // PUT /api/admin/settings
  update: async (settings: Partial<GlobalSettings>) => {
    const response = await api.put<{
      success: boolean;
      data: GlobalSettings;
      message: string;
    }>('/settings', settings);
    return response.data;
  },

  // POST /api/admin/settings/reset
  reset: async () => {
    const response = await api.post<{
      success: boolean;
      data: GlobalSettings;
      message: string;
    }>('/settings/reset');
    return response.data;
  },

  // GET /api/admin/settings/health
  healthCheck: async () => {
    const response = await api.get<{
      success: boolean;
      data: {
        status: 'healthy' | 'degraded' | 'unhealthy';
        services: Record<string, 'up' | 'down' | 'degraded'>;
        timestamp: string;
      };
    }>('/settings/health');
    return response.data;
  },
};