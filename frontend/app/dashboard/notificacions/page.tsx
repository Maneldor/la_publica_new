'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateMockNotifications, getNotificationIcon, getNotificationColor, getPriorityColor, getNotificationStats } from '@/lib/notifications/mockData';
import { Notification } from '@/lib/notifications/types';

export default function NotificacionsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    // Cargar notificaciones
    const mockNotifications = generateMockNotifications();
    setNotifications(mockNotifications);
    setFilteredNotifications(mockNotifications);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = notifications;

    // Filtrar por tipo
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(notif => notif.tipus === selectedFilter);
    }

    // Filtrar por estado
    if (selectedStatus === 'unread') {
      filtered = filtered.filter(notif => !notif.llegit);
    } else if (selectedStatus === 'read') {
      filtered = filtered.filter(notif => notif.llegit);
    }

    // Ordenar por fecha (más recientes primero)
    filtered = filtered.sort((a, b) =>
      new Date(b.data_creacio).getTime() - new Date(a.data_creacio).getTime()
    );

    setFilteredNotifications(filtered);
  }, [notifications, selectedFilter, selectedStatus]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ara mateix';
    if (diffInMinutes < 60) return `Fa ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Fa ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return date.toLocaleDateString('ca-ES', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    return date.toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, llegit: true }
          : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, llegit: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como leído
    if (!notification.llegit) {
      markAsRead(notification.id);
    }

    // Navegar si tiene URL
    if (notification.accio_url) {
      window.location.href = notification.accio_url;
    }
  };

  const stats = getNotificationStats(notifications);
  const unreadCount = notifications.filter(n => !n.llegit).length;

  const filterOptions = [
    { value: 'all', label: 'Totes', icon: '📝' },
    { value: 'missatge', label: 'Missatges', icon: '💬' },
    { value: 'event', label: 'Events', icon: '📅' },
    { value: 'grup', label: 'Grups', icon: '👥' },
    { value: 'assessorament', label: 'Assessoraments', icon: '💼' },
    { value: 'formacio', label: 'Formació', icon: '🎓' },
    { value: 'empresa', label: 'Empreses', icon: '🏢' },
    { value: 'anunci', label: 'Anuncis', icon: '📢' },
    { value: 'sistema', label: 'Sistema', icon: '⚙️' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Carregant notificacions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🔔 Notificacions</h1>
            <p className="text-gray-600">
              Gestiona totes les teves notificacions i actualitzacions
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Marcar tot com llegit
              </button>
            )}
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Tornar al dashboard
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total notificacions</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{stats.no_llegits}</div>
            <div className="text-sm text-gray-600">Sense llegir</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.per_tipus.missatge}</div>
            <div className="text-sm text-gray-600">Missatges</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.per_tipus.event}</div>
            <div className="text-sm text-gray-600">Events</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipus
            </label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estat
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Totes</option>
              <option value="unread">Sense llegir</option>
              <option value="read">Llegides</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedFilter('all');
                setSelectedStatus('all');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Netejar filtres
            </button>
          </div>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hi ha notificacions
            </h3>
            <p>
              {selectedFilter !== 'all' || selectedStatus !== 'all'
                ? 'No hi ha notificacions que coincideixin amb els filtres seleccionats.'
                : 'Quan rebis notificacions, apareixeran aquí.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 cursor-pointer transition-all border-l-4 ${getPriorityColor(notification.prioritat)} ${
                  !notification.llegit ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-4">
                  {/* Icono y tipo */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getNotificationColor(notification.tipus)}`}>
                    <span className="text-xl">
                      {getNotificationIcon(notification.tipus)}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={`text-lg font-medium text-gray-900 mb-1 ${
                          !notification.llegit ? 'font-semibold' : ''
                        }`}>
                          {notification.titol}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {notification.missatge}
                        </p>

                        {/* Emissor */}
                        {notification.emissor && (
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">
                              {notification.emissor.avatar}
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                              {notification.emissor.nom}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getNotificationColor(notification.emissor.tipus)}`}>
                              {notification.emissor.tipus}
                            </span>
                          </div>
                        )}

                        {/* Acción */}
                        {notification.accio_text && (
                          <div className="mb-3">
                            <span className="text-sm text-blue-600 font-medium">
                              {notification.accio_text} →
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Fecha y acciones */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {formatDate(notification.data_creacio)}
                          </span>
                          {!notification.llegit && (
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {!notification.llegit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded"
                            >
                              Marcar llegit
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
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