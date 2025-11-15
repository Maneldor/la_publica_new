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
      // Usar la API local de Next.js en lugar del backend Express
      const response = await fetch('/api/admin/companies');

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error('Error al obtener empresas');
      }

      let companies = result.data || [];

      // Aplicar filtros del lado del cliente (temporalmente)
      if (filters?.sector && filters.sector !== 'all') {
        companies = companies.filter((c: Empresa) => c.sector === filters.sector);
      }

      if (filters?.verified !== undefined) {
        companies = companies.filter((c: Empresa) => c.isVerified === filters.verified);
      }

      if (filters?.active !== undefined) {
        companies = companies.filter((c: Empresa) => c.isActive === filters.active);
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        companies = companies.filter((c: Empresa) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.limit) {
        companies = companies.slice(0, filters.limit);
      }

      return companies;
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