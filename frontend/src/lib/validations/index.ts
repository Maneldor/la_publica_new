// @ts-nocheck

/**
 * Index de Validaciones con Zod
 * Sistema completo de validación para La Pública
 *
 * Exporta todos los schemas, tipos y utilidades de validación
 * organizados por módulos para fácil importación.
 */

// Importaciones explícitas necesarias para usar los schemas localmente
import {
  createCategorySchema,
  createSeriesSchema,
  postFiltersSchema,
  updatePostSchema,
} from './posts';

// ==================== VALIDACIONES COMUNES ====================
export * from './common';

// Re-exportar validaciones comunes con alias para claridad
export {
  textSchema as commonTextSchema,
  emailSchema as commonEmailSchema,
  urlSchema as commonUrlSchema,
  phoneSchema as commonPhoneSchema,
  dateSchema as commonDateSchema,
  priceSchema as commonPriceSchema,
  slugSchema as commonSlugSchema,
  validateData,
  getFieldErrors
} from './common';

// ==================== VALIDACIONES DE ANUNCIOS ====================
export * from './anuncios';

// Re-exportar schemas principales de anuncios
export {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  publishAnnouncementSchema,
  announcementFiltersSchema,
  AnnouncementTypeEnum,
  AnnouncementAudienceEnum,
  NotificationChannelEnum,
  type CreateAnnouncementInput,
  type UpdateAnnouncementInput,
  type AnnouncementFilters,
  validateAnnouncementForPublishing,
  validateAnnouncementPermissions,
  prepareAnnouncementForDB
} from './anuncios';

// ==================== VALIDACIONES DE EMPRESAS ====================
export * from './empresas';

// Re-exportar schemas principales de empresas
export {
  companyRegistrationSchema,
  completeCompanyProfileSchema,
  createCompanySchema,
  updateCompanySchema,
  verifyCompanySchema,
  companyFiltersSchema,
  CompanySizeEnum,
  CompanyTypeEnum,
  IndustryEnum,
  CompanyStatusEnum,
  VerificationStatusEnum,
  type CompanyRegistrationInput,
  type CreateCompanyInput,
  type UpdateCompanyInput,
  type CompanyFilters,
  validateCIF,
  calculateProfileCompleteness,
  validateCompanyPermissions,
  prepareCompanyForDB
} from './empresas';

// ==================== VALIDACIONES DE OFERTAS ====================
export * from './ofertas';

// Re-exportar schemas principales de ofertas
export {
  createJobSchema,
  updateJobSchema,
  publishJobSchema,
  jobFiltersSchema,
  jobApplicationSchema,
  evaluateApplicationSchema,
  JobStatusEnum,
  JobCategoryEnum,
  SalaryTypeEnum,
  ApplicationMethodEnum,
  type CreateJobInput,
  type UpdateJobInput,
  type JobFilters,
  type JobApplicationInput,
  validateJobForPublishing,
  calculateJobQualityScore,
  validateJobPermissions,
  prepareJobForDB
} from './ofertas';

// ==================== VALIDACIONES DE USUARIOS ====================
export * from './users';

// Re-exportar schemas principales de usuarios
export {
  userRegistrationSchema,
  createUserSchema,
  updateUserSchema,
  updateUserProfileSchema,
  changePasswordSchema,
  changeEmailSchema,
  userFiltersSchema,
  banUserSchema,
  changeUserRoleSchema,
  UserStatusEnum,
  GenderEnum,
  EmploymentStatusEnum,
  EducationLevelEnum,
  type UserRegistrationInput,
  type CreateUserInput,
  type UpdateUserInput,
  type UserFilters,
  calculateAge,
  validatePasswordStrength,
  calculateProfileCompleteness as calculateUserProfileCompleteness,
  validateUserPermissions,
  prepareUserForDB
} from './users';

// ==================== VALIDACIONES DE POSTS ====================
export * from './posts';

// Re-exportar schemas principales de posts
export {
  createPostSchema,
  updatePostSchema,
  publishPostSchema,
  postFiltersSchema,
  createCategorySchema,
  createSeriesSchema,
  postCommentSchema,
  moderateCommentSchema,
  PostTypeEnum,
  PostStatusEnum,
  PostVisibilityEnum,
  ContentFormatEnum,
  type CreatePostInput,
  type UpdatePostInput,
  type PostFilters,
  calculateReadingTime,
  generatePostSlug,
  generateExcerpt,
  validatePostForPublishing,
  validatePostPermissions,
  preparePostForDB
} from './posts';

// ==================== UTILIDADES GLOBALES ====================

/**
 * Helper para validar cualquier schema con manejo de errores consistente
 */
export const validateSchema = <T>(
  schema: any,
  data: unknown,
  options?: {
    throwOnError?: boolean;
    fieldPath?: string;
  }
): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  message?: string;
} => {
  try {
    const result = schema.safeParse(data);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }

    // Convertir errores de Zod a formato más amigable
    const fieldErrors: Record<string, string> = {};
    let generalMessage = 'Datos inválidos';

    result.error.issues.forEach(issue => {
      const path = issue.path.length > 0
        ? issue.path.join('.')
        : options?.fieldPath || 'general';

      if (!fieldErrors[path]) {
        fieldErrors[path] = issue.message;
      }

      // El primer error se convierte en mensaje general
      if (path === 'general' && generalMessage === 'Datos inválidos') {
        generalMessage = issue.message;
      }
    });

    const response = {
      success: false,
      errors: fieldErrors,
      message: generalMessage
    };

    if (options?.throwOnError) {
      throw new ValidationError(generalMessage, fieldErrors);
    }

    return response;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    const errorResponse = {
      success: false,
      errors: { general: 'Error interno de validación' },
      message: 'Error interno de validación'
    };

    if (options?.throwOnError) {
      throw new ValidationError('Error interno de validación');
    }

    return errorResponse;
  }
};

/**
 * Clase de error personalizada para validaciones
 */
export class ValidationError extends Error {
  public fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }

  /**
   * Obtener errores formateados para formularios
   */
  getFormErrors(): Record<string, string> {
    return this.fieldErrors;
  }

  /**
   * Obtener primer error encontrado
   */
  getFirstError(): string {
    const errors = Object.values(this.fieldErrors);
    return errors.length > 0 ? errors[0] : this.message;
  }

  /**
   * Verificar si hay error en campo específico
   */
  hasFieldError(field: string): boolean {
    return field in this.fieldErrors;
  }

  /**
   * Obtener error de campo específico
   */
  getFieldError(field: string): string | undefined {
    return this.fieldErrors[field];
  }
}

/**
 * Middleware para validación en API Routes
 */
export const withValidation = <T>(
  schema: any,
  options?: {
    parseBody?: boolean;
    fieldPath?: string;
  }
) => {
  return (handler: (validatedData: T, ...args: any[]) => Promise<Response>) => {
    return async (request: Request, ...args: any[]): Promise<Response> => {
      try {
        let data: unknown;

        if (options?.parseBody !== false) {
          data = await request.json();
        } else {
          data = request;
        }

        const validation = validateSchema<T>(schema, data, {
          throwOnError: true,
          fieldPath: options?.fieldPath
        });

        if (!validation.success) {
          return new Response(
            JSON.stringify({
              error: 'Datos de entrada inválidos',
              details: validation.errors
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }

        return await handler(validation.data!, ...args);
      } catch (error) {
        if (error instanceof ValidationError) {
          return new Response(
            JSON.stringify({
              error: error.message,
              details: error.fieldErrors
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }

        // Error no relacionado con validación
        return new Response(
          JSON.stringify({
            error: 'Error interno del servidor'
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    };
  };
};

/**
 * Hook para validación en tiempo real en formularios
 */
export const useFormValidation = <T>(
  schema: any,
  options?: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    debounceMs?: number;
  }
) => {
  const validate = (data: unknown): {
    isValid: boolean;
    errors: Record<string, string>;
    data?: T;
  } => {
    const result = validateSchema<T>(schema, data);
    return {
      isValid: result.success,
      errors: result.errors || {},
      data: result.data
    };
  };

  const validateField = (fieldName: string, value: unknown): {
    isValid: boolean;
    error?: string;
  } => {
    try {
      // Crear schema temporal solo para este campo
      const fieldSchema = schema.shape?.[fieldName];
      if (!fieldSchema) {
        return { isValid: true };
      }

      const result = fieldSchema.safeParse(value);
      return {
        isValid: result.success,
        error: result.success ? undefined : result.error.issues[0]?.message
      };
    } catch {
      return { isValid: true };
    }
  };

  return {
    validate,
    validateField
  };
};

/**
 * Constantes de configuración para validaciones
 */
export const VALIDATION_CONFIG = {
  // Límites generales
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,  // 5MB
  MAX_TEXT_LENGTH: 5000,
  MAX_TITLE_LENGTH: 200,
  MAX_EMAIL_LENGTH: 255,

  // Patrones regex comunes
  PATTERNS: {
    SPANISH_PHONE: /^[+]?[\d\s\-()]{9,}$/,
    SPANISH_POSTAL_CODE: /^[0-9]{5}$/,
    SPANISH_NIF: /^[XYZ]?\d{7,8}[A-Z]$/i,
    SLUG: /^[a-z0-9-]+$/,
    HEX_COLOR: /^#[0-9A-F]{6}$/i,
    URL: /^https?:\/\/.+/
  },

  // Mensajes de error por defecto
  MESSAGES: {
    REQUIRED: 'Este campo es obligatorio',
    INVALID_EMAIL: 'Formato de email inválido',
    INVALID_URL: 'URL inválida',
    INVALID_PHONE: 'Formato de teléfono inválido',
    INVALID_DATE: 'Fecha inválida',
    TOO_SHORT: 'Texto demasiado corto',
    TOO_LONG: 'Texto demasiado largo',
    INVALID_FILE_TYPE: 'Tipo de archivo no permitido',
    FILE_TOO_LARGE: 'Archivo demasiado grande'
  }
} as const;

/**
 * Lista de todos los schemas disponibles para referencia
 */
export const AVAILABLE_SCHEMAS = {
  // Comunes
  text: 'textSchema',
  email: 'emailSchema',
  url: 'urlSchema',
  phone: 'phoneSchema',
  date: 'dateSchema',

  // Anuncios
  createAnnouncement: 'createAnnouncementSchema',
  updateAnnouncement: 'updateAnnouncementSchema',

  // Empresas
  createCompany: 'createCompanySchema',
  updateCompany: 'updateCompanySchema',
  companyRegistration: 'companyRegistrationSchema',

  // Ofertas
  createJob: 'createJobSchema',
  updateJob: 'updateJobSchema',
  jobApplication: 'jobApplicationSchema',

  // Usuarios
  userRegistration: 'userRegistrationSchema',
  createUser: 'createUserSchema',
  updateUser: 'updateUserSchema',
  changePassword: 'changePasswordSchema',

  // Posts
  createPost: 'createPostSchema',
  updatePost: 'updatePostSchema',
  createCategory: 'createCategorySchema'
} as const;

/**
 * Ejemplo de uso de las validaciones
 */
export const USAGE_EXAMPLES = `
// Importar validaciones específicas
import { createUserSchema, validateSchema, ValidationError } from '@/lib/validations';

// Validar datos con manejo de errores
try {
  const result = validateSchema(createUserSchema, userData, { throwOnError: true });
  console.log('Usuario válido:', result.data);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Errores de validación:', error.getFormErrors());
  }
}

// Usar en API Route
import { withValidation } from '@/lib/validations';

export const POST = withValidation(createUserSchema)(
  async (validatedData) => {
    // validatedData ya está validado y tipado
    const user = await createUser(validatedData);
    return Response.json(user);
  }
);

// Usar en formulario
import { useFormValidation } from '@/lib/validations';

const { validate, validateField } = useFormValidation(createUserSchema);

const handleSubmit = (formData) => {
  const { isValid, errors, data } = validate(formData);
  if (isValid) {
    // Enviar datos válidos
    submitForm(data);
  } else {
    // Mostrar errores
    setErrors(errors);
  }
};
`;

// ==================== TIPOS GLOBALES ====================

/**
 * Tipo helper para extraer el tipo de input de cualquier schema
 */
export type InferInput<T> = T extends import('zod').ZodType<infer U> ? U : never;

/**
 * Tipo helper para extraer el tipo de output de cualquier schema
 */
export type InferOutput<T> = T extends import('zod').ZodType<any, any, infer U> ? U : never;

/**
 * Tipo para resultado de validación consistente
 */
export type ValidationResultType<T> = {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  message?: string;
};

/**
 * Configuración de validación
 */
export type ValidationConfig = {
  throwOnError?: boolean;
  fieldPath?: string;
  customMessages?: Record<string, string>;
};

// ==================== EXPORT DEFAULT ====================

/**
 * Export por defecto con todas las validaciones organizadas
 */
const validations = {
  // Schemas comunes
  common: {
    text: textSchema,
    email: emailSchema,
    url: urlSchema,
    phone: phoneSchema,
    date: dateSchema,
    price: priceSchema,
    slug: slugSchema
  },

  // Anuncios
  announcements: {
    create: createAnnouncementSchema,
    update: updateAnnouncementSchema,
    publish: publishAnnouncementSchema,
    filters: announcementFiltersSchema
  },

  // Empresas
  companies: {
    create: createCompanySchema,
    update: updateCompanySchema,
    registration: companyRegistrationSchema,
    filters: companyFiltersSchema
  },

  // Ofertas
  jobs: {
    create: createJobSchema,
    update: updateJobSchema,
    application: jobApplicationSchema,
    filters: jobFiltersSchema
  },

  // Usuarios
  users: {
    create: createUserSchema,
    update: updateUserSchema,
    registration: userRegistrationSchema,
    changePassword: changePasswordSchema,
    filters: userFiltersSchema
  },

  // Posts
  posts: {
    create: createPostSchema,
    update: updatePostSchema,
    filters: postFiltersSchema,
    category: createCategorySchema,
    series: createSeriesSchema
  },

  // Utilidades
  utils: {
    validate: validateSchema,
    ValidationError,
    withValidation,
    useFormValidation
  },

  // Configuración
  config: VALIDATION_CONFIG
};

export default validations;