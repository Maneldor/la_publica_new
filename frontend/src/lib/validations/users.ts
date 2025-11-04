/**
 * Validaciones para el módulo de Usuarios
 * Panel admin de La Pública
 */

import { z } from 'zod';
import {
  nameSchema,
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
  timestampsSchema,
  withIdSchema,
  idArraySchema,
  dateSchema,
  integerSchema,
  positiveIntegerSchema
} from './common';
import { UserRole } from '@/lib/permissions';

// ==================== ENUMS ESPECÍFICOS ====================

export const UserStatusEnum = z.enum([
  'active',        // Usuario activo
  'inactive',      // Usuario inactivo
  'pending',       // Pendiente de activación
  'suspended',     // Suspendido temporalmente
  'banned',        // Baneado permanentemente
  'deleted'        // Marcado para eliminación
], {
  errorMap: () => ({ message: 'Estado de usuario inválido' })
});

export const GenderEnum = z.enum([
  'male',
  'female',
  'other',
  'prefer_not_to_say'
], {
  errorMap: () => ({ message: 'Género inválido' })
});

export const EmploymentStatusEnum = z.enum([
  'employed',      // Empleado
  'unemployed',    // Desempleado
  'self_employed', // Autónomo
  'student',       // Estudiante
  'retired',       // Jubilado
  'other'          // Otro
], {
  errorMap: () => ({ message: 'Estado laboral inválido' })
});

export const EducationLevelEnum = z.enum([
  'primary',       // Educación primaria
  'secondary',     // Educación secundaria
  'vocational',    // Formación profesional
  'bachelor',      // Licenciatura/Grado
  'master',        // Máster
  'doctorate',     // Doctorado
  'other'          // Otro
], {
  errorMap: () => ({ message: 'Nivel educativo inválido' })
});

export const NotificationPreferenceEnum = z.enum([
  'all',          // Todas las notificaciones
  'important',    // Solo importantes
  'minimal',      // Mínimas
  'none'          // Ninguna
], {
  errorMap: () => ({ message: 'Preferencia de notificación inválida' })
});

export const LanguageProficiencyEnum = z.enum([
  'basic',
  'intermediate',
  'advanced',
  'native'
], {
  errorMap: () => ({ message: 'Nivel de idioma inválido' })
});

// ==================== SCHEMAS BASE ====================

// Información personal básica
const personalInfoSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  dateOfBirth: dateSchema.optional(),
  gender: GenderEnum.optional(),
  nif: validatedSpanishIdSchema.optional(),

  // Ubicación
  address: addressSchema.optional(),
  nationality: z
    .string()
    .trim()
    .max(50, 'Nacionalidad muy larga')
    .optional(),

  // Biografía
  bio: shortDescriptionSchema.optional(),
  about: longDescriptionSchema.optional(),

  // Redes sociales y web
  website: optionalUrlSchema,
  linkedinUrl: optionalUrlSchema,
  twitterUrl: optionalUrlSchema,
  githubUrl: optionalUrlSchema,

  // Imagen de perfil
  avatarUrl: urlSchema.optional()
});

// Información profesional
const professionalInfoSchema = z.object({
  // Estado laboral
  employmentStatus: EmploymentStatusEnum.optional(),
  currentJobTitle: z
    .string()
    .trim()
    .max(100, 'Título del trabajo muy largo')
    .optional(),
  currentEmployer: z
    .string()
    .trim()
    .max(150, 'Nombre del empleador muy largo')
    .optional(),

  // Experiencia laboral
  yearsOfExperience: z
    .number()
    .int()
    .min(0, 'Años de experiencia no pueden ser negativos')
    .max(60, 'Años de experiencia muy altos')
    .optional(),

  // Educación
  educationLevel: EducationLevelEnum.optional(),
  university: z
    .string()
    .trim()
    .max(150, 'Nombre de universidad muy largo')
    .optional(),
  degree: z
    .string()
    .trim()
    .max(150, 'Título universitario muy largo')
    .optional(),
  graduationYear: z
    .number()
    .int()
    .min(1950, 'Año de graduación muy antiguo')
    .max(new Date().getFullYear() + 10, 'Año de graduación muy futuro')
    .optional(),

  // Habilidades
  skills: z
    .array(z.string().trim().max(50, 'Habilidad muy larga'))
    .max(50, 'Máximo 50 habilidades')
    .optional(),

  // Idiomas
  languages: z.array(z.object({
    language: z.string().trim().min(2, 'Idioma requerido'),
    proficiency: LanguageProficiencyEnum,
    certified: z.boolean().default(false)
  })).max(10, 'Máximo 10 idiomas').optional(),

  // Certificaciones
  certifications: z.array(z.object({
    name: z.string().trim().min(1, 'Nombre de certificación requerido').max(150),
    issuer: z.string().trim().max(150, 'Emisor muy largo').optional(),
    issueDate: dateSchema.optional(),
    expiryDate: dateSchema.optional(),
    credentialUrl: urlSchema.optional()
  })).max(20, 'Máximo 20 certificaciones').optional(),

  // CV
  cvUrl: urlSchema.optional(),
  cvLastUpdated: z.date().optional()
});

// Configuración de cuenta
const accountSettingsSchema = z.object({
  // Preferencias de notificación
  emailNotifications: NotificationPreferenceEnum.default('important'),
  smsNotifications: NotificationPreferenceEnum.default('minimal'),
  pushNotifications: NotificationPreferenceEnum.default('important'),

  // Privacidad
  profileVisibility: z.enum(['public', 'registered', 'private']).default('registered'),
  showEmail: z.boolean().default(false),
  showPhone: z.boolean().default(false),
  allowMessages: z.boolean().default(true),
  allowJobAlerts: z.boolean().default(true),

  // Configuración de búsqueda de empleo
  openToWork: z.boolean().default(false),
  preferredJobTypes: z
    .array(z.string().trim())
    .max(10, 'Máximo 10 tipos de trabajo preferidos')
    .optional(),
  salaryExpectation: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
    currency: z.string().default('EUR')
  }).optional(),

  // Configuración de idioma y zona horaria
  preferredLanguage: z.string().trim().default('es'),
  timezone: z.string().trim().default('Europe/Madrid')
});

// Schema completo de usuario
const userBaseSchema = z.object({
  ...personalInfoSchema.shape,
  professional: professionalInfoSchema.optional(),
  settings: accountSettingsSchema.optional(),

  // Sistema
  role: z.nativeEnum(UserRole),
  status: UserStatusEnum,
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
  communityId: z.string().trim().optional(),

  // Metadata
  tags: tagsArraySchema.optional(),
  internalNotes: z
    .string()
    .trim()
    .max(1000, 'Notas internas muy largas')
    .optional(),

  // Estadísticas
  loginCount: integerSchema.default(0),
  profileViews: integerSchema.default(0),

  // Fechas importantes
  lastLoginAt: z.date().optional(),
  emailVerifiedAt: z.date().optional(),
  profileCompletedAt: z.date().optional(),
  bannedAt: z.date().optional(),
  bannedUntil: z.date().optional(),
  deletedAt: z.date().optional()
});

// ==================== SCHEMAS DE FORMULARIOS ====================

// Registro de usuario
export const userRegistrationSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede superar los 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Debe aceptar los términos y condiciones'
  }),
  acceptPrivacy: z.boolean().refine((val) => val === true, {
    message: 'Debe aceptar la política de privacidad'
  }),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  communityId: z.string().trim().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

// Crear usuario (admin)
export const createUserSchema = userBaseSchema
  .omit({ status: true, isVerified: true })
  .extend({
    status: z.literal('active').default('active'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(100, 'La contraseña no puede superar los 100 caracteres'),
    sendWelcomeEmail: z.boolean().default(true),
    createdBy: z.string().trim().min(1, 'ID de creador requerido')
  });

// Actualizar usuario
export const updateUserSchema = withIdSchema(
  userBaseSchema.partial().extend({
    // No se puede cambiar email directamente
    email: undefined
  })
);

// Actualizar perfil (usuario)
export const updateUserProfileSchema = z.object({
  personalInfo: personalInfoSchema.partial(),
  professional: professionalInfoSchema.partial(),
  settings: accountSettingsSchema.partial()
});

// Cambiar contraseña
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .max(100, 'La nueva contraseña no puede superar los 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La nueva contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'La nueva contraseña debe ser diferente a la actual',
  path: ['newPassword']
});

// Cambiar email
export const changeEmailSchema = z.object({
  newEmail: emailSchema,
  password: z.string().min(1, 'Contraseña requerida para cambiar email')
});

// Verificar email
export const verifyEmailSchema = z.object({
  token: z.string().trim().min(1, 'Token de verificación requerido'),
  email: emailSchema
});

// Restablecer contraseña
export const resetPasswordSchema = z.object({
  email: emailSchema
});

export const confirmResetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Token requerido'),
  newPassword: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede superar los 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

// ==================== SCHEMAS DE ADMINISTRACIÓN ====================

// Banear usuario
export const banUserSchema = z.object({
  userId: z.string().trim().min(1, 'ID de usuario requerido'),
  reason: z
    .string()
    .trim()
    .min(5, 'Razón del baneo requerida')
    .max(500, 'Razón muy larga'),
  duration: z.enum(['temporary', 'permanent']),
  bannedUntil: z.date().optional(),
  notifyUser: z.boolean().default(true),
  bannedBy: z.string().trim().min(1, 'ID de administrador requerido')
}).refine((data) => {
  if (data.duration === 'temporary' && !data.bannedUntil) {
    return false;
  }
  if (data.bannedUntil && data.bannedUntil <= new Date()) {
    return false;
  }
  return true;
}, {
  message: 'Para baneo temporal debe especificar fecha futura',
  path: ['bannedUntil']
});

// Desbanear usuario
export const unbanUserSchema = z.object({
  userId: z.string().trim().min(1, 'ID de usuario requerido'),
  reason: z
    .string()
    .trim()
    .max(500, 'Razón muy larga')
    .optional(),
  notifyUser: z.boolean().default(true),
  unbannedBy: z.string().trim().min(1, 'ID de administrador requerido')
});

// Cambiar rol de usuario
export const changeUserRoleSchema = z.object({
  userId: z.string().trim().min(1, 'ID de usuario requerido'),
  newRole: z.nativeEnum(UserRole),
  communityId: z.string().trim().optional(),
  reason: z
    .string()
    .trim()
    .max(500, 'Razón muy larga')
    .optional(),
  notifyUser: z.boolean().default(true),
  changedBy: z.string().trim().min(1, 'ID de administrador requerido')
}).refine((data) => {
  // Si el rol requiere comunidad, debe proporcionarse
  if ([UserRole.COMMUNITY_MANAGER, UserRole.MODERATOR].includes(data.newRole) && !data.communityId) {
    return false;
  }
  return true;
}, {
  message: 'Este rol requiere asignación a una comunidad específica',
  path: ['communityId']
});

// ==================== SCHEMAS DE FILTROS ====================

// Filtros de búsqueda de usuarios
export const userFiltersSchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, 'La búsqueda no puede superar los 100 caracteres')
    .optional(),

  role: z.nativeEnum(UserRole).optional(),
  status: UserStatusEnum.optional(),
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  communityId: z.string().trim().optional(),

  gender: GenderEnum.optional(),
  employmentStatus: EmploymentStatusEnum.optional(),
  educationLevel: EducationLevelEnum.optional(),

  province: z.string().trim().optional(),
  city: z.string().trim().optional(),
  country: z.string().trim().optional(),

  ageMin: z.number().int().min(16).max(100).optional(),
  ageMax: z.number().int().min(16).max(100).optional(),

  experienceMin: z.number().int().min(0).max(60).optional(),
  experienceMax: z.number().int().min(0).max(60).optional(),

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

  lastLoginFrom: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
    .optional(),
  lastLoginTo: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
    .optional(),

  skills: z
    .array(z.string().trim())
    .max(10, 'Máximo 10 habilidades para filtrar')
    .optional(),

  languages: z
    .array(z.string().trim())
    .max(5, 'Máximo 5 idiomas para filtrar')
    .optional(),

  hasAvatar: z.boolean().optional(),
  hasCV: z.boolean().optional(),
  openToWork: z.boolean().optional()
}).refine((data) => {
  if (data.ageMin && data.ageMax) {
    return data.ageMin <= data.ageMax;
  }
  return true;
}, {
  message: 'La edad mínima debe ser menor o igual a la máxima',
  path: ['ageMax']
}).refine((data) => {
  if (data.experienceMin && data.experienceMax) {
    return data.experienceMin <= data.experienceMax;
  }
  return true;
}, {
  message: 'La experiencia mínima debe ser menor o igual a la máxima',
  path: ['experienceMax']
}).refine((data) => {
  if (data.registeredFrom && data.registeredTo) {
    return new Date(data.registeredFrom) <= new Date(data.registeredTo);
  }
  return true;
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['registeredTo']
}).refine((data) => {
  if (data.lastLoginFrom && data.lastLoginTo) {
    return new Date(data.lastLoginFrom) <= new Date(data.lastLoginTo);
  }
  return true;
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['lastLoginTo']
});

// ==================== SCHEMAS DE COMUNICACIÓN ====================

// Enviar mensaje a usuario
export const sendMessageToUserSchema = z.object({
  userId: z.string().trim().min(1, 'ID de usuario requerido'),
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
  sendNotification: z.boolean().default(true),
  sendSMS: z.boolean().default(false)
});

// Comunicación masiva
export const massMessageSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, 'Asunto requerido')
    .max(200, 'Asunto muy largo'),
  message: z
    .string()
    .trim()
    .min(50, 'Mensaje muy corto')
    .max(5000, 'Mensaje muy largo'),
  filters: userFiltersSchema.optional(),
  sendToAll: z.boolean().default(false),
  channels: z.array(z.enum(['email', 'notification', 'sms'])).min(1, 'Seleccione al menos un canal'),
  scheduleFor: z.date().optional(),
  templateId: z.string().trim().optional()
});

// ==================== TIPOS TYPESCRIPT ====================

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ConfirmResetPasswordInput = z.infer<typeof confirmResetPasswordSchema>;
export type BanUserInput = z.infer<typeof banUserSchema>;
export type UnbanUserInput = z.infer<typeof unbanUserSchema>;
export type ChangeUserRoleInput = z.infer<typeof changeUserRoleSchema>;
export type UserFilters = z.infer<typeof userFiltersSchema>;
export type SendMessageToUserInput = z.infer<typeof sendMessageToUserSchema>;
export type MassMessageInput = z.infer<typeof massMessageSchema>;

// ==================== VALIDADORES ESPECÍFICOS ====================

// Validar edad basada en fecha de nacimiento
export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

// Validar fuerza de contraseña
export const validatePasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 1;
  else feedback.push('Debe tener al menos 8 caracteres');

  if (password.length >= 12) score += 1;

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Debe contener letras minúsculas');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Debe contener letras mayúsculas');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Debe contener números');

  if (/[^a-zA-Z\d]/.test(password)) score += 1;
  else feedback.push('Debe contener caracteres especiales');

  if (!/(.)\1{2,}/.test(password)) score += 1;
  else feedback.push('No debe repetir caracteres consecutivos');

  return { score, feedback };
};

// Calcular completitud de perfil
export const calculateProfileCompleteness = (user: any): number => {
  const requiredFields = [
    'firstName', 'lastName', 'email'
  ];

  const importantFields = [
    'phone', 'dateOfBirth', 'address.city', 'address.province',
    'professional.currentJobTitle', 'professional.employmentStatus',
    'professional.educationLevel', 'bio'
  ];

  const optionalFields = [
    'avatarUrl', 'website', 'linkedinUrl', 'professional.skills',
    'professional.languages', 'professional.university',
    'professional.yearsOfExperience', 'about'
  ];

  let completedRequired = 0;
  let completedImportant = 0;
  let completedOptional = 0;

  requiredFields.forEach(field => {
    if (getNestedUserValue(user, field)) {
      completedRequired++;
    }
  });

  importantFields.forEach(field => {
    if (getNestedUserValue(user, field)) {
      completedImportant++;
    }
  });

  optionalFields.forEach(field => {
    const value = getNestedUserValue(user, field);
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      completedOptional++;
    }
  });

  // 50% requeridos + 35% importantes + 15% opcionales
  const requiredScore = (completedRequired / requiredFields.length) * 0.5;
  const importantScore = (completedImportant / importantFields.length) * 0.35;
  const optionalScore = (completedOptional / optionalFields.length) * 0.15;

  return Math.round((requiredScore + importantScore + optionalScore) * 100);
};

// Helper para obtener valores anidados
const getNestedUserValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Validar permisos para acciones en usuarios
export const validateUserPermissions = (
  action: 'create' | 'update' | 'delete' | 'ban' | 'changeRole',
  userRole: string,
  targetUser?: any
): boolean => {
  const adminRoles = ['SUPER_ADMIN', 'ADMIN'];
  const managerRoles = [...adminRoles, 'COMMUNITY_MANAGER'];

  switch (action) {
    case 'create':
    case 'update':
      return managerRoles.includes(userRole);

    case 'ban':
    case 'changeRole':
      return adminRoles.includes(userRole);

    case 'delete':
      return userRole === 'SUPER_ADMIN';

    default:
      return false;
  }
};

// ==================== TRANSFORMACIONES ====================

// Preparar datos de usuario para la DB
export const prepareUserForDB = (data: CreateUserInput) => {
  return {
    ...data,
    displayName: `${data.firstName} ${data.lastName}`,
    slug: `${data.firstName}-${data.lastName}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, ''),

    // Valores por defecto
    loginCount: 0,
    profileViews: 0,
    profileCompleteness: calculateProfileCompleteness(data),

    // Fechas
    createdAt: new Date(),
    updatedAt: new Date()
  };
};