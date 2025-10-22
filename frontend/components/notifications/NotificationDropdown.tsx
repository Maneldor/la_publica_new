'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { generateMockNotifications, getNotificationIcon, getNotificationColor, getPriorityColor } from '@/lib/notifications/mockData';
import { Notification } from '@/lib/notifications/types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick: (notification: Notification) => void;
}

export function NotificationDropdown({ isOpen, onClose, onNotificationClick }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cargar notificaciones
    const mockNotifications = generateMockNotifications();
    setNotifications(mockNotifications);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Cerrar dropdown al hacer click fuera
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ara mateix';
    if (diffInMinutes < 60) return `Fa ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Fa ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Fa ${diffInDays} dies`;

    return date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' });
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

  const unreadNotifications = notifications.filter(n => !n.llegit);
  const recentNotifications = notifications
    .sort((a, b) => new Date(b.data_creacio).getTime() - new Date(a.data_creacio).getTime())
    .slice(0, 8);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-[100] max-h-[500px] overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Notificacions
          </h3>
          <div className="flex items-center gap-2">
            {unreadNotifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Marcar tot com llegit
              </button>
            )}
            <Link
              href="/dashboard/notificacions"
              onClick={onClose}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Veure tot
            </Link>
          </div>
        </div>

        {unreadNotifications.length > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            {unreadNotifications.length} notificacions sense llegir
          </p>
        )}
      </div>

      {/* Lista de notificaciones */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Carregant notificacions...
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">🔔</div>
            <p>No tens notificacions</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${getPriorityColor(notification.prioritat)} ${
                  !notification.llegit ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  markAsRead(notification.id);
                  onNotificationClick(notification);
                  onClose();
                }}
              >
                <div className="flex gap-3">
                  {/* Icono y tipo */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.tipus)}`}>
                    <span className="text-lg">
                      {getNotificationIcon(notification.tipus)}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-medium text-gray-900 line-clamp-1 ${
                        !notification.llegit ? 'font-semibold' : ''
                      }`}>
                        {notification.titol}
                      </h4>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTimeAgo(notification.data_creacio)}
                        </span>
                        {!notification.llegit && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.missatge}
                    </p>

                    {/* Emissor */}
                    {notification.emissor && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs">
                          {notification.emissor.avatar}
                        </span>
                        <span className="text-xs text-gray-500">
                          {notification.emissor.nom}
                        </span>
                      </div>
                    )}

                    {/* Acción */}
                    {notification.accio_text && (
                      <div className="mt-2">
                        <span className="text-xs text-blue-600 font-medium">
                          {notification.accio_text} →
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {recentNotifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <Link
            href="/dashboard/notificacions"
            onClick={onClose}
            className="block w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Veure totes les notificacions
          </Link>
        </div>
      )}
    </div>
  );
}