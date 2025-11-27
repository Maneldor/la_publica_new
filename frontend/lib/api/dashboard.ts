import axios from 'axios';
import { getSession } from 'next-auth/react';

// Obtener la URL base del backend
// IMPORTANTE: NEXT_PUBLIC_API_URL en .env.local es 'http://localhost:5000/api/v1'
// Necesitamos remover /api/v1 porque lo añadimos después en baseURL
const getApiBase = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  // Remover /api/v1 si está presente (puede estar al final con o sin trailing slash)
  let base = envUrl;
  
  // Caso 1: termina con /api/v1/
  if (base.endsWith('/api/v1/')) {
    base = base.replace(/\/api\/v1\/$/, '');
  }
  // Caso 2: termina con /api/v1
  else if (base.endsWith('/api/v1')) {
    base = base.replace(/\/api\/v1$/, '');
  }
  
  // Remover cualquier trailing slash restante
  base = base.replace(/\/$/, '');
  
  return base;
};

const API_BASE = getApiBase();

// Función para obtener token con la misma lógica que api-client.ts
const getAuthToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Intentar obtener sesión de NextAuth
    const session = await getSession();

    // Prioridad 1: Token JWT duradero de NextAuth session
    let token = session?.user && (session.user as any).apiToken;
    if (token) {
      return token;
    }

    // Prioridad 2: Token legacy del backend en sesión
    token = session?.user && (session.user as any).backendToken;
    if (token) {
      return token;
    }

    // Prioridad 3: Token en localStorage (fallback)
    token = localStorage.getItem('lapublica_token');
    if (token) {
      return token;
    }

    // Prioridad 4: Token legacy en localStorage
    token = localStorage.getItem('token');
    if (token) {
      return token;
    }

    return null;
  } catch (error) {
    console.error('Error obteniendo token:', error);
    return null;
  }
};

// Construir baseURL de forma explícita
const BASE_URL = `${API_BASE}/api/v1/admin`;

// Debug en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔍 NEXT_PUBLIC_API_URL original:', process.env.NEXT_PUBLIC_API_URL);
  console.log('🔍 API_BASE procesado:', API_BASE);
  console.log('🔍 BASE_URL final:', BASE_URL);
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos timeout
});

// Interceptor para manejar errores de conexión y autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Error de conexión
    if (error.code === 'ECONNREFUSED' || error.message.includes('ERR_CONNECTION_REFUSED')) {
      console.warn('⚠️ Backend no disponible. Usando datos mock.');
      throw new Error('BACKEND_UNAVAILABLE');
    }

    // Error de autenticación
    if (error.response?.status === 401) {
      console.error('❌ Error de autenticación:', error.response?.data?.error || 'Token inválido o expirado');
      // No redirigir automáticamente, dejar que el componente maneje el error
    }

    // Error de permisos
    if (error.response?.status === 403) {
      console.error('❌ Error de permisos:', error.response?.data?.error || 'Acceso denegado');
    }

    return Promise.reject(error);
  }
);

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

// Datos mock para cuando el backend no está disponible
const mockStats: DashboardStats = {
  overview: {
    totalLeads: 0,
    leadsToday: 0,
    leadsThisWeek: 0,
    leadsThisMonth: 0,
    pendingReview: 0,
    approvedLeads: 0,
    rejectedLeads: 0,
  },
  sources: {
    total: 0,
    active: 0,
    inactive: 0,
    byType: [],
    topPerformers: [],
  },
  aiProviders: {
    total: 0,
    active: 0,
    byType: [],
    usage: {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalCost: 0,
    },
  },
  jobs: {
    total: 0,
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
    recentActivity: [],
  },
  trends: {
    leadsPerDay: [],
    successRateOverTime: [],
  },
};

const mockQuickStats: QuickStats = {
  pendingReview: 0,
  activeJobs: 0,
  leadsToday: 0,
  activeSources: 0,
};

// API Functions
export const dashboardAPI = {
  // GET /api/v1/admin/dashboard/stats
  getStats: async () => {
    try {
      // Obtener token antes de hacer la llamada
      const token = await getAuthToken();
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('⚠️ No se encontró token de autenticación para dashboard API');
      }

      // Debug: verificar URL completa antes de la llamada
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log('🔍 Llamando a:', `${api.defaults.baseURL}/dashboard/stats`);
      }

      const response = await api.get<{
        success: boolean;
        data: DashboardStats;
      }>('/dashboard/stats', { headers });
      return response.data;
    } catch (error: any) {
      // Error de conexión
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        console.warn('⚠️ Backend no disponible. Usando datos mock.');
        return {
          success: true,
          data: mockStats,
        };
      }
      
      // Error de autenticación o permisos
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('❌ Error de autenticación/permisos:', error.response?.data?.error);
        // Retornar datos mock en lugar de fallar
        return {
          success: true,
          data: mockStats,
        };
      }
      
      throw error;
    }
  },

  // GET /api/v1/admin/dashboard/quick-stats
  getQuickStats: async () => {
    try {
      // Obtener token antes de hacer la llamada
      const token = await getAuthToken();
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Debug: verificar URL completa antes de la llamada
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log('🔍 Llamando a:', `${api.defaults.baseURL}/dashboard/quick-stats`);
      }

      const response = await api.get<{
        success: boolean;
        data: QuickStats;
      }>('/dashboard/quick-stats', { headers });
      return response.data;
    } catch (error: any) {
      // Error de conexión
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        console.warn('⚠️ Backend no disponible. Usando datos mock.');
        return {
          success: true,
          data: mockQuickStats,
        };
      }
      
      // Error de autenticación o permisos
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('❌ Error de autenticación/permisos:', error.response?.data?.error);
        // Retornar datos mock en lugar de fallar
        return {
          success: true,
          data: mockQuickStats,
        };
      }
      
      throw error;
    }
  },
};