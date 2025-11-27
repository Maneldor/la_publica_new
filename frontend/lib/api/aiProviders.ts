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
export interface AIProvider {
  id: string;
  name: string;
  displayName: string;
  type: 'CLAUDE' | 'OPENAI' | 'GEMINI' | 'AZURE_OPENAI' | 'COHERE' | 'CUSTOM';
  isActive: boolean;
  isDefault: boolean;
  config: {
    apiKey?: string;
    model?: string;
    endpoint?: string;
    baseURL?: string;
    timeout?: number;
    maxTokens?: number;
    temperature?: number;
  };
  capabilities?: {
    leadAnalysis?: boolean;
    scoring?: boolean;
    pitchGeneration?: boolean;
    dataEnrichment?: boolean;
    classification?: boolean;
    validation?: boolean;
  };
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    leadSources: number;
    leads: number;
    aiLogs: number;
  };
}

export interface CreateAIProviderData {
  name: string;
  displayName: string;
  type: AIProvider['type'];
  config: AIProvider['config'];
  capabilities?: AIProvider['capabilities'];
  isActive?: boolean;
  isDefault?: boolean;
}

export interface UpdateAIProviderData {
  displayName?: string;
  config?: AIProvider['config'];
  capabilities?: AIProvider['capabilities'];
  isActive?: boolean;
  isDefault?: boolean;
}

export interface TestProviderResult {
  success: boolean;
  available: boolean;
  latency?: number;
  error?: string;
  message: string;
}

// API Functions
export const aiProvidersAPI = {
  // GET /api/admin/ai-providers
  getAll: async (filters?: { isActive?: boolean; type?: string }) => {
    const response = await api.get<{
      success: boolean;
      data: AIProvider[];
      count: number;
    }>('/ai-providers', { params: filters });
    return response.data;
  },

  // GET /api/admin/ai-providers/:id
  getById: async (id: string) => {
    const response = await api.get<{
      success: boolean;
      data: AIProvider;
    }>(`/ai-providers/${id}`);
    return response.data;
  },

  // POST /api/admin/ai-providers
  create: async (data: CreateAIProviderData) => {
    const response = await api.post<{
      success: boolean;
      data: AIProvider;
      message: string;
    }>('/ai-providers', data);
    return response.data;
  },

  // PUT /api/admin/ai-providers/:id
  update: async (id: string, data: UpdateAIProviderData) => {
    const response = await api.put<{
      success: boolean;
      data: AIProvider;
      message: string;
    }>(`/ai-providers/${id}`, data);
    return response.data;
  },

  // DELETE /api/admin/ai-providers/:id
  delete: async (id: string) => {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/ai-providers/${id}`);
    return response.data;
  },

  // POST /api/admin/ai-providers/:id/test
  test: async (id: string) => {
    const response = await api.post<{
      success: boolean;
      data: TestProviderResult;
    }>(`/ai-providers/${id}/test`);
    return response.data;
  },

  // PUT /api/admin/ai-providers/:id/toggle
  toggle: async (id: string) => {
    const response = await api.put<{
      success: boolean;
      data: AIProvider;
      message: string;
    }>(`/ai-providers/${id}/toggle`);
    return response.data;
  },
};