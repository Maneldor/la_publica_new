'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Megaphone, CheckCircle, Star, Clock } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

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

export default function ListarOfertasPage() {
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
      // Cargar ofertas desde localStorage
      const createdOfertas = JSON.parse(localStorage.getItem('createdOfertas') || '[]');

      // Convertir al formato esperado por la interfaz Announcement
      const convertedAnnouncements: Announcement[] = createdOfertas.map((oferta: any) => ({
        id: oferta.id,
        title: oferta.title,
        content: oferta.description,
        type: oferta.type?.toUpperCase() || 'OFERTA',
        priority: oferta.priority?.toUpperCase() || 'NORMAL',
        targetAudience: 'ALL',
        isPinned: oferta.isPinned || false,
        expiresAt: oferta.expiresAt,
        createdAt: oferta.createdAt || new Date().toISOString(),
        category: oferta.category,
        status: oferta.status === 'published' ? 'active' : oferta.status === 'draft' ? 'pending' : 'archived'
      }));

      setAnnouncements(convertedAnnouncements);
      setFilteredAnnouncements(convertedAnnouncements);
    } catch (error) {
      console.error('Error al cargar ofertas desde localStorage:', error);
      setError('Error al cargar las ofertas');
      setAnnouncements([]);
      setFilteredAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta oferta?')) return;

    try {
      // Eliminar desde localStorage
      const createdOfertas = JSON.parse(localStorage.getItem('createdOfertas') || '[]');
      const updatedOfertas = createdOfertas.filter((oferta: any) => oferta.id !== id);
      localStorage.setItem('createdOfertas', JSON.stringify(updatedOfertas));

      // Actualizar el estado local
      setAnnouncements(announcements.filter(a => a.id !== id));
      setFilteredAnnouncements(filteredAnnouncements.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error al eliminar oferta:', error);
      alert('Error al eliminar la oferta');
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
      case 'OFERTA': return '📤';
      case 'DEMANDA': return '📥';
      case 'INFO': return 'ℹ️';
      case 'WARNING': return '⚠️';
      case 'URGENT': return '🚨';
      case 'NEWS': return '📰';
      case 'EVENT': return '📅';
      default: return '📋';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'OFERTA': return 'bg-green-100 text-green-800';
      case 'DEMANDA': return 'bg-blue-100 text-blue-800';
      case 'INFO': return 'bg-blue-100 text-blue-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'NEWS': return 'bg-green-100 text-green-800';
      case 'EVENT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando ofertas...</div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📤 Gestión de Ofertas</h1>
          <p className="text-gray-600">Administra las ofertas de la plataforma</p>
        </div>
        <Link
          href="/admin/ofertas/crear"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Crear Oferta
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Ofertas"
          value={stats.total}
          icon={<Megaphone className="w-10 h-10" />}
          color="blue"
        />
        <StatCard
          title="Ofertas Activas"
          value={stats.activos}
          icon={<CheckCircle className="w-10 h-10" />}
          color="green"
        />
        <StatCard
          title="Ofertas Destacadas"
          value={stats.destacados}
          icon={<Star className="w-10 h-10" />}
          color="yellow"
        />
        <StatCard
          title="Pendientes Revisión"
          value={stats.pendientes}
          icon={<Clock className="w-10 h-10" />}
          color="orange"
        />
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
              <option value="altres">📦 Otros</option>
              <option value="OFERTA">📤 Ofertas</option>
              <option value="DEMANDA">📥 Demandas</option>
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

      {/* Lista de ofertas */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Ofertas ({filteredAnnouncements.length})
          </h2>
        </div>

        {filteredAnnouncements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {announcements.length === 0
              ? "No hay ofertas creadas aún"
              : "No hay ofertas que coincidan con los filtros seleccionados."
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
                      onClick={() => router.push(`/admin/ofertas/${announcement.id}`)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => router.push(`/admin/ofertas/editar/${announcement.id}`)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Editar
                    </button>
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