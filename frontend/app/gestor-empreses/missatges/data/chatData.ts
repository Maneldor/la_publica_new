import { User, Message, Conversation } from '../types/chatTypes';

// Usuario actual - Gestor de empresas
export const currentUser: User = {
  id: '1',
  name: 'Gestor Comercial',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
  isOnline: true,
  lastSeen: 'En línia'
};

// Conversaciones de ejemplo - Adaptadas para gestor de empresas
export const sampleConversations: Conversation[] = [
  {
    id: '1',
    type: 'individual',
    name: 'Admin Principal',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    lastMessage: {
      id: '1',
      conversationId: '1',
      senderId: '2',
      content: 'Perfecte! Els leads estan actualitzats',
      type: 'text',
      timestamp: new Date('2024-01-15T14:23:00'),
      status: 'read'
    },
    unreadCount: 0,
    isPinned: true,
    isMuted: false,
    isArchived: false,
    participants: [
      {
        id: '2',
        name: 'Admin Principal',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        isOnline: true,
        lastSeen: 'En línia'
      }
    ]
  },
  {
    id: '2',
    type: 'group',
    name: 'Gestors Comercials',
    avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&h=150&fit=crop',
    lastMessage: {
      id: '2',
      conversationId: '2',
      senderId: '3',
      content: 'Hem tancat 5 leads aquesta setmana',
      type: 'text',
      timestamp: new Date('2024-01-15T13:45:00'),
      status: 'delivered'
    },
    unreadCount: 3,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    participants: [
      {
        id: '3',
        name: 'Anna Soler - Gestor',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
        isOnline: false,
        lastSeen: 'Vist fa 2 hores'
      },
      {
        id: '4',
        name: 'Pere Camps - Gestor',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
        isOnline: true,
        lastSeen: 'En línia'
      }
    ],
    groupInfo: {
      description: 'Grup de coordinació entre gestors comercials',
      admins: [1, 2],
      createdAt: new Date('2023-06-15')
    }
  },
  {
    id: '3',
    type: 'company',
    name: 'TechCorp Solutions',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    lastMessage: {
      id: '3',
      conversationId: '3',
      senderId: '1',
      content: 'proposta_comercial.pdf',
      type: 'document',
      timestamp: new Date('2024-01-14T18:30:00'),
      status: 'read',
      attachments: [{
        id: '1',
        type: 'document',
        url: '#',
        name: 'proposta_comercial.pdf',
        size: 2457600
      }]
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: true,
    isArchived: false,
    participants: [
      {
        id: '5',
        name: 'Jordi Puig - Director TechCorp',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        isOnline: false,
        lastSeen: 'Vist ahir a les 23:15'
      }
    ]
  },
  {
    id: '4',
    type: 'company',
    name: 'Innovació Digital SL',
    avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop',
    lastMessage: {
      id: '4',
      conversationId: '4',
      senderId: '6',
      content: 'Necessitem més informació sobre els serveis',
      type: 'text',
      timestamp: new Date('2024-01-13T10:00:00'),
      status: 'read'
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isArchived: true,
    participants: [
      {
        id: '6',
        name: 'Maria Valls - CEO',
        avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop',
        isOnline: true,
        lastSeen: 'En línia'
      }
    ]
  },
  {
    id: '5',
    type: 'individual',
    name: 'Carla Vidal - Gestor',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    lastMessage: {
      id: '5',
      conversationId: '5',
      senderId: '7',
      content: 'Com va el seguiment dels leads?',
      type: 'text',
      timestamp: new Date('2024-01-15T11:30:00'),
      status: 'delivered'
    },
    unreadCount: 2,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    participants: [
      {
        id: '7',
        name: 'Carla Vidal - Gestor',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
        isOnline: false,
        lastSeen: 'Vist fa 1 hora'
      }
    ]
  }
];

// Mensajes de ejemplo para la conversación activa - Contexto CRM
export const sampleMessages: Message[] = [
  {
    id: '1',
    conversationId: '1',
    senderId: '2',
    content: 'Hola! Com van els nous leads aquesta setmana?',
    type: 'text',
    timestamp: new Date('2024-01-15T09:00:00'),
    status: 'read'
  },
  {
    id: '2',
    conversationId: '1',
    senderId: '1',
    content: 'Molt bé! Hem tancat 3 deals i tenim 5 leads més en pipeline',
    type: 'text',
    timestamp: new Date('2024-01-15T09:05:00'),
    status: 'read'
  },
  {
    id: '3',
    conversationId: '1',
    senderId: '2',
    content: 'Excel·lent! Pots enviar-me el resum dels leads prioritaris?',
    type: 'text',
    timestamp: new Date('2024-01-15T09:10:00'),
    status: 'read'
  },
  {
    id: '4',
    conversationId: '1',
    senderId: '1',
    content: 'Clar! T\'envio l\'informe actualitzat ara mateix',
    type: 'text',
    timestamp: new Date('2024-01-15T09:15:00'),
    status: 'read'
  },
  {
    id: '5',
    conversationId: '1',
    senderId: '1',
    content: 'resum_leads_gener.pdf',
    type: 'document',
    timestamp: new Date('2024-01-15T09:20:00'),
    status: 'read',
    attachments: [{
      id: '2',
      type: 'document',
      url: '#',
      name: 'resum_leads_gener.pdf',
      size: 1248576
    }]
  },
  {
    id: '6',
    conversationId: '1',
    senderId: '2',
    content: 'Perfecte! Veig que TechCorp està molt interessada',
    type: 'text',
    timestamp: new Date('2024-01-15T09:21:00'),
    status: 'read'
  },
  {
    id: '7',
    conversationId: '1',
    senderId: '1',
    content: 'Sí! Tenen reunió programada per demà',
    type: 'text',
    timestamp: new Date('2024-01-15T09:25:00'),
    status: 'read',
    reactions: []
  },
  {
    id: '8',
    conversationId: '1',
    senderId: '2',
    content: 'Perfecte! Els leads estan actualitzats',
    type: 'text',
    timestamp: new Date('2024-01-15T14:23:00'),
    status: 'read'
  }
];