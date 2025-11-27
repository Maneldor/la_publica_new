/**
 * Validaciones para el módulo de Empresas
 * Panel admin de La Pública
 */

import { z } from 'zod';
import {
  companyNameSchema,
  emailSchema,
  phoneSchema,
  urlSchema,
  optionalUrlSchema,
  validatedSpanishIdSchema,
  addressSchema,
  longDescriptionSchema,
  shortDescriptionSchema,
  StatusEnum,
  imageFileSchema,
  documentFileSchema,
  tagsArraySchema,
  metadataSchema,
  timestampsSchema,
  withIdSchema,
  idArraySchema,
  priceSchema,
  integerSchema,
  positiveIntegerSchema
} from './common';

// ==================== ENUMS ESPECÍFICOS ====================

export const CompanySizeEnum = z.enum([
  'startup',       // 1-10 empleados
  'small',         // 11-50 empleados
  'medium',        // 51-200 empleados
  'large',         // 201-1000 empleados
  'enterprise'     // 1000+ empleados
]);

export const CompanyTypeEnum = z.enum([
  'sl',           // Sociedad Limitada
  'sa',           // Sociedad Anónima
  'autonomo',     // Autónomo
  'cooperativa',  // Cooperativa
  'fundacion',    // Fundación
  'asociacion',   // Asociación
  'publica',      // Empresa pública
  'mixta',        // Empresa mixta
  'otra'          // Otra forma jurídica
]);

export const IndustryEnum = z.enum([
  'tecnologia',
  'consultoria',
  'educacion',
  'salud',
  'construccion',
  'manufactura',
  'servicios',
  'comercio',
  'hosteleria',
  'transporte',
  'energia',
  'finanzas',
  'inmobiliaria',
  'media',
  'agricultura',
  'turismo',
  'deporte',
  'cultura',
  'ong',
  'otra'
]);

export const CompanyStatusEnum = z.enum([
  'pending',      // Pendiente de verificación
  'verified',     // Verificada
  'active',       // Activa
  'suspended',    // Suspendida
  'rejected',     // Rechazada
  'inactive'      // Inactiva
]);

export const VerificationStatusEnum = z.enum([
  'pending',      // Pendiente
  'in_review',    // En revisión
  'approved',     // Aprobada
  'rejected',     // Rechazada
  'expired'       // Expirada
]);

export const PlanTypeEnum = z.enum([
  'free',         // Plan gratuito
  'basic',        // Plan básico
  'premium',      // Plan premium
  'enterprise',   // Plan enterprise
  'custom'        // Plan personalizado
]);

// ==================== SCHEMAS BASE ====================

// Información básica de la empresa
const companyBaseInfoSchema = z.object({
  name: companyNameSchema,
  commercialName: z
    .string()
    .trim()
    .max(150, 'El nombre comercial no puede superar los 150 caracteres')
    .optional(),
  cif: validatedSpanishIdSchema,
  type: CompanyTypeEnum,
  size: CompanySizeEnum,
  industry: IndustryEnum,
  foundedYear: z
    .number()
    .int()
    .min(1800, 'Año de fundación muy antiguo')
    .max(new Date().getFullYear(), 'Año de fundación no puede ser futuro')
    .optional(),
  employeeCount: positiveIntegerSchema.optional(),
  description: longDescriptionSchema.optional(),
  shortDescription: shortDescriptionSchema.optional()
});

// Información de contacto
const companyContactSchema = z.object({
  email: emailSchema,
  phone: phoneSchema.refine((val) => val && val.length >= 9, {
    message: 'Teléfono obligatorio para empresas'
  }),
  website: optionalUrlSchema,
  linkedinUrl: optionalUrlSchema,
  twitterUrl: optionalUrlSchema,
  address: addressSchema,

  // Contacto principal
  contactPerson: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Nombre del contacto debe tener al menos 2 caracteres')
      .max(100, 'Nombre del contacto no puede superar los 100 caracteres'),
    position: z
      .string()
      .trim()
      .max(100, 'Cargo no puede superar los 100 caracteres')
      .optional(),
    email: emailSchema,
    phone: phoneSchema.optional()
  })
});

// Información de verificación
const verificationSchema = z.object({
  status: VerificationStatusEnum,
  verifiedAt: z.date().optional(),
  verifiedBy: z.string().trim().optional(),
  documents: z.array(z.object({
    type: z.enum(['cif', 'registro_mercantil', 'estatutos', 'poder_representacion', 'otro']),
    name: z.string().trim().min(1, 'Nombre de documento requerido'),
    url: urlSchema.refine((val) => val && val.length > 0, {
      message: 'URL de documento requerida'
    }),
    uploadedAt: z.date().default(() => new Date())
  })).max(10, 'Máximo 10 documentos'),
  notes: z
    .string()
    .trim()
    .max(1000, 'Las notas no pueden superar los 1000 caracteres')
    .optional()
});

// Información de plan y facturación
const billingSchema = z.object({
  plan: PlanTypeEnum,
  planStartDate: z.date().optional(),
  planEndDate: z.date().optional(),
  billingEmail: emailSchema.optional(),
  taxAddress: addressSchema.optional(),
  paymentMethod: z.enum(['card', 'transfer', 'invoice']).optional(),

  // Límites del plan
  maxJobPostings: positiveIntegerSchema.optional(),
  maxUsers: positiveIntegerSchema.optional(),
  maxApplications: positiveIntegerSchema.optional(),

  // Facturación
  monthlyPrice: priceSchema.optional(),
  yearlyPrice: priceSchema.optional(),
  currency: z.string().trim().default('EUR')
});

// Schema completo de empresa
const companyBaseSchema = z.object({
  ...companyBaseInfoSchema.shape,
  ...companyContactSchema.shape,
  verification: verificationSchema.optional(),
  billing: billingSchema.optional(),

  status: CompanyStatusEnum,
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),

  // Metadatos
  tags: tagsArraySchema.optional(),
  logoUrl: urlSchema.optional(),
  bannerUrl: urlSchema.optional(),

  // SEO
  metadata: metadataSchema.optional(),

  // Estadísticas
  totalJobPostings: integerSchema.default(0),
  activeJobPostings: integerSchema.default(0),
  totalApplications: integerSchema.default(0),

  // Fechas
  lastLoginAt: z.date().optional(),
  profileCompletedAt: z.date().optional()
});

// ==================== SCHEMAS DE FORMULARIOS ====================

// Registro inicial de empresa
export const companyRegistrationSchema = z.object({
  name: companyNameSchema,
  cif: validatedSpanishIdSchema,
  email: emailSchema,
  phone: phoneSchema.refine((val) => val && val.length >= 9, {
    message: 'Teléfono obligatorio'
  }),
  contactPerson: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Nombre del contacto requerido')
      .max(100, 'Nombre muy largo'),
    email: emailSchema
  }),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Debe aceptar los términos y condiciones'
  }),
  acceptPrivacy: z.boolean().refine((val) => val === true, {
    message: 'Debe aceptar la política de privacidad'
  })
});

// Completar perfil de empresa
export const completeCompanyProfileSchema = z.object({
  commercialName: z.string().trim().max(150).optional(),
  type: CompanyTypeEnum,
  size: CompanySizeEnum,
  industry: IndustryEnum,
  foundedYear: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),
  employeeCount: positiveIntegerSchema.optional(),
  description: longDescriptionSchema,
  shortDescription: shortDescriptionSchema,
  website: optionalUrlSchema,
  linkedinUrl: optionalUrlSchema,
  address: addressSchema,
  logoUrl: urlSchema.optional(),
  tags: tagsArraySchema.optional()
});

// Crear empresa (admin)
export const createCompanySchema = companyBaseSchema
  .omit({ status: true, verification: true, billing: true })
  .extend({
    status: z.literal('pending').default('pending'),
    createdBy: z.string().trim().min(1, 'ID de creador requerido')
  });

// Actualizar empresa
export const updateCompanySchema = withIdSchema(
  companyBaseSchema.partial()
);

// Verificar empresa
export const verifyCompanySchema = z.object({
  id: z.string().trim().min(1, 'ID de empresa requerido'),
  status: VerificationStatusEnum,
  notes: z
    .string()
    .trim()
    .max(1000, 'Las notas no pueden superar los 1000 caracteres')
    .optional(),
  verifiedBy: z.string().trim().min(1, 'ID de verificador requerido')
});

// Subir documentos de verificación
export const uploadVerificationDocumentsSchema = z.object({
  companyId: z.string().trim().min(1, 'ID de empresa requerido'),
  documents: z.array(z.object({
    type: z.enum(['cif', 'registro_mercantil', 'estatutos', 'poder_representacion', 'otro']),
    file: documentFileSchema,
    name: z.string().trim().min(1, 'Nombre de documento requerido')
  })).min(1, 'Debe subir al menos un documento').max(5, 'Máximo 5 documentos por vez')
});

// ==================== SCHEMAS DE FILTROS ====================

// Filtros de búsqueda de empresas
export const companyFiltersSchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, 'La búsqueda no puede superar los 100 caracteres')
    .optional(),

  status: CompanyStatusEnum.optional(),
  verificationStatus: VerificationStatusEnum.optional(),
  type: CompanyTypeEnum.optional(),
  size: CompanySizeEnum.optional(),
  industry: IndustryEnum.optional(),
  plan: PlanTypeEnum.optional(),

  province: z.string().trim().optional(),
  city: z.string().trim().optional(),

  hasLogo: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),

  foundedFrom: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),
  foundedTo: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),

  employeeCountMin: z.number().int().min(0).optional(),
  employeeCountMax: z.number().int().min(0).optional(),

  registeredFrom: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
    .optional(),
  registeredTo: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
    .optional(),

  tags: z
    .array(z.string().trim())
    .max(5, 'Máximo 5 tags para filtrar')
    .optional()
}).refine((data) => {
  if (data.foundedFrom && data.foundedTo) {
    return data.foundedFrom <= data.foundedTo;
  }
  return true;
}, {
  message: 'El año de inicio debe ser anterior al año de fin',
  path: ['foundedTo']
}).refine((data) => {
  if (data.employeeCountMin && data.employeeCountMax) {
    return data.employeeCountMin <= data.employeeCountMax;
  }
  return true;
}, {
  message: 'El mínimo de empleados debe ser menor al máximo',
  path: ['employeeCountMax']
}).refine((data) => {
  if (data.registeredFrom && data.registeredTo) {
    return new Date(data.registeredFrom) <= new Date(data.registeredTo);
  }
  return true;
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['registeredTo']
});

// ==================== SCHEMAS DE GESTIÓN DE PLANES ====================

// Cambiar plan de empresa
export const changePlanSchema = z.object({
  companyId: z.string().trim().min(1, 'ID de empresa requerido'),
  newPlan: PlanTypeEnum,
  billingCycle: z.enum(['monthly', 'yearly']).default('monthly'),
  paymentMethod: z.enum(['card', 'transfer', 'invoice']).optional(),
  promoCode: z
    .string()
    .trim()
    .max(50, 'Código promocional muy largo')
    .optional(),
  autoRenew: z.boolean().default(true)
});

// Configuración de límites de plan
export const planLimitsSchema = z.object({
  plan: PlanTypeEnum,
  maxJobPostings: positiveIntegerSchema,
  maxUsers: positiveIntegerSchema,
  maxApplications: positiveIntegerSchema,
  canAccessAnalytics: z.boolean().default(false),
  canFeaturedJobs: z.boolean().default(false),
  prioritySupport: z.boolean().default(false),
  customBranding: z.boolean().default(false)
});

// ==================== SCHEMAS DE ESTADÍSTICAS ====================

// Métricas de empresa
export const companyMetricsSchema = z.object({
  companyId: z.string().trim().min(1, 'ID de empresa requerido'),

  // Métricas de ofertas
  totalJobPostings: integerSchema.default(0),
  activeJobPostings: integerSchema.default(0),
  expiredJobPostings: integerSchema.default(0),

  // Métricas de aplicaciones
  totalApplications: integerSchema.default(0),
  pendingApplications: integerSchema.default(0),
  acceptedApplications: integerSchema.default(0),
  rejectedApplications: integerSchema.default(0),

  // Métricas de perfil
  profileViews: integerSchema.default(0),
  logoClicks: integerSchema.default(0),
  websiteClicks: integerSchema.default(0),

  // Engagement
  averageApplicationsPerJob: z.number().min(0).default(0),
  averageTimeToHire: z.number().min(0).default(0), // días
  responseRate: z.number().min(0).max(1).default(0),

  // Fechas de actualización
  lastCalculatedAt: z.date().default(() => new Date()),
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('monthly')
});

// ==================== SCHEMAS DE COMUNICACIÓN ====================

// Enviar mensaje a empresa
export const sendMessageToCompanySchema = z.object({
  companyId: z.string().trim().min(1, 'ID de empresa requerido'),
  subject: z
    .string()
    .trim()
    .min(3, 'Asunto debe tener al menos 3 caracteres')
    .max(200, 'Asunto no puede superar los 200 caracteres'),
  message: z
    .string()
    .trim()
    .min(10, 'Mensaje debe tener al menos 10 caracteres')
    .max(2000, 'Mensaje no puede superar los 2000 caracteres'),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  sendEmail: z.boolean().default(true),
  sendNotification: z.boolean().default(true)
});

// Newsletter y comunicaciones masivas
export const massEmailSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, 'Asunto requerido')
    .max(200, 'Asunto muy largo'),
  content: z
    .string()
    .trim()
    .min(50, 'Contenido muy corto')
    .max(10000, 'Contenido muy largo'),
  filters: companyFiltersSchema.optional(),
  sendToAll: z.boolean().default(false),
  scheduleFor: z.date().optional(),
  templateId: z.string().trim().optional()
});

// ==================== TIPOS TYPESCRIPT ====================

export type CompanyRegistrationInput = z.infer<typeof companyRegistrationSchema>;
export type CompleteCompanyProfileInput = z.infer<typeof completeCompanyProfileSchema>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type VerifyCompanyInput = z.infer<typeof verifyCompanySchema>;
export type UploadVerificationDocumentsInput = z.infer<typeof uploadVerificationDocumentsSchema>;
export type CompanyFilters = z.infer<typeof companyFiltersSchema>;
export type ChangePlanInput = z.infer<typeof changePlanSchema>;
export type PlanLimits = z.infer<typeof planLimitsSchema>;
export type CompanyMetrics = z.infer<typeof companyMetricsSchema>;
export type SendMessageToCompanyInput = z.infer<typeof sendMessageToCompanySchema>;
export type MassEmailInput = z.infer<typeof massEmailSchema>;

// ==================== VALIDADORES ESPECÍFICOS ====================

// Validar CIF específicamente
export const validateCIF = (cif: string): boolean => {
  const cleanCIF = cif.toUpperCase().replace(/\s/g, '');

  if (!/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(cleanCIF)) {
    return false;
  }

  const organizationType = cleanCIF[0];
  const numbers = cleanCIF.slice(1, 8);
  const controlDigit = cleanCIF[8];

  // Cálculo del dígito de control (simplificado)
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    let digit = parseInt(numbers[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit = Math.floor(digit / 10) + (digit % 10);
    }
    sum += digit;
  }

  const calculatedControl = (10 - (sum % 10)) % 10;

  // Algunos tipos usan letra, otros número
  if (['N', 'P', 'Q', 'R', 'S', 'W'].includes(organizationType)) {
    const letters = 'JABCDEFGHI';
    return letters[calculatedControl] === controlDigit;
  } else {
    return calculatedControl.toString() === controlDigit;
  }
};

// Validar completitud de perfil
export const calculateProfileCompleteness = (company: any): number => {
  const requiredFields = [
    'name', 'cif', 'email', 'phone', 'type', 'size', 'industry',
    'description', 'address.street', 'address.city', 'address.province',
    'contactPerson.name', 'contactPerson.email'
  ];

  const optionalFields = [
    'website', 'logoUrl', 'foundedYear', 'employeeCount', 'shortDescription'
  ];

  let completedRequired = 0;
  let completedOptional = 0;

  requiredFields.forEach(field => {
    if (getNestedValue(company, field)) {
      completedRequired++;
    }
  });

  optionalFields.forEach(field => {
    if (getNestedValue(company, field)) {
      completedOptional++;
    }
  });

  // 80% requeridos + 20% opcionales
  const requiredScore = (completedRequired / requiredFields.length) * 0.8;
  const optionalScore = (completedOptional / optionalFields.length) * 0.2;

  return Math.round((requiredScore + optionalScore) * 100);
};

// Helper para obtener valores anidados
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Validar permisos para acciones en empresas
export const validateCompanyPermissions = (
  action: 'create' | 'update' | 'delete' | 'verify' | 'changePlan',
  userRole: string,
  company?: any
): boolean => {
  const adminRoles = ['SUPER_ADMIN', 'ADMIN'];
  const managerRoles = [...adminRoles, 'COMMUNITY_MANAGER'];

  switch (action) {
    case 'create':
    case 'update':
      return managerRoles.includes(userRole);

    case 'verify':
    case 'changePlan':
      return adminRoles.includes(userRole);

    case 'delete':
      return userRole === 'SUPER_ADMIN';

    default:
      return false;
  }
};

// ==================== TRANSFORMACIONES ====================

// Preparar datos de empresa para la DB
export const prepareCompanyForDB = (data: CreateCompanyInput) => {
  return {
    ...data,
    slug: data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, ''),

    // Valores por defecto
    totalJobPostings: 0,
    activeJobPostings: 0,
    totalApplications: 0,
    profileCompleteness: calculateProfileCompleteness(data),

    // Fechas
    createdAt: new Date(),
    updatedAt: new Date()
  };
};