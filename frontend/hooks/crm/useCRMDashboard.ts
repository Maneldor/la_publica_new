'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  inProgressLeads: number;
  convertedLeads: number;
  totalValue: number;
  conversionRate: number;
  recentLeads: Array<{
    id: string;
    companyName: string;
    sector?: string;
    source: string;
    priority: string;
    status: string;
    estimatedValue?: number;
    createdAt: string;
  }>;
}

export const useCRMDashboard = () => {
  return useQuery({
    queryKey: ['crm-dashboard'],
    queryFn: async () => {
      try {
        // Intentar conectar con el backend real
        return await apiGet<DashboardStats>('/crm/dashboard');
      } catch (error) {
        console.log('Backend CRM no disponible, usando datos mock:', error);

        // Fallback a datos de ejemplo
        const mockDashboard: DashboardStats = {
          totalLeads: 45,
          newLeads: 12,
          inProgressLeads: 18,
          convertedLeads: 8,
          totalValue: 245000,
          conversionRate: 17.8,
          recentLeads: [
            {
              id: '1',
              companyName: 'Tech Solutions SL',
              sector: 'Tecnología',
              source: 'Web',
              priority: 'high',
              status: 'new',
              estimatedValue: 50000,
              createdAt: '2024-10-25T10:00:00Z'
            },
            {
              id: '2',
              companyName: 'Marketing Pro SA',
              sector: 'Marketing',
              source: 'Referido',
              priority: 'medium',
              status: 'contacted',
              estimatedValue: 25000,
              createdAt: '2024-10-24T15:30:00Z'
            },
            {
              id: '3',
              companyName: 'Construcciones García',
              sector: 'Construcción',
              source: 'LinkedIn',
              priority: 'low',
              status: 'new',
              estimatedValue: 15000,
              createdAt: '2024-10-24T12:00:00Z'
            },
            {
              id: '4',
              companyName: 'Servicios Digitales BCN',
              sector: 'Servicios',
              source: 'Evento',
              priority: 'high',
              status: 'negotiating',
              estimatedValue: 80000,
              createdAt: '2024-10-23T09:15:00Z'
            },
            {
              id: '5',
              companyName: 'Innovación Verde S.L.',
              sector: 'Sostenibilidad',
              source: 'Web',
              priority: 'medium',
              status: 'contacted',
              estimatedValue: 35000,
              createdAt: '2024-10-22T16:45:00Z'
            }
          ]
        };

        return mockDashboard;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};