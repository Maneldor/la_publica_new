import { Notification, NotificationStats } from './types';

export function generateMockNotifications(): Notification[] {
  const now = new Date();
  const notifications: Notification[] = [
    // Mensajes
    {
      id: 'notif-1',
      tipus: 'missatge',
      titol: 'Nuevo mensaje en grupo',
      missatge: 'Maria Puig ha enviado un mensaje en el grupo "Desenvolupadors Web"',
      llegit: false,
      data_creacio: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      accio_url: '/dashboard/grups/desenvolupadors-web',
      accio_text: 'Ver grupo',
      emissor: {
        nom: 'Maria Puig',
        avatar: '👩‍💼',
        tipus: 'usuari'
      },
      metadades: {
        grup_id: 'grup-1',
        conversa_id: 'conv-123'
      },
      prioritat: 'normal'
    },
    {
      id: 'notif-2',
      tipus: 'missatge',
      titol: 'Respuesta a tu mensaje',
      missatge: 'Pere Soler ha respondido a tu mensaje en "Economia Social"',
      llegit: false,
      data_creacio: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      accio_url: '/dashboard/grups/economia-social',
      accio_text: 'Ver conversación',
      emissor: {
        nom: 'Pere Soler',
        avatar: '👨‍💻',
        tipus: 'usuari'
      },
      metadades: {
        grup_id: 'grup-2',
        conversa_id: 'conv-456'
      },
      prioritat: 'alta'
    },

    // Eventos y calendario
    {
      id: 'notif-3',
      tipus: 'event',
      titol: 'Recordatorio de evento',
      missatge: 'El curso "RGPD - Sesión 3" comienza en 1 hora',
      llegit: false,
      data_creacio: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      accio_url: '/dashboard/calendari',
      accio_text: 'Ver calendario',
      emissor: {
        nom: 'Sistema de Calendario',
        tipus: 'sistema'
      },
      metadades: {
        event_id: 'event-1'
      },
      prioritat: 'alta'
    },
    {
      id: 'notif-4',
      tipus: 'event',
      titol: 'Nuevo evento disponible',
      missatge: 'Se ha añadido el webinar "IA y Administración Pública" para mañana',
      llegit: true,
      data_creacio: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      accio_url: '/dashboard/calendari',
      accio_text: 'Ver evento',
      emissor: {
        nom: 'Administrador',
        tipus: 'admin'
      },
      metadades: {
        event_id: 'event-16'
      },
      prioritat: 'normal'
    },

    // Assessoraments
    {
      id: 'notif-5',
      tipus: 'assessorament',
      titol: 'Assessorament confirmado',
      missatge: 'Tu cita con Maria Puig para assessorament legal ha sido confirmada para mañana a las 10:00',
      llegit: false,
      data_creacio: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      accio_url: '/dashboard/assessoraments',
      accio_text: 'Ver assessoraments',
      emissor: {
        nom: 'Maria Puig',
        avatar: '⚖️',
        tipus: 'usuari'
      },
      metadades: {
        event_id: 'assess-1'
      },
      prioritat: 'alta'
    },

    // Grupos
    {
      id: 'notif-6',
      tipus: 'grup',
      titol: 'Invitación a grupo',
      missatge: 'Has sido invitado a unirte al grupo "Sostenibilitat i Medi Ambient"',
      llegit: false,
      data_creacio: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      accio_url: '/dashboard/grups/sostenibilitat',
      accio_text: 'Ver invitación',
      emissor: {
        nom: 'Joan Roca',
        avatar: '🌱',
        tipus: 'usuari'
      },
      metadades: {
        grup_id: 'grup-3'
      },
      prioritat: 'normal'
    },
    {
      id: 'notif-7',
      tipus: 'grup',
      titol: 'Nueva actividad en grupo',
      missatge: 'Se ha publicado una nueva propuesta en "Innovació Tecnològica"',
      llegit: true,
      data_creacio: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      accio_url: '/dashboard/grups/innovacio',
      accio_text: 'Ver propuesta',
      emissor: {
        nom: 'Grup Innovació',
        avatar: '💡',
        tipus: 'grup'
      },
      metadades: {
        grup_id: 'grup-4',
        post_id: 'post-123'
      },
      prioritat: 'baixa'
    },

    // Formación
    {
      id: 'notif-8',
      tipus: 'formacio',
      titol: 'Curso completado',
      missatge: 'Has completado exitosamente el curso "Excel Avanzado". Descarga tu certificado.',
      llegit: true,
      data_creacio: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      accio_url: '/dashboard/formacio/certificats',
      accio_text: 'Descargar certificado',
      emissor: {
        nom: 'Sistema de Formación',
        tipus: 'sistema'
      },
      metadades: {
        event_id: 'curs-excel'
      },
      prioritat: 'normal'
    },

    // Empresas
    {
      id: 'notif-9',
      tipus: 'empresa',
      titol: 'Nueva empresa en tu sector',
      missatge: 'TechSol BCN se ha registrado en tu sector de interés: Tecnología',
      llegit: true,
      data_creacio: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      accio_url: '/dashboard/empreses/techsol-bcn',
      accio_text: 'Ver empresa',
      emissor: {
        nom: 'TechSol BCN',
        avatar: '🏢',
        tipus: 'empresa'
      },
      metadades: {
        empresa_id: 'empresa-123'
      },
      prioritat: 'baixa'
    },

    // Anuncios
    {
      id: 'notif-10',
      tipus: 'anunci',
      titol: 'Anuncio importante',
      missatge: 'Nueva funcionalidad: Ya puedes exportar tu calendario a Google Calendar',
      llegit: false,
      data_creacio: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      accio_url: '/dashboard/calendari',
      accio_text: 'Probar función',
      emissor: {
        nom: 'Equipo La Pública',
        tipus: 'admin'
      },
      prioritat: 'normal'
    },

    // Sistema
    {
      id: 'notif-11',
      tipus: 'sistema',
      titol: 'Actualización de perfil',
      missatge: 'Tu perfil ha sido verificado exitosamente',
      llegit: true,
      data_creacio: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
      accio_url: '/dashboard/perfil',
      accio_text: 'Ver perfil',
      emissor: {
        nom: 'Sistema',
        tipus: 'sistema'
      },
      prioritat: 'baixa'
    }
  ];

  return notifications;
}

export function getNotificationStats(notifications: Notification[]): NotificationStats {
  const stats: NotificationStats = {
    total: notifications.length,
    no_llegits: notifications.filter(n => !n.llegit).length,
    per_tipus: {
      missatge: 0,
      event: 0,
      grup: 0,
      assessorament: 0,
      formacio: 0,
      empresa: 0,
      anunci: 0,
      sistema: 0
    }
  };

  notifications.forEach(notification => {
    stats.per_tipus[notification.tipus]++;
  });

  return stats;
}

export function getNotificationIcon(tipus: string): string {
  const icons = {
    missatge: '💬',
    event: '📅',
    grup: '👥',
    assessorament: '💼',
    formacio: '🎓',
    empresa: '🏢',
    anunci: '📢',
    sistema: '⚙️'
  };
  return icons[tipus as keyof typeof icons] || '📝';
}

export function getNotificationColor(tipus: string): string {
  const colors = {
    missatge: 'text-blue-600 bg-blue-50',
    event: 'text-green-600 bg-green-50',
    grup: 'text-purple-600 bg-purple-50',
    assessorament: 'text-orange-600 bg-orange-50',
    formacio: 'text-indigo-600 bg-indigo-50',
    empresa: 'text-gray-600 bg-gray-50',
    anunci: 'text-red-600 bg-red-50',
    sistema: 'text-gray-600 bg-gray-50'
  };
  return colors[tipus as keyof typeof colors] || 'text-gray-600 bg-gray-50';
}

export function getPriorityColor(prioritat: string): string {
  const colors = {
    baixa: 'border-gray-300',
    normal: 'border-blue-300',
    alta: 'border-orange-300',
    urgent: 'border-red-300'
  };
  return colors[prioritat as keyof typeof colors] || 'border-gray-300';
}