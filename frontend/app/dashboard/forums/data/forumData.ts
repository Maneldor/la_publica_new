import { Post, StatsData } from '../types/forumTypes';

// Datos de ejemplo de posts del forum
export const samplePosts: Post[] = [
  {
    id: 1,
    title: 'Implementació de la nova plataforma de gestió documental',
    content: 'Necessito orientació sobre la implementació de la nova plataforma de gestió documental que s\'ha aprovat recentment. Quines són les millors pràctiques per a la migració de documents existents?',
    author: 'Maria González',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b593?w=100&h=100&fit=crop&crop=face',
    category: 'Tecnologia i Innovació',
    tags: ['gestió documental', 'digitalització', 'migració'],
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
    createdAt: '2025-01-07T10:30:00Z',
    lastActivity: 'fa 2 hores',
    commentsCount: 12,
    votesUp: 8,
    votesDown: 1,
    isFollowing: true,
    isPinned: false,
    hasAttachments: true,
    attachments: [
      { name: 'guia_migracio.pdf', type: 'pdf', size: '2.1 MB' },
      { name: 'checklist.xlsx', type: 'excel', size: '0.8 MB' }
    ]
  },
  {
    id: 2,
    title: 'Protocols de teletreball per a funcionaris',
    content: 'Amb la nova normativa de teletreball, necessitem establir protocols clars per als funcionaris. Comparteixo aquesta proposta inicial i busco comentaris i suggeriments.',
    author: 'Joan Martín',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    category: 'Gestió Pública',
    tags: ['teletreball', 'protocols', 'normativa'],
    coverImage: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=200&fit=crop',
    createdAt: '2025-01-07T09:15:00Z',
    lastActivity: 'fa 1 hora',
    commentsCount: 18,
    votesUp: 15,
    votesDown: 2,
    isFollowing: false,
    isPinned: true,
    hasAttachments: false,
    attachments: []
  },
  {
    id: 3,
    title: 'Formació en ciberseguretat per a empleats públics',
    content: 'S\'ha detectat un increment en els intents de phishing dirigits a empleats públics. Proposem un programa de formació especialitzat. Adjunto materials de referència.',
    author: 'Laura Puig',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    category: 'Formació i Desenvolupament',
    tags: ['ciberseguretat', 'formació', 'phishing'],
    coverImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop',
    createdAt: '2025-01-07T08:45:00Z',
    lastActivity: 'fa 3 hores',
    commentsCount: 9,
    votesUp: 12,
    votesDown: 0,
    isFollowing: true,
    isPinned: false,
    hasAttachments: true,
    attachments: [
      { name: 'manual_ciberseguretat.pdf', type: 'pdf', size: '5.2 MB' },
      { name: 'exemples_phishing.png', type: 'image', size: '1.1 MB' }
    ]
  },
  {
    id: 4,
    title: 'Consulta sobre aplicació de la Llei de Transparència',
    content: 'Tinc dubtes sobre com aplicar correctament alguns aspectes de la Llei de Transparència en processos de contractació pública. Algú té experiència similar?',
    author: 'David Ferrer',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    category: 'Normativa i Legislació',
    tags: ['transparència', 'contractació', 'legislació'],
    coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=200&fit=crop',
    createdAt: '2025-01-06T16:20:00Z',
    lastActivity: 'ahir',
    commentsCount: 6,
    votesUp: 5,
    votesDown: 0,
    isFollowing: false,
    isPinned: false,
    hasAttachments: false,
    attachments: []
  },
  {
    id: 5,
    title: 'Avaluació del rendiment dels funcionaris: noves metodologies',
    content: 'Estem revisant els sistemes d\'avaluació del rendiment. He investigat noves metodologies que podrien ser més efectives. Comparteixo els resultats de l\'estudi.',
    author: 'Anna Soler',
    authorAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face',
    category: 'Recursos Humans',
    tags: ['avaluació', 'rendiment', 'metodologies'],
    coverImage: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=400&h=200&fit=crop',
    createdAt: '2025-01-06T14:10:00Z',
    lastActivity: 'ahir',
    commentsCount: 14,
    votesUp: 11,
    votesDown: 1,
    isFollowing: true,
    isPinned: false,
    hasAttachments: true,
    attachments: [
      { name: 'estudi_avaluacio.pdf', type: 'pdf', size: '3.7 MB' },
      { name: 'plantilla_avaluacio.docx', type: 'word', size: '0.5 MB' }
    ]
  },
  {
    id: 6,
    title: 'Optimització de processos administratius amb IA',
    content: 'Proposem l\'ús d\'intel·ligència artificial per optimitzar alguns processos administratius repetitius. Busquem feedback sobre la viabilitat i possibles riscos.',
    author: 'Carla Roca',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b593?w=100&h=100&fit=crop&crop=face',
    category: 'Tecnologia i Innovació',
    tags: ['IA', 'automatització', 'processos'],
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop',
    createdAt: '2025-01-06T11:30:00Z',
    lastActivity: 'fa 2 dies',
    commentsCount: 21,
    votesUp: 18,
    votesDown: 3,
    isFollowing: false,
    isPinned: false,
    hasAttachments: true,
    attachments: [
      { name: 'proposta_ia.pdf', type: 'pdf', size: '4.1 MB' }
    ]
  }
];

export const statsData: StatsData[] = [
  { label: 'Total Fòrums', value: '156', trend: '+12%' },
  { label: 'Els Meus Fòrums', value: '8', trend: '+2' },
  { label: 'Nous Avui', value: '7', trend: '+3' },
  { label: 'Comentaris Total', value: '892', trend: '+25%' }
];