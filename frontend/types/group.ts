export interface User {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
  role: 'ADMIN' | 'USER' | 'MODERATOR';
}

export interface GroupMember {
  id: string;
  usuario: User;
  grupo: string;
  rol: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  fechaIngreso: string;
  estado: 'activo' | 'inactivo' | 'pendiente';
}

export interface Group {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'publico' | 'privado' | 'secreto';
  estado: 'activo' | 'inactivo' | 'archivado';
  fechaCreacion: string;
  fechaActualizacion: string;
  creador: User;
  configuracion: {
    requiereAprobacion: boolean;
    permiteInvitaciones: boolean;
    visibilidadMiembros: 'publico' | 'miembros' | 'admin';
    permitePublicaciones: 'todos' | 'miembros' | 'moderadores' | 'admin';
  };
  estadisticas: {
    totalMiembros: number;
    miembrosActivos: number;
    publicaciones: number;
    actividad: number;
  };
  miembros?: GroupMember[];
  comunidades: string[];
  tags: string[];
  imagen?: string;
}

export interface GroupFilter {
  tipo?: 'publico' | 'privado' | 'secreto' | '';
  estado?: 'activo' | 'inactivo' | 'archivado' | '';
  comunidad?: string;
  busqueda?: string;
  creador?: string;
}

export interface CreateGroupData {
  nombre: string;
  descripcion: string;
  tipo: 'publico' | 'privado' | 'secreto';
  comunidades: string[];
  tags: string[];
  imagen?: string;
  configuracion: {
    requiereAprobacion: boolean;
    permiteInvitaciones: boolean;
    visibilidadMiembros: 'publico' | 'miembros' | 'admin';
    permitePublicaciones: 'todos' | 'miembros' | 'moderadores' | 'admin';
  };
}

export interface UpdateGroupData extends Partial<CreateGroupData> {
  id: string;
  estado?: 'activo' | 'inactivo' | 'archivado';
}

export interface AddMemberData {
  usuarioId: string;
  groupId: string;
  rol: 'ADMIN' | 'MODERATOR' | 'MEMBER';
}

export interface UpdateMemberData {
  memberId: string;
  rol?: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  estado?: 'activo' | 'inactivo' | 'pendiente';
}