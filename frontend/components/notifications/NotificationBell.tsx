'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Settings } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    image?: string;
  } | null;
}

interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  pagination: {
    total: number;
    unread: number;
    hasMore: boolean;
  };
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();

    // Polling cada 30 segundos para nuevas notificaciones
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=5');
      const data: NotificationResponse = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.pagination.unread);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });

      // Actualizar estado local
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));

    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT'
      });

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }

    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'COUPON_GENERATED':
        return '🎫';
      case 'COUPON_USED':
        return '✅';
      case 'OFFER_EXPIRING':
        return '⏰';
      case 'NEW_FAVORITE':
        return '❤️';
      case 'WEEKLY_SUMMARY':
        return '📊';
      case 'COMPANY_APPROVED':
        return '✅';
      case 'COMPANY_REJECTED':
        return '❌';
      default:
        return '🔔';
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ara mateix';
    if (minutes < 60) return `Fa ${minutes}m`;
    if (hours < 24) return `Fa ${hours}h`;
    return `Fa ${days}d`;
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notification-bell')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative notification-bell">
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Notificacions ${unreadCount > 0 ? `(${unreadCount} sense llegir)` : ''}`}
      >
        <Bell className="w-5 h-5 text-gray-600" />

        {/* Badge de notificaciones sin leer */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[32rem] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900">Notificacions</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Marcant...' : 'Marcar totes com llegides'}
                </button>
              )}
              <button
                onClick={() => setShowDropdown(false)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                aria-label="Tancar notificacions"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No tens notificacions</p>
                <p className="text-xs text-gray-400 mt-1">Les teves notificacions apareixeran aquí</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  {notification.actionUrl ? (
                    <Link
                      href={notification.actionUrl}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification.id);
                        }
                        setShowDropdown(false);
                      }}
                      className="block p-4"
                    >
                      <NotificationContent
                        notification={notification}
                        getIcon={getNotificationIcon}
                        formatTime={formatTime}
                      />
                    </Link>
                  ) : (
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      <NotificationContent
                        notification={notification}
                        getIcon={getNotificationIcon}
                        formatTime={formatTime}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t bg-gray-50">
              <Link
                href="/dashboard/notificacions"
                className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium p-3 hover:bg-gray-100 transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                Veure totes les notificacions
              </Link>

              {/* Enlace a preferencias */}
              <Link
                href="/dashboard/configuracio/preferencies"
                className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium p-3 hover:bg-gray-100 border-t transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <Settings className="w-4 h-4" />
                Configurar preferències
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Componente para el contenido de cada notificación
interface NotificationContentProps {
  notification: Notification;
  getIcon: (type: string) => string;
  formatTime: (dateString: string) => string;
}

function NotificationContent({ notification, getIcon, formatTime }: NotificationContentProps) {
  return (
    <div className="flex gap-3">
      {/* Icon */}
      <div className="text-2xl flex-shrink-0 mt-0.5">
        {getIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm line-clamp-1">
          {notification.title}
        </p>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
          {notification.message}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between mt-2">
          <p className="text-gray-400 text-xs">
            {formatTime(notification.createdAt)}
          </p>

          {/* Sender info */}
          {notification.sender && (
            <p className="text-xs text-gray-400">
              De {notification.sender.name}
            </p>
          )}
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );
}