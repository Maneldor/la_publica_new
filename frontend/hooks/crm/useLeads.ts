'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api-client';

export interface CreateContactData {
  name: string;
  position?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  notes?: string;
}

export interface CreateLeadData {
  companyName: string;
  cif?: string;
  sector?: string;
  website?: string;
  employees?: number;
  source: string;
  priority: 'low' | 'medium' | 'high';
  estimatedValue?: number;
  notes?: string;
  contacts?: CreateContactData[];
}

export interface LeadSummary {
  id: string;
  companyName: string;
  cif?: string;
  sector?: string;
  source: string;
  priority: string;
  status: string;
  estimatedValue?: number;
  assignedToId?: string;
  assignedTo?: {
    id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  contacts: Array<{
    id: string;
    name: string;
    isPrimary: boolean;
  }>;
  _count: {
    contacts: number;
    interactions: number;
  };
}

export interface LeadsResponse {
  leads: LeadSummary[];
  total: number;
  hasMore: boolean;
}

export interface LeadsFilters {
  status?: string;
  priority?: string;
  source?: string;
  sector?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export const useLeads = (filters: LeadsFilters = {}) => {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      try {
        // Intentar conectar con el backend real
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });

        const queryString = params.toString();
        const endpoint = `/crm/leads${queryString ? `?${queryString}` : ''}`;

        return await apiGet<LeadsResponse>(endpoint);
      } catch (error) {
        console.log('Backend CRM no disponible, usando datos mock:', error);

        // Fallback a datos de ejemplo
        const mockLeads: LeadSummary[] = [
          {
            id: '1',
            companyName: 'Tech Solutions SL',
            cif: 'B12345678',
            sector: 'Tecnología',
            source: 'Web',
            priority: 'high',
            status: 'new',
            estimatedValue: 50000,
            assignedTo: { id: 'user1', email: 'manager@lapublica.com' },
            createdAt: '2024-10-25T10:00:00Z',
            updatedAt: '2024-10-25T10:00:00Z',
            contacts: [{ id: 'c1', name: 'Maria García', isPrimary: true }],
            _count: { contacts: 2, interactions: 0 }
          },
          {
            id: '2',
            companyName: 'Marketing Pro SA',
            cif: 'A87654321',
            sector: 'Marketing',
            source: 'Referido',
            priority: 'medium',
            status: 'contacted',
            estimatedValue: 25000,
            assignedTo: { id: 'user1', email: 'manager@lapublica.com' },
            createdAt: '2024-10-24T15:30:00Z',
            updatedAt: '2024-10-25T09:15:00Z',
            contacts: [{ id: 'c2', name: 'Pere López', isPrimary: true }],
            _count: { contacts: 1, interactions: 3 }
          }
        ];

        // Aplicar filtros básicos
        let filteredLeads = mockLeads;
        if (filters.search) {
          const search = filters.search.toLowerCase();
          filteredLeads = mockLeads.filter(lead =>
            lead.companyName.toLowerCase().includes(search) ||
            (lead.cif && lead.cif.toLowerCase().includes(search))
          );
        }
        if (filters.status) {
          filteredLeads = filteredLeads.filter(lead => lead.status === filters.status);
        }
        if (filters.priority) {
          filteredLeads = filteredLeads.filter(lead => lead.priority === filters.priority);
        }

        return {
          leads: filteredLeads,
          total: filteredLeads.length,
          hasMore: false
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeadData) => {
      try {
        // Intentar conectar con el backend real
        return await apiPost('/crm/leads', data);
      } catch (error) {
        console.log('Backend no disponible, usando simulación:', error);

        // Simulación de respuesta si el backend no está disponible
        await new Promise(resolve => setTimeout(resolve, 1500));

        const contacts = (data.contacts || []).map((contact, index) => ({
          id: 'contact-' + Date.now() + '-' + index,
          name: contact.name,
          position: contact.position || '',
          phone: contact.phone || '',
          email: contact.email || '',
          linkedin: contact.linkedin || '',
          isPrimary: index === 0, // Primer contacto es principal por defecto
          notes: contact.notes || '',
          createdAt: new Date().toISOString()
        }));

        const newLead = {
          id: 'lead-' + Date.now(),
          companyName: data.companyName,
          cif: data.cif,
          sector: data.sector,
          website: data.website,
          employees: data.employees,
          source: data.source,
          priority: data.priority,
          estimatedValue: data.estimatedValue,
          notes: data.notes,
          status: 'new',
          assignedTo: {
            id: 'user1',
            email: 'manager@lapublica.com'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          contacts,
          interactions: []
        };

        return newLead;
      }
    },
    onSuccess: () => {
      // Invalidar queries para recargar datos
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
};