'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ModerationReport {
  id: string;
  reason: string;
  reportedBy: string;
  reporterEmail: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface ModerationItem {
  id: string;
  type: 'CONTENT' | 'POST' | 'POST_COMMENT' | 'GROUP_POST' | 'FORUM_TOPIC' | 'FORUM_REPLY' | 'ANNOUNCEMENT';
  title?: string;
  content: string;
  author: {
    id: string;
    email: string;
  };
  createdAt: string;
  reportCount: number;
  reports: ModerationReport[];
  metadata: {
    source: string;
    location?: string;
    isModerated?: boolean;
    isPinned?: boolean;
    reported?: boolean;
    parentInfo?: string;
  };
}

interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedToday: number;
  byType: Record<string, number>;
  topReporters: { email: string; count: number }[];
  recentActivity: {
    type: string;
    title: string;
    reporter: string;
    reason: string;
    createdAt: string;
  }[];
}

export default function ModerationDashboard() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('PENDING');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  const fetchModerationData = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(selectedType && { type: selectedType }),
        ...(selectedStatus && { status: selectedStatus })
      });

      const [itemsResponse, statsResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/v1/moderation/content?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/v1/moderation/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setItems(itemsData.items || []);
        setTotalPages(itemsData.pagination?.totalPages || 1);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error cargando datos de moderación:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reportId: string, contentId: string, type: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/v1/moderation/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, contentId, type })
      });

      if (response.ok) {
        alert(action === 'APPROVE' ? 'Contenido moderado' : 'Reporte rechazado');
        fetchModerationData();
      } else {
        alert('Error procesando la acción');
      }
    } catch (error) {
      console.error('Error moderando:', error);
      alert('Error procesando la acción');
    }
  };

  const handleBulkModeration = async (action: 'APPROVE' | 'REJECT') => {
    if (selectedItems.size === 0) {
      alert('Selecciona al menos un elemento');
      return;
    }

    try {
      const token = getToken();
      if (!token) return;

      const reports = Array.from(selectedItems).map(itemId => {
        const item = items.find(i => i.id === itemId);
        return {
          reportId: item?.reports[0]?.id,
          contentId: itemId,
          type: item?.type
        };
      }).filter(r => r.reportId);

      const response = await fetch('http://localhost:5000/api/v1/moderation/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reports, action })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Procesados: ${result.processed}, Errores: ${result.errors}`);
        setSelectedItems(new Set());
        fetchModerationData();
      }
    } catch (error) {
      console.error('Error en moderación en lote:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'CONTENT': 'Blog',
      'POST': 'Feed Social',
      'POST_COMMENT': 'Comentario',
      'GROUP_POST': 'Grupo',
      'FORUM_TOPIC': 'Foro Topic',
      'FORUM_REPLY': 'Foro Respuesta',
      'ANNOUNCEMENT': 'Anuncio'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-red-100 text-red-800',
      'REJECTED': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    fetchModerationData();
  }, [page, selectedType, selectedStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos de moderación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Moderación Unificado</h1>
              <p className="mt-2 text-gray-600">Gestiona todos los reportes de contenido desde un solo lugar</p>
            </div>
            <Link href="/admin" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              Volver al Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-md">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reportes</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalReports}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-md">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pendingReports}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-md">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resueltos Hoy</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.resolvedToday}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-md">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tipos Activos</p>
                  <p className="text-2xl font-semibold text-gray-900">{Object.keys(stats.byType).length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Contenido</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="CONTENT">Blog</option>
                <option value="POST">Feed Social</option>
                <option value="POST_COMMENT">Comentarios</option>
                <option value="GROUP_POST">Grupos</option>
                <option value="FORUM_TOPIC">Foro Topics</option>
                <option value="FORUM_REPLY">Foro Respuestas</option>
                <option value="ANNOUNCEMENT">Anuncios</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="PENDING">Pendientes</option>
                <option value="APPROVED">Aprobados</option>
                <option value="REJECTED">Rechazados</option>
              </select>
            </div>

            <div className="flex-1"></div>

            {selectedItems.size > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkModeration('APPROVE')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Aprobar Seleccionados ({selectedItems.size})
                </button>
                <button
                  onClick={() => handleBulkModeration('REJECT')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Rechazar Seleccionados ({selectedItems.size})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Contenido Reportado</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedItems);
                      if (e.target.checked) {
                        newSelected.add(item.id);
                      } else {
                        newSelected.delete(item.id);
                      }
                      setSelectedItems(newSelected);
                    }}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getTypeLabel(item.type) === 'Blog' ? 'bg-blue-100 text-blue-800' :
                          getTypeLabel(item.type) === 'Feed Social' ? 'bg-green-100 text-green-800' :
                          getTypeLabel(item.type) === 'Comentario' ? 'bg-orange-100 text-orange-800' :
                          getTypeLabel(item.type) === 'Grupo' ? 'bg-purple-100 text-purple-800' :
                          getTypeLabel(item.type) === 'Foro Topic' ? 'bg-indigo-100 text-indigo-800' :
                          getTypeLabel(item.type) === 'Foro Respuesta' ? 'bg-cyan-100 text-cyan-800' :
                          getTypeLabel(item.type) === 'Anuncio' ? 'bg-pink-100 text-pink-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getTypeLabel(item.type)}
                        </span>
                        <span className="text-sm text-gray-500">
                          de {item.metadata.source}
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">
                          {item.reportCount} reporte{item.reportCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </div>

                    <div className="mt-2">
                      {item.title && (
                        <h4 className="text-lg font-medium text-gray-900 mb-1">
                          {item.title}
                        </h4>
                      )}
                      <p className="text-gray-700 line-clamp-3">
                        {item.content}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          Autor: <span className="font-medium">{item.author.email}</span>
                        </span>
                        {item.metadata.location && (
                          <span className="text-sm text-gray-500">
                            Ubicación: {item.metadata.location}
                          </span>
                        )}
                        {item.metadata.parentInfo && (
                          <span className="text-sm text-gray-500">
                            {item.metadata.parentInfo}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reports */}
                    <div className="mt-4 border-t pt-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Reportes:</h5>
                      <div className="space-y-2">
                        {item.reports.map((report) => (
                          <div key={report.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                  {report.status === 'PENDING' ? 'Pendiente' :
                                   report.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
                                </span>
                                <span className="text-sm text-gray-600">
                                  por {report.reporterEmail}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mt-1">
                                <strong>Razón:</strong> {report.reason}
                              </p>
                            </div>

                            {report.status === 'PENDING' && (
                              <div className="flex space-x-2 ml-4">
                                <button
                                  onClick={() => handleModerate(report.id, item.id, item.type, 'APPROVE')}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                >
                                  Aprobar
                                </button>
                                <button
                                  onClick={() => handleModerate(report.id, item.id, item.type, 'REJECT')}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                                >
                                  Rechazar
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay contenido reportado</h3>
              <p className="mt-1 text-sm text-gray-500">No se encontraron reportes con los filtros seleccionados.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6 rounded-lg shadow">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Página <span className="font-medium">{page}</span> de{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        page === i + 1
                          ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity Sidebar */}
        {stats && stats.recentActivity.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.type}:</span> {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Reportado por {activity.reporter} - {activity.reason}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.createdAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}