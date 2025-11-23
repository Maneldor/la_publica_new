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
export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type JobPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface ScrapingJob {
  id: string;
  sourceId: string;
  source: {
    id: string;
    name: string;
    type: string;
  };
  status: JobStatus;
  priority: JobPriority;
  progress: number;
  leadsGenerated: number;
  error?: string;
  config?: any;
  scheduledFor?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobStats {
  statusStats: Array<{ status: JobStatus; count: number }>;
  priorityStats: Array<{ priority: JobPriority; count: number }>;
  leadsGenerated: {
    total: number;
    average: number;
  };
  recentJobs: number;
  averageExecutionTime: number; // en ms
  successRate: number; // percentage
}

export interface JobHistoryOptions {
  status?: JobStatus[];
  sourceId?: string;
  page?: number;
  pageSize?: number;
}

export interface JobHistoryResult {
  jobs: ScrapingJob[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// API Functions
export const jobsAPI = {
  // GET /api/admin/jobs
  getAll: async (filters?: {
    status?: JobStatus | JobStatus[];
    priority?: JobPriority;
    sourceId?: string;
    limit?: number;
    offset?: number;
  }) => {
    const params: any = {};

    if (filters?.status) {
      params.status = Array.isArray(filters.status)
        ? filters.status.join(',')
        : filters.status;
    }
    if (filters?.priority) params.priority = filters.priority;
    if (filters?.sourceId) params.sourceId = filters.sourceId;
    if (filters?.limit) params.limit = filters.limit;
    if (filters?.offset) params.offset = filters.offset;

    const response = await api.get<{
      success: boolean;
      data: ScrapingJob[];
      pagination: {
        total: number;
        limit: number;
        offset: number;
      };
    }>('/jobs', { params });

    return response.data;
  },

  // GET /api/admin/jobs/:id
  getById: async (id: string) => {
    const response = await api.get<{
      success: boolean;
      data: ScrapingJob & {
        generatedLeads?: Array<{
          id: string;
          companyName: string;
          reviewStatus: string;
          aiScore: number;
          createdAt: string;
        }>;
      };
    }>(`/jobs/${id}`);
    return response.data;
  },

  // GET /api/admin/jobs/stats
  getStats: async (filters?: {
    sourceId?: string;
    since?: Date;
  }) => {
    const params: any = {};
    if (filters?.sourceId) params.sourceId = filters.sourceId;
    if (filters?.since) params.since = filters.since.toISOString();

    const response = await api.get<{
      success: boolean;
      data: JobStats;
    }>('/jobs/stats', { params });
    return response.data;
  },

  // GET /api/admin/jobs/active
  getActive: async () => {
    const response = await api.get<{
      success: boolean;
      data: ScrapingJob[];
      count: number;
    }>('/jobs/active');
    return response.data;
  },

  // GET /api/admin/jobs/history
  getHistory: async (options: JobHistoryOptions) => {
    const params: any = {};

    if (options.status && options.status.length > 0) {
      params.status = options.status.join(',');
    }
    if (options.sourceId) params.sourceId = options.sourceId;
    if (options.page) params.page = options.page;
    if (options.pageSize) params.pageSize = options.pageSize;

    const response = await api.get<{
      success: boolean;
      data: ScrapingJob[];
      pagination: JobHistoryResult['pagination'];
    }>('/jobs/history', { params });

    return {
      jobs: response.data.data,
      pagination: response.data.pagination,
    };
  },

  // POST /api/admin/jobs/:id/cancel
  cancel: async (id: string) => {
    const response = await api.post<{
      success: boolean;
      data: ScrapingJob;
      message: string;
    }>(`/jobs/${id}/cancel`);
    return response.data;
  },

  // POST /api/admin/jobs/:id/retry
  retry: async (id: string) => {
    const response = await api.post<{
      success: boolean;
      data: ScrapingJob;
      message: string;
    }>(`/jobs/${id}/retry`);
    return response.data;
  },

  // DELETE /api/admin/jobs/:id
  delete: async (id: string) => {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/jobs/${id}`);
    return response.data;
  },

  // DELETE /api/admin/jobs/cleanup
  cleanup: async (olderThanDays: number = 30) => {
    const response = await api.delete<{
      success: boolean;
      data: {
        deletedCount: number;
        message: string;
      };
    }>('/jobs/cleanup', {
      params: { days: olderThanDays }
    });
    return response.data;
  },
};