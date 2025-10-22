'use client';

import { useState, useMemo, useEffect } from 'react';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import { CourseSearchFilters } from '../../../components/ui/CourseSearchFilters';
import { CourseTabs } from '../../../components/ui/CourseTabs';
import { ViewToggle } from '../../../components/ui/ViewToggle';
import { CourseCard } from '../../../components/ui/CourseCard';
import { coursesService, Course } from '../../../lib/courses';

// Datos de ejemplo de cursos
const sampleCourses = [
  {
    id: 1,
    title: 'Desenvolupament Web amb React',
    description: 'Aprèn a crear aplicacions web modernes amb React, hooks i eines actuals del desenvolupament frontend.',
    instructor: 'Marc González',
    institution: 'TechAcademy Barcelona',
    logo: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150&h=150&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=240&fit=crop',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    category: 'Tecnologia',
    duration: 40,
    level: 'Intermedi',
    mode: 'online',
    price: 299,
    originalPrice: 399,
    startDate: '2024-11-15',
    endDate: '2024-12-20',
    availableSlots: 15,
    totalSlots: 25,
    isHighlighted: true,
    isFavorite: false,
    enrolled: 156,
    rating: 4.8,
    createdAt: 'fa 2 dies'
  },
  {
    id: 2,
    title: 'Excel Avançat per a Professionals',
    description: 'Domina les funcions avançades d\'Excel: taules dinàmiques, macros, anàlisi de dades i automatització.',
    instructor: 'Laura Martínez',
    institution: 'Institut de Formació Professional',
    logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=150&h=150&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=240&fit=crop',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=80&h=80&fit=crop&crop=face',
    category: 'Ofimàtica',
    duration: 20,
    level: 'Avançat',
    mode: 'presencial',
    price: 180,
    originalPrice: 180,
    startDate: '2024-11-08',
    endDate: '2024-11-29',
    availableSlots: 8,
    totalSlots: 20,
    isHighlighted: false,
    isFavorite: true,
    enrolled: 89,
    rating: 4.9,
    createdAt: 'fa 1 setmana'
  },
  {
    id: 3,
    title: 'Disseny UX/UI amb Figma',
    description: 'Curs complet de disseny d\'experiència d\'usuari i interfícies amb Figma, des de zero fins a nivell professional.',
    instructor: 'Anna Roca',
    institution: 'Escola de Disseny Digital',
    logo: 'https://images.unsplash.com/photo-1558655146-9f40138edf8d?w=150&h=150&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=240&fit=crop',
    instructorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    category: 'Disseny',
    duration: 35,
    level: 'Principiant',
    mode: 'hibrid',
    price: 350,
    originalPrice: 450,
    startDate: '2024-11-10',
    endDate: '2024-12-15',
    availableSlots: 22,
    totalSlots: 30,
    isHighlighted: true,
    isFavorite: false,
    enrolled: 234,
    rating: 4.7,
    createdAt: 'fa 3 dies'
  },
  {
    id: 4,
    title: 'Màrqueting Digital i SEO',
    description: 'Estratègies de màrqueting digital, SEO, SEM, analítica web i campanyes publicitàries en xarxes socials.',
    instructor: 'David Torres',
    institution: 'Marketing Institute',
    logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&h=150&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=240&fit=crop',
    instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    category: 'Màrqueting Digital',
    duration: 30,
    level: 'Intermedi',
    mode: 'online',
    price: 250,
    originalPrice: 320,
    startDate: '2024-11-20',
    endDate: '2024-12-18',
    availableSlots: 12,
    totalSlots: 35,
    isHighlighted: false,
    isFavorite: true,
    enrolled: 178,
    rating: 4.6,
    createdAt: 'fa 5 dies'
  },
  {
    id: 5,
    title: 'Anglès Tècnic per a Professionals',
    description: 'Millora el teu anglès professional amb vocabulari tècnic, presentacions i comunicació empresarial.',
    instructor: 'Sarah Johnson',
    institution: 'English Professional Center',
    logo: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=150&h=150&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=240&fit=crop',
    instructorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
    category: 'Idiomes',
    duration: 25,
    level: 'Intermedi',
    mode: 'presencial',
    price: 220,
    originalPrice: 220,
    startDate: '2024-11-12',
    endDate: '2024-12-10',
    availableSlots: 6,
    totalSlots: 15,
    isHighlighted: false,
    isFavorite: false,
    enrolled: 67,
    rating: 4.8,
    createdAt: 'fa 1 setmana'
  },
  {
    id: 6,
    title: 'Gestió de Projectes amb Scrum',
    description: 'Metodologies àgils, Scrum Master, planificació de projectes i lideratge d\'equips de desenvolupament.',
    instructor: 'Carlos Ruiz',
    institution: 'Agile Academy',
    logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=150&h=150&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=240&fit=crop',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    category: 'Gestió i Lideratge',
    duration: 28,
    level: 'Avançat',
    mode: 'hibrid',
    price: 380,
    originalPrice: 480,
    startDate: '2024-11-25',
    endDate: '2024-12-23',
    availableSlots: 18,
    totalSlots: 25,
    isHighlighted: true,
    isFavorite: false,
    enrolled: 145,
    rating: 4.9,
    createdAt: 'ahir'
  },
  {
    id: 7,
    title: 'Python per a Anàlisi de Dades',
    description: 'Introducció a Python, pandas, numpy, matplotlib i anàlisi estadístic per a ciència de dades.',
    instructor: 'Elena Vidal',
    institution: 'Data Science Hub',
    logo: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=150&h=150&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=240&fit=crop',
    instructorAvatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop&crop=face',
    category: 'Tecnologia',
    duration: 45,
    level: 'Principiant',
    mode: 'online',
    price: 320,
    originalPrice: 420,
    startDate: '2024-11-18',
    endDate: '2024-12-30',
    availableSlots: 25,
    totalSlots: 40,
    isHighlighted: false,
    isFavorite: true,
    enrolled: 298,
    rating: 4.7,
    createdAt: 'fa 4 dies'
  }
];

export default function FormacioPage() {
  const [activeTab, setActiveTab] = useState('tots');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    mode: '',
    duration: '',
    price: ''
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar cursos al montar el componente
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        // Por ahora usar datos mock directamente para mostrar las imágenes
        setCourses(sampleCourses as Course[]);
        setError('');

        // TODO: Uncomment when API courses include featuredImage
        // const response = await coursesService.getCourses({
        //   status: 'PUBLISHED',
        //   limit: 100
        // });
        // setCourses(response.data);
      } catch (err) {
        console.error('Error loading courses:', err);
        setError('Error al cargar los cursos');
        // Fallback a datos mock si hay error
        setCourses(sampleCourses as Course[]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const statsData = [
    { label: 'Cursos Disponibles', value: courses.length.toString(), trend: '+8%' },
    { label: 'Els Meus Cursos', value: '3', trend: '+1' },
    { label: 'Certificats Obtinguts', value: '7', trend: '+2' },
    { label: 'Hores de Formació', value: '120h', trend: '+25h' }
  ];

  // Lista extensible de categorías
  const availableCategories = [
    'Tecnologia',
    'Disseny',
    'Màrqueting Digital',
    'Gestió i Lideratge',
    'Idiomes',
    'Ofimàtica',
    'Comptabilitat i Finances',
    'Comunicació',
    'Recursos Humans',
    'Ciberseguretat',
    'Desenvolupament Personal'
  ].sort();

  // Filtrar cursos basado en búsqueda, filtros y tab activo
  const filteredCourses = useMemo(() => {
    let filtered = [...courses];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.institution.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (filters.category) {
      filtered = filtered.filter(course =>
        course.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    // Filtrar por nivel
    if (filters.level) {
      filtered = filtered.filter(course =>
        course.level.toLowerCase().includes(filters.level.toLowerCase())
      );
    }

    // Filtrar por modalidad
    if (filters.mode) {
      filtered = filtered.filter(course =>
        course.mode === filters.mode
      );
    }

    // Filtrar por tab activo
    switch (activeTab) {
      case 'recomanats':
        filtered = filtered.filter(course => course.isHighlighted || course.isFeatured);
        break;
      case 'meus-cursos':
        // Simular cursos del usuario (por ahora, cursos con rating alto)
        filtered = filtered.filter(course => course.averageRating && course.averageRating >= 4.7);
        break;
      case 'finalitzats':
        // Simular cursos finalizados (últimos 2)
        filtered = filtered.slice(-2);
        break;
      case 'nous':
        // Cursos nuevos (los más recientes)
        filtered = filtered
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        break;
      default:
        // 'tots' - no filtrar
        break;
    }

    return filtered;
  }, [searchTerm, filters, activeTab, courses]);

  // Calcular contadores para pestañas
  const tabCounts = {
    tots: courses.length,
    recomanats: courses.filter(c => c.isHighlighted || c.isFeatured).length,
    'meus-cursos': courses.filter(c => c.averageRating && c.averageRating >= 4.7).length,
    finalitzats: 2,
    nous: 3
  };

  return (
    <PageTemplate
      title="Formació Professional"
      subtitle="Cursos i programes de desenvolupament en diverses temàtiques"
      statsData={statsData}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Búsqueda y filtros */}
        <CourseSearchFilters
          onSearch={setSearchTerm}
          onFilterChange={setFilters}
          totalResults={filteredCourses.length}
          availableCategories={availableCategories}
        />

        {/* Tabs de navegación */}
        <CourseTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={tabCounts}
        />

        {/* Header con toggle de vista */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#2c3e50',
            margin: 0
          }}>
            {filteredCourses.length} curs{filteredCourses.length !== 1 ? 'os' : ''} trobat{filteredCourses.length !== 1 ? 's' : ''}
          </h2>

          <ViewToggle
            viewMode={viewMode}
            onViewChange={setViewMode}
          />
        </div>

        {/* Mensaje de error */}
        {error && (
          <div style={{
            padding: '20px',
            backgroundColor: '#fee2e2',
            borderRadius: '12px',
            marginBottom: '20px',
            color: '#dc2626',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#6c757d',
              marginBottom: '8px'
            }}>
              Carregant cursos...
            </h3>
          </div>
        ) : (
          <>
            {/* Grid/Lista de cursos */}
            {filteredCourses.length > 0 ? (
          <div style={{
            display: viewMode === 'grid' ? 'grid' : 'block',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(4, 1fr)' : 'none',
            gap: viewMode === 'grid' ? '20px' : '0'
          }}>
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#6c757d',
              marginBottom: '8px'
            }}>
              No s'han trobat cursos
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#8e8e93',
              margin: 0
            }}>
              Prova a ajustar els filtres o el terme de cerca
            </p>
          </div>
        )}
          </>
        )}
      </div>
    </PageTemplate>
  );
}