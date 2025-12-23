/**
 * Validaciones para el módulo de Posts/Blog
 * Panel admin de La Pública
 */

import { z } from 'zod';
import {
  titleSchema,
  longDescriptionSchema,
  shortDescriptionSchema,
  StatusEnum,
  PriorityEnum,
  futureDateSchema,
  dateTimeSchema,
  urlSchema,
  imageFileSchema,
  tagsArraySchema,
  metadataSchema,
  timestampsSchema,
  withIdSchema,
  idArraySchema,
  slugSchema,
  integerSchema,
  positiveIntegerSchema
} from './common';

// ==================== ENUMS ESPECÍFICOS ====================

export const PostTypeEnum = z.enum([
  'article',       // Artículo estándar
  'news',          // Noticia
  'tutorial',      // Tutorial
  'interview',     // Entrevista
  'opinion',       // Opinión
  'analysis',      // Análisis
  'guide',         // Guía
  'case_study',    // Caso de estudio
  'announcement',  // Anuncio
  'event',         // Evento
  'video',         // Video
  'podcast',       // Podcast
  'infographic'    // Infografía
]);

export const PostStatusEnum = z.enum([
  'draft',         // Borrador
  'pending',       // Pendiente de revisión
  'scheduled',     // Programado
  'published',     // Publicado
  'archived',      // Archivado
  'trashed'        // Papelera
]);

export const PostVisibilityEnum = z.enum([
  'public',        // Público
  'private',       // Privado
  'password',      // Protegido por contraseña
  'members',       // Solo miembros
  'premium'        // Solo premium
]);

export const ContentFormatEnum = z.enum([
  'html',          // HTML
  'markdown',      // Markdown
  'rich_text',     // Editor rich text
  'blocks'         // Sistema de bloques
]);

export const CommentStatusEnum = z.enum([
  'open',          // Comentarios abiertos
  'closed',        // Comentarios cerrados
  'moderated'      // Comentarios moderados
]);

// ==================== SCHEMAS BASE ====================

// Contenido del post
const postContentSchema = z.object({
  title: titleSchema,
  slug: slugSchema.optional(), // Se genera automáticamente si no se proporciona
  excerpt: shortDescriptionSchema.optional(),
  content: longDescriptionSchema,
  contentFormat: ContentFormatEnum.default('rich_text'),

  // Imagen destacada
  featuredImage: z.object({
    url: urlSchema.optional(),
    alt: z.string().trim().max(200, 'Texto alternativo muy largo').optional(),
    caption: z.string().trim().max(500, 'Pie de imagen muy largo').optional(),
    credit: z.string().trim().max(200, 'Crédito muy largo').optional()
  }).optional(),

  // Galería de imágenes
  gallery: z.array(z.object({
    url: urlSchema.refine((val) => val && val.length > 0, {
      message: 'URL de imagen requerida'
    }),
    alt: z.string().trim().max(200).optional(),
    caption: z.string().trim().max(500).optional()
  })).max(20, 'Máximo 20 imágenes en galería').optional(),

  // Video/Audio
  media: z.object({
    type: z.enum(['video', 'audio', 'youtube', 'vimeo', 'spotify']).optional(),
    url: urlSchema.optional(),
    embedCode: z.string().trim().max(2000, 'Código embed muy largo').optional(),
    duration: z.number().int().min(0).optional(), // segundos
    transcript: z.string().trim().max(10000, 'Transcripción muy larga').optional()
  }).optional()
});

// Configuración del post
const postConfigSchema = z.object({
  type: PostTypeEnum,
  status: PostStatusEnum,
  visibility: PostVisibilityEnum.default('public'),
  password: z
    .string()
    .trim()
    .min(6, 'Contraseña debe tener al menos 6 caracteres')
    .max(50, 'Contraseña muy larga')
    .optional(),

  // Fechas
  publishedAt: dateTimeSchema.optional(),
  scheduledFor: futureDateSchema.optional(),
  expiresAt: dateTimeSchema.optional(),

  // Configuración de comentarios
  allowComments: z.boolean().default(true),
  commentStatus: CommentStatusEnum.default('open'),

  // Configuración social
  allowSharing: z.boolean().default(true),
  allowPingbacks: z.boolean().default(false),

  // Destacado
  isFeatured: z.boolean().default(false),
  isSticky: z.boolean().default(false),
  priority: PriorityEnum.default('medium')
});

// Autoría y categorización
const postMetaSchema = z.object({
  // Autor
  authorId: z.string().trim().min(1, 'ID de autor requerido'),
  coAuthors: idArraySchema('coautor').optional(),

  // Categorización
  categoryId: z.string().trim().min(1, 'Categoría requerida'),
  subcategoryId: z.string().trim().optional(),
  tags: tagsArraySchema.optional(),

  // Series/Colecciones
  seriesId: z.string().trim().optional(),
  seriesOrder: positiveIntegerSchema.optional(),

  // Comunidad
  communityId: z.string().trim().optional(),

  // Temas relacionados
  relatedPosts: idArraySchema('post relacionado').max(10, 'Máximo 10 posts relacionados').optional(),

  // Fuentes y referencias
  sources: z.array(z.object({
    title: z.string().trim().min(1, 'Título de fuente requerido').max(200),
    url: urlSchema.optional(),
    author: z.string().trim().max(100).optional(),
    publishedAt: z.string().trim().optional()
  })).max(20, 'Máximo 20 fuentes').optional()
});

// Schema completo de post
const postBaseSchema = z.object({
  ...postContentSchema.shape,
  ...postConfigSchema.shape,
  ...postMetaSchema.shape,

  // SEO y metadata
  metadata: metadataSchema.optional(),

  // Notas internas
  internalNotes: z
    .string()
    .trim()
    .max(1000, 'Notas internas muy largas')
    .optional(),

  // Estadísticas
  viewsCount: integerSchema.default(0),
  likesCount: integerSchema.default(0),
  sharesCount: integerSchema.default(0),
  commentsCount: integerSchema.default(0),
  readingTime: integerSchema.default(0), // minutos estimados

  // Configuración avanzada
  customFields: z
    .record(z.string(), z.any())
    .optional(),

  // Versioning
  version: positiveIntegerSchema.default(1),
  isRevision: z.boolean().default(false),
  parentPostId: z.string().trim().optional()
});

// ==================== SCHEMAS DE FORMULARIOS ====================

// Crear post
export const createPostSchema = postBaseSchema
  .omit({ status: true, publishedAt: true })
  .extend({
    status: PostStatusEnum.default('draft'),
    createdBy: z.string().trim().min(1, 'ID de creador requerido')
  })
  .refine((data) => {
    // Si es protegido por contraseña, debe tener contraseña
    if (data.visibility === 'password' && !data.password) {
      return false;
    }
    return true;
  }, {
    message: 'Debe proporcionar una contraseña para posts protegidos',
    path: ['password']
  })
  .refine((data) => {
    // Si está programado, debe tener fecha
    if (data.status === 'scheduled' && !data.scheduledFor) {
      return false;
    }
    return true;
  }, {
    message: 'Debe especificar fecha para posts programados',
    path: ['scheduledFor']
  })
  .refine((data) => {
    // Si tiene fecha de expiración, debe ser futura
    if (data.expiresAt) {
      const expireDate = new Date(data.expiresAt);
      const now = new Date();
      return expireDate > now;
    }
    return true;
  }, {
    message: 'La fecha de expiración debe ser futura',
    path: ['expiresAt']
  })
  .refine((data) => {
    // Si está en una serie, debe tener orden
    if (data.seriesId && !data.seriesOrder) {
      return false;
    }
    return true;
  }, {
    message: 'Debe especificar el orden en la serie',
    path: ['seriesOrder']
  });

// Actualizar post
export const updatePostSchema = withIdSchema(
  postBaseSchema.partial()
);

// Publicar post
export const publishPostSchema = z.object({
  id: z.string().trim().min(1, 'ID de post requerido'),
  publishAt: dateTimeSchema.optional(),
  notifySubscribers: z.boolean().default(false),
  shareOnSocial: z.boolean().default(false),
  sendNewsletter: z.boolean().default(false)
});

// Programar post
export const schedulePostSchema = z.object({
  id: z.string().trim().min(1, 'ID de post requerido'),
  scheduledFor: futureDateSchema,
  timezone: z.string().trim().default('Europe/Madrid'),
  notifySubscribers: z.boolean().default(false),
  shareOnSocial: z.boolean().default(false)
});

// Duplicar post
export const duplicatePostSchema = z.object({
  sourcePostId: z.string().trim().min(1, 'ID de post origen requerido'),
  title: titleSchema.optional(),
  includeMeta: z.boolean().default(false),
  includeComments: z.boolean().default(false),
  newAuthorId: z.string().trim().optional()
});

// ==================== SCHEMAS DE CATEGORÍAS ====================

// Categoría de posts
export const postCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nombre de categoría debe tener al menos 2 caracteres')
    .max(100, 'Nombre de categoría muy largo'),
  slug: slugSchema.optional(),
  description: shortDescriptionSchema.optional(),
  parentId: z.string().trim().optional(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-F]{6}$/i, 'Color debe ser código hexadecimal válido')
    .optional(),
  icon: z.string().trim().max(50).optional(),
  isActive: z.boolean().default(true),
  sortOrder: integerSchema.default(0),
  metadata: metadataSchema.optional()
});

// Crear categoría
export const createCategorySchema = postCategorySchema.extend({
  createdBy: z.string().trim().min(1, 'ID de creador requerido')
});

// Actualizar categoría
export const updateCategorySchema = withIdSchema(
  postCategorySchema.partial()
);

// ==================== SCHEMAS DE SERIES ====================

// Serie de posts
export const postSeriesSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nombre de serie debe tener al menos 2 caracteres')
    .max(150, 'Nombre de serie muy largo'),
  slug: slugSchema.optional(),
  description: longDescriptionSchema,
  shortDescription: shortDescriptionSchema.optional(),
  coverImage: urlSchema.optional(),
  isActive: z.boolean().default(true),
  isComplete: z.boolean().default(false),
  expectedPosts: positiveIntegerSchema.optional(),
  publishingSchedule: z.enum(['weekly', 'biweekly', 'monthly', 'irregular']).optional(),
  metadata: metadataSchema.optional()
});

// Crear serie
export const createSeriesSchema = postSeriesSchema.extend({
  createdBy: z.string().trim().min(1, 'ID de creador requerido')
});

// Actualizar serie
export const updateSeriesSchema = withIdSchema(
  postSeriesSchema.partial()
);

// ==================== SCHEMAS DE FILTROS ====================

// Filtros de búsqueda de posts
export const postFiltersSchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, 'La búsqueda no puede superar los 100 caracteres')
    .optional(),

  type: PostTypeEnum.optional(),
  status: PostStatusEnum.optional(),
  visibility: PostVisibilityEnum.optional(),
  categoryId: z.string().trim().optional(),
  seriesId: z.string().trim().optional(),
  authorId: z.string().trim().optional(),
  communityId: z.string().trim().optional(),

  isFeatured: z.boolean().optional(),
  isSticky: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  hasMedia: z.boolean().optional(),
  hasFeaturedImage: z.boolean().optional(),

  publishedFrom: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
    .optional(),
  publishedTo: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
    .optional(),

  viewsMin: integerSchema.optional(),
  viewsMax: integerSchema.optional(),

  readingTimeMin: integerSchema.optional(),
  readingTimeMax: integerSchema.optional(),

  tags: z
    .array(z.string().trim())
    .max(10, 'Máximo 10 tags para filtrar')
    .optional()
}).refine((data) => {
  if (data.publishedFrom && data.publishedTo) {
    return new Date(data.publishedFrom) <= new Date(data.publishedTo);
  }
  return true;
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['publishedTo']
}).refine((data) => {
  if (data.viewsMin && data.viewsMax) {
    return data.viewsMin <= data.viewsMax;
  }
  return true;
}, {
  message: 'El mínimo de vistas debe ser menor al máximo',
  path: ['viewsMax']
}).refine((data) => {
  if (data.readingTimeMin && data.readingTimeMax) {
    return data.readingTimeMin <= data.readingTimeMax;
  }
  return true;
}, {
  message: 'El tiempo de lectura mínimo debe ser menor al máximo',
  path: ['readingTimeMax']
});

// ==================== SCHEMAS DE COMENTARIOS ====================

// Comentario en post
export const postCommentSchema = z.object({
  postId: z.string().trim().min(1, 'ID de post requerido'),
  content: z
    .string()
    .trim()
    .min(1, 'El comentario no puede estar vacío')
    .max(2000, 'El comentario no puede superar los 2000 caracteres'),
  parentId: z.string().trim().optional(), // Para respuestas
  authorName: z
    .string()
    .trim()
    .min(2, 'Nombre de autor requerido')
    .max(100, 'Nombre muy largo'),
  authorEmail: z.string().trim().email('Email inválido'),
  authorUrl: urlSchema.optional(),
  isApproved: z.boolean().default(false),
  ipAddress: z.string().trim().optional(),
  userAgent: z.string().trim().optional()
});

// Moderar comentario
export const moderateCommentSchema = z.object({
  commentId: z.string().trim().min(1, 'ID de comentario requerido'),
  action: z.enum(['approve', 'reject', 'spam', 'trash']),
  reason: z
    .string()
    .trim()
    .max(500, 'Razón muy larga')
    .optional(),
  moderatedBy: z.string().trim().min(1, 'ID de moderador requerido')
});

// ==================== SCHEMAS DE ESTADÍSTICAS ====================

// Métricas de post
export const postMetricsSchema = z.object({
  postId: z.string().trim().min(1, 'ID de post requerido'),

  // Visualizaciones
  views: integerSchema.default(0),
  uniqueViews: integerSchema.default(0),

  // Engagement
  likes: integerSchema.default(0),
  shares: integerSchema.default(0),
  comments: integerSchema.default(0),
  bookmarks: integerSchema.default(0),

  // Tiempo de lectura
  averageTimeOnPage: z.number().min(0).default(0), // segundos
  bounceRate: z.number().min(0).max(1).default(0),
  completionRate: z.number().min(0).max(1).default(0),

  // Social media
  socialShares: z.object({
    facebook: integerSchema.default(0),
    twitter: integerSchema.default(0),
    linkedin: integerSchema.default(0),
    whatsapp: integerSchema.default(0),
    email: integerSchema.default(0)
  }).optional(),

  // SEO
  searchRanking: z.object({
    keyword: z.string().trim(),
    position: positiveIntegerSchema,
    clicks: integerSchema.default(0),
    impressions: integerSchema.default(0)
  }).array().max(10).optional(),

  // Fechas
  period: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  date: z.date().default(() => new Date())
});

// ==================== SCHEMAS DE IMPORTACIÓN/EXPORTACIÓN ====================

// Importar posts
export const importPostsSchema = z.object({
  format: z.enum(['wordpress', 'medium', 'ghost', 'csv', 'json']),
  file: z.instanceof(File).refine(
    (file) => file.size <= 50 * 1024 * 1024, // 50MB
    'El archivo debe ser menor a 50MB'
  ),
  authorId: z.string().trim().min(1, 'ID de autor por defecto requerido'),
  categoryId: z.string().trim().min(1, 'ID de categoría por defecto requerida'),
  importMedia: z.boolean().default(true),
  importComments: z.boolean().default(false),
  preserveDates: z.boolean().default(true),
  setAsDraft: z.boolean().default(true)
});

// Exportar posts
export const exportPostsSchema = z.object({
  format: z.enum(['wordpress', 'json', 'csv', 'pdf']),
  includeMedia: z.boolean().default(false),
  includeComments: z.boolean().default(false),
  includeMetadata: z.boolean().default(true),
  filters: postFiltersSchema.optional()
});

// ==================== TIPOS TYPESCRIPT ====================

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PublishPostInput = z.infer<typeof publishPostSchema>;
export type SchedulePostInput = z.infer<typeof schedulePostSchema>;
export type DuplicatePostInput = z.infer<typeof duplicatePostSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateSeriesInput = z.infer<typeof createSeriesSchema>;
export type UpdateSeriesInput = z.infer<typeof updateSeriesSchema>;
export type PostFilters = z.infer<typeof postFiltersSchema>;
export type PostCommentInput = z.infer<typeof postCommentSchema>;
export type ModerateCommentInput = z.infer<typeof moderateCommentSchema>;
export type PostMetrics = z.infer<typeof postMetricsSchema>;
export type ImportPostsInput = z.infer<typeof importPostsSchema>;
export type ExportPostsInput = z.infer<typeof exportPostsSchema>;

// ==================== VALIDADORES ESPECÍFICOS ====================

// Calcular tiempo de lectura estimado
export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200; // Promedio en español
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Validar que un post puede ser publicado
export const validatePostForPublishing = (post: any): boolean => {
  const requiredFields = ['title', 'content', 'categoryId', 'authorId'];

  for (const field of requiredFields) {
    if (!post[field]) {
      return false;
    }
  }

  // Validar longitud mínima del contenido
  if (post.content.length < 100) {
    return false;
  }

  // Si es protegido por contraseña, debe tenerla
  if (post.visibility === 'password' && !post.password) {
    return false;
  }

  return true;
};

// Generar slug automático
export const generatePostSlug = (title: string, existingSlugs: string[] = []): string => {
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .replace(/^-|-$/g, ''); // Quitar guiones al inicio/fin

  let slug = baseSlug;
  let counter = 1;

  // Si el slug ya existe, añadir número
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// Extraer excerpt automático del contenido
export const generateExcerpt = (content: string, maxLength: number = 160): string => {
  // Limpiar HTML si existe
  const cleanContent = content.replace(/<[^>]*>/g, '');

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  // Cortar en la palabra más cercana
  const truncated = cleanContent.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > 0
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
};

// Validar permisos para acciones en posts
export const validatePostPermissions = (
  action: 'create' | 'update' | 'delete' | 'publish' | 'moderate',
  userRole: string,
  post?: any
): boolean => {
  const adminRoles = ['SUPER_ADMIN', 'ADMIN'];
  const managerRoles = [...adminRoles, 'COMMUNITY_MANAGER'];
  const editorRoles = [...managerRoles, 'EDITOR'];

  switch (action) {
    case 'create':
    case 'update':
      return editorRoles.includes(userRole);

    case 'publish':
      return managerRoles.includes(userRole);

    case 'moderate':
      return managerRoles.includes(userRole);

    case 'delete':
      return adminRoles.includes(userRole);

    default:
      return false;
  }
};

// ==================== TRANSFORMACIONES ====================

// Preparar datos de post para la DB
export const preparePostForDB = (data: CreatePostInput) => {
  const slug = data.slug || generatePostSlug(data.title);
  const readingTime = calculateReadingTime(data.content);
  const excerpt = data.excerpt || generateExcerpt(data.content);

  return {
    ...data,
    slug,
    excerpt,
    readingTime,

    // Valores por defecto
    viewsCount: 0,
    likesCount: 0,
    sharesCount: 0,
    commentsCount: 0,
    version: 1,

    // Fechas
    createdAt: new Date(),
    updatedAt: new Date()
  };
};