'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  User,
  Filter,
  Send
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'REMINDER' | 'ALERT' | 'SUCCESS' | 'INFO';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  leadId?: string;
  actionType?: string;
  actionUrl?: string;
  dueDate?: string;
  createdAt: string;
  isRead: boolean;
  lead?: {
    id: string;
    companyName: string;
  };
  company?: {
    id: string;
    name: string;
  };
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onRefresh?: () => void;
}

export default function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  onRefresh
}: NotificationCenterProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let filtered = notifications;

    switch (filter) {
      case 'unread':
        filtered = notifications.filter(n => !n.isRead);
        break;
      case 'high':
        filtered = notifications.filter(n => n.priority === 'HIGH');
        break;
      default:
        filtered = notifications;
    }

    // Ordenar por prioridad y fecha
    filtered.sort((a, b) => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredNotifications(filtered);
  }, [notifications, filter]);

  const getNotificationIcon = (type: string, actionType?: string) => {
    if (actionType) {
      switch (actionType) {
        case 'call': return <Phone className="h-4 w-4" />;
        case 'email': return <Mail className="h-4 w-4" />;
        case 'meeting': return <Calendar className="h-4 w-4" />;
        default: return <Clock className="h-4 w-4" />;
      }
    }

    switch (type) {
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'info': return <TrendingUp className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColors = (type: string, priority: string) => {
    if (priority === 'HIGH') {
      return 'bg-red-50 border-red-200 text-red-800';
    }

    switch (type) {
      case 'ALERT':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'SUCCESS':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'INFO':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${diffDays}d`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                router.push('/gestor-empreses/missatges');
                onClose();
              }}
              className="p-2 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50"
              title="Abrir mensajería"
            >
              <Send className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrar:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              No leídas ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                filter === 'high'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Urgentes
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>

        {/* Lista de notificaciones */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay notificaciones</p>
              <p className="text-sm text-gray-400 mt-1">
                {filter === 'unread' && 'Todas las notificaciones están leídas'}
                {filter === 'high' && 'No hay notificaciones urgentes'}
                {filter === 'all' && 'Manténte al día con las actividades de tu CRM'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      onMarkAsRead(notification.id);
                    }
                    onNotificationClick?.(notification);
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${getNotificationColors(notification.type, notification.priority)}`}>
                      {getNotificationIcon(notification.type, notification.actionType)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>

                      {(notification.lead?.companyName || notification.company?.name) && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                          <User className="h-3 w-3" />
                          <span>{notification.lead?.companyName || notification.company?.name}</span>
                        </div>
                      )}

                      {notification.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-orange-600 mb-2">
                          <Clock className="h-3 w-3" />
                          <span>Vence: {new Date(notification.dueDate).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                        {notification.priority === 'HIGH' && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Urgente
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </>
  );
}