'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Megaphone, CheckCircle, Star, Clock, Check, X, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { useAnuncios, useDeleteAnuncio, usePendingAnuncios, useApproveAnuncio, useRejectAnuncio } from '@/hooks/useAnuncios';
import { AnnouncementFilters } from '@/lib/validations/anuncios';


export default function ListarAnunciosPage() {
  const router = useRouter();

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Construir objeto de filtros para la API
  const filters: AnnouncementFilters = {
    search: searchTerm || undefined,
    type: selectedType !== 'all' ? selectedType.toLowerCase() as 'general' | 'urgent' | 'event' | 'maintenance' | 'news' | 'alert' | 'promotion' | 'regulation' : undefined,
    status: selectedStatus !== 'all' ? selectedStatus as 'draft' | 'pending' | 'published' | 'archived' : undefined,
    page,
    limit: 10
  };

  // Hooks de datos
  const { data, isLoading, error } = useAnuncios(filters);
  const { data: pendingData } = usePendingAnuncios();
  const deleteAnuncioMutation = useDeleteAnuncio();
  const approveAnuncioMutation = useApproveAnuncio();
  const rejectAnuncioMutation = useRejectAnuncio();

  const announcements = data?.data || [];
  const pagination = data?.pagination;



  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este anuncio?')) return;
    deleteAnuncioMutation.mutate(id);
  };

  const handleApprove = async (id: string) => {
    if (!confirm('¿Aprobar este anuncio? Se publicará inmediatamente.')) return;
    approveAnuncioMutation.mutate(id);
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Razón del rechazo (opcional):');
    if (reason === null) return; // Usuario canceló
    rejectAnuncioMutation.mutate({ id, reason: reason.trim() || undefined });
  };

  // Calcular estadísticas
  const getStats = () => {
    const total = pagination?.total || 0;
    const activos = announcements.filter((a) =>
      a.status === 'approved'
    ).length;
    const destacados = announcements.filter((a) => a.isPinned).length;
    const pendientes = pendingData?.pagination?.total || 0;

    return { total, activos, destacados, pendientes };
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'GENERAL': return '📋';
      case 'URGENT': return '🚨';
      case 'EVENT': return '📅';
      case 'MAINTENANCE': return '🔧';
      case 'NEWS': return '📰';
      case 'ALERT': return '⚠️';
      case 'PROMOTION': return '🎁';
      case 'REGULATION': return '📜';
      default: return '📋';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'GENERAL': return 'bg-gray-100 text-gray-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'EVENT': return 'bg-purple-100 text-purple-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      case 'NEWS': return 'bg-green-100 text-green-800';
      case 'ALERT': return 'bg-orange-100 text-orange-800';
      case 'PROMOTION': return 'bg-blue-100 text-blue-800';
      case 'REGULATION': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  if (isLoading) {
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
        <StatCard
          title="Total Anuncios"
          value={stats.total}
          icon={<Megaphone className="w-10 h-10" />}
          color="blue"
        />
        <StatCard
          title="Anuncios Activos"
          value={stats.activos}
          icon={<CheckCircle className="w-10 h-10" />}
          color="green"
        />
        <StatCard
          title="Anuncios Destacados"
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
              Tipo
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="general">📋 General</option>
              <option value="urgent">🚨 Urgente</option>
              <option value="event">📅 Evento</option>
              <option value="maintenance">🔧 Mantenimiento</option>
              <option value="news">📰 Noticias</option>
              <option value="alert">⚠️ Alerta</option>
              <option value="promotion">🎁 Promoción</option>
              <option value="regulation">📜 Normativa</option>
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
              <option value="approved">✅ Aprobado</option>
              <option value="pending_review">⏳ Pendiente revisión</option>
              <option value="rejected">❌ Rechazado</option>
              <option value="draft">📝 Borrador</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedStatus('all');
                setPage(1);
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
          {error.message || 'Error al cargar los anuncios'}
        </div>
      )}

      {/* Lista de anuncios */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Anuncios ({announcements.length} de {pagination?.total || 0})
          </h2>
        </div>

        {announcements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {isLoading
              ? "Cargando anuncios..."
              : "No hay anuncios que coincidan con los filtros seleccionados."
            }
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {announcement.isSticky && <span className="text-xl">📌</span>}
                      <span className="text-2xl">{getTypeIcon(announcement.type)}</span>
                      <h3 className="text-lg font-medium text-gray-900">
                        {announcement.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(announcement.type)}`}>
                        {announcement.type}
                      </span>
                      {announcement.priority > 7 && (
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
                      <span>👥 {announcement.audience === 'ALL' ? 'Todos' : announcement.audience}</span>
                      <span>👤 {announcement.author?.name || announcement.author?.email}</span>
                      {announcement.expiresAt && (
                        <span>⏰ Expira: {new Date(announcement.expiresAt).toLocaleDateString('es-ES')}</span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        announcement.status === 'approved' ? 'bg-green-100 text-green-800' :
                        announcement.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                        announcement.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        announcement.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {announcement.status === 'approved' ? '✅ Aprobado' :
                         announcement.status === 'pending_review' ? '⏳ Pendiente' :
                         announcement.status === 'rejected' ? '❌ Rechazado' :
                         announcement.status === 'draft' ? '📝 Borrador' :
                         announcement.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {/* Botones de moderación para anuncios pendientes */}
                    {announcement.status === 'pending_review' && (
                      <>
                        <button
                          onClick={() => handleApprove(announcement.id)}
                          disabled={approveAnuncioMutation.isPending}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleReject(announcement.id)}
                          disabled={rejectAnuncioMutation.isPending}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Rechazar
                        </button>
                      </>
                    )}

                    {/* Botón de alerta para rechazados */}
                    {announcement.status === 'rejected' && (
                      <span className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Rechazado
                      </span>
                    )}

                    <button
                      onClick={() => router.push(`/admin/anuncios/${announcement.id}`)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Ver
                    </button>
                    <Link
                      href={`/admin/anuncios/${announcement.id}/editar`}
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

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} anuncios
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || isLoading}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages || isLoading}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}