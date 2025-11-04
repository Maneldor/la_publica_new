'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const useRealNotifications = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar notificaciones reales desde el backend
  const loadNotifications = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/crm/notifications`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
      } else {
        console.error('Error cargando notificaciones:', response.statusText);
        // Fallback a array vacío si hay error
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [session]);

  const markAsRead = async (id: string) => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/crm/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === id
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/crm/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, isRead: true }))
        );
      }
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/crm/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: session.user.id,
          ...notification
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(prev => [data.data, ...prev]);
      }
    } catch (error) {
      console.error('Error creando notificación:', error);
    }
  };

  const generateAutomaticNotifications = async () => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/crm/notifications/generate-automatic`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${data.mensaje}`);
        // Recargar notificaciones para mostrar las nuevas
        await loadNotifications();
      }
    } catch (error) {
      console.error('Error generando notificaciones automáticas:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => !n.isRead && n.priority === 'HIGH').length;

  return {
    notifications,
    loading,
    unreadCount,
    urgentCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    generateAutomaticNotifications,
    reload: loadNotifications
  };
};