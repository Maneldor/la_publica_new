import { getSession } from 'next-auth/react';

// URL base del backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ApiClientOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  requireAuth?: boolean;
}

/**
 * Cliente API que maneja automáticamente la autenticación
 */
export async function apiClient(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<Response> {
  const { body, requireAuth = true, ...customOptions } = options;

  // Obtener la sesión de NextAuth
  const session = await getSession();

  // Configurar headers
  const headers: Record<string, string> = {
    ...(customOptions.headers as Record<string, string>),
  };

  // Añadir Content-Type si hay body
  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  // Añadir Authorization si se requiere auth
  if (requireAuth) {
    console.log('🔍 DEBUGGING AUTH - Sesión actual:', session);

    // Prioridad 1: Token JWT duradero de NextAuth session
    let token = session?.user && (session.user as any).apiToken;
    console.log('🔑 TOKEN JWT EN SESIÓN:', token ? `${token.substring(0, 20)}...` : 'NO ENCONTRADO');

    // Prioridad 2: Token legacy del backend en sesión
    if (!token) {
      token = session?.user && (session.user as any).backendToken;
      console.log('🔑 TOKEN LEGACY EN SESIÓN:', token ? `${token.substring(0, 20)}...` : 'NO ENCONTRADO');
    }

    // Prioridad 3: Token en localStorage (fallback)
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('lapublica_token');
      console.log('🔑 TOKEN EN LOCALSTORAGE:', token ? `${token.substring(0, 20)}...` : 'NO ENCONTRADO');
      console.log('🔑 TOKEN LENGTH:', token?.length);
      if (token) {
        console.log('📦 Usando token de localStorage como fallback');
      }
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 Header Authorization configurado:', `Bearer ${token.substring(0, 20)}...`);
    } else if (session?.user) {
      console.log('⚠️ No hay JWT token disponible, autenticación puede fallar');
      console.log('👤 Datos de usuario en sesión:', {
        email: session.user.email,
        id: session.user.id,
        role: session.user.role
      });
      // Fallback: enviar headers de usuario para debug
      if (session.user.email) headers['X-User-Email'] = session.user.email;
      if (session.user.id) headers['X-User-Id'] = session.user.id;
      if (session.user.role) headers['X-User-Role'] = session.user.role;
    } else {
      console.log('❌ No hay sesión ni token disponible');
    }
  }

  const config: RequestInit = {
    ...customOptions,
    headers,
    credentials: 'include', // Incluir cookies
  };

  // Añadir body si existe
  if (body) {
    config.body = JSON.stringify(body);
  }

  // Construir URL completa
  const url = `${API_BASE}${endpoint}`;

  // LOGS DE DEBUGGING COMPLETOS
  console.log('📡 === REQUEST DEBUGGING ===');
  console.log('📡 URL:', url);
  console.log('📡 API_BASE:', API_BASE);
  console.log('📡 Headers:', headers);
  console.log('📡 Config completo:', config);
  console.log('📡 ========================');

  try {
    const response = await fetch(url, config);

    // Log para debugging
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }

    return response;
  } catch (error) {
    console.error('API Client Error:', error);
    throw error;
  }
}

/**
 * Helper para peticiones GET
 */
export async function apiGet<T = any>(
  endpoint: string,
  options?: Omit<ApiClientOptions, 'method' | 'body'>
): Promise<T> {
  const response = await apiClient(endpoint, {
    ...options,
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error: ${response.status}`);
  }

  const result = await response.json();
  return result.success && result.data ? result.data : result;
}

/**
 * Helper para peticiones POST
 */
export async function apiPost<T = any>(
  endpoint: string,
  data?: any,
  options?: Omit<ApiClientOptions, 'method' | 'body'>
): Promise<T> {
  console.log('🚀 apiPost iniciado para:', endpoint);
  console.log('📦 Datos a enviar:', data);

  const response = await apiClient(endpoint, {
    ...options,
    method: 'POST',
    body: data,
  });

  console.log('📡 Response status:', response.status);
  console.log('📡 Response headers:', response.headers);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    console.error('❌ Response error:', error);
    throw new Error(error.error || `Error: ${response.status}`);
  }

  const result = await response.json();
  console.log('✅ Response result:', result);
  return result.success && result.data ? result.data : result;
}

/**
 * Helper para peticiones PUT
 */
export async function apiPut<T = any>(
  endpoint: string,
  data?: any,
  options?: Omit<ApiClientOptions, 'method' | 'body'>
): Promise<T> {
  const response = await apiClient(endpoint, {
    ...options,
    method: 'PUT',
    body: data,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error: ${response.status}`);
  }

  const result = await response.json();
  return result.success && result.data ? result.data : result;
}

/**
 * Helper para peticiones DELETE
 */
export async function apiDelete<T = any>(
  endpoint: string,
  options?: Omit<ApiClientOptions, 'method'>
): Promise<T> {
  const response = await apiClient(endpoint, {
    ...options,
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error: ${response.status}`);
  }

  const result = await response.json();
  return result.success && result.data ? result.data : result;
}

/**
 * Helper para peticiones PATCH
 */
export async function apiPatch<T = any>(
  endpoint: string,
  data?: any,
  options?: Omit<ApiClientOptions, 'method' | 'body'>
): Promise<T> {
  const response = await apiClient(endpoint, {
    ...options,
    method: 'PATCH',
    body: data,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error: ${response.status}`);
  }

  const result = await response.json();
  return result.success && result.data ? result.data : result;
}