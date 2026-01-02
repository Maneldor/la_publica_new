'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  createdAt: Date;
  read: boolean;
  sender?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  hasWarnings: boolean;
  hasErrors: boolean;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasWarnings, setHasWarnings] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/empresa/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setHasWarnings(data.hasWarnings || false);
        setHasErrors(data.hasErrors || false);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    // Actualizar estado local inmediatamente
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Persistir al servidor (solo si es una notificación real de BD, no generada)
      if (!id.startsWith('trial-') && !id.startsWith('limit-')) {
        try {
          await fetch('/api/empresa/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: id })
          });
        } catch (error) {
          console.error('Error marcant notificació com a llegida:', error);
        }
      }
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    // Persistir al servidor
    try {
      await fetch('/api/empresa/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      });
    } catch (error) {
      console.error('Error marcant totes com a llegides:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    // Solo eliminar notificaciones reales de BD
    if (id.startsWith('trial-') || id.startsWith('limit-')) {
      // Las notificaciones generadas dinámicamente no se pueden eliminar
      return;
    }

    setNotifications(prev => prev.filter(n => n.id !== id));

    try {
      await fetch(`/api/empresa/notifications?id=${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error eliminant notificació:', error);
      // Recargar para restaurar el estado
      fetchNotifications();
    }
  };

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast(message, { icon: '⚠️' });
        break;
      default:
        toast(message);
        break;
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        hasWarnings,
        hasErrors,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        showToast
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}