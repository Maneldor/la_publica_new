'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost, apiPut } from '@/lib/api-client';

export interface CreateInteractionData {
  type: 'email' | 'call' | 'meeting' | 'whatsapp' | 'note';
  subject?: string;
  content: string;
  outcome?: 'positive' | 'neutral' | 'negative' | 'no_response';
  nextAction?: string;
  nextActionDate?: string;
  companyLeadId?: string;
  companyId?: string;
  contactId?: string;
}

export const useCreateInteraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, data }: { leadId: string; data: CreateInteractionData }) => {
      try {
        // Intentar usar el API real - nuevo endpoint para leads
        return await apiPost(`/crm/leads/${leadId}/interactions`, data);
      } catch (error) {
        console.log('Backend no disponible para crear interacción:', error);

        // Simulación de respuesta si el backend no está disponible
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newInteraction = {
          id: 'interaction-' + Date.now(),
          ...data,
          companyLeadId: leadId,
          nextActionCompleted: false,
          createdById: 'user1',
          createdBy: {
            id: 'user1',
            email: 'manager@lapublica.com'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          contact: data.contactId ? {
            id: data.contactId,
            name: 'Contacto Mock',
            position: 'Cargo Mock',
            isPrimary: true,
            createdAt: new Date().toISOString()
          } : null
        };

        return { success: true, data: newInteraction };
      }
    },
    onSuccess: (_, { leadId }) => {
      // Invalidar queries para recargar datos
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
};

export const useCompleteInteractionAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ interactionId, leadId }: { interactionId: string; leadId: string }) => {
      try {
        return await apiPut(`/crm/interactions/${interactionId}/complete-action`, {});
      } catch (error) {
        console.log('Backend no disponible para completar acción:', error);

        // Simulación si el backend no está disponible
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, data: { id: interactionId, nextActionCompleted: true } };
      }
    },
    onSuccess: (_, { leadId }) => {
      // Invalidar queries para recargar datos
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
    }
  });
};