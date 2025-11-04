'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiPost, apiGet } from '@/lib/api-client';

export interface CreateEmpresaData {
  name: string;
  description: string;
  sector: string;
  size: 'startup' | 'pequeña' | 'mediana' | 'grande' | 'multinacional';
  email: string;
  phone?: string;
  website?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    province: string;
    country: string;
  };
  foundingYear?: number;
  employeeCount?: number;
  configuration?: {
    slogan?: string;
    services?: string[];
    images?: string[];
    logoUrl?: string;
    isVerified?: boolean;
    isFeatured?: boolean;
    isPinned?: boolean;
    status?: 'active' | 'pending' | 'suspended';
  };
}

export interface Empresa {
  id: string;
  name: string;
  description: string;
  sector: string;
  size: string;
  email: string;
  phone?: string;
  website?: string;
  address?: any;
  foundedYear?: number;
  employeeCount?: number;
  logo?: string;
  configuration?: any;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Hook para obtener empresas
export const useEmpresas = (filters?: {
  sector?: string;
  size?: string;
  verified?: boolean;
  active?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: ['empresas', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.sector) params.append('sector', filters.sector);
      if (filters?.size) params.append('tamaño', filters.size);
      if (filters?.verified !== undefined) params.append('verificada', filters.verified.toString());
      if (filters?.active !== undefined) params.append('activa', filters.active.toString());
      if (filters?.search) params.append('busqueda', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const queryString = params.toString();
      const endpoint = queryString ? `/companies?${queryString}` : '/companies';

      return apiGet(endpoint, { requireAuth: true });
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener una empresa específica
export const useEmpresa = (id: string) => {
  return useQuery({
    queryKey: ['empresa', id],
    queryFn: () => apiGet(`/companies/${id}`, { requireAuth: false }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para crear empresa
export const useCreateEmpresa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEmpresaData) => {
      // Mapear los datos del wizard al formato esperado por el backend
      const empresaData = {
        name: data.name,
        description: data.description,
        sector: data.sector,
        size: data.size,
        email: data.email,
        phone: data.phone,
        website: data.website,
        address: data.address,
        foundingYear: data.foundingYear,
        employeeCount: data.employeeCount,
        logoUrl: data.configuration?.logoUrl,
        configuration: {
          slogan: data.configuration?.slogan,
          services: data.configuration?.services || [],
          images: data.configuration?.images || [],
          isVerified: data.configuration?.isVerified || false,
          isFeatured: data.configuration?.isFeatured || false,
          isPinned: data.configuration?.isPinned || false,
          status: data.configuration?.status || 'active'
        }
      };

      console.log('📤 Enviando empresa al backend:', empresaData);
      return apiPost('/companies', empresaData, { requireAuth: true });
    },
    onSuccess: () => {
      // Invalidar y refrescar la lista de empresas
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
    }
  });
};

// Hook para subir imágenes (placeholder por ahora)
export const useUploadImages = () => {
  return useMutation({
    mutationFn: async (files: File[]) => {
      // Por ahora convertimos a Base64 para simular la subida
      // En producción esto debería subir al servidor y devolver URLs
      const base64Images = await Promise.all(
        files.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      return base64Images;
    }
  });
};