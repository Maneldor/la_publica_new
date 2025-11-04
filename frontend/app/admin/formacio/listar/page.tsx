'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, Star, CheckCircle2 } from 'lucide-react';
import { coursesService, Course } from '../../../../lib/courses';

export default function ListarCursosPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterAndSortCourses();
  }, [courses, searchTerm, filterCategory, filterStatus, filterLevel, sortBy]);

  const loadCourses = async () => {
    try {
      setLoading(true);

      // Cargar cursos desde localStorage
      const createdCourses = JSON.parse(localStorage.getItem('courses') || '[]');

      // Convertir cursos creados al formato Course
      const convertedCourses: Course[] = createdCourses.map((course: any) => ({
        id: course.id.toString(),
        title: course.title,
        description: course.description,
        shortDescription: course.subtitle || course.description.slice(0, 100),
        slug: course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        instructor: course.instructor || course.selectedInstructor?.name || 'Instructor',
        institution: course.selectedInstructor?.institution || 'Institut de Formació',
        instructorEmail: 'instructor@example.com',
        institutionLogo: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150&h=150&fit=crop',
        category: course.category,
        subcategory: course.category,
        tags: course.tags || '',
        level: course.level,
        mode: course.mode || course.modalities?.[0] || 'online',
        duration: Math.round(course.duration || 0),
        language: course.language,
        price: course.price || 0,
        originalPrice: course.price || 0,
        discount: 0,
        currency: 'EUR',
        startDate: course.startDate,
        endDate: course.endDate,
        enrollmentDeadline: course.startDate,
        availableSlots: course.availableSlots || course.capacity || 25,
        totalSlots: course.capacity || 25,
        status: course.status || 'PUBLISHED',
        isHighlighted: course.isHighlighted || false,
        isFeatured: course.isFeatured || false,
        isNew: true,
        coverImage: course.coverImage || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
        promoVideo: '',
        materials: 'Materials del curs',
        viewsCount: 0,
        enrollmentCount: 0,
        completionRate: 0,
        averageRating: 5.0,
        totalRatings: 0,
        creatorId: 'admin-user',
        comunidadSlug: 'formacio-community',
        createdAt: course.createdAt || new Date().toISOString(),
        updatedAt: course.createdAt || new Date().toISOString()
      }));

      // Curso de ejemplo
      const sampleCourse: Course = {
        id: '1',
        title: 'Desenvolupament Web amb React',
        description: 'Aprèn a crear aplicacions web modernes amb React',
        shortDescription: 'Curs complet de React',
        slug: 'react-development',
        instructor: 'Marc González',
        institution: 'TechAcademy Barcelona',
        instructorEmail: 'marc@techacademy.cat',
        institutionLogo: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150&h=150&fit=crop',
        category: 'Tecnologia',
        subcategory: 'Desenvolupament Web',
        tags: 'react,javascript,frontend',
        level: 'Intermedi',
        mode: 'online',
        duration: 40,
        language: 'Català',
        price: 299,
        originalPrice: 399,
        discount: 25,
        currency: 'EUR',
        startDate: '2024-11-15',
        endDate: '2024-12-20',
        enrollmentDeadline: '2024-11-10',
        availableSlots: 15,
        totalSlots: 25,
        status: 'PUBLISHED',
        isHighlighted: true,
        isFeatured: true,
        isNew: false,
        coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
        promoVideo: '',
        materials: 'PDFs, videos, exercises',
        viewsCount: 150,
        enrollmentCount: 10,
        completionRate: 85,
        averageRating: 4.8,
        totalRatings: 25,
        creatorId: 'admin-user',
        comunidadSlug: 'tech-community',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Combinar cursos creados con ejemplo (creados aparecen primero)
      const allCourses = [...convertedCourses, sampleCourse];
      setCourses(allCourses);
      setError('');
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Error al cargar los cursos');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCourses = () => {
    let filtered = [...courses];

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.institution.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(course => course.category === filterCategory);
    }
    if (filterStatus) {
      filtered = filtered.filter(course => course.status === filterStatus);
    }
    if (filterLevel) {
      filtered = filtered.filter(course => course.level === filterLevel);
    }

    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'startDate':
        filtered.sort((a, b) => new Date(a.startDate || '').getTime() - new Date(b.startDate || '').getTime());
        break;
      case 'enrolled':
        filtered.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        break;
    }

    setFilteredCourses(filtered);
  };

  const toggleStatus = async (id: string) => {
    try {
      // Actualizar en localStorage si es un curso creado
      const createdCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const updatedCreatedCourses = createdCourses.map((course: any) => {
        if (course.id.toString() === id) {
          return {
            ...course,
            status: course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
          };
        }
        return course;
      });
      localStorage.setItem('courses', JSON.stringify(updatedCreatedCourses));

      // Actualizar estado local
      const updatedCourses = courses.map(course => {
        if (course.id === id) {
          return {
            ...course,
            status: course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
          };
        }
        return course;
      });
      setCourses(updatedCourses);
    } catch (err) {
      console.error('Error updating course status:', err);
      alert('Error al actualitzar l\'estat del curs');
    }
  };

  const toggleHighlight = async (id: string) => {
    try {
      // Actualizar en localStorage si es un curso creado
      const createdCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const updatedCreatedCourses = createdCourses.map((course: any) => {
        if (course.id.toString() === id) {
          return {
            ...course,
            isHighlighted: !course.isHighlighted
          };
        }
        return course;
      });
      localStorage.setItem('courses', JSON.stringify(updatedCreatedCourses));

      // Actualizar estado local
      const updatedCourses = courses.map(course => {
        if (course.id === id) {
          return {
            ...course,
            isHighlighted: !course.isHighlighted
          };
        }
        return course;
      });
      setCourses(updatedCourses);
    } catch (err) {
      console.error('Error updating course highlight:', err);
      alert('Error al actualitzar el destacat del curs');
    }
  };

  const deleteCourse = async (id: string) => {
    if (confirm('Estàs segur que vols eliminar aquest curs? Aquesta acció no es pot desfer.')) {
      try {
        // Eliminar de localStorage si es un curso creado
        const createdCourses = JSON.parse(localStorage.getItem('courses') || '[]');
        const updatedCreatedCourses = createdCourses.filter((course: any) => course.id.toString() !== id);
        localStorage.setItem('courses', JSON.stringify(updatedCreatedCourses));

        // Actualizar estado local
        const updatedCourses = courses.filter(c => c.id !== id);
        setCourses(updatedCourses);
        alert('Curs eliminat correctament');
      } catch (err) {
        console.error('Error deleting course:', err);
        alert('Error al eliminar el curs');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Publicat</span>;
      case 'DRAFT':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Esborrany</span>;
      case 'ARCHIVED':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Arxivat</span>;
      default:
        return null;
    }
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      'Principiant': 'bg-green-100 text-green-700',
      'Intermedi': 'bg-yellow-100 text-yellow-700',
      'Avançat': 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[level] || 'bg-gray-100 text-gray-700'}`}>
        {level}
      </span>
    );
  };

  const getModeBadge = (mode: string) => {
    const icons: Record<string, string> = {
      'online': '💻',
      'presencial': '🏢',
      'hibrid': '🔄'
    };
    return (
      <span className="text-sm">
        {icons[mode] || '📚'} {mode}
      </span>
    );
  };

  const categories = [...new Set(courses.map(c => c.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Cargando cursos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎓 Gestió de Cursos</h1>
          <p className="text-gray-600 mt-1">
            {loading ? 'Carregant...' : `${filteredCourses.length} cursos trobats`}
          </p>
        </div>
        <Link
          href="/admin/formacio/crear"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Crear Nou Curs
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Cursos Publicats</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {courses.filter(c => c.status === 'PUBLISHED').length}
              </p>
            </div>
            <BookOpen className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Inscrits</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {courses.reduce((sum, c) => sum + c.enrollmentCount, 0)}
              </p>
            </div>
            <Users className="w-10 h-10 text-green-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Cursos Destacats</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {courses.filter(c => c.isHighlighted).length}
              </p>
            </div>
            <Star className="w-10 h-10 text-yellow-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Cursos Complets</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {courses.filter(c => c.availableSlots === 0).length}
              </p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 mr-2">⚠️</div>
            <div className="text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cercar</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Títol, instructor..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Totes</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estat</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tots</option>
              <option value="PUBLISHED">Publicat</option>
              <option value="DRAFT">Esborrany</option>
              <option value="ARCHIVED">Arxivat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivell</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tots</option>
              <option value="Principiant">Principiant</option>
              <option value="Intermedi">Intermedi</option>
              <option value="Avançat">Avançat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar per</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Més recents</option>
              <option value="title">Títol</option>
              <option value="startDate">Data d'inici</option>
              <option value="enrolled">Inscrits</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('');
              setFilterStatus('');
              setFilterLevel('');
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            🔄 Netejar filtres
          </button>
        </div>
      </div>

      {/* Lista de cursos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredCourses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">No s'han trobat cursos</p>
            <p className="text-sm">Prova a ajustar els filtres o crea un nou curs</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalls</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Places</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estat</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Accions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {course.coverImage && (
                          <img
                            src={course.coverImage}
                            alt={course.title}
                            className="w-12 h-12 object-cover rounded-lg mr-4"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {course.title}
                            {course.isHighlighted && (
                              <span className="ml-2 text-yellow-500">⭐</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{course.instructor}</div>
                          <div className="text-xs text-gray-400">{course.institution}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-900">{course.category}</div>
                        <div className="flex gap-2 mt-1">
                          {getLevelBadge(course.level)}
                          {getModeBadge(course.mode)}
                        </div>
                        <div className="text-gray-500 mt-1">{course.duration}h - {course.price}€</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div>Inici: {course.startDate ? new Date(course.startDate).toLocaleDateString('ca') : 'N/A'}</div>
                        <div>Fi: {course.endDate ? new Date(course.endDate).toLocaleDateString('ca') : 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium">{course.enrollmentCount} / {course.totalSlots}</div>
                        <div className="text-gray-500">{course.availableSlots} disponibles</div>
                        {course.availableSlots === 0 && (
                          <span className="text-xs text-red-600 font-medium">COMPLET</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(course.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => toggleHighlight(course.id)}
                          className={`text-sm ${course.isHighlighted ? 'text-yellow-600' : 'text-gray-400'} hover:text-yellow-600`}
                          title="Destacar/No destacar"
                        >
                          ⭐
                        </button>
                        <button
                          onClick={() => toggleStatus(course.id)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                          title="Cambiar estado"
                        >
                          {course.status === 'PUBLISHED' ? 'Despublicar' : 'Publicar'}
                        </button>
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}