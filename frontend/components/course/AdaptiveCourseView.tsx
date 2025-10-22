'use client';

import { MicroCursSingle } from './MicroCursSingle';
import { BasicCursSingle } from './BasicCursSingle';
import { CompletCursSingle } from './CompletCursSingle';

interface Course {
  id: string;
  courseType: 'micro' | 'basic' | 'complet' | 'premium';
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  language: string;
  tags: string;
  coverImage: string;

  // Para micro cursos
  aiGeneratedContent?: {
    lessons: Array<{
      id: string;
      title: string;
      duration: number;
      type: string;
      content: string;
    }>;
    totalDuration: number;
  };

  // Para cursos básicos/completos/premium
  modules?: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
      type: string;
      duration: number;
      isPreview: boolean;
    }>;
  }>;

  // Instructor
  hasInstructor: boolean;
  instructor?: {
    name: string;
    avatar: string;
    expertise: string;
    rating: number;
    bio?: string;
    courses?: number;
    students?: number;
  };

  // Precios
  price: number;
  memberPrice?: number;
  modalities: string[];

  // Certificados y extras (solo completos/premium)
  hasCertificate?: boolean;
  certificateType?: string;
  hasDownloadables?: boolean;
  hasProjects?: boolean;
  hasExercises?: boolean;
  hasForum?: boolean;
  hasGuarantee?: boolean;

  // Estado y métricas
  status: string;
  rating: number;
  totalRatings: number;
  enrollmentCount: number;

  // Fechas (opcional)
  startDate?: string;
  endDate?: string;
  availableSlots?: number;
  totalSlots?: number;

  // Metadatos
  createdAt: string;
  [key: string]: any; // Para compatibilidad con otros campos
}

interface AdaptiveCourseViewProps {
  course: Course;
}

/**
 * Componente adaptativo que renderiza la vista correcta según el tipo de curso
 *
 * MICRO-CURS (Simple):
 * - Layout simple, 1 columna
 * - Sin sidebar
 * - Lecciones en lista vertical
 * - Botón: "Comenzar micro-curso"
 * - Sin instructor
 * - Sin valoraciones complejas
 *
 * CURS BÀSIC:
 * - Layout 2 columnas básico
 * - Sidebar simple con info
 * - Temario colapsable
 * - Instructor opcional (si tiene)
 * - Valoraciones simples
 *
 * CURS COMPLET/PREMIUM:
 * - Layout completo (el que hemos diseñado antes)
 * - Sidebar sticky con toda la info
 * - Todos los tabs
 * - Instructor destacado
 * - Valoraciones completas
 * - Certificado
 * - Etc.
 */
export function AdaptiveCourseView({ course }: AdaptiveCourseViewProps) {
  // Lógica condicional para renderizar el componente correcto
  if (course.courseType === 'micro') {
    return <MicroCursSingle course={course as any} />;
  }

  if (course.courseType === 'basic') {
    return <BasicCursSingle course={course as any} />;
  }

  if (course.courseType === 'complet' || course.courseType === 'premium') {
    return <CompletCursSingle course={course as any} />;
  }

  // Fallback para cursos legacy sin tipo definido
  // Por defecto, los tratamos como cursos completos
  return <CompletCursSingle course={{ ...course, courseType: 'complet' } as any} />;
}

/**
 * Hook para determinar las características del curso según su tipo
 */
export function useCourseFeatures(courseType: string) {
  const features = {
    micro: {
      hasInstructor: false,
      hasCertificate: false,
      hasAdvancedFeatures: false,
      layoutType: 'simple',
      maxLessons: 5,
      maxDuration: 60, // minutos
      pricing: 'free'
    },
    basic: {
      hasInstructor: true, // opcional
      hasCertificate: false,
      hasAdvancedFeatures: false,
      layoutType: 'basic',
      maxLessons: 20,
      maxDuration: 300, // minutos (5 horas)
      pricing: 'flexible'
    },
    complet: {
      hasInstructor: true,
      hasCertificate: true,
      hasAdvancedFeatures: true,
      layoutType: 'complete',
      maxLessons: 100,
      maxDuration: 1800, // minutos (30 horas)
      pricing: 'paid'
    },
    premium: {
      hasInstructor: true,
      hasCertificate: true,
      hasAdvancedFeatures: true,
      layoutType: 'premium',
      maxLessons: 200,
      maxDuration: 3600, // minutos (60 horas)
      pricing: 'premium'
    }
  };

  return features[courseType as keyof typeof features] || features.complet;
}

/**
 * Función helper para validar si un curso cumple con los requisitos de su tipo
 */
export function validateCourseType(course: Course): { isValid: boolean; errors: string[] } {
  const features = useCourseFeatures(course.courseType);
  const errors: string[] = [];

  // Validar instructor
  if (features.hasInstructor && course.courseType !== 'basic' && !course.hasInstructor) {
    errors.push(`Los cursos ${course.courseType} requieren instructor`);
  }

  // Validar duración para micro-cursos
  if (course.courseType === 'micro' && course.aiGeneratedContent) {
    if (course.aiGeneratedContent.totalDuration > features.maxDuration) {
      errors.push(`Los micro-cursos no pueden superar ${features.maxDuration} minutos`);
    }
  }

  // Validar certificado
  if (features.hasCertificate && !course.hasCertificate && (course.courseType === 'complet' || course.courseType === 'premium')) {
    errors.push(`Los cursos ${course.courseType} deberían incluir certificado`);
  }

  // Validar precio
  if (course.courseType === 'micro' && course.price > 0) {
    errors.push('Los micro-cursos deberían ser gratuitos');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export default AdaptiveCourseView;