'use client';

import { useQuery } from '@tanstack/react-query';

export interface CRMEmpresa {
  id: string;
  name: string;
  description?: string;
  sector: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  cif: string;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  isActive: boolean;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  currentPlan?: {
    id: string;
    name: string;
    nombreCorto: string;
    tier: string;
  };
  createdBy?: {
    id: string;
    email: string;
    name?: string;
    userType: string;
  };
  assignedTo?: {
    id: string;
    email: string;
    name?: string;
  };
  lastContactedAt?: string;
  nextFollowUp?: string;
  leadScore?: number;
  interactions?: number;
}

export const useCRMEmpresas = () => {
  return useQuery({
    queryKey: ['crm-empresas'],
    queryFn: async (): Promise<CRMEmpresa[]> => {
      const response = await fetch('/api/crm/companies');

      if (!response.ok) {
        throw new Error('Error al cargar empresas desde CRM');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error desconocido');
      }

      return data.companies || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2
  });
};