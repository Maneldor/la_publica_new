import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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

  const response = await fetch(`/api/admin/anuncios?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al cargar anuncios');
  }

  return response.json();
};

const fetchAnuncio = async (id: string): Promise<Anuncio> => {
  const response = await fetch(`/api/admin/anuncios/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al cargar anuncio');
  }

  return response.json();
};

const createAnuncio = async (data: CreateAnnouncementInput): Promise<Anuncio> => {
  const response = await fetch('/api/admin/anuncios', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear anuncio');
  }

  return response.json();
};

const updateAnuncio = async ({ id, ...data }: UpdateAnnouncementInput & { id: string }): Promise<Anuncio> => {
  const response = await fetch(`/api/admin/anuncios/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar anuncio');
  }

  return response.json();
};

const deleteAnuncio = async (id: string): Promise<void> => {
  const response = await fetch(`/api/admin/anuncios/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar anuncio');
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