'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '@/lib/api-client';

export interface Lead {
  id: string;
  companyName: string;
  cif?: string;
  sector?: string;
  website?: string;
  employees?: number;
  source: string;
  priority: string;
  status: string;
  lostReason?: string;
  estimatedValue?: number;
  notes?: string;
  assignedToId?: string;
  assignedTo?: {
    id: string;
    email: string;
  };
  convertedToCompanyId?: string;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
  contacts: Contact[];
  interactions: Interaction[];
}

export interface Contact {
  id: string;
  name: string;
  position?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  isPrimary: boolean;
  notes?: string;
  createdAt: string;
}

export interface Interaction {
  id: string;
  type: string;
  subject?: string;
  content: string;
  outcome?: string;
  nextAction?: string;
  nextActionDate?: string;
  nextActionCompleted: boolean;
  contactId?: string;
  contact?: Contact;
  createdById: string;
  createdBy: {
    id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const useLeadDetail = (id: string) => {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      try {
        // Intentar usar el API real primero
        return await apiGet<Lead>(`/crm/leads/${id}`);
      } catch (error) {
        console.log('Backend CRM no disponible, usando datos mock:', error);

        // Fallback a datos de ejemplo si el backend no está disponible
        const mockLeads: { [key: string]: Lead } = {
        '1': {
          id: '1',
          companyName: 'Tech Solutions BCN',
          cif: 'B12345678',
          sector: 'Tecnología',
          website: 'www.techsolutions.com',
          employees: 25,
          source: 'Formulario Web',
          priority: 'high',
          status: 'new',
          estimatedValue: 15000,
          notes: 'Empresa emergente con mucho potencial. Interesados en nuestros servicios de transformación digital.',
          assignedTo: {
            id: 'user1',
            email: 'manager@lapublica.com'
          },
          createdAt: '2024-10-29T10:30:00Z',
          updatedAt: '2024-10-29T10:30:00Z',
          contacts: [
            {
              id: 'contact1',
              name: 'Maria García',
              position: 'CEO',
              phone: '+34 666 777 888',
              email: 'maria@techsolutions.com',
              linkedin: 'https://linkedin.com/in/mariagarcia',
              isPrimary: true,
              notes: 'Muy receptiva a nuevas tecnologías',
              createdAt: '2024-10-29T10:30:00Z'
            },
            {
              id: 'contact2',
              name: 'Josep Martínez',
              position: 'CTO',
              phone: '+34 666 555 444',
              email: 'josep@techsolutions.com',
              isPrimary: false,
              notes: 'Contacto técnico principal',
              createdAt: '2024-10-29T10:35:00Z'
            }
          ],
          interactions: [
            {
              id: 'int1',
              type: 'email',
              subject: 'Información sobre servicios',
              content: 'Primer contacto vía email. La empresa está interesada en conocer más sobre nuestros servicios de transformación digital.',
              outcome: 'Positivo - Acordamos una llamada de seguimiento',
              nextAction: 'Llamada de seguimiento',
              nextActionDate: '2024-10-30T10:00:00Z',
              nextActionCompleted: false,
              contactId: 'contact1',
              contact: {
                id: 'contact1',
                name: 'Maria García',
                position: 'CEO',
                phone: '+34 666 777 888',
                email: 'maria@techsolutions.com',
                isPrimary: true,
                notes: 'Muy receptiva a nuevas tecnologías',
                createdAt: '2024-10-29T10:30:00Z'
              },
              createdById: 'user1',
              createdBy: {
                id: 'user1',
                email: 'manager@lapublica.com'
              },
              createdAt: '2024-10-29T11:00:00Z',
              updatedAt: '2024-10-29T11:00:00Z'
            }
          ]
        },
        '2': {
          id: '2',
          companyName: 'Innovació Digital SL',
          cif: 'A87654321',
          sector: 'Marketing Digital',
          website: 'www.innovaciodigital.com',
          employees: 15,
          source: 'Referido',
          priority: 'medium',
          status: 'contacted',
          estimatedValue: 8500,
          notes: 'Empresa especializada en marketing digital. Buscan ampliar su oferta de servicios.',
          assignedTo: {
            id: 'user1',
            email: 'manager@lapublica.com'
          },
          createdAt: '2024-10-28T14:15:00Z',
          updatedAt: '2024-10-29T09:00:00Z',
          contacts: [
            {
              id: 'contact3',
              name: 'Pere López',
              position: 'Director Comercial',
              phone: '+34 666 333 222',
              email: 'pere@innovaciodigital.com',
              isPrimary: true,
              notes: 'Contacto principal para temas comerciales',
              createdAt: '2024-10-28T14:15:00Z'
            }
          ],
          interactions: [
            {
              id: 'int2',
              type: 'call',
              subject: 'Llamada inicial',
              content: 'Primera llamada comercial. Mostraron interés en nuestros servicios.',
              outcome: 'Muy positivo - Solicitaron propuesta',
              nextAction: 'Enviar propuesta comercial',
              nextActionDate: '2024-10-30T16:00:00Z',
              nextActionCompleted: false,
              contactId: 'contact3',
              contact: {
                id: 'contact3',
                name: 'Pere López',
                position: 'Director Comercial',
                phone: '+34 666 333 222',
                email: 'pere@innovaciodigital.com',
                isPrimary: true,
                notes: 'Contacto principal para temas comerciales',
                createdAt: '2024-10-28T14:15:00Z'
              },
              createdById: 'user1',
              createdBy: {
                id: 'user1',
                email: 'manager@lapublica.com'
              },
              createdAt: '2024-10-28T15:30:00Z',
              updatedAt: '2024-10-28T15:30:00Z'
            },
            {
              id: 'int3',
              type: 'email',
              subject: 'Información adicional',
              content: 'Envío de información adicional sobre nuestros servicios y casos de éxito.',
              outcome: 'Información enviada correctamente',
              nextAction: 'Revisar feedback',
              nextActionDate: '2024-10-31T10:00:00Z',
              nextActionCompleted: false,
              contactId: 'contact3',
              contact: {
                id: 'contact3',
                name: 'Pere López',
                position: 'Director Comercial',
                phone: '+34 666 333 222',
                email: 'pere@innovaciodigital.com',
                isPrimary: true,
                notes: 'Contacto principal para temas comerciales',
                createdAt: '2024-10-28T14:15:00Z'
              },
              createdById: 'user1',
              createdBy: {
                id: 'user1',
                email: 'manager@lapublica.com'
              },
              createdAt: '2024-10-29T09:00:00Z',
              updatedAt: '2024-10-29T09:00:00Z'
            }
          ]
        },
        '3': {
          id: '3',
          companyName: 'Sostenibilitat Empresarial',
          cif: 'B98765432',
          sector: 'Consultoría',
          website: 'www.sostenibilitat.com',
          employees: 45,
          source: 'LinkedIn',
          priority: 'high',
          status: 'negotiating',
          estimatedValue: 22000,
          notes: 'Consultora especializada en sostenibilidad. Proyecto de gran envergadura.',
          assignedTo: {
            id: 'user1',
            email: 'manager@lapublica.com'
          },
          createdAt: '2024-10-27T09:45:00Z',
          updatedAt: '2024-10-29T14:00:00Z',
          contacts: [
            {
              id: 'contact4',
              name: 'Anna Puig',
              position: 'Directora General',
              phone: '+34 666 111 000',
              email: 'anna@sostenibilitat.com',
              linkedin: 'https://linkedin.com/in/annapuig',
              isPrimary: true,
              notes: 'Muy interesada en innovación tecnológica',
              createdAt: '2024-10-27T09:45:00Z'
            },
            {
              id: 'contact5',
              name: 'Marc Vila',
              position: 'Director de Proyectos',
              phone: '+34 666 999 888',
              email: 'marc@sostenibilitat.com',
              isPrimary: false,
              notes: 'Responsable de la implementación técnica',
              createdAt: '2024-10-27T10:00:00Z'
            }
          ],
          interactions: [
            {
              id: 'int4',
              type: 'meeting',
              subject: 'Reunión inicial',
              content: 'Reunión presencial para presentar nuestros servicios y entender sus necesidades.',
              outcome: 'Excelente recepción - Interés en colaboración',
              nextAction: 'Preparar propuesta detallada',
              nextActionDate: '2024-10-31T11:00:00Z',
              nextActionCompleted: false,
              contactId: 'contact4',
              contact: {
                id: 'contact4',
                name: 'Anna Puig',
                position: 'Directora General',
                phone: '+34 666 111 000',
                email: 'anna@sostenibilitat.com',
                linkedin: 'https://linkedin.com/in/annapuig',
                isPrimary: true,
                notes: 'Muy interesada en innovación tecnológica',
                createdAt: '2024-10-27T09:45:00Z'
              },
              createdById: 'user1',
              createdBy: {
                id: 'user1',
                email: 'manager@lapublica.com'
              },
              createdAt: '2024-10-28T11:30:00Z',
              updatedAt: '2024-10-28T11:30:00Z'
            },
            {
              id: 'int5',
              type: 'whatsapp',
              content: 'Confirmación de reunión de seguimiento para la próxima semana.',
              outcome: 'Reunión confirmada',
              nextAction: 'Reunión de seguimiento',
              nextActionDate: '2024-11-01T15:00:00Z',
              nextActionCompleted: false,
              contactId: 'contact4',
              contact: {
                id: 'contact4',
                name: 'Anna Puig',
                position: 'Directora General',
                phone: '+34 666 111 000',
                email: 'anna@sostenibilitat.com',
                linkedin: 'https://linkedin.com/in/annapuig',
                isPrimary: true,
                notes: 'Muy interesada en innovación tecnológica',
                createdAt: '2024-10-27T09:45:00Z'
              },
              createdById: 'user1',
              createdBy: {
                id: 'user1',
                email: 'manager@lapublica.com'
              },
              createdAt: '2024-10-29T14:00:00Z',
              updatedAt: '2024-10-29T14:00:00Z'
            }
          ]
        }
      };

        const lead = mockLeads[id];
        if (!lead) {
          throw new Error('Lead no encontrado');
        }

        return lead;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Lead> }) => {
      try {
        return await apiPut(`/crm/leads/${id}`, data);
      } catch (error) {
        console.log('Backend no disponible para actualizar lead:', error);
        // En simulación, devolver datos ficticios
        return { id, ...data };
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
};