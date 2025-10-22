import { User, Message, Conversation } from '../types/chatTypes';

// Usuario actual
export const currentUser: User = {
  id: 1,
  name: 'Joan Martínez',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
  isOnline: true,
  lastSeen: 'En línia'
};

// Conversaciones de ejemplo
export const sampleConversations: Conversation[] = [
  {
    id: 1,
    type: 'individual',
    name: 'Maria González',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    lastMessage: {
      id: 1,
      conversationId: 1,
      senderId: 2,
      content: 'Perfecte! Ens veiem demà a les 10h 👍',
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
        id: 2,
        name: 'Maria González',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        isOnline: true,
        lastSeen: 'En línia'
      }
    ]
  },
  {
    id: 2,
    type: 'group',
    name: 'Equip Frontend',
    avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&h=150&fit=crop',
    lastMessage: {
      id: 2,
      conversationId: 2,
      senderId: 3,
      content: 'He actualitzat el component de navegació',
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
        id: 3,
        name: 'Anna Soler',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
        isOnline: false,
        lastSeen: 'Vist fa 2 hores'
      },
      {
        id: 4,
        name: 'Pere Camps',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
        isOnline: true,
        lastSeen: 'En línia'
      }
    ],
    groupInfo: {
      description: 'Grup de coordinació de l\'equip de desenvolupament frontend',
      admins: [1, 3],
      createdAt: new Date('2023-06-15')
    }
  },
  {
    id: 3,
    type: 'individual',
    name: 'Jordi Puig',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    lastMessage: {
      id: 3,
      conversationId: 3,
      senderId: 1,
      content: 'document_projecte.pdf',
      type: 'document',
      timestamp: new Date('2024-01-14T18:30:00'),
      status: 'read',
      attachments: [{
        id: 1,
        type: 'document',
        url: '#',
        name: 'document_projecte.pdf',
        size: 2457600
      }]
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: true,
    isArchived: false,
    participants: [
      {
        id: 5,
        name: 'Jordi Puig',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        isOnline: false,
        lastSeen: 'Vist ahir a les 23:15'
      }
    ]
  },
  {
    id: 4,
    type: 'company',
    name: 'Suport Tècnic',
    avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop',
    lastMessage: {
      id: 4,
      conversationId: 4,
      senderId: 6,
      content: 'El teu tiquet #4532 ha estat resolt',
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
        id: 6,
        name: 'Suport Tècnic',
        avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop',
        isOnline: true,
        lastSeen: 'En línia'
      }
    ]
  },
  {
    id: 5,
    type: 'individual',
    name: 'Carla Vidal',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    lastMessage: {
      id: 5,
      conversationId: 5,
      senderId: 7,
      content: 'Hola! Com va el projecte?',
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
        id: 7,
        name: 'Carla Vidal',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
        isOnline: false,
        lastSeen: 'Vist fa 1 hora'
      }
    ]
  }
];

// Mensajes de ejemplo para la conversación activa
export const sampleMessages: Message[] = [
  {
    id: 1,
    conversationId: 1,
    senderId: 2,
    content: 'Hola Joan! Com estàs?',
    type: 'text',
    timestamp: new Date('2024-01-15T09:00:00'),
    status: 'read'
  },
  {
    id: 2,
    conversationId: 1,
    senderId: 1,
    content: 'Hola Maria! Tot bé, gràcies 😊',
    type: 'text',
    timestamp: new Date('2024-01-15T09:05:00'),
    status: 'read'
  },
  {
    id: 3,
    conversationId: 1,
    senderId: 2,
    content: 'Tens temps demà per revisar el projecte?',
    type: 'text',
    timestamp: new Date('2024-01-15T09:10:00'),
    status: 'read'
  },
  {
    id: 4,
    conversationId: 1,
    senderId: 1,
    content: 'Sí, cap problema! A quina hora et va bé?',
    type: 'text',
    timestamp: new Date('2024-01-15T09:15:00'),
    status: 'read'
  },
  {
    id: 5,
    conversationId: 1,
    senderId: 2,
    content: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400',
    type: 'image',
    timestamp: new Date('2024-01-15T09:20:00'),
    status: 'read',
    attachments: [{
      id: 2,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400',
      thumbnail: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=200'
    }]
  },
  {
    id: 6,
    conversationId: 1,
    senderId: 2,
    content: 'Aquest és el disseny que hem de revisar',
    type: 'text',
    timestamp: new Date('2024-01-15T09:21:00'),
    status: 'read'
  },
  {
    id: 7,
    conversationId: 1,
    senderId: 1,
    content: 'Molt bon disseny! 👏',
    type: 'text',
    timestamp: new Date('2024-01-15T09:25:00'),
    status: 'read',
    reactions: [{ userId: 2, emoji: '❤️' }]
  },
  {
    id: 8,
    conversationId: 1,
    senderId: 2,
    content: 'Perfecte! Ens veiem demà a les 10h 👍',
    type: 'text',
    timestamp: new Date('2024-01-15T14:23:00'),
    status: 'read'
  }
];