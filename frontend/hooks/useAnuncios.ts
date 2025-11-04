import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiGet, apiPost, apiPut, apiDelete, apiClient } from '@/lib/api-client';
import type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  AnnouncementFilters
} from '@/lib/validations/anuncios';

// Tipos de respuesta
interface Anuncio {
  id: string;
  title: string;
  content: string;
  summary?: string;
  type: string;
  priority: number;
  status: string;
  audience: string;
  targetCommunities: string[];
  targetRoles: string[];
  publishAt?: Date;
  expiresAt?: Date;
  sendNotification: boolean;
  notificationChannels: string[];
  imageUrl?: string;
  attachmentUrl?: string;
  externalUrl?: string;
  tags: string[];
  isSticky: boolean;
  allowComments: boolean;
  slug?: string;
  views: number;
  reactions: number;
  commentsCount: number;
  sharesCount: number;
  communityId?: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  author: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
  community?: {
    id: string;
    nombre: string;
  };
  _count?: {
    comments: number;
  };
}

interface AnunciosResponse {
  data: Anuncio[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Funciones de API
const fetchAnuncios = async (filters?: AnnouncementFilters & { page?: number; limit?: number }): Promise<AnunciosResponse> => {
  const params = new URLSearchParams();

  console.log('🔍 Filtres aplicats:', filters);

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      }
    });
  }

  console.log('📡 Fent GET a:', `/announcements?${params.toString()}`);

  try {
    const result = await apiGet<any>(`/announcements?${params.toString()}`);

    console.log('📥 Resposta del backend:', result);
    console.log('📊 Tipus de resposta:', typeof result);
    console.log('🔑 Keys de la resposta:', Object.keys(result));

    // Si el backend retorna amb estructura success/data
    if (result.success && result.data) {
      console.log(`✅ Rebuts ${result.data.length} anuncis amb estructura success/data`);
      return {
        data: result.data,
        pagination: result.pagination || {
          total: result.data.length,
          page: 1,
          limit: 20,
          totalPages: 1
        }
      };
    }

    // Si el backend retorna directament data i pagination
    if (result.data !== undefined && result.pagination !== undefined) {
      console.log(`✅ Rebuts ${result.data.length} anuncis amb estructura data/pagination`);
      return {
        data: result.data,
        pagination: result.pagination
      };
    }

    // Si ve directament com array
    if (Array.isArray(result)) {
      console.log(`✅ Rebuts ${result.length} anuncis com array directe`);
      return {
        data: result,
        pagination: {
          total: result.length,
          page: 1,
          limit: 20,
          totalPages: 1
        }
      };
    }

    console.log('⚠️ Estructura de resposta no reconeguda, retornant com està');
    return result;
  } catch (error) {
    console.error('❌ Error fetching anuncios:', error);
    throw error;
  }
};

const fetchAnuncio = async (id: string): Promise<Anuncio> => {
  try {
    return await apiGet<Anuncio>(`/announcements/${id}`);
  } catch (error) {
    console.error('Error fetching anuncio:', error);
    throw error;
  }
};

const createAnuncio = async (data: CreateAnnouncementInput): Promise<Anuncio> => {
  console.log('📤 Datos enviados al backend:', JSON.stringify(data, null, 2));

  try {
    console.log('🔄 Iniciando llamada a apiPost...');
    const result = await apiPost<Anuncio>('/announcements', data);
    console.log('📥 Backend response:', result);
    return result;
  } catch (error) {
    console.error('❌ Error creando anuncio:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
};

const updateAnuncio = async ({ id, ...data }: UpdateAnnouncementInput & { id: string }): Promise<Anuncio> => {
  try {
    return await apiPut<Anuncio>(`/announcements/${id}`, data);
  } catch (error) {
    console.error('Error updating anuncio:', error);
    throw error;
  }
};

const deleteAnuncio = async (id: string): Promise<void> => {
  try {
    await apiDelete(`/announcements/${id}`);
  } catch (error) {
    console.error('Error deleting anuncio:', error);
    throw error;
  }
};

// Hook para listar anuncios
export function useAnuncios(
  filters?: AnnouncementFilters & { page?: number; limit?: number }
) {
  return useQuery({
    queryKey: ['anuncios', filters],
    queryFn: () => fetchAnuncios(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obtener un anuncio específico
export function useAnuncio(id?: string) {
  return useQuery({
    queryKey: ['anuncio', id],
    queryFn: () => fetchAnuncio(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para crear anuncio
export function useCreateAnuncio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAnuncio,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['anuncios'] });
      toast.success('Anuncio creado correctamente');
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear el anuncio');
    },
  });
}

// Hook para actualizar anuncio
export function useUpdateAnuncio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAnuncio,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['anuncios'] });
      queryClient.invalidateQueries({ queryKey: ['anuncio', variables.id] });
      toast.success('Anuncio actualizado correctamente');
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar el anuncio');
    },
  });
}

// Hook para eliminar anuncio
export function useDeleteAnuncio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAnuncio,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['anuncios'] });
      queryClient.removeQueries({ queryKey: ['anuncio', id] });
      toast.success('Anuncio eliminado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar el anuncio');
    },
  });
}

// Hook para publicar anuncio
export function usePublishAnuncio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, sendNotification = false }: { id: string; sendNotification?: boolean }) =>
      updateAnuncio({ id, status: 'published', sendNotification }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['anuncios'] });
      queryClient.invalidateQueries({ queryKey: ['anuncio', variables.id] });
      toast.success('Anuncio publicado correctamente');
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al publicar el anuncio');
    },
  });
}

// Hook para archivar anuncio
export function useArchiveAnuncio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      updateAnuncio({ id, status: 'archived' }),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['anuncios'] });
      queryClient.invalidateQueries({ queryKey: ['anuncio', id] });
      toast.success('Anuncio archivado correctamente');
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al archivar el anuncio');
    },
  });
}

// Hook para duplicar anuncio
export function useDuplicateAnuncio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const original = await fetchAnuncio(id);
      const { id: _, createdAt, updatedAt, deletedAt, author, community, _count, ...data } = original;
      return createAnuncio({
        ...data,
        title: `${data.title} (Copia)`,
        status: 'draft',
        authorId: '', // Se establecerá en el backend
      } as CreateAnnouncementInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anuncios'] });
      toast.success('Anuncio duplicado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al duplicar el anuncio');
    },
  });
}

// Hook para obtener anuncios pendientes de revisión
export function usePendingAnuncios(filters?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['anuncios-pending', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.limit) params.append('limit', String(filters.limit));
      if (filters?.offset) params.append('offset', String(filters.offset));

      const result = await apiGet(`/announcements/pending/list?${params.toString()}`);

      // Asegurar estructura consistente
      return {
        data: result.data || result.announcements || [],
        pagination: result.pagination || {
          total: result.total || 0,
          page: 1,
          limit: filters?.limit || 20,
          totalPages: 1
        }
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutos (más frecuente para moderation)
  });
}

// Hook para aprobar anuncio
export function useApproveAnuncio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await apiClient(`/announcements/${id}/approve`, {
        method: 'PATCH',
        body: {}
      });

      if (!result.ok) {
        const error = await result.json();
        throw new Error(error.error || 'Error al aprobar el anuncio');
      }

      return result.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['anuncios'] });
      queryClient.invalidateQueries({ queryKey: ['anuncios-pending'] });
      queryClient.invalidateQueries({ queryKey: ['anuncio', id] });
      toast.success('Anuncio aprobado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al aprobar el anuncio');
    },
  });
}

// Hook para rechazar anuncio
export function useRejectAnuncio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const result = await apiClient(`/announcements/${id}/reject`, {
        method: 'PATCH',
        body: { reason }
      });

      if (!result.ok) {
        const error = await result.json();
        throw new Error(error.error || 'Error al rechazar el anuncio');
      }

      return result.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['anuncios'] });
      queryClient.invalidateQueries({ queryKey: ['anuncios-pending'] });
      queryClient.invalidateQueries({ queryKey: ['anuncio', variables.id] });
      toast.success('Anuncio rechazado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al rechazar el anuncio');
    },
  });
}