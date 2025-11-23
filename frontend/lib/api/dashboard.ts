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
export interface DashboardStats {
  overview: {
    totalLeads: number;
    leadsToday: number;
    leadsThisWeek: number;
    leadsThisMonth: number;
    pendingReview: number;
    approvedLeads: number;
    rejectedLeads: number;
  };
  sources: {
    total: number;
    active: number;
    inactive: number;
    byType: Array<{ type: string; count: number }>;
    topPerformers: Array<{
      id: string;
      name: string;
      leadsGenerated: number;
      successRate: number;
    }>;
  };
  aiProviders: {
    total: number;
    active: number;
    byType: Array<{ type: string; count: number }>;
    usage: {
      totalRequests: number;
      successfulRequests: number;
      failedRequests: number;
      totalCost: number;
    };
  };
  jobs: {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    recentActivity: Array<{
      id: string;
      status: string;
      sourceName: string;
      leadsGenerated: number;
      createdAt: string;
    }>;
  };
  trends: {
    leadsPerDay: Array<{ date: string; count: number }>;
    successRateOverTime: Array<{ date: string; rate: number }>;
  };
}

export interface QuickStats {
  pendingReview: number;
  activeJobs: number;
  leadsToday: number;
  activeSources: number;
}

// API Functions
export const dashboardAPI = {
  // GET /api/admin/dashboard/stats
  getStats: async () => {
    const response = await api.get<{
      success: boolean;
      data: DashboardStats;
    }>('/dashboard/stats');
    return response.data;
  },

  // GET /api/admin/dashboard/quick-stats
  getQuickStats: async () => {
    const response = await api.get<{
      success: boolean;
      data: QuickStats;
    }>('/dashboard/quick-stats');
    return response.data;
  },
};