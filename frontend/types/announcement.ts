export interface User {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
  role: 'ADMIN' | 'USER' | 'MODERATOR';
}

export interface Announcement {
  id: string;
  titulo: string;
  contenido: string;
  tipo: 'info' | 'warning' | 'success' | 'error' | 'promocion' | 'mantenimiento' | 'evento';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'borrador' | 'publicado' | 'pausado' | 'expirado' | 'archivado';
  fechaCreacion: string;
  fechaActualizacion: string;
  fechaPublicacion?: string;
  fechaExpiracion?: string;
  fechaInicio?: string;
  autor: User;
  fijado: boolean;
  activo: boolean;
  configuracion: {
    mostrarEnInicio: boolean;
    mostrarEnDashboard: boolean;
    enviarNotificacion: boolean;
    requiereConfirmacion: boolean;
    permitirDismiss: boolean;
    autoExpirar: boolean;
    diasValidez?: number;
  };
  audiencia: {
    comunidades: string[];
    roles: ('ADMIN' | 'USER' | 'MODERATOR')[];
    usuarios?: string[];
    todosLosUsuarios: boolean;
  };
  diseno: {
    color?: string;
    icono?: string;
    imagen?: string;
    estilo: 'banner' | 'modal' | 'toast' | 'embedded';
    posicion: 'top' | 'bottom' | 'center' | 'sidebar';
  };
  estadisticas: {
    vistas: number;
    clics: number;
    dismissals: number;
    confirmaciones: number;
    alcance: number;
  };
  metadatos: {
    url?: string;
    botonTexto?: string;
    botonUrl?: string;
    tags: string[];
    categoria: string;
  };
}

export interface AnnouncementFilter {
  tipo?: 'info' | 'warning' | 'success' | 'error' | 'promocion' | 'mantenimiento' | 'evento' | '';
  prioridad?: 'baja' | 'media' | 'alta' | 'critica' | '';
  estado?: 'borrador' | 'publicado' | 'pausado' | 'expirado' | 'archivado' | '';
  comunidad?: string;
  autor?: string;
  fijado?: boolean;
  activo?: boolean;
  busqueda?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  categoria?: string;
}

export interface CreateAnnouncementData {
  titulo: string;
  contenido: string;
  tipo: 'info' | 'warning' | 'success' | 'error' | 'promocion' | 'mantenimiento' | 'evento';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  fechaPublicacion?: string;
  fechaExpiracion?: string;
  fechaInicio?: string;
  fijado: boolean;
  configuracion: {
    mostrarEnInicio: boolean;
    mostrarEnDashboard: boolean;
    enviarNotificacion: boolean;
    requiereConfirmacion: boolean;
    permitirDismiss: boolean;
    autoExpirar: boolean;
    diasValidez?: number;
  };
  audiencia: {
    comunidades: string[];
    roles: ('ADMIN' | 'USER' | 'MODERATOR')[];
    usuarios?: string[];
    todosLosUsuarios: boolean;
  };
  diseno: {
    color?: string;
    icono?: string;
    imagen?: string;
    estilo: 'banner' | 'modal' | 'toast' | 'embedded';
    posicion: 'top' | 'bottom' | 'center' | 'sidebar';
  };
  metadatos: {
    url?: string;
    botonTexto?: string;
    botonUrl?: string;
    tags: string[];
    categoria: string;
  };
}

export interface UpdateAnnouncementData extends Partial<CreateAnnouncementData> {
  id: string;
  estado?: 'borrador' | 'publicado' | 'pausado' | 'expirado' | 'archivado';
  activo?: boolean;
}

export interface AnnouncementAction {
  tipo: 'publicar' | 'pausar' | 'expirar' | 'archivar' | 'fijar' | 'activar' | 'desactivar';
  motivo?: string;
  fechaExpiracion?: string;
}