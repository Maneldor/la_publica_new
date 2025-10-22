export interface User {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
  role: 'ADMIN' | 'USER' | 'MODERATOR';
}

export interface ForumPost {
  id: string;
  contenido: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  autor: User;
  editado: boolean;
  estado: 'activo' | 'moderado' | 'eliminado';
  reportes: number;
  likes: number;
  topicId: string;
}

export interface Topic {
  id: string;
  titulo: string;
  descripcion: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  autor: User;
  foroId: string;
  estado: 'abierto' | 'cerrado' | 'fijado' | 'archivado';
  fijado: boolean;
  cerrado: boolean;
  tags: string[];
  estadisticas: {
    posts: number;
    vistas: number;
    participantes: number;
    ultimaActividad: string;
  };
  ultimoPost?: ForumPost;
  reportes: number;
}

export interface Forum {
  id: string;
  nombre: string;
  descripcion: string;
  slug: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creador: User;
  estado: 'activo' | 'inactivo' | 'archivado';
  configuracion: {
    requiereModerador: boolean;
    permiteTopicsUsuarios: boolean;
    requiereAprobacion: boolean;
    visibilidad: 'publico' | 'privado' | 'restringido';
    ordenTopics: 'actividad' | 'fecha' | 'alfabetico';
  };
  categorias: string[];
  moderadores: User[];
  comunidades: string[];
  estadisticas: {
    totalTopics: number;
    totalPosts: number;
    topicsActivos: number;
    participantesUnicos: number;
    ultimaActividad: string;
  };
  icono?: string;
  color?: string;
}

export interface ForumFilter {
  estado?: 'activo' | 'inactivo' | 'archivado' | '';
  comunidad?: string;
  categoria?: string;
  busqueda?: string;
  moderador?: string;
}

export interface TopicFilter {
  foroId?: string;
  estado?: 'abierto' | 'cerrado' | 'fijado' | 'archivado' | '';
  autor?: string;
  busqueda?: string;
  tags?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface PostFilter {
  topicId?: string;
  autor?: string;
  estado?: 'activo' | 'moderado' | 'eliminado' | '';
  reportado?: boolean;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface CreateForumData {
  nombre: string;
  descripcion: string;
  slug: string;
  categorias: string[];
  comunidades: string[];
  moderadores: string[];
  icono?: string;
  color?: string;
  configuracion: {
    requiereModerador: boolean;
    permiteTopicsUsuarios: boolean;
    requiereAprobacion: boolean;
    visibilidad: 'publico' | 'privado' | 'restringido';
    ordenTopics: 'actividad' | 'fecha' | 'alfabetico';
  };
}

export interface UpdateForumData extends Partial<CreateForumData> {
  id: string;
  estado?: 'activo' | 'inactivo' | 'archivado';
}

export interface CreateTopicData {
  titulo: string;
  descripcion: string;
  foroId: string;
  tags: string[];
  fijado?: boolean;
}

export interface UpdateTopicData extends Partial<CreateTopicData> {
  id: string;
  estado?: 'abierto' | 'cerrado' | 'fijado' | 'archivado';
  cerrado?: boolean;
  fijado?: boolean;
}

export interface ModerationAction {
  tipo: 'aprobar' | 'rechazar' | 'eliminar' | 'cerrar' | 'fijar' | 'mover' | 'editar';
  motivo?: string;
  nuevoForoId?: string;
  observaciones?: string;
}

export interface PostModerationAction {
  tipo: 'aprobar' | 'rechazar' | 'eliminar' | 'editar' | 'reportar';
  motivo?: string;
  nuevoContenido?: string;
  observaciones?: string;
}