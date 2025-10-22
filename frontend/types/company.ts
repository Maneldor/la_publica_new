export interface User {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
  role: 'ADMIN' | 'USER' | 'MODERATOR';
}

export interface CompanyContact {
  telefono?: string;
  email?: string;
  web?: string;
  direccion?: string;
  ciudad?: string;
  codigoPostal?: string;
  provincia?: string;
  pais?: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
}

export interface CompanyHours {
  lunes?: string;
  martes?: string;
  miercoles?: string;
  jueves?: string;
  viernes?: string;
  sabado?: string;
  domingo?: string;
  notas?: string;
}

export interface CompanyService {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio?: {
    minimo?: number;
    maximo?: number;
    moneda: string;
    tipo: 'fijo' | 'rango' | 'consultar';
  };
  duracion?: string;
  disponible: boolean;
  destacado: boolean;
  imagen?: string;
  tags: string[];
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CompanyProduct {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio?: {
    valor: number;
    moneda: string;
    descuento?: number;
    oferta?: boolean;
  };
  disponible: boolean;
  stock?: number;
  destacado: boolean;
  imagenes: string[];
  especificaciones: { [key: string]: string };
  tags: string[];
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CompanyReview {
  id: string;
  usuario: User;
  valoracion: number;
  titulo?: string;
  comentario: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  verificado: boolean;
  respuesta?: {
    texto: string;
    fecha: string;
    autor: User;
  };
  util: number;
  reportado: boolean;
  estado: 'activo' | 'moderado' | 'eliminado';
  metadatos: {
    servicio?: string;
    producto?: string;
    experiencia: 'excelente' | 'buena' | 'regular' | 'mala' | 'terrible';
  };
}

export interface Company {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  subcategoria?: string;
  logo?: string;
  imagenes: string[];
  estado: 'activo' | 'inactivo' | 'pendiente' | 'suspendido' | 'cerrado';
  verificado: boolean;
  destacado: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  propietario: User;
  contacto: CompanyContact;
  horarios: CompanyHours;
  servicios: CompanyService[];
  productos: CompanyProduct[];
  valoraciones: CompanyReview[];
  estadisticas: {
    valoracionPromedio: number;
    totalValoraciones: number;
    totalServicios: number;
    totalProductos: number;
    vistas: number;
    clics: number;
    contactos: number;
  };
  configuracion: {
    permiteValoraciones: boolean;
    requiereAprobacion: boolean;
    mostrarPrecios: boolean;
    mostrarHorarios: boolean;
    permiteContacto: boolean;
    visible: boolean;
  };
  seo: {
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
  };
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  comunidades: string[];
  tags: string[];
  certificaciones: string[];
  licencias: string[];
}

export interface CompanyFilter {
  categoria?: string;
  subcategoria?: string;
  estado?: 'activo' | 'inactivo' | 'pendiente' | 'suspendido' | 'cerrado' | '';
  comunidad?: string;
  verificado?: boolean;
  destacado?: boolean;
  busqueda?: string;
  ciudad?: string;
  provincia?: string;
  valoracionMinima?: number;
  propietario?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface ServiceFilter {
  companyId?: string;
  categoria?: string;
  disponible?: boolean;
  destacado?: boolean;
  busqueda?: string;
  precioMinimo?: number;
  precioMaximo?: number;
}

export interface ProductFilter {
  companyId?: string;
  categoria?: string;
  disponible?: boolean;
  destacado?: boolean;
  busqueda?: string;
  precioMinimo?: number;
  precioMaximo?: number;
  enStock?: boolean;
}

export interface ReviewFilter {
  companyId?: string;
  valoracionMinima?: number;
  valoracionMaxima?: number;
  verificado?: boolean;
  estado?: 'activo' | 'moderado' | 'eliminado' | '';
  reportado?: boolean;
  usuario?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface CreateCompanyData {
  nombre: string;
  descripcion: string;
  categoria: string;
  subcategoria?: string;
  logo?: string;
  imagenes: string[];
  propietarioId: string;
  contacto: CompanyContact;
  horarios: CompanyHours;
  configuracion: {
    permiteValoraciones: boolean;
    requiereAprobacion: boolean;
    mostrarPrecios: boolean;
    mostrarHorarios: boolean;
    permiteContacto: boolean;
    visible: boolean;
  };
  seo: {
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
  };
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  comunidades: string[];
  tags: string[];
  certificaciones: string[];
  licencias: string[];
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  id: string;
  estado?: 'activo' | 'inactivo' | 'pendiente' | 'suspendido' | 'cerrado';
  verificado?: boolean;
  destacado?: boolean;
}

export interface CreateServiceData {
  nombre: string;
  descripcion: string;
  categoria: string;
  precio?: {
    minimo?: number;
    maximo?: number;
    moneda: string;
    tipo: 'fijo' | 'rango' | 'consultar';
  };
  duracion?: string;
  disponible: boolean;
  destacado: boolean;
  imagen?: string;
  tags: string[];
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  id: string;
  companyId: string;
}

export interface CreateProductData {
  nombre: string;
  descripcion: string;
  categoria: string;
  precio?: {
    valor: number;
    moneda: string;
    descuento?: number;
    oferta?: boolean;
  };
  disponible: boolean;
  stock?: number;
  destacado: boolean;
  imagenes: string[];
  especificaciones: { [key: string]: string };
  tags: string[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
  companyId: string;
}

export interface CreateReviewData {
  companyId: string;
  valoracion: number;
  titulo?: string;
  comentario: string;
  metadatos: {
    servicio?: string;
    producto?: string;
    experiencia: 'excelente' | 'buena' | 'regular' | 'mala' | 'terrible';
  };
}

export interface UpdateReviewData extends Partial<CreateReviewData> {
  id: string;
  estado?: 'activo' | 'moderado' | 'eliminado';
  verificado?: boolean;
}

export interface ReviewResponse {
  reviewId: string;
  texto: string;
}