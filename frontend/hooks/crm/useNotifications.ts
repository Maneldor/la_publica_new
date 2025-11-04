import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'reminder' | 'alert' | 'success' | 'info';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  leadId?: string;
  leadName?: string;
  actionType?: 'call' | 'email' | 'meeting' | 'follow_up';
  dueDate?: string;
  createdAt: string;
  read: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Generar notificaciones mock (en producción vendrían del backend)
  useEffect(() => {
    const generateMockNotifications = (): Notification[] => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      return [
        {
          id: '1',
          type: 'reminder',
          priority: 'high',
          title: 'Seguimiento urgente requerido',
          message: 'Tienes leads pendientes de seguimiento desde hace varios días',
          actionType: 'call',
          dueDate: now.toISOString(),
          createdAt: yesterday.toISOString(),
          read: false
        },
        {
          id: '2',
          type: 'alert',
          priority: 'high',
          title: 'Lead de alta prioridad inactivo',
          message: 'Digital Marketing SL (€25.000) no ha tenido actividad en 5 días',
          leadId: 'lead-2',
          leadName: 'Digital Marketing SL',
          actionType: 'email',
          dueDate: tomorrow.toISOString(),
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: '3',
          type: 'success',
          priority: 'medium',
          title: 'Lead convertido exitosamente',
          message: 'Innovación Empresarial SA se ha convertido en cliente',
          leadId: 'lead-3',
          leadName: 'Innovación Empresarial SA',
          createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: '4',
          type: 'reminder',
          priority: 'medium',
          title: 'Reunión programada para mañana',
          message: 'Reunión con Consultoria Estratégica BCN a las 10:00',
          leadId: 'lead-4',
          leadName: 'Consultoria Estratégica BCN',
          actionType: 'meeting',
          dueDate: tomorrow.toISOString(),
          createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
          read: true
        },
        {
          id: '5',
          type: 'info',
          priority: 'low',
          title: 'Nuevo lead asignado',
          message: 'Se te ha asignado el lead Desarrollo Web Plus',
          leadId: 'lead-5',
          leadName: 'Desarrollo Web Plus',
          createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
          read: true
        },
        {
          id: '6',
          type: 'reminder',
          priority: 'medium',
          title: 'Propuesta pendiente de envío',
          message: 'La propuesta para Servicios Integrales BCN está lista para enviar',
          leadId: 'lead-6',
          leadName: 'Servicios Integrales BCN',
          actionType: 'email',
          dueDate: nextWeek.toISOString(),
          createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
          read: true
        },
        {
          id: '7',
          type: 'alert',
          priority: 'high',
          title: 'Lead en riesgo de pérdida',
          message: 'Tecnología Avanzada SL no responde desde hace 7 días',
          leadId: 'lead-7',
          leadName: 'Tecnología Avanzada SL',
          actionType: 'call',
          dueDate: now.toISOString(),
          createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: '8',
          type: 'info',
          priority: 'low',
          title: 'Reporte semanal disponible',
          message: 'Tu reporte de actividad semanal está listo para revisar',
          createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
          read: true
        }
      ];
    };

    setNotifications(generateMockNotifications());
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Función para generar notificaciones automáticas basadas en datos del CRM
  const generateAutomaticNotifications = (leads: any[]) => {
    const now = new Date();
    const autoNotifications: Notification[] = [];

    leads.forEach(lead => {
      const lastActivity = lead.interactions?.length > 0
        ? new Date(lead.interactions[0].createdAt)
        : new Date(lead.createdAt);

      const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      // Lead sin actividad por más de 3 días
      if (daysSinceActivity >= 3 && lead.status !== 'converted' && lead.status !== 'lost') {
        autoNotifications.push({
          id: `auto-${lead.id}-inactive`,
          type: 'reminder',
          priority: daysSinceActivity >= 7 ? 'high' : 'medium',
          title: `Seguimiento requerido`,
          message: `${lead.companyName} lleva ${daysSinceActivity} días sin actividad`,
          leadId: lead.id,
          leadName: lead.companyName,
          actionType: 'call',
          dueDate: now.toISOString(),
          createdAt: now.toISOString(),
          read: false
        });
      }

      // Lead de alta prioridad sin conversión
      if (lead.priority === 'high' && lead.status !== 'converted' && daysSinceActivity >= 2) {
        autoNotifications.push({
          id: `auto-${lead.id}-priority`,
          type: 'alert',
          priority: 'high',
          title: 'Lead de alta prioridad requiere atención',
          message: `${lead.companyName} (Prioridad Alta) necesita seguimiento inmediato`,
          leadId: lead.id,
          leadName: lead.companyName,
          actionType: 'email',
          dueDate: now.toISOString(),
          createdAt: now.toISOString(),
          read: false
        });
      }

      // Próximas acciones vencidas
      lead.interactions?.forEach((interaction: any) => {
        if (interaction.nextAction && !interaction.nextActionCompleted && interaction.nextActionDate) {
          const actionDate = new Date(interaction.nextActionDate);
          if (actionDate <= now) {
            autoNotifications.push({
              id: `auto-${interaction.id}-overdue`,
              type: 'alert',
              priority: 'high',
              title: 'Acción vencida',
              message: `${interaction.nextAction} para ${lead.companyName} está vencida`,
              leadId: lead.id,
              leadName: lead.companyName,
              actionType: 'follow_up',
              dueDate: actionDate.toISOString(),
              createdAt: now.toISOString(),
              read: false
            });
          }
        }
      });
    });

    return autoNotifications;
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => !n.read && n.priority === 'high').length;

  return {
    notifications,
    unreadCount,
    urgentCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    generateAutomaticNotifications
  };
};