'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageTemplate } from '@/components/ui/PageTemplate';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { Bell, Search, Filter, Check, X, RefreshCw, ChevronLeft, ChevronRight, Settings } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  senderId?: string;
}

interface NotificationFilters {
  type: string;
  status: string;
  search: string;
}

export default function NotificacionsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<NotificationFilters>({
    type: 'all',
    status: 'all',
    search: ''
  });

  const notificationsPerPage = 20;

  // Cargar notificaciones
  const loadNotifications = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: notificationsPerPage.toString(),
        type: filters.type,
        status: filters.status,
        search: filters.search
      });

      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();

      if (response.ok) {
        setNotifications(data.notifications || []);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error('Error loading notifications:', data.error);
        // Fallback a datos mock en caso de error
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Fallback a datos mock en caso de error
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Marcar como leída/no leída
  const toggleReadStatus = async (notificationId: string, isRead: boolean) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: !isRead }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, isRead: !isRead }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Efectos
  useEffect(() => {
    loadNotifications();
  }, [currentPage, filters]);

  // Auto-refresh cada 60 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [currentPage, filters]);

  // Estadísticas para el header
  const statsData = [
    {
      label: 'Total',
      value: notifications.length.toString(),
      trend: '+0'
    },
    {
      label: 'No leídas',
      value: notifications.filter(n => !n.isRead).length.toString(),
      trend: ''
    },
    {
      label: 'Leídas',
      value: notifications.filter(n => n.isRead).length.toString(),
      trend: ''
    },
    {
      label: 'Esta semana',
      value: notifications.filter(n => {
        const notifDate = new Date(n.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return notifDate > weekAgo;
      }).length.toString(),
      trend: ''
    }
  ];

  // Función para obtener el icono según el tipo
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'COUPON_GENERATED':
        return '🎫';
      case 'COUPON_USED':
        return '✅';
      case 'OFFER_EXPIRING':
        return '⏰';
      case 'NEW_FAVORITE':
        return '❤️';
      default:
        return '🔔';
    }
  };

  // Función para obtener el color según el tipo
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'COUPON_GENERATED':
        return 'bg-green-50 border-green-200';
      case 'COUPON_USED':
        return 'bg-blue-50 border-blue-200';
      case 'OFFER_EXPIRING':
        return 'bg-orange-50 border-orange-200';
      case 'NEW_FAVORITE':
        return 'bg-pink-50 border-pink-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Ahora mismo';
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-ES');
  };


  if (loading) {
    return (
      <PageTemplate
        title="Notificaciones"
        subtitle="Gestiona todas tus notificaciones"
        statsData={[]}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando notificaciones...</span>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Notificaciones"
      subtitle="Gestiona todas tus notificaciones y mantente al día"
      statsData={statsData}
    >
      <div className="px-6 pb-6">
        {/* Barra de herramientas */}
        <UniversalCard
          variant="default"
          padding="lg"
          className="mb-6"
          middleZone={{
            title: "Gestión de Notificaciones",
            subtitle: "Filtra, busca y gestiona tus notificaciones",
            content: (
              <div className="space-y-4">
                {/* Filtros y búsqueda */}
                <div className="flex flex-wrap gap-4 items-center">
                  {/* Buscador */}
                  <div className="relative flex-1 min-w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar notificaciones..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>

                  {/* Filtro por tipo */}
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="COUPON_GENERATED">Cupones generados</option>
                    <option value="COUPON_USED">Cupones usados</option>
                    <option value="OFFER_EXPIRING">Ofertas expiran</option>
                    <option value="NEW_FAVORITE">Nuevos favoritos</option>
                  </select>

                  {/* Filtro por estado */}
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="unread">No leídas</option>
                    <option value="read">Leídas</option>
                  </select>

                  {/* Botones de acción */}
                  <Link
                    href="/dashboard/configuracio/preferencies"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="Configurar preferències"
                  >
                    <Settings className="w-4 h-4" />
                    Preferències
                  </Link>

                  <button
                    onClick={() => loadNotifications(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Actualizar
                  </button>

                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                    Marcar todas como leídas
                  </button>
                </div>
              </div>
            )
          }}
        />

        {/* Lista de notificaciones */}
        {notifications.length === 0 ? (
          <UniversalCard
            variant="default"
            padding="lg"
            className="text-center"
            middleZone={{
              content: (
                <div className="py-12">
                  <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay notificaciones
                  </h3>
                  <p className="text-gray-500">
                    {filters.search || filters.type !== 'all' || filters.status !== 'all'
                      ? 'No se encontraron notificaciones con los filtros aplicados.'
                      : 'Cuando recibas notificaciones aparecerán aquí.'
                    }
                  </p>
                </div>
              )
            }}
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <UniversalCard
                key={notification.id}
                variant="default"
                padding="md"
                className={`${getNotificationColor(notification.type)} ${
                  !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
                }`}
                middleZone={{
                  content: (
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {/* Icono */}
                        <div className="flex-shrink-0 text-2xl">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-medium ${
                              notification.isRead ? 'text-gray-600' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>

                          <p className={`text-sm ${
                            notification.isRead ? 'text-gray-500' : 'text-gray-700'
                          } mb-2`}>
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {formatDate(notification.createdAt)}
                            </span>

                            {notification.actionUrl && (
                              <a
                                href={notification.actionUrl}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Ver detalles →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botón de marcar como leída/no leída */}
                      <button
                        onClick={() => toggleReadStatus(notification.id, notification.isRead)}
                        className={`flex-shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors ${
                          notification.isRead ? 'text-gray-400' : 'text-blue-600'
                        }`}
                        title={notification.isRead ? 'Marcar como no leída' : 'Marcar como leída'}
                      >
                        {notification.isRead ? (
                          <X className="h-4 w-4" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )
                }}
              />
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <UniversalCard
            variant="default"
            padding="md"
            className="mt-6"
            middleZone={{
              content: (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </button>

                    <span className="text-sm text-gray-500 px-2">
                      {Math.min((currentPage - 1) * notificationsPerPage + 1, notifications.length)} - {Math.min(currentPage * notificationsPerPage, notifications.length)} de {notifications.length}
                    </span>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            }}
          />
        )}
      </div>
    </PageTemplate>
  );
}