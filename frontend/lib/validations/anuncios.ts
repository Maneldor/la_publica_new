import { z } from 'zod';

// Enums para tipos de anuncio
export const AnuncioType = {
  GENERAL: 'GENERAL',
  URGENT: 'URGENT',
  EVENT: 'EVENT',
  MAINTENANCE: 'MAINTENANCE',
  NEWS: 'NEWS',
  ALERT: 'ALERT',
  PROMOTION: 'PROMOTION',
  REGULATION: 'REGULATION'
} as const;

export const AnuncioStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
} as const;

export const AnuncioAudience = {
  ALL: 'ALL',
  EMPLOYEES: 'EMPLOYEES',
  COMPANIES: 'COMPANIES',
  SPECIFIC: 'SPECIFIC',
  COMMUNITY: 'COMMUNITY'
} as const;

// Schema para crear anuncio (acepta valores en minúscula que el backend mapea)
export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'El título es demasiado largo'),
  content: z.string().min(1, 'El contenido es requerido'),
  summary: z.string().optional(),
  type: z.enum(['general', 'urgent', 'event', 'maintenance', 'news', 'alert', 'promotion', 'regulation']).default('general'),
  priority: z.number().int().min(1).max(10).default(5),
  status: z.enum(['draft', 'pending', 'published', 'archived']).default('draft'),
  audience: z.enum(['all', 'employees', 'companies', 'specific', 'community']).default('all'),
  targetCommunities: z.array(z.string()).default([]),
  targetRoles: z.array(z.string()).default([]),
  publishAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  sendNotification: z.boolean().default(false),
  notificationChannels: z.array(z.enum(['platform', 'email', 'sms', 'push', 'all_channels'])).default([]),
  imageUrl: z.string().url().optional().or(z.literal('')),
  attachmentUrl: z.string().url().optional().or(z.literal('')),
  externalUrl: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  isSticky: z.boolean().default(false),
  allowComments: z.boolean().default(true),
  authorId: z.string().optional(), // Se establecerá en el backend
});

// Schema para actualizar anuncio
export const updateAnnouncementSchema = createAnnouncementSchema.partial();

// Schema para filtros de búsqueda
export const announcementFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.enum(['general', 'urgent', 'event', 'maintenance', 'news', 'alert', 'promotion', 'regulation']).optional(),
  status: z.enum(['draft', 'pending', 'published', 'archived']).optional(),
  audience: z.enum(['all', 'employees', 'companies', 'specific', 'community']).optional(),
  communityId: z.string().optional(),
  authorId: z.string().optional(),
  isSticky: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  priority: z.number().int().min(1).max(10).optional(),
  publishedFrom: z.string().optional(),
  publishedTo: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

// Tipos de TypeScript derivados de los schemas
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type AnnouncementFilters = z.infer<typeof announcementFiltersSchema>;