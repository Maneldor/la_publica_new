'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Globe, Lock, Calendar, Pin, FileText } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

interface Forum {
  id: number;
  title: string;
  description: string;
  category: string;
  isPublic: boolean;
  allowAnonymous: boolean;
  isPinned?: boolean;
  status?: string;
  topicsCount?: number;
  postsCount?: number;
  createdAt: string;
}

export default function ListarForosPage() {
  const router = useRouter();
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    fetchForums();
  }, []);

  const fetchForums = async () => {
    try {
      // Cargar foros de la API
      let apiForums: Forum[] = [];
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/v1/forums', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            apiForums = data;
          } else if (data.data && Array.isArray(data.data)) {
            apiForums = data.data;
          }
        }
      } catch (err) {
        console.log('No se pudieron cargar foros de la API:', err);
      }

      // Cargar foros creados localmente
      const createdForums = JSON.parse(localStorage.getItem('createdForums') || '[]');
      const localForums: Forum[] = createdForums.map((forum: any) => ({
        id: forum.id,
        title: forum.title,
        description: forum.description,
        category: forum.category,
        isPublic: forum.isPublic,
        allowAnonymous: forum.allowAnonymous,
        isPinned: forum.isPinned,
        status: forum.status || 'published',
        topicsCount: 0,
        postsCount: 0,
        createdAt: forum.createdAt
      }));

      // Combinar ambos arrays
      const allForums = [...localForums, ...apiForums];
      setForums(allForums);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar los foros');
      setForums([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este foro? Se eliminarán todos sus temas y respuestas.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/v1/forums/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setForums(forums.filter(f => f.id !== id));
      } else {
        alert('Error al eliminar el foro');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  // Aplicar filtros y búsqueda
  let filteredForums = forums;

  // Filtrar por estado
  if (filter !== 'ALL') {
    if (filter === 'PUBLISHED') {
      filteredForums = filteredForums.filter(f => f.status === 'published' || !f.status);
    } else if (filter === 'DRAFT') {
      filteredForums = filteredForums.filter(f => f.status === 'draft');
    } else if (filter === 'PINNED') {
      filteredForums = filteredForums.filter(f => f.isPinned);
    }
  }

  // Filtrar por categoría
  if (categoryFilter !== 'ALL') {
    filteredForums = filteredForums.filter(f => f.category === categoryFilter);
  }

  // Filtrar por búsqueda
  if (searchTerm) {
    filteredForums = filteredForums.filter(f =>
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Calcular estadísticas
  const getStats = () => {
    const total = forums.length;
    const publicos = forums.filter(f => f.isPublic).length;
    const privados = forums.filter(f => !f.isPublic).length;
    const borradores = forums.filter(f => f.status === 'draft').length;
    const anclados = forums.filter(f => f.isPinned).length;

    return { total, publicos, privados, borradores, anclados };
  };

  // Obtener categorías únicas
  const getCategories = () => {
    const categories = [...new Set(forums.map(f => f.category))].filter(Boolean);
    return categories.sort();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Cargando foros...</p>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💬 Gestión de Foros</h1>
          <p className="text-gray-600">Administra los foros y espacios de discusión de la plataforma</p>
        </div>
        <button
          onClick={() => router.push('/admin/foros/crear')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Crear Foro
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          title="Total Foros"
          value={stats.total}
          icon={<MessageSquare className="w-10 h-10" />}
          color="blue"
        />
        <StatCard
          title="Públicos"
          value={stats.publicos}
          icon={<Globe className="w-10 h-10" />}
          color="green"
        />
        <StatCard
          title="Privados"
          value={stats.privados}
          icon={<Lock className="w-10 h-10" />}
          color="yellow"
        />
        <StatCard
          title="Borradores"
          value={stats.borradores}
          icon={<FileText className="w-10 h-10" />}
          color="orange"
        />
        <StatCard
          title="Anclados"
          value={stats.anclados}
          icon={<Pin className="w-10 h-10" />}
          color="purple"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Título, descripción o categoría..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todas las categorías</option>
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Botón limpiar filtros */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Filtrar por estado</h3>
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'PUBLISHED', 'DRAFT', 'PINNED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? '📋 Todos' :
                 status === 'PUBLISHED' ? '✅ Publicados' :
                 status === 'DRAFT' ? '📝 Borradores' : '📌 Anclados'}
                <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                  {status === 'ALL' ? stats.total :
                   status === 'PUBLISHED' ? (stats.total - stats.borradores) :
                   status === 'DRAFT' ? stats.borradores : stats.anclados}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="text-sm text-gray-600">
          Mostrando {filteredForums.length} de {forums.length} foros
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredForums.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-lg font-medium text-gray-700 mb-1">No se encontraron foros</p>
              <p className="text-sm">Intenta ajustar los filtros o crear un nuevo foro</p>
            </div>
          ) : (
            filteredForums.map((forum) => (
              <div key={forum.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">{forum.title}</h3>

                      {/* Badge de categoría */}
                      <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                        {forum.category}
                      </span>

                      {/* Badge de estado */}
                      {forum.status === 'draft' && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                          📝 Borrador
                        </span>
                      )}

                      {/* Badge de anclado */}
                      {forum.isPinned && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                          📌 Anclado
                        </span>
                      )}

                      {/* Badge de público */}
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        forum.isPublic
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {forum.isPublic ? '🌐 Público' : '🔒 Privado'}
                      </span>

                      {/* Badge de anónimo */}
                      {forum.allowAnonymous && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800">
                          👤 Anónimo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{forum.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>{forum.topicsCount || 0} temas</span>
                      <span>{forum.postsCount || 0} respuestas</span>
                      <span>{new Date(forum.createdAt).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 flex-wrap">
                    {(forum.status === 'published' || !forum.status) && (
                      <button
                        onClick={() => router.push(`/dashboard/forums/${forum.id}`)}
                        className="px-3 py-1 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                      >
                        👁️ Ver
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/admin/foros/editar/${forum.id}`)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(forum.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}