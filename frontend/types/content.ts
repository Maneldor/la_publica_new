export interface Comunidad {
    slug: string;
    nombre: string;
    idiomas: string[];
  }
  
  export interface CrearContenidoForm {
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
  
  export interface PublicacionInfo {
    comunidad: string;
    idioma: string;
    url: string;
    traduccionAutomatica: boolean;
  }
  
  export interface ResultadoPublicacion {
    contenidoId: string;
    traduccionesCreadas: number;
    publicaciones: PublicacionInfo[];
  }