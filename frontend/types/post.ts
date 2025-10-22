export interface Post {
  id: string;
  titulo: string;
  contenido: string;
  extracto: string;
  tipo: 'blog' | 'noticia' | 'evento' | 'normativa';
  idiomaOrigen: string;
  comunidades: string[];
  estado: 'borrador' | 'publicado' | 'archivado';
  fijado: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  autor: {
    id: string;
    nombre: string;
    email: string;
  };
  metadatos: {
    meta_description: string;
    keywords: string[];
    imagen_destacada: string;
    categoria: string;
  };
  estadisticas: {
    vistas: number;
    comentarios: number;
    compartidos: number;
  };
}

export interface PostFilter {
  tipo?: 'blog' | 'noticia' | 'evento' | 'normativa' | '';
  comunidad?: string;
  estado?: 'borrador' | 'publicado' | 'archivado' | '';
  autor?: string;
  busqueda?: string;
}

export interface CreatePostData {
  titulo: string;
  contenido: string;
  extracto: string;
  tipo: 'blog' | 'noticia' | 'evento' | 'normativa';
  idiomaOrigen: string;
  comunidades: string[];
  publicarInmediatamente: boolean;
  metadatos: {
    meta_description: string;
    keywords: string[];
    imagen_destacada: string;
    categoria: string;
  };
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string;
  fijado?: boolean;
  estado?: 'borrador' | 'publicado' | 'archivado';
}