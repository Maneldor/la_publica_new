'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdaptiveCourseView } from '../../../../components/course/AdaptiveCourseView';

// Datos de ejemplo de cursos con diferentes tipos
const sampleCourses = [
  // MICRO-CURS
  {
    id: 1,
    courseType: 'micro',
    title: 'Introducció al RGPD',
    subtitle: 'Aprèn els conceptes bàsics de protecció de dades en 30 minuts',
    description: 'Un micro-curs generat amb IA que et donarà les bases essencials sobre el Reglament General de Protecció de Dades.',
    category: 'Ciberseguretat',
    level: 'Principiant',
    language: 'Català',
    tags: 'RGPD, protecció dades, privacitat',
    coverImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
    aiGeneratedContent: {
      lessons: [
        {
          id: '1',
          title: 'Introducció al RGPD',
          duration: 10,
          type: 'text',
          content: 'El Reglament General de Protecció de Dades (RGPD) és una normativa europea que regula el tractament de dades personals i la protecció de la privacitat dels ciutadans de la UE.'
        },
        {
          id: '2',
          title: 'Principis fonamentals',
          duration: 12,
          type: 'video',
          content: 'Els principis del RGPD inclouen legalitat, lleialtat, transparència, limitació de la finalitat, minimització de dades, exactitud, limitació del termini de conservació, integritat i confidencialitat.'
        },
        {
          id: '3',
          title: 'Drets dels ciutadans',
          duration: 8,
          type: 'quiz',
          content: 'Quiz sobre els drets dels ciutadans segons el RGPD: dret d\'accés, rectificació, supressió, portabilitat, oposició i limitació del tractament.'
        }
      ],
      totalDuration: 30
    },
    hasInstructor: false,
    price: 0,
    modalities: ['online'],
    status: 'PUBLISHED',
    rating: 4.5,
    totalRatings: 89,
    enrollmentCount: 324,
    createdAt: '2024-10-15'
  },

  // CURS BÀSIC
  {
    id: 2,
    courseType: 'basic',
    title: 'Excel per a Professionals',
    subtitle: 'Domina les funcions essencials d\'Excel per millorar la teva productivitat',
    description: 'Aprèn a utilitzar Excel de manera professional amb funcions avançades, taules dinàmiques i anàlisi de dades. Aquest curs et donarà les habilitats necessàries per ser més eficient en el teu treball diari.',
    category: 'Ofimàtica',
    level: 'Intermedi',
    language: 'Català',
    tags: 'excel, ofimàtica, productivitat, anàlisi',
    coverImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop',
    modules: [
      {
        id: 'mod1',
        title: 'Funcions bàsiques i fórmules',
        lessons: [
          { id: 'l1', title: 'Introducció a Excel', type: 'video', duration: 15, isPreview: true },
          { id: 'l2', title: 'Fórmules essencials', type: 'video', duration: 20, isPreview: false },
          { id: 'l3', title: 'Referències absolutes i relatives', type: 'video', duration: 18, isPreview: false }
        ]
      },
      {
        id: 'mod2',
        title: 'Taules dinàmiques i anàlisi',
        lessons: [
          { id: 'l4', title: 'Creació de taules dinàmiques', type: 'video', duration: 25, isPreview: false },
          { id: 'l5', title: 'Anàlisi de dades', type: 'exercise', duration: 30, isPreview: false },
          { id: 'l6', title: 'Gràfics dinàmics', type: 'video', duration: 22, isPreview: false }
        ]
      }
    ],
    hasInstructor: true,
    instructor: {
      name: 'Laura Martínez',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=80&h=80&fit=crop&crop=face',
      expertise: 'Especialista en Ofimàtica i Productivitat',
      rating: 4.7
    },
    price: 89,
    memberPrice: 45,
    modalities: ['online'],
    status: 'PUBLISHED',
    rating: 4.6,
    totalRatings: 156,
    enrollmentCount: 892,
    createdAt: '2024-10-10'
  },

  // CURS COMPLET
  {
    id: 3,
    courseType: 'complet',
    title: 'Desenvolupament Web amb React',
    subtitle: 'Converteix-te en expert en React i crea aplicacions web modernes',
    description: 'Un curs complet que et portarà des dels fonaments de React fins a la creació d\'aplicacions complexes amb les millors pràctiques del sector. Aprendràs hooks, context, routing, testing i molt més.',
    category: 'Tecnologia',
    level: 'Intermedi',
    language: 'Català',
    tags: 'react, javascript, frontend, web development',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    modules: [
      {
        id: 'mod1',
        title: 'Fonaments de React',
        lessons: [
          { id: 'l1', title: 'Introducció a React', type: 'video', duration: 25, isPreview: true },
          { id: 'l2', title: 'Components i JSX', type: 'video', duration: 30, isPreview: true },
          { id: 'l3', title: 'Props i State', type: 'video', duration: 35, isPreview: false },
          { id: 'l4', title: 'Event Handling', type: 'exercise', duration: 20, isPreview: false }
        ]
      },
      {
        id: 'mod2',
        title: 'Hooks i Gestió d\'estat',
        lessons: [
          { id: 'l5', title: 'useState i useEffect', type: 'video', duration: 40, isPreview: false },
          { id: 'l6', title: 'Custom Hooks', type: 'video', duration: 35, isPreview: false },
          { id: 'l7', title: 'Context API', type: 'video', duration: 45, isPreview: false },
          { id: 'l8', title: 'Projecte pràctic', type: 'exercise', duration: 60, isPreview: false }
        ]
      },
      {
        id: 'mod3',
        title: 'Routing i Navegació',
        lessons: [
          { id: 'l9', title: 'React Router', type: 'video', duration: 30, isPreview: false },
          { id: 'l10', title: 'Navegació programàtica', type: 'video', duration: 25, isPreview: false },
          { id: 'l11', title: 'Lazy Loading', type: 'video', duration: 20, isPreview: false }
        ]
      }
    ],
    hasInstructor: true,
    instructor: {
      name: 'Marc González',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
      expertise: 'Senior Frontend Developer',
      rating: 4.9,
      bio: 'Desenvolupador frontend amb més de 8 anys d\'experiència en React i tecnologies web modernes.',
      courses: 12,
      students: 2847
    },
    price: 299,
    memberPrice: 199,
    modalities: ['online'],
    hasCertificate: true,
    certificateType: 'digital',
    hasDownloadables: true,
    hasProjects: true,
    hasExercises: true,
    hasForum: true,
    hasGuarantee: true,
    status: 'PUBLISHED',
    rating: 4.8,
    totalRatings: 234,
    enrollmentCount: 1567,
    startDate: '2024-11-15',
    endDate: '2024-12-20',
    availableSlots: 15,
    totalSlots: 25,
    createdAt: '2024-10-05'
  },

  // CURS PREMIUM
  {
    id: 4,
    courseType: 'premium',
    title: 'Màster en Ciberseguretat Empresarial',
    subtitle: 'Programa complet amb mentoria personalitzada i certificació oficial',
    description: 'El màster més complet en ciberseguretat per a professionals que volen liderar la protecció digital de les organitzacions. Inclou mentoria 1:1, projectes reals i certificació reconeguda internacionalment.',
    category: 'Ciberseguretat',
    level: 'Avançat',
    language: 'Català',
    tags: 'ciberseguretat, hacking ètic, pentesting, auditoria',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop',
    modules: [
      {
        id: 'mod1',
        title: 'Fonaments de Ciberseguretat',
        lessons: [
          { id: 'l1', title: 'Introducció a la ciberseguretat', type: 'video', duration: 45, isPreview: true },
          { id: 'l2', title: 'Tipus d\'amenaces', type: 'video', duration: 40, isPreview: true },
          { id: 'l3', title: 'Marc normatiu', type: 'text', duration: 30, isPreview: false }
        ]
      },
      {
        id: 'mod2',
        title: 'Hacking Ètic i Pentesting',
        lessons: [
          { id: 'l4', title: 'Metodologies de pentesting', type: 'video', duration: 60, isPreview: false },
          { id: 'l5', title: 'Eines de pentesting', type: 'video', duration: 50, isPreview: false },
          { id: 'l6', title: 'Pràctica en laboratori', type: 'exercise', duration: 120, isPreview: false }
        ]
      },
      {
        id: 'mod3',
        title: 'Gestió de Riscos',
        lessons: [
          { id: 'l7', title: 'Avaluació de riscos', type: 'video', duration: 55, isPreview: false },
          { id: 'l8', title: 'Plans de contingència', type: 'video', duration: 45, isPreview: false },
          { id: 'l9', title: 'Projecte final', type: 'exercise', duration: 180, isPreview: false }
        ]
      }
    ],
    hasInstructor: true,
    instructor: {
      name: 'Dr. Albert Soler',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face',
      expertise: 'Expert en Ciberseguretat i Consultor Internacional',
      rating: 4.9,
      bio: 'Doctor en Informàtica amb especialització en ciberseguretat. Consultor per a empreses Fortune 500 i certificat CISSP, CEH i CISM.',
      courses: 8,
      students: 1247
    },
    price: 1299,
    memberPrice: 899,
    modalities: ['hibrid'],
    hasCertificate: true,
    certificateType: 'oficial',
    hasDownloadables: true,
    hasProjects: true,
    hasExercises: true,
    hasForum: true,
    hasGuarantee: true,
    status: 'PUBLISHED',
    rating: 4.9,
    totalRatings: 87,
    enrollmentCount: 234,
    startDate: '2024-12-01',
    endDate: '2025-03-31',
    availableSlots: 8,
    totalSlots: 20,
    createdAt: '2024-09-20'
  }
];

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCourse = async () => {
    try {
      setLoading(true);

      // Buscar en datos locales primero
      let foundCourse = sampleCourses.find(c => c.id.toString() === courseId);

      if (!foundCourse) {
        // Si no se encuentra, intentar cargar desde localStorage (cursos creados)
        const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
        foundCourse = savedCourses.find((c: any) => c.id.toString() === courseId);
      }

      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        setError('Curs no trobat');
      }
    } catch {
      console.error('Error loading course:', err);
      setError('Error al carregar el curs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregant curs...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Curs no trobat</h1>
          <p className="text-gray-600 mb-6">{error || 'El curs que cerques no existeix.'}</p>
          <button
            onClick={() => router.push('/dashboard/formacio')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tornar als cursos
          </button>
        </div>
      </div>
    );
  }

  return <AdaptiveCourseView course={course} />;
}