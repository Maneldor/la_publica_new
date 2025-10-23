'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  priority: string;
  targetAudience: string;
  isPinned: boolean;
  expiresAt?: string;
  createdAt: string;
  category?: string;
  status?: 'active' | 'pending' | 'archived';
}

export default function ListarAnunciosPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    let filtered = announcements;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(announcement =>
        announcement.category === selectedCategory ||
        announcement.type === selectedCategory
      );
    }

    // Filtrar por estado
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(announcement => {
        if (selectedStatus === 'active') {
          return !announcement.expiresAt || new Date(announcement.expiresAt) > new Date();
        } else if (selectedStatus === 'pending') {
          return announcement.status === 'pending';
        } else if (selectedStatus === 'archived') {
          return announcement.expiresAt && new Date(announcement.expiresAt) <= new Date();
        }
        return true;
      });
    }

    setFilteredAnnouncements(filtered);
  }, [announcements, searchTerm, selectedCategory, selectedStatus]);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/announcements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Datos recibidos:', data);

        if (Array.isArray(data)) {
          setAnnouncements(data);
          setFilteredAnnouncements(data);
        } else if (data.data && Array.isArray(data.data)) {
          setAnnouncements(data.data);
          setFilteredAnnouncements(data.data);
        } else {
          console.error('Los datos no son un array:', data);
          setAnnouncements([]);
          setFilteredAnnouncements([]);
        }
      } else {
        setError('Error al cargar los anuncios');
        setAnnouncements([]);
        setFilteredAnnouncements([]);
      }
    } catch {
      console.error('Error de conexión');
      setError('Error de conexión');
      setAnnouncements([]);
      setFilteredAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este anuncio?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/v1/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setAnnouncements(announcements.filter(a => a.id !== id));
      } else {
        alert('Error al eliminar el anuncio');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  // Calcular estadísticas
  const getStats = () => {
    const total = announcements.length;
    const activos = announcements.filter(a =>
      !a.expiresAt || new Date(a.expiresAt) > new Date()
    ).length;
    const destacados = announcements.filter(a => a.isPinned).length;
    const pendientes = announcements.filter(a =>
      a.status === 'pending' || a.priority === 'LOW'
    ).length;

    return { total, activos, destacados, pendientes };
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INFO': return 'ℹ️';
      case 'WARNING': return '⚠️';
      case 'URGENT': return '🚨';
      case 'NEWS': return '📰';
      case 'EVENT': return '📅';
      default: return 'ℹ️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INFO': return 'bg-blue-100 text-blue-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'NEWS': return 'bg-green-100 text-green-800';
      case 'EVENT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600';
      case 'NORMAL': return 'text-gray-600';
      case 'LOW': return 'text-gray-400';
      default: return 'text-gray-600';
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      'tecnologia': '💻 Tecnología',
      'vehicles': '🚗 Vehículos',
      'immobiliaria': '🏠 Inmobiliaria',
      'moda': '👔 Moda',
      'esports': '⚽ Deportes',
      'llar': '🏡 Hogar',
      'serveis': '🔧 Servicios',
      'altres': '📦 Otros',
      'INFO': 'ℹ️ Información',
      'WARNING': '⚠️ Aviso',
      'URGENT': '🚨 Urgente',
      'NEWS': '📰 Noticias',
      'EVENT': '📅 Evento'
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando anuncios...</div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📢 Gestión de Anuncios</h1>
          <p className="text-gray-600">Administra los anuncios de la plataforma</p>
        </div>
        <Link
          href="/admin/anuncios/crear"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Crear Anuncio
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total anuncios</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.activos}</div>
          <div className="text-sm text-gray-600">Anuncios activos</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.destacados}</div>
          <div className="text-sm text-gray-600">Anuncios destacados</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">{stats.pendientes}</div>
          <div className="text-sm text-gray-600">Pendientes revisión</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Título o descripción..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las categorías</option>
              <option value="tecnologia">💻 Tecnología</option>
              <option value="vehicles">🚗 Vehículos</option>
              <option value="immobiliaria">🏠 Inmobiliaria</option>
              <option value="moda">👔 Moda</option>
              <option value="esports">⚽ Deportes</option>
              <option value="llar">🏡 Hogar</option>
              <option value="serveis">🔧 Servicios</option>
              <option value="INFO">ℹ️ Información</option>
              <option value="WARNING">⚠️ Aviso</option>
              <option value="URGENT">🚨 Urgente</option>
              <option value="NEWS">📰 Noticias</option>
              <option value="EVENT">📅 Evento</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">✅ Activo</option>
              <option value="pending">⏳ Pendiente</option>
              <option value="archived">📁 Archivado</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Lista de anuncios */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Anuncios ({filteredAnnouncements.length})
          </h2>
        </div>

        {filteredAnnouncements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {announcements.length === 0
              ? "No hay anuncios creados aún"
              : "No hay anuncios que coincidan con los filtros seleccionados."
            }
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAnnouncements.map((announcement) => (
              <div key={announcement.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {announcement.isPinned && <span className="text-xl">📌</span>}
                      <span className="text-2xl">{getTypeIcon(announcement.type)}</span>
                      <h3 className="text-lg font-medium text-gray-900">
                        {announcement.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(announcement.type)}`}>
                        {announcement.type}
                      </span>
                      {announcement.priority === 'HIGH' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Alta prioridad
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {announcement.content}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📅 {new Date(announcement.createdAt).toLocaleDateString('es-ES')}</span>
                      <span>👥 {announcement.targetAudience === 'ALL' ? 'Todos' : announcement.targetAudience}</span>
                      {announcement.expiresAt && (
                        <span>⏰ Expira: {new Date(announcement.expiresAt).toLocaleDateString('es-ES')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => router.push(`/admin/anuncios/${announcement.id}`)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Ver
                    </button>
                    <Link
                      href={`/admin/anuncios/editar/${announcement.id}`}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}