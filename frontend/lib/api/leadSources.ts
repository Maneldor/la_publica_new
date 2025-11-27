import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper per obtenir token JWT (assumim que està en localStorage o cookie)
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

// Interceptor per afegir token a totes les requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface LeadSource {
  id: string;
  name: string;
  description?: string | null;
  type:
    | 'GOOGLE_MAPS'
    | 'WEB_SCRAPING'
    | 'API'
    | 'API_INTEGRATION'
    | 'CSV_IMPORT'
    | 'LINKEDIN'
    | 'CUSTOM'
    | 'MANUAL';
  isActive: boolean;
  aiProviderId?: string;
  config: {
    url?: string;
    query?: string;
    location?: string;
    radius?: number;
    maxResults?: number;
    filters?: Record<string, any>;
    headers?: Record<string, string>;
    payload?: Record<string, any>;
    mapping?: Record<string, string>;
    selectors?: Record<string, string>;
    delimiter?: string;
    skipRows?: number;
  };
  schedule?: {
    frequency: 'MANUAL' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    timezone?: string;
    daysOfWeek?: number[];
    isActive?: boolean;
  };
  frequency?: 'MANUAL' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  time?: string;
  lastRun?: string | null;
  nextRun?: string | null;
  totalLeads: number;
  leadsGenerated?: number;
  leadsApproved?: number;
  successRate?: number;
  successfulRuns: number;
  failedRuns?: number;
  lastRunAt?: string;
  nextRunAt?: string;
  lastRunStatus?: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING';
  lastRunError?: string;
  averageRunTime: number;
  createdAt: string;
  updatedAt: string;
  aiProvider?: {
    id: string;
    name: string;
    displayName: string;
    type: string;
  };
  _count?: {
    leads: number;
    scrapingJobs: number;
  };
}

export interface CreateLeadSourceData {
  name: string;
  type: LeadSource['type'];
  config: LeadSource['config'];
  schedule?: LeadSource['schedule'];
  aiProviderId?: string;
  isActive?: boolean;
}

export interface UpdateLeadSourceData {
  name?: string;
  config?: LeadSource['config'];
  schedule?: LeadSource['schedule'];
  aiProviderId?: string;
  isActive?: boolean;
}

export interface TestSourceResult {
  success: boolean;
  available: boolean;
  sampleData?: any[];
  estimatedLeads?: number;
  latency?: number;
  error?: string;
  message: string;
}

export interface ExecuteSourceResult {
  success: boolean;
  jobId: string;
  estimatedDuration?: number;
  message: string;
}

// API Functions
export const leadSourcesAPI = {
  // GET /api/admin/lead-sources
  getAll: async (filters?: { isActive?: boolean; type?: string }) => {
    const response = await api.get<{
      success: boolean;
      data: LeadSource[];
      count: number;
    }>('/lead-sources', { params: filters });
    return response.data;
  },

  // GET /api/admin/lead-sources/:id
  getById: async (id: string) => {
    const response = await api.get<{
      success: boolean;
      data: LeadSource;
    }>(`/lead-sources/${id}`);
    return response.data;
  },

  // POST /api/admin/lead-sources
  create: async (data: CreateLeadSourceData) => {
    const response = await api.post<{
      success: boolean;
      data: LeadSource;
      message: string;
    }>('/lead-sources', data);
    return response.data;
  },

  // PUT /api/admin/lead-sources/:id
  update: async (id: string, data: UpdateLeadSourceData) => {
    const response = await api.put<{
      success: boolean;
      data: LeadSource;
      message: string;
    }>(`/lead-sources/${id}`, data);
    return response.data;
  },

  // DELETE /api/admin/lead-sources/:id
  delete: async (id: string) => {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/lead-sources/${id}`);
    return response.data;
  },

  // POST /api/admin/lead-sources/:id/test
  test: async (id: string) => {
    const response = await api.post<{
      success: boolean;
      data: TestSourceResult;
    }>(`/lead-sources/${id}/test`);
    return response.data;
  },

  // POST /api/admin/lead-sources/:id/execute
  execute: async (id: string) => {
    const response = await api.post<{
      success: boolean;
      data: ExecuteSourceResult;
    }>(`/lead-sources/${id}/execute`);
    return response.data;
  },

  // PUT /api/admin/lead-sources/:id/toggle
  toggle: async (id: string) => {
    const response = await api.put<{
      success: boolean;
      data: LeadSource;
      message: string;
    }>(`/lead-sources/${id}/toggle`);
    return response.data;
  },

  // GET /api/admin/lead-sources/:id/status
  getStatus: async (id: string) => {
    const response = await api.get<{
      success: boolean;
      data: {
        status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING';
        progress?: number;
        message?: string;
        startedAt?: string;
        estimatedCompletion?: string;
      };
    }>(`/lead-sources/${id}/status`);
    return response.data;
  },
};