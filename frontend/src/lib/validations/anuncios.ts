/**
 * Validaciones para el módulo de Anuncios
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
  idArraySchema
} from './common';

// ==================== ENUMS ESPECÍFICOS ====================

export const AnnouncementTypeEnum = z.enum([
  'general',        // Anuncio general
  'urgent',         // Anuncio urgente
  'event',          // Evento
  'maintenance',    // Mantenimiento
  'news',          // Noticias
  'alert',         // Alerta
  'promotion',     // Promoción
  'regulation'     // Normativa
], {
  errorMap: () => ({ message: 'Tipo de anuncio inválido' })
});

export const AnnouncementAudienceEnum = z.enum([
  'all',           // Todos los usuarios
  'employees',     // Solo empleados públicos
  'companies',     // Solo empresas
  'specific',      // Audiencia específica
  'community'      // Solo una comunidad
], {
  errorMap: () => ({ message: 'Audiencia inválida' })
});

export const NotificationChannelEnum = z.enum([
  'platform',      // Solo en plataforma
  'email',         // Solo email
  'sms',          // Solo SMS
  'push',         // Solo notificación push
  'all_channels'   // Todos los canales
], {
  errorMap: () => ({ message: 'Canal de notificación inválido' })
});

// ==================== SCHEMAS BASE ====================

// Schema base para anuncios
const announcementBaseSchema = z.object({
  title: titleSchema,
  content: longDescriptionSchema,
  summary: shortDescriptionSchema.optional(),
  type: AnnouncementTypeEnum,
  priority: PriorityEnum,
  status: StatusEnum,

  // Audiencia y targeting
  audience: AnnouncementAudienceEnum,
  targetCommunities: idArraySchema('comunidad').optional(),
  targetRoles: z
    .array(z.string().trim())
    .max(10, 'Máximo 10 roles objetivo')
    .optional(),

  // Programación
  publishAt: dateTimeSchema.optional(),
  expiresAt: dateTimeSchema.optional(),

  // Notificaciones
  sendNotification: z.boolean().default(false),
  notificationChannels: z
    .array(NotificationChannelEnum)
    .max(4, 'Máximo 4 canales de notificación')
    .optional(),

  // Contenido adicional
  imageUrl: urlSchema.optional(),
  attachmentUrl: urlSchema.optional(),
  externalUrl: urlSchema.optional(),

  // Metadatos
  tags: tagsArraySchema.optional(),
  isSticky: z.boolean().default(false), // Anuncio fijado
  allowComments: z.boolean().default(true),

  // SEO y metadata
  metadata: metadataSchema.optional()
});

// ==================== SCHEMAS DE FORMULARIOS ====================

// Crear anuncio
export const createAnnouncementSchema = announcementBaseSchema
  .omit({ status: true })
  .extend({
    status: z.literal('draft').default('draft'),
    authorId: z.string().trim().min(1, 'ID de autor requerido')
  })
  .refine((data) => {
    // Si se programa para publicar, debe ser fecha futura
    if (data.publishAt) {
      const publishDate = new Date(data.publishAt);
      const now = new Date();
      return publishDate > now;
    }
    return true;
  }, {
    message: 'La fecha de publicación debe ser en el futuro',
    path: ['publishAt']
  })
  .refine((data) => {
    // Si tiene fecha de expiración, debe ser posterior a la publicación
    if (data.publishAt && data.expiresAt) {
      const publishDate = new Date(data.publishAt);
      const expireDate = new Date(data.expiresAt);
      return expireDate > publishDate;
    }
    return true;
  }, {
    message: 'La fecha de expiración debe ser posterior a la de publicación',
    path: ['expiresAt']
  })
  .refine((data) => {
    // Si la audiencia es específica, debe tener al menos un target
    if (data.audience === 'specific') {
      return (data.targetCommunities && data.targetCommunities.length > 0) ||
             (data.targetRoles && data.targetRoles.length > 0);
    }
    return true;
  }, {
    message: 'Para audiencia específica debe seleccionar comunidades o roles',
    path: ['audience']
  })
  .refine((data) => {
    // Si es comunidad específica, debe tener al menos una comunidad
    if (data.audience === 'community') {
      return data.targetCommunities && data.targetCommunities.length > 0;
    }
    return true;
  }, {
    message: 'Para audiencia de comunidad debe seleccionar al menos una',
    path: ['targetCommunities']
  });

// Actualizar anuncio
export const updateAnnouncementSchema = withIdSchema(
  announcementBaseSchema.partial()
).refine((data) => {
  // Mismas validaciones que crear pero opcionales
  if (data.publishAt && data.status === 'pending') {
    const publishDate = new Date(data.publishAt);
    const now = new Date();
    return publishDate > now;
  }
  return true;
}, {
  message: 'La fecha de publicación debe ser en el futuro para anuncios pendientes',
  path: ['publishAt']
});

// Publicar anuncio
export const publishAnnouncementSchema = z.object({
  id: z.string().trim().min(1, 'ID de anuncio requerido'),
  publishAt: dateTimeSchema.optional(),
  sendNotification: z.boolean().default(false),
  notificationChannels: z
    .array(NotificationChannelEnum)
    .optional()
});

// Archivar/despublicar anuncio
export const archiveAnnouncementSchema = z.object({
  id: z.string().trim().min(1, 'ID de anuncio requerido'),
  reason: z
    .string()
    .trim()
    .max(500, 'La razón no puede superar los 500 caracteres')
    .optional()
});

// ==================== SCHEMAS DE FILTROS ====================

// Filtros de búsqueda de anuncios
export const announcementFiltersSchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, 'La búsqueda no puede superar los 100 caracteres')
    .optional(),

  type: AnnouncementTypeEnum.optional(),
  status: StatusEnum.optional(),
  priority: PriorityEnum.optional(),
  audience: AnnouncementAudienceEnum.optional(),

  authorId: z.string().trim().optional(),
  communityId: z.string().trim().optional(),

  hasImage: z.boolean().optional(),
  hasAttachment: z.boolean().optional(),
  isSticky: z.boolean().optional(),
  allowComments: z.boolean().optional(),

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

  expiresFrom: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
    .optional(),
  expiresTo: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
    .optional(),

  tags: z
    .array(z.string().trim())
    .max(5, 'Máximo 5 tags para filtrar')
    .optional()
}).refine((data) => {
  // Validar rango de fechas de publicación
  if (data.publishedFrom && data.publishedTo) {
    return new Date(data.publishedFrom) <= new Date(data.publishedTo);
  }
  return true;
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['publishedTo']
}).refine((data) => {
  // Validar rango de fechas de expiración
  if (data.expiresFrom && data.expiresTo) {
    return new Date(data.expiresFrom) <= new Date(data.expiresTo);
  }
  return true;
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['expiresTo']
});

// ==================== SCHEMAS DE CONFIGURACIÓN ====================

// Configuración de notificaciones
export const notificationConfigSchema = z.object({
  defaultChannels: z
    .array(NotificationChannelEnum)
    .min(1, 'Debe seleccionar al menos un canal por defecto'),

  urgentChannels: z
    .array(NotificationChannelEnum)
    .min(1, 'Debe seleccionar al menos un canal para urgentes'),

  emailTemplate: z
    .string()
    .trim()
    .min(1, 'Template de email requerido'),

  smsTemplate: z
    .string()
    .trim()
    .max(160, 'Template SMS no puede superar 160 caracteres')
    .optional(),

  pushTemplate: z
    .string()
    .trim()
    .max(100, 'Template push no puede superar 100 caracteres')
    .optional(),

  enableAutoNotification: z.boolean().default(true),
  maxNotificationsPerDay: z
    .number()
    .int()
    .min(1, 'Mínimo 1 notificación por día')
    .max(50, 'Máximo 50 notificaciones por día')
    .default(10)
});

// ==================== SCHEMAS DE COMENTARIOS ====================

// Comentario en anuncio
export const announcementCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'El comentario no puede estar vacío')
    .max(1000, 'El comentario no puede superar los 1000 caracteres'),

  parentId: z
    .string()
    .trim()
    .optional(), // Para respuestas a comentarios

  isPrivate: z.boolean().default(false), // Comentario solo visible para admins

  attachmentUrl: urlSchema.optional()
});

// Moderar comentario
export const moderateCommentSchema = z.object({
  id: z.string().trim().min(1, 'ID de comentario requerido'),
  action: z.enum(['approve', 'reject', 'hide'], {
    errorMap: () => ({ message: 'Acción de moderación inválida' })
  }),
  reason: z
    .string()
    .trim()
    .max(500, 'La razón no puede superar los 500 caracteres')
    .optional()
});

// ==================== SCHEMAS DE ESTADÍSTICAS ====================

// Métricas de anuncio
export const announcementMetricsSchema = z.object({
  announcementId: z.string().trim().min(1, 'ID de anuncio requerido'),
  views: z.number().int().min(0).default(0),
  clicks: z.number().int().min(0).default(0),
  reactions: z.number().int().min(0).default(0),
  comments: z.number().int().min(0).default(0),
  shares: z.number().int().min(0).default(0),

  // Métricas por canal
  emailOpens: z.number().int().min(0).default(0),
  emailClicks: z.number().int().min(0).default(0),
  pushOpens: z.number().int().min(0).default(0),

  // Engagement rate
  engagementRate: z.number().min(0).max(1).default(0),

  // Fechas
  lastViewedAt: z.date().optional(),
  lastInteractionAt: z.date().optional()
});

// ==================== SCHEMAS DE IMPORTACIÓN/EXPORTACIÓN ====================

// Importar anuncios desde CSV/Excel
export const importAnnouncementsSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ].includes(file.type),
    'Solo se permiten archivos CSV o Excel'
  ).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'El archivo debe ser menor a 5MB'
  ),

  overwriteExisting: z.boolean().default(false),
  defaultAuthorId: z.string().trim().min(1, 'ID de autor por defecto requerido'),
  defaultCommunityId: z.string().trim().optional()
});

// Exportar anuncios
export const exportAnnouncementsSchema = z.object({
  format: z.enum(['csv', 'excel', 'json'], {
    errorMap: () => ({ message: 'Formato de exportación inválido' })
  }),

  includeMetrics: z.boolean().default(false),
  includeComments: z.boolean().default(false),

  dateFrom: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
    .optional(),
  dateTo: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
    .optional(),

  filters: announcementFiltersSchema.optional()
});

// ==================== TIPOS TYPESCRIPT ====================

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type PublishAnnouncementInput = z.infer<typeof publishAnnouncementSchema>;
export type ArchiveAnnouncementInput = z.infer<typeof archiveAnnouncementSchema>;
export type AnnouncementFilters = z.infer<typeof announcementFiltersSchema>;
export type NotificationConfig = z.infer<typeof notificationConfigSchema>;
export type AnnouncementComment = z.infer<typeof announcementCommentSchema>;
export type ModerateComment = z.infer<typeof moderateCommentSchema>;
export type AnnouncementMetrics = z.infer<typeof announcementMetricsSchema>;
export type ImportAnnouncementsInput = z.infer<typeof importAnnouncementsSchema>;
export type ExportAnnouncementsInput = z.infer<typeof exportAnnouncementsSchema>;

// ==================== VALIDADORES ESPECÍFICOS ====================

// Validar que un anuncio puede ser publicado
export const validateAnnouncementForPublishing = (announcement: any): boolean => {
  const requiredFields = ['title', 'content', 'type', 'priority', 'audience'];

  for (const field of requiredFields) {
    if (!announcement[field]) {
      return false;
    }
  }

  // Si es audiencia específica, debe tener targets
  if (announcement.audience === 'specific') {
    return (announcement.targetCommunities?.length > 0) ||
           (announcement.targetRoles?.length > 0);
  }

  // Si es comunidad específica, debe tener comunidades
  if (announcement.audience === 'community') {
    return announcement.targetCommunities?.length > 0;
  }

  return true;
};

// Validar permisos para acciones en anuncios
export const validateAnnouncementPermissions = (
  action: 'create' | 'update' | 'delete' | 'publish' | 'moderate',
  userRole: string,
  announcement?: any
): boolean => {
  const adminRoles = ['SUPER_ADMIN', 'ADMIN'];
  const managerRoles = [...adminRoles, 'COMMUNITY_MANAGER'];

  switch (action) {
    case 'create':
    case 'update':
      return managerRoles.includes(userRole);

    case 'publish':
    case 'moderate':
      return adminRoles.includes(userRole);

    case 'delete':
      return userRole === 'SUPER_ADMIN';

    default:
      return false;
  }
};

// ==================== TRANSFORMACIONES ====================

// Preparar datos para la base de datos
export const prepareAnnouncementForDB = (data: CreateAnnouncementInput) => {
  const prepared = {
    ...data,
    slug: data.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, ''),

    publishAt: data.publishAt ? new Date(data.publishAt) : null,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,

    // Defaults
    views: 0,
    reactions: 0,
    commentsCount: 0,
    sharesCount: 0
  };

  return prepared;
};