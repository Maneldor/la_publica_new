'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditarCursoPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [courseFound, setCourseFound] = useState(true);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    instructor: '',
    institution: '',
    logo: '',
    duration: '',
    level: 'Principiant',
    mode: 'online',
    price: '',
    originalPrice: '',
    startDate: '',
    endDate: '',
    enrollmentDeadline: '',
    totalSlots: '',
    availableSlots: '',
    minStudents: '',
    objectives: '',
    syllabus: '',
    requirements: '',
    targetAudience: '',
    certification: '',
    isHighlighted: false,
    isActive: true,
    allowEnrollment: true,
    location: '',
    platform: '',
    schedule: '',
    materials: '',
    language: 'Català',
    tags: '',
    status: 'DRAFT'
  });

  const categories = [
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
    'Desenvolupament Personal',
    'Administració Pública',
    'Salut i Prevenció',
    'Medi Ambient',
    'Innovació'
  ];

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = () => {
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const course = courses.find((c: any) => c.id === parseInt(courseId));

    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || '',
        instructor: course.instructor || '',
        institution: course.institution || '',
        logo: course.logo || '',
        duration: course.duration?.toString() || '',
        level: course.level || 'Principiant',
        mode: course.mode || 'online',
        price: course.price?.toString() || '',
        originalPrice: course.originalPrice?.toString() || '',
        startDate: course.startDate || '',
        endDate: course.endDate || '',
        enrollmentDeadline: course.enrollmentDeadline || '',
        totalSlots: course.totalSlots?.toString() || '',
        availableSlots: course.availableSlots?.toString() || '',
        minStudents: course.minStudents?.toString() || '',
        objectives: course.objectives || '',
        syllabus: course.syllabus || '',
        requirements: course.requirements || '',
        targetAudience: course.targetAudience || '',
        certification: course.certification || '',
        isHighlighted: course.isHighlighted || false,
        isActive: course.isActive !== undefined ? course.isActive : true,
        allowEnrollment: course.allowEnrollment !== undefined ? course.allowEnrollment : true,
        location: course.location || '',
        platform: course.platform || '',
        schedule: course.schedule || '',
        materials: course.materials || '',
        language: course.language || 'Català',
        tags: course.tags || '',
        status: course.status || 'DRAFT'
      });
      setImagePreview(course.logo || '');
    } else {
      setCourseFound(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const courses = JSON.parse(localStorage.getItem('courses') || '[]');
      const courseIndex = courses.findIndex((c: any) => c.id === parseInt(courseId));

      if (courseIndex !== -1) {
        const updatedCourse = {
          ...courses[courseIndex],
          ...formData,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price),
          originalPrice: parseFloat(formData.originalPrice),
          totalSlots: parseInt(formData.totalSlots),
          availableSlots: parseInt(formData.availableSlots),
          minStudents: parseInt(formData.minStudents),
          updatedAt: new Date().toISOString()
        };

        courses[courseIndex] = updatedCourse;
        localStorage.setItem('courses', JSON.stringify(courses));

        alert('Curs actualitzat correctament!');
        router.push('/admin/formacio/listar');
      }
    } catch (error) {
      alert('Error al actualitzar el curs');
    } finally {
      setLoading(false);
    }
  };

  if (!courseFound) {
    return (
      <div className="max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-red-800 mb-2">Curs no trobat</h1>
          <p className="text-red-600 mb-4">El curs amb ID {courseId} no existeix.</p>
          <Link
            href="/admin/formacio/listar"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Tornar a la llista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Curs</h1>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/formacio/${courseId}`}
            className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
            target="_blank"
          >
            👁️ Vista prèvia
          </Link>
          <Link
            href="/admin/formacio/listar"
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Tornar a la llista
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-8">

        {/* Informació Bàsica */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">📚 Informació Bàsica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Títol del Curs *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripció *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Selecciona una categoria</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma del Curs *
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="Català">Català</option>
                <option value="Castellà">Castellà</option>
                <option value="Anglès">Anglès</option>
                <option value="Francès">Francès</option>
              </select>
            </div>
          </div>
        </div>

        {/* Instructor i Institució */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">👨‍🏫 Instructor i Institució</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'Instructor *
              </label>
              <input
                type="text"
                value={formData.instructor}
                onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institució *
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({...formData, institution: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo/Imatge del Curs *
              </label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
              </div>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => {
                  setFormData({...formData, logo: e.target.value});
                  setImagePreview(e.target.value);
                }}
                className="w-full border rounded-lg px-3 py-2 mt-2"
                placeholder="O introdueix una URL d'imatge..."
              />
            </div>
          </div>
        </div>

        {/* Detalls del Curs */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">📋 Detalls del Curs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durada (hores) *
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivell *
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="Principiant">Principiant</option>
                <option value="Intermedi">Intermedi</option>
                <option value="Avançat">Avançat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modalitat *
              </label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({...formData, mode: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="online">Online</option>
                <option value="presencial">Presencial</option>
                <option value="hibrid">Híbrid</option>
              </select>
            </div>

            {(formData.mode === 'presencial' || formData.mode === 'hibrid') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicació
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            )}

            {(formData.mode === 'online' || formData.mode === 'hibrid') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plataforma
                </label>
                <input
                  type="text"
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            )}

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horari
              </label>
              <input
                type="text"
                value={formData.schedule}
                onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">📅 Dates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data d'Inici *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Fi *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data límit d'inscripció
              </label>
              <input
                type="date"
                value={formData.enrollmentDeadline}
                onChange={(e) => setFormData({...formData, enrollmentDeadline: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Preu i Capacitat */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">💰 Preu i Capacitat</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preu (€) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preu Original (€)
              </label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Places Totals *
              </label>
              <input
                type="number"
                value={formData.totalSlots}
                onChange={(e) => setFormData({...formData, totalSlots: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Places Disponibles *
              </label>
              <input
                type="number"
                value={formData.availableSlots}
                onChange={(e) => setFormData({...formData, availableSlots: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mínim d'Estudiants
              </label>
              <input
                type="number"
                value={formData.minStudents}
                onChange={(e) => setFormData({...formData, minStudents: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Contingut del Curs */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">📝 Contingut del Curs</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objectius
              </label>
              <textarea
                value={formData.objectives}
                onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temari
              </label>
              <textarea
                value={formData.syllabus}
                onChange={(e) => setFormData({...formData, syllabus: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requisits Previs
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Públic Objectiu
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificació
              </label>
              <input
                type="text"
                value={formData.certification}
                onChange={(e) => setFormData({...formData, certification: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materials Inclosos
              </label>
              <textarea
                value={formData.materials}
                onChange={(e) => setFormData({...formData, materials: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Configuració */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">⚙️ Configuració</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isHighlighted}
                onChange={(e) => setFormData({...formData, isHighlighted: e.target.checked})}
                className="w-4 h-4"
              />
              <span className="text-sm">🌟 Curs Destacat/Recomanat</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4"
              />
              <span className="text-sm">✅ Curs Actiu</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.allowEnrollment}
                onChange={(e) => setFormData({...formData, allowEnrollment: e.target.checked})}
                className="w-4 h-4"
              />
              <span className="text-sm">📝 Permetre Inscripcions</span>
            </label>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estat de Publicació
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="DRAFT">Esborrany</option>
              <option value="PUBLISHED">Publicat</option>
              <option value="ARCHIVED">Arxivat</option>
            </select>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetes (separades per comes)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Botons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardant...' : 'Guardar Canvis'}
          </button>

          <button
            type="button"
            onClick={() => {
              setFormData({...formData, status: 'PUBLISHED'});
              setTimeout(() => {
                handleSubmit(new Event('submit') as any);
              }, 100);
            }}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Guardar i Publicar
          </button>

          <Link
            href="/admin/formacio/listar"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel·lar
          </Link>
        </div>
      </form>
    </div>
  );
}