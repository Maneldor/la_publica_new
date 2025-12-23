/**
 * Validaciones comunes reutilizables con Zod
 * Para formularios del panel admin de La Pública
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from 'zod';

// ==================== TIPOS BÁSICOS ====================

// Validaciones de texto
export const textSchema = z.string().trim().min(1, 'Este campo es obligatorio');
export const optionalTextSchema = z.string().trim().optional();
export const longTextSchema = z.string().trim().min(1, 'Este campo es obligatorio').max(5000, 'Máximo 5000 caracteres');

// Email y URLs
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'El email es obligatorio')
  .email('Formato de email inválido')
  .toLowerCase();

export const urlSchema = z
  .string()
  .trim()
  .url('URL inválida')
  .optional()
  .or(z.literal(''));

export const optionalUrlSchema = z
  .string()
  .trim()
  .refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'URL inválida'
  })
  .optional();

// Teléfonos
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[+]?[\d\s\-()]{9,}$/, 'Formato de teléfono inválido')
  .optional()
  .or(z.literal(''));

// Códigos postales españoles
export const postalCodeSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{5}$/, 'Código postal debe tener 5 dígitos')
  .optional()
  .or(z.literal(''));

// NIF/NIE/CIF
export const nifSchema = z
  .string()
  .trim()
  .regex(/^[XYZ]?\d{7,8}[A-Z]$/i, 'Formato de NIF/NIE/CIF inválido')
  .transform(val => val.toUpperCase())
  .optional()
  .or(z.literal(''));

// ==================== FECHAS Y TIEMPO ====================

export const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
  .refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, 'Fecha inválida');

export const futureDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
  .refine((date) => {
    const parsedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parsedDate >= today;
  }, 'La fecha debe ser hoy o en el futuro');

export const timeSchema = z
  .string()
  .trim()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)');

export const dateTimeSchema = z
  .string()
  .trim()
  .refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Fecha y hora inválidas');

// ==================== NÚMEROS Y MONETARIOS ====================

export const integerSchema = z
  .number()
  .int('Debe ser un número entero')
  .min(0, 'Debe ser mayor o igual a 0');

export const positiveIntegerSchema = z
  .number()
  .int('Debe ser un número entero')
  .min(1, 'Debe ser mayor a 0');

export const priceSchema = z
  .number()
  .min(0, 'El precio debe ser mayor o igual a 0')
  .max(999999.99, 'Precio máximo: 999.999,99€')
  .multipleOf(0.01, 'Máximo 2 decimales');

export const salarySchema = z
  .number()
  .min(0, 'El salario debe ser mayor o igual a 0')
  .max(999999.99, 'Salario máximo: 999.999,99€')
  .multipleOf(0.01, 'Máximo 2 decimales');

export const percentageSchema = z
  .number()
  .min(0, 'El porcentaje debe ser mayor o igual a 0')
  .max(100, 'El porcentaje debe ser menor o igual a 100');

// ==================== ENUMS ESPECÍFICOS ====================

// Estados generales
export const StatusEnum = z.enum(['active', 'inactive', 'pending', 'rejected']);

// Prioridades
export const PriorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);

// Tipos de contrato laboral
export const ContractTypeEnum = z.enum([
  'indefinido',
  'temporal',
  'practicas',
  'formacion',
  'obra_servicio',
  'interinidad',
  'relevo',
  'jubilacion_parcial'
]);

// Modalidades de trabajo
export const WorkModalityEnum = z.enum(['presencial', 'remoto', 'hibrido']);

// Jornadas laborales
export const WorkScheduleEnum = z.enum(['completa', 'parcial', 'intensiva', 'flexible']);

// Niveles de experiencia
export const ExperienceLevelEnum = z.enum(['junior', 'mid', 'senior', 'lead']);

// Provincias españolas
export const ProvinceEnum = z.enum([
  'alava', 'albacete', 'alicante', 'almeria', 'asturias', 'avila', 'badajoz', 'baleares',
  'barcelona', 'burgos', 'caceres', 'cadiz', 'cantabria', 'castellon', 'ciudad_real',
  'cordoba', 'coruna', 'cuenca', 'girona', 'granada', 'guadalajara', 'guipuzcoa',
  'huelva', 'huesca', 'jaen', 'leon', 'lleida', 'lugo', 'madrid', 'malaga', 'murcia',
  'navarra', 'ourense', 'palencia', 'palmas', 'pontevedra', 'rioja', 'salamanca',
  'segovia', 'sevilla', 'soria', 'tarragona', 'santa_cruz_tenerife', 'teruel',
  'toledo', 'valencia', 'valladolid', 'vizcaya', 'zamora', 'zaragoza'
]);

// ==================== VALIDACIONES DE ARCHIVOS ====================

export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, 'La imagen debe ser menor a 5MB')
  .refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'Solo se permiten archivos JPG, PNG o WebP'
  );

export const documentFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 10 * 1024 * 1024, 'El documento debe ser menor a 10MB')
  .refine(
    (file) => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type),
    'Solo se permiten archivos PDF, DOC o DOCX'
  );

// ==================== VALIDACIONES DE CONTENIDO ====================

// Títulos y nombres
export const titleSchema = z
  .string()
  .trim()
  .min(3, 'El título debe tener al menos 3 caracteres')
  .max(200, 'El título no puede superar los 200 caracteres');

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre no puede superar los 100 caracteres');

export const companyNameSchema = z
  .string()
  .trim()
  .min(2, 'El nombre de empresa debe tener al menos 2 caracteres')
  .max(150, 'El nombre de empresa no puede superar los 150 caracteres');

// Descripciones
export const shortDescriptionSchema = z
  .string()
  .trim()
  .min(10, 'La descripción debe tener al menos 10 caracteres')
  .max(300, 'La descripción no puede superar los 300 caracteres');

export const longDescriptionSchema = z
  .string()
  .trim()
  .min(50, 'La descripción debe tener al menos 50 caracteres')
  .max(5000, 'La descripción no puede superar los 5000 caracteres');

// Slug para URLs
export const slugSchema = z
  .string()
  .trim()
  .min(3, 'El slug debe tener al menos 3 caracteres')
  .max(100, 'El slug no puede superar los 100 caracteres')
  .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones')
  .refine((val) => !val.startsWith('-') && !val.endsWith('-'), 'El slug no puede empezar o terminar con guión');

// Tags y categorías
export const tagSchema = z
  .string()
  .trim()
  .min(2, 'El tag debe tener al menos 2 caracteres')
  .max(50, 'El tag no puede superar los 50 caracteres')
  .regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s\-]+$/, 'El tag solo puede contener letras, espacios y guiones');

export const tagsArraySchema = z
  .array(tagSchema)
  .max(10, 'Máximo 10 tags permitidos');

// ==================== VALIDACIONES DE UBICACIÓN ====================

export const addressSchema = z.object({
  street: z
    .string()
    .trim()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede superar los 200 caracteres'),
  city: z
    .string()
    .trim()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(100, 'La ciudad no puede superar los 100 caracteres'),
  province: ProvinceEnum,
  postalCode: postalCodeSchema.refine((val) => val && val.length === 5, {
    message: 'Código postal obligatorio'
  }),
  country: z
    .string()
    .trim()
    .default('España')
});

// ==================== SCHEMAS DE METADATOS ====================

export const metadataSchema = z.object({
  title: z
    .string()
    .trim()
    .max(60, 'El título SEO no puede superar los 60 caracteres')
    .optional(),
  description: z
    .string()
    .trim()
    .max(160, 'La descripción SEO no puede superar los 160 caracteres')
    .optional(),
  keywords: z
    .array(z.string().trim())
    .max(10, 'Máximo 10 palabras clave')
    .optional(),
  canonical: optionalUrlSchema
});

// ==================== VALIDADORES DE FORMULARIOS ====================

// Paginación
export const paginationSchema = z.object({
  page: z
    .number()
    .int()
    .min(1, 'La página debe ser mayor a 0')
    .default(1),
  limit: z
    .number()
    .int()
    .min(1, 'El límite debe ser mayor a 0')
    .max(100, 'El límite máximo es 100')
    .default(10),
  sortBy: z
    .string()
    .trim()
    .optional(),
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('desc')
});

// Filtros de búsqueda
export const searchFiltersSchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, 'La búsqueda no puede superar los 100 caracteres')
    .optional(),
  status: StatusEnum.optional(),
  category: z
    .string()
    .trim()
    .optional(),
  dateFrom: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
    .optional(),
  dateTo: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
    .optional()
}).refine((data) => {
  if (data.dateFrom && data.dateTo) {
    return new Date(data.dateFrom) <= new Date(data.dateTo);
  }
  return true;
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['dateTo']
});

// ==================== UTILIDADES ====================

// Helper para validar arrays de IDs
export const idArraySchema = (name: string = 'elemento') => z
  .array(z.string().trim().min(1, `ID de ${name} inválido`))
  .min(1, `Debe seleccionar al menos un ${name}`);

// Helper para validar objetos con ID
export const withIdSchema = <T extends z.ZodTypeAny>(schema: T) =>
  schema.extend({
    id: z.string().trim().min(1, 'ID requerido').optional()
  });

// Helper para timestamps
export const timestampsSchema = z.object({
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Helper para validación condicional
export const conditionalSchema = <T extends z.ZodTypeAny>(
  condition: (data: any) => boolean,
  schema: T
) => z.any().superRefine((data, ctx) => {
  if (condition(data)) {
    const result = schema.safeParse(data);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        ctx.addIssue(issue);
      });
    }
  }
});

// ==================== TRANSFORMACIONES ====================

// Limpiar strings
export const cleanString = (str: string): string =>
  str.trim().replace(/\s+/g, ' ');

// Normalizar teléfonos
export const normalizePhone = (phone: string): string =>
  phone.replace(/\s|\-|\(|\)/g, '');

// Generar slug automático
export const generateSlug = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .replace(/^-|-$/g, ''); // Quitar guiones al inicio/fin

// ==================== VALIDACIONES PERSONALIZADAS ====================

// Validar NIF/NIE/CIF con algoritmo
export const validateSpanishId = (id: string): boolean => {
  const cleanId = id.toUpperCase().replace(/\s/g, '');

  // NIF
  if (/^\d{8}[A-Z]$/.test(cleanId)) {
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const number = parseInt(cleanId.slice(0, 8));
    return letters[number % 23] === cleanId[8];
  }

  // NIE
  if (/^[XYZ]\d{7}[A-Z]$/.test(cleanId)) {
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const prefix = { X: '0', Y: '1', Z: '2' }[cleanId[0] as 'X' | 'Y' | 'Z'];
    const number = parseInt(prefix + cleanId.slice(1, 8));
    return letters[number % 23] === cleanId[8];
  }

  // CIF (simplificado)
  if (/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(cleanId)) {
    return true; // Validación simplificada para CIFs
  }

  return false;
};

// Schema con validación de NIF/NIE/CIF
export const validatedSpanishIdSchema = z
  .string()
  .trim()
  .min(1, 'NIF/NIE/CIF obligatorio')
  .refine(validateSpanishId, 'NIF/NIE/CIF inválido')
  .transform(val => val.toUpperCase());

// ==================== EXPORTS DE UTILIDAD ====================

export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: string[];
};

export const validateData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> => {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  }

  return {
    success: false,
    errors: result.error.issues.map(issue => issue.message)
  };
};

export const getFieldErrors = (error: z.ZodError): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};

  error.issues.forEach(issue => {
    const path = issue.path.join('.');
    if (!fieldErrors[path]) {
      fieldErrors[path] = issue.message;
    }
  });

  return fieldErrors;
};