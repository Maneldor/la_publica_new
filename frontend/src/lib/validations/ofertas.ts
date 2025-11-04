/**
 * Validaciones para el módulo de Ofertas Laborales
 * Panel admin de La Pública
 */

import { z } from 'zod';
import {
  titleSchema,
  longDescriptionSchema,
  shortDescriptionSchema,
  StatusEnum,
  salarySchema,
  futureDateSchema,
  dateTimeSchema,
  urlSchema,
  addressSchema,
  tagsArraySchema,
  metadataSchema,
  timestampsSchema,
  withIdSchema,
  idArraySchema,
  integerSchema,
  positiveIntegerSchema,
  ContractTypeEnum,
  WorkModalityEnum,
  WorkScheduleEnum,
  ExperienceLevelEnum,
  ProvinceEnum
} from './common';

// ==================== ENUMS ESPECÍFICOS ====================

export const JobStatusEnum = z.enum([
  'draft',         // Borrador
  'pending',       // Pendiente de aprobación
  'active',        // Activa
  'paused',        // Pausada
  'filled',        // Cubierta
  'expired',       // Expirada
  'cancelled',     // Cancelada
  'rejected'       // Rechazada
], {
  errorMap: () => ({ message: 'Estado de oferta inválido' })
});

export const JobCategoryEnum = z.enum([
  'tecnologia',
  'administracion',
  'salud',
  'educacion',
  'ingenieria',
  'marketing',
  'ventas',
  'finanzas',
  'recursos_humanos',
  'legal',
  'operaciones',
  'construccion',
  'consultoría',
  'diseño',
  'comunicacion',
  'investigacion',
  'seguridad',
  'transporte',
  'hosteleria',
  'comercio',
  'agricultura',
  'energia',
  'medio_ambiente',
  'cultura',
  'deporte',
  'otros'
], {
  errorMap: () => ({ message: 'Categoría de trabajo inválida' })
});

export const EducationLevelEnum = z.enum([
  'sin_estudios',
  'eso',
  'bachillerato',
  'fp_medio',
  'fp_superior',
  'universitario',
  'master',
  'doctorado'
], {
  errorMap: () => ({ message: 'Nivel educativo inválido' })
});

export const SalaryTypeEnum = z.enum([
  'fixed',         // Salario fijo
  'range',         // Rango salarial
  'competitive',   // Competitivo
  'to_negotiate'   // A negociar
], {
  errorMap: () => ({ message: 'Tipo de salario inválido' })
});

export const ApplicationMethodEnum = z.enum([
  'platform',      // A través de la plataforma
  'email',         // Por email
  'website',       // Web externa
  'phone'          // Por teléfono
], {
  errorMap: () => ({ message: 'Método de aplicación inválido' })
});

export const JobSourceEnum = z.enum([
  'direct',        // Publicada directamente
  'imported',      // Importada
  'scrapped',      // Extraída por scraping
  'api'           // Recibida por API
], {
  errorMap: () => ({ message: 'Origen de oferta inválido' })
});

// ==================== SCHEMAS BASE ====================

// Información básica de la oferta
const jobBaseInfoSchema = z.object({
  title: titleSchema,
  description: longDescriptionSchema,
  summary: shortDescriptionSchema.optional(),
  category: JobCategoryEnum,
  subcategory: z
    .string()
    .trim()
    .max(100, 'Subcategoría muy larga')
    .optional(),

  // Empresa
  companyId: z.string().trim().min(1, 'ID de empresa requerido'),
  companyName: z
    .string()
    .trim()
    .min(2, 'Nombre de empresa requerido')
    .max(150, 'Nombre de empresa muy largo'),

  // Ubicación
  isRemote: z.boolean().default(false),
  workModality: WorkModalityEnum,
  location: z.object({
    address: addressSchema.optional(),
    allowsRelocation: z.boolean().default(false),
    provinces: z
      .array(ProvinceEnum)
      .max(10, 'Máximo 10 provincias')
      .optional()
  }).optional()
});

// Requisitos y condiciones
const jobRequirementsSchema = z.object({
  // Experiencia
  experienceLevel: ExperienceLevelEnum,
  yearsExperience: z.object({
    min: z.number().int().min(0).max(50).optional(),
    max: z.number().int().min(0).max(50).optional()
  }).optional(),

  // Educación
  educationLevel: EducationLevelEnum,
  specificEducation: z
    .array(z.string().trim().max(100))
    .max(5, 'Máximo 5 titulaciones específicas')
    .optional(),

  // Idiomas
  languages: z.array(z.object({
    language: z.string().trim().min(2, 'Idioma requerido'),
    level: z.enum(['basic', 'intermediate', 'advanced', 'native']),
    required: z.boolean().default(false)
  })).max(5, 'Máximo 5 idiomas').optional(),

  // Habilidades técnicas
  technicalSkills: z
    .array(z.string().trim().max(50))
    .max(20, 'Máximo 20 habilidades técnicas')
    .optional(),

  // Habilidades blandas
  softSkills: z
    .array(z.string().trim().max(50))
    .max(10, 'Máximo 10 habilidades blandas')
    .optional(),

  // Certificaciones
  certifications: z
    .array(z.string().trim().max(100))
    .max(10, 'Máximo 10 certificaciones')
    .optional(),

  // Otros requisitos
  drivingLicense: z.boolean().default(false),
  ownVehicle: z.boolean().default(false),
  travelRequired: z.boolean().default(false),
  travelPercentage: z
    .number()
    .int()
    .min(0)
    .max(100)
    .optional(),

  // Requisitos específicos
  specificRequirements: z
    .string()
    .trim()
    .max(1000, 'Requisitos específicos muy largos')
    .optional()
});

// Condiciones laborales
const jobConditionsSchema = z.object({
  // Contrato
  contractType: ContractTypeEnum,
  workSchedule: WorkScheduleEnum,
  hoursPerWeek: z
    .number()
    .int()
    .min(1, 'Mínimo 1 hora por semana')
    .max(60, 'Máximo 60 horas por semana')
    .optional(),

  // Salario
  salaryType: SalaryTypeEnum,
  salary: z.object({
    min: salarySchema.optional(),
    max: salarySchema.optional(),
    currency: z.string().trim().default('EUR'),
    period: z.enum(['hour', 'day', 'month', 'year']).default('year'),
    includes: z.object({
      bonuses: z.boolean().default(false),
      commissions: z.boolean().default(false),
      benefits: z.boolean().default(false)
    }).optional()
  }).optional(),

  // Beneficios
  benefits: z.array(z.object({
    type: z.enum([
      'health_insurance',
      'dental_insurance',
      'life_insurance',
      'retirement_plan',
      'flexible_hours',
      'remote_work',
      'training',
      'gym',
      'meal_vouchers',
      'transport',
      'parking',
      'phone',
      'laptop',
      'other'
    ]),
    description: z.string().trim().max(200).optional()
  })).max(15, 'Máximo 15 beneficios').optional(),

  // Fechas
  startDate: futureDateSchema.optional(),
  applicationDeadline: futureDateSchema.optional(),

  // Urgencia
  isUrgent: z.boolean().default(false),
  urgencyReason: z
    .string()
    .trim()
    .max(500, 'Razón de urgencia muy larga')
    .optional()
});

// Proceso de aplicación
const applicationProcessSchema = z.object({
  method: ApplicationMethodEnum,
  email: z
    .string()
    .trim()
    .email('Email inválido')
    .optional(),
  website: urlSchema.optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s\-()]{9,}$/, 'Formato de teléfono inválido')
    .optional(),

  instructions: z
    .string()
    .trim()
    .max(1000, 'Instrucciones muy largas')
    .optional(),

  documentsRequired: z.array(z.enum([
    'cv',
    'cover_letter',
    'portfolio',
    'references',
    'certificates',
    'photo',
    'other'
  ])).max(7, 'Máximo 7 tipos de documentos').optional(),

  processingTime: z
    .string()
    .trim()
    .max(200, 'Tiempo de procesamiento muy largo')
    .optional(),

  interviewProcess: z
    .string()
    .trim()
    .max(500, 'Descripción del proceso muy larga')
    .optional()
});

// Schema completo de oferta
const jobBaseSchema = z.object({
  ...jobBaseInfoSchema.shape,
  requirements: jobRequirementsSchema.optional(),
  conditions: jobConditionsSchema.optional(),
  applicationProcess: applicationProcessSchema.optional(),

  status: JobStatusEnum,
  source: JobSourceEnum.default('direct'),

  // Configuración
  featuredUntil: z.date().optional(),
  boostUntil: z.date().optional(),
  maxApplications: positiveIntegerSchema.optional(),

  // Metadatos
  tags: tagsArraySchema.optional(),
  internalNotes: z
    .string()
    .trim()
    .max(1000, 'Notas internas muy largas')
    .optional(),

  // SEO
  metadata: metadataSchema.optional(),

  // Estadísticas
  viewsCount: integerSchema.default(0),
  applicationsCount: integerSchema.default(0),
  impressionsCount: integerSchema.default(0),

  // Fechas
  publishedAt: z.date().optional(),
  expiresAt: z.date().optional(),
  lastApplicationAt: z.date().optional()
});

// ==================== SCHEMAS DE FORMULARIOS ====================

// Crear oferta
export const createJobSchema = jobBaseSchema
  .omit({ status: true, publishedAt: true })
  .extend({
    status: z.literal('draft').default('draft'),
    createdBy: z.string().trim().min(1, 'ID de creador requerido')
  })
  .refine((data) => {
    // Validar rango salarial
    if (data.conditions?.salary?.min && data.conditions?.salary?.max) {
      return data.conditions.salary.min <= data.conditions.salary.max;
    }
    return true;
  }, {
    message: 'El salario mínimo debe ser menor o igual al máximo',
    path: ['conditions', 'salary', 'max']
  })
  .refine((data) => {
    // Validar años de experiencia
    if (data.requirements?.yearsExperience?.min && data.requirements?.yearsExperience?.max) {
      return data.requirements.yearsExperience.min <= data.requirements.yearsExperience.max;
    }
    return true;
  }, {
    message: 'Los años mínimos deben ser menores o iguales a los máximos',
    path: ['requirements', 'yearsExperience', 'max']
  })
  .refine((data) => {
    // Validar método de aplicación
    if (data.applicationProcess?.method === 'email' && !data.applicationProcess?.email) {
      return false;
    }
    if (data.applicationProcess?.method === 'website' && !data.applicationProcess?.website) {
      return false;
    }
    if (data.applicationProcess?.method === 'phone' && !data.applicationProcess?.phone) {
      return false;
    }
    return true;
  }, {
    message: 'Debe proporcionar la información requerida para el método de aplicación seleccionado',
    path: ['applicationProcess']
  })
  .refine((data) => {
    // Si es urgente, debe tener razón
    if (data.conditions?.isUrgent && !data.conditions?.urgencyReason) {
      return false;
    }
    return true;
  }, {
    message: 'Debe proporcionar una razón para la urgencia',
    path: ['conditions', 'urgencyReason']
  });

// Actualizar oferta
export const updateJobSchema = withIdSchema(
  jobBaseSchema.partial()
);

// Publicar oferta
export const publishJobSchema = z.object({
  id: z.string().trim().min(1, 'ID de oferta requerido'),
  publishAt: dateTimeSchema.optional(),
  expiresAt: futureDateSchema.optional(),
  featured: z.boolean().default(false),
  boost: z.boolean().default(false)
});

// Clonar oferta
export const cloneJobSchema = z.object({
  sourceJobId: z.string().trim().min(1, 'ID de oferta origen requerido'),
  title: titleSchema.optional(),
  companyId: z.string().trim().optional(),
  modifyConditions: z.boolean().default(false)
});

// ==================== SCHEMAS DE FILTROS ====================

// Filtros de búsqueda de ofertas
export const jobFiltersSchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, 'La búsqueda no puede superar los 100 caracteres')
    .optional(),

  status: JobStatusEnum.optional(),
  category: JobCategoryEnum.optional(),
  contractType: ContractTypeEnum.optional(),
  workModality: WorkModalityEnum.optional(),
  workSchedule: WorkScheduleEnum.optional(),
  experienceLevel: ExperienceLevelEnum.optional(),
  educationLevel: EducationLevelEnum.optional(),
  salaryType: SalaryTypeEnum.optional(),

  companyId: z.string().trim().optional(),
  location: z.string().trim().optional(),
  province: ProvinceEnum.optional(),
  isRemote: z.boolean().optional(),
  isUrgent: z.boolean().optional(),
  isFeatured: z.boolean().optional(),

  salaryMin: salarySchema.optional(),
  salaryMax: salarySchema.optional(),

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

  skills: z
    .array(z.string().trim())
    .max(10, 'Máximo 10 habilidades para filtrar')
    .optional(),

  tags: z
    .array(z.string().trim())
    .max(5, 'Máximo 5 tags para filtrar')
    .optional()
}).refine((data) => {
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMin <= data.salaryMax;
  }
  return true;
}, {
  message: 'El salario mínimo debe ser menor o igual al máximo',
  path: ['salaryMax']
}).refine((data) => {
  if (data.publishedFrom && data.publishedTo) {
    return new Date(data.publishedFrom) <= new Date(data.publishedTo);
  }
  return true;
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['publishedTo']
}).refine((data) => {
  if (data.expiresFrom && data.expiresTo) {
    return new Date(data.expiresFrom) <= new Date(data.expiresTo);
  }
  return true;
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['expiresTo']
});

// ==================== SCHEMAS DE APLICACIONES ====================

// Aplicación a oferta
export const jobApplicationSchema = z.object({
  jobId: z.string().trim().min(1, 'ID de oferta requerido'),
  applicantId: z.string().trim().min(1, 'ID de aplicante requerido'),

  // Datos de contacto
  email: z.string().trim().email('Email inválido'),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s\-()]{9,}$/, 'Formato de teléfono inválido')
    .optional(),

  // Documentos
  cvUrl: urlSchema.optional(),
  coverLetterUrl: urlSchema.optional(),
  portfolioUrl: urlSchema.optional(),
  additionalDocuments: z
    .array(z.object({
      name: z.string().trim().min(1, 'Nombre de documento requerido'),
      url: urlSchema.refine((val) => val && val.length > 0, {
        message: 'URL de documento requerida'
      })
    }))
    .max(5, 'Máximo 5 documentos adicionales')
    .optional(),

  // Información adicional
  motivation: z
    .string()
    .trim()
    .max(2000, 'Motivación muy larga')
    .optional(),
  availabilityDate: futureDateSchema.optional(),
  salaryExpectation: salarySchema.optional(),

  // Respuestas a preguntas específicas
  customAnswers: z
    .array(z.object({
      question: z.string().trim().min(1, 'Pregunta requerida'),
      answer: z.string().trim().min(1, 'Respuesta requerida').max(1000, 'Respuesta muy larga')
    }))
    .max(10, 'Máximo 10 preguntas personalizadas')
    .optional(),

  // Consentimientos
  acceptsTerms: z.boolean().refine((val) => val === true, {
    message: 'Debe aceptar los términos y condiciones'
  }),
  acceptsPrivacy: z.boolean().refine((val) => val === true, {
    message: 'Debe aceptar la política de privacidad'
  }),
  acceptsDataProcessing: z.boolean().default(false)
});

// Evaluar aplicación
export const evaluateApplicationSchema = z.object({
  applicationId: z.string().trim().min(1, 'ID de aplicación requerido'),
  status: z.enum(['pending', 'reviewed', 'shortlisted', 'interview', 'hired', 'rejected']),
  rating: z
    .number()
    .int()
    .min(1, 'Calificación mínima: 1')
    .max(5, 'Calificación máxima: 5')
    .optional(),
  notes: z
    .string()
    .trim()
    .max(1000, 'Notas muy largas')
    .optional(),
  feedback: z
    .string()
    .trim()
    .max(500, 'Feedback muy largo')
    .optional(),
  interviewDate: dateTimeSchema.optional(),
  rejectionReason: z
    .string()
    .trim()
    .max(500, 'Razón de rechazo muy larga')
    .optional()
});

// ==================== SCHEMAS DE ESTADÍSTICAS ====================

// Métricas de oferta
export const jobMetricsSchema = z.object({
  jobId: z.string().trim().min(1, 'ID de oferta requerido'),

  // Visualizaciones
  views: integerSchema.default(0),
  uniqueViews: integerSchema.default(0),
  impressions: integerSchema.default(0),

  // Aplicaciones
  applications: integerSchema.default(0),
  qualifiedApplications: integerSchema.default(0),
  conversionRate: z.number().min(0).max(1).default(0),

  // Engagement
  clicks: integerSchema.default(0),
  shares: integerSchema.default(0),
  bookmarks: integerSchema.default(0),

  // Origen del tráfico
  trafficSources: z.object({
    direct: integerSchema.default(0),
    search: integerSchema.default(0),
    social: integerSchema.default(0),
    referral: integerSchema.default(0),
    email: integerSchema.default(0)
  }).optional(),

  // Tiempo promedio en página
  averageTimeOnPage: z.number().min(0).default(0), // segundos

  // Fechas
  period: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  lastCalculatedAt: z.date().default(() => new Date())
});

// ==================== TIPOS TYPESCRIPT ====================

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type PublishJobInput = z.infer<typeof publishJobSchema>;
export type CloneJobInput = z.infer<typeof cloneJobSchema>;
export type JobFilters = z.infer<typeof jobFiltersSchema>;
export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;
export type EvaluateApplicationInput = z.infer<typeof evaluateApplicationSchema>;
export type JobMetrics = z.infer<typeof jobMetricsSchema>;

// ==================== VALIDADORES ESPECÍFICOS ====================

// Validar que una oferta puede ser publicada
export const validateJobForPublishing = (job: any): boolean => {
  const requiredFields = [
    'title', 'description', 'category', 'companyId', 'companyName',
    'workModality', 'experienceLevel', 'educationLevel', 'contractType'
  ];

  for (const field of requiredFields) {
    if (!getNestedJobValue(job, field)) {
      return false;
    }
  }

  // Si no es remoto, debe tener ubicación
  if (!job.isRemote && !job.location?.address) {
    return false;
  }

  // Debe tener método de aplicación válido
  if (!job.applicationProcess?.method) {
    return false;
  }

  // Validaciones específicas por método
  const method = job.applicationProcess.method;
  if (method === 'email' && !job.applicationProcess.email) return false;
  if (method === 'website' && !job.applicationProcess.website) return false;
  if (method === 'phone' && !job.applicationProcess.phone) return false;

  return true;
};

// Helper para obtener valores anidados en ofertas
const getNestedJobValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Calcular puntuación de calidad de oferta
export const calculateJobQualityScore = (job: any): number => {
  let score = 0;

  // Campos básicos (40 puntos)
  if (job.title?.length >= 10) score += 5;
  if (job.description?.length >= 200) score += 10;
  if (job.summary?.length >= 50) score += 5;
  if (job.companyName) score += 5;
  if (job.category) score += 5;
  if (job.workModality) score += 5;
  if (job.contractType) score += 5;

  // Requisitos detallados (20 puntos)
  if (job.requirements?.technicalSkills?.length > 0) score += 5;
  if (job.requirements?.educationLevel) score += 5;
  if (job.requirements?.experienceLevel) score += 5;
  if (job.requirements?.languages?.length > 0) score += 5;

  // Condiciones laborales (20 puntos)
  if (job.conditions?.salary?.min && job.conditions?.salary?.max) score += 10;
  if (job.conditions?.benefits?.length > 0) score += 5;
  if (job.conditions?.workSchedule) score += 5;

  // Proceso de aplicación (15 puntos)
  if (job.applicationProcess?.method) score += 5;
  if (job.applicationProcess?.instructions?.length > 0) score += 5;
  if (job.applicationProcess?.processingTime) score += 5;

  // Extras (5 puntos)
  if (job.tags?.length > 0) score += 2;
  if (job.location?.address) score += 3;

  return Math.min(score, 100);
};

// Validar permisos para acciones en ofertas
export const validateJobPermissions = (
  action: 'create' | 'update' | 'delete' | 'publish' | 'feature',
  userRole: string,
  job?: any
): boolean => {
  const adminRoles = ['SUPER_ADMIN', 'ADMIN'];
  const managerRoles = [...adminRoles, 'COMMUNITY_MANAGER'];

  switch (action) {
    case 'create':
    case 'update':
      return managerRoles.includes(userRole);

    case 'publish':
      return managerRoles.includes(userRole);

    case 'feature':
      return adminRoles.includes(userRole);

    case 'delete':
      return userRole === 'SUPER_ADMIN';

    default:
      return false;
  }
};

// ==================== TRANSFORMACIONES ====================

// Preparar datos de oferta para la DB
export const prepareJobForDB = (data: CreateJobInput) => {
  return {
    ...data,
    slug: data.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, ''),

    // Valores por defecto
    viewsCount: 0,
    applicationsCount: 0,
    impressionsCount: 0,
    qualityScore: calculateJobQualityScore(data),

    // Fechas
    createdAt: new Date(),
    updatedAt: new Date()
  };
};