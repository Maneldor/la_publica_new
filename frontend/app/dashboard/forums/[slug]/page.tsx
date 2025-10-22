'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageTemplate } from '../../../../components/ui/PageTemplate';

// Tipos e interfaces
interface User {
  id: number;
  username: string;
  name: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'member';
  joinDate: string;
  postCount: number;
  likesReceived: number;
  isOnline: boolean;
}

interface ForumPost {
  id: number;
  authorId: number;
  content: string;
  createdAt: Date;
  editedAt?: Date;
  upvotes: number;
  downvotes: number;
  attachments?: Attachment[];
  parentId?: number; // Para respuestas anidadas
  isBestAnswer?: boolean;
  userVote?: 'up' | 'down' | null;
  mentions?: number[];
}

interface Attachment {
  id: number;
  type: 'image' | 'document' | 'video';
  url: string;
  name: string;
  size: number;
  thumbnail?: string;
}

interface ForumTopic {
  id: number;
  slug: string;
  title: string;
  category: string;
  categoryColor: string;
  authorId: number;
  originalPost: ForumPost;
  replies: ForumPost[];
  createdAt: Date;
  lastReplyAt: Date;
  viewCount: number;
  replyCount: number;
  upvotes: number;
  downvotes: number;
  isPinned: boolean;
  isClosed: boolean;
  isResolved: boolean;
  tags: string[];
  userVote?: 'up' | 'down' | null;
  isFollowing?: boolean;
  isSaved?: boolean;
}

// Datos de ejemplo
const sampleUsers: User[] = [
  {
    id: 1,
    username: 'joan_martin',
    name: 'Joan Martín',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    role: 'member',
    joinDate: 'Gen 2024',
    postCount: 124,
    likesReceived: 567,
    isOnline: true
  },
  {
    id: 2,
    username: 'maria_dev',
    name: 'Maria González',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    role: 'admin',
    joinDate: 'Set 2023',
    postCount: 892,
    likesReceived: 2341,
    isOnline: true
  },
  {
    id: 3,
    username: 'laura_puig',
    name: 'Laura Puig',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    role: 'moderator',
    joinDate: 'Nov 2023',
    postCount: 456,
    likesReceived: 1234,
    isOnline: false
  },
  {
    id: 4,
    username: 'pere_camps',
    name: 'Pere Camps',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    role: 'member',
    joinDate: 'Abr 2024',
    postCount: 67,
    likesReceived: 234,
    isOnline: true
  }
];

const sampleTopic: ForumTopic = {
  id: 1,
  slug: 'protocols-teletreball-funcionaris',
  title: 'Protocols de teletreball per a funcionaris',
  category: 'Gestió Pública',
  categoryColor: '#3b82f6',
  authorId: 1,
  originalPost: {
    id: 1,
    authorId: 1,
    content: `Amb la nova normativa de teletreball, necessitem establir protocols clars de connexió i disponibilitat per als funcionaris.

Comparteixo aquesta proposta de protocol que he estat desenvolupant:

## Punts clau del protocol:

1. **Horaris de connexió**: Mantenir els horaris habituals amb flexibilitat de ±2 hores
2. **Disponibilitat**: Resposta a emails en màxim 4 hores durant l'horari laboral
3. **Reunions virtuals**: Obligatòries les setmanals d'equip, opcionals les altres
4. **Seguiment de tasques**: Ús d'eines col·laboratives (Trello, Asana, etc.)

Què us sembla? Teniu altres propostes o millores?`,
    createdAt: new Date('2024-01-15T10:00:00'),
    upvotes: 45,
    downvotes: 2,
    userVote: null,
    attachments: [
      {
        id: 1,
        type: 'document',
        url: '#',
        name: 'Protocol_Teletreball_v1.pdf',
        size: 2457600
      }
    ]
  },
  replies: [
    {
      id: 2,
      authorId: 2,
      content: 'Molt bona proposta Joan! Jo afegiria també la necessitat de tenir un espai de treball adequat a casa, amb connexió estable i sense interrupcions.',
      createdAt: new Date('2024-01-15T10:30:00'),
      upvotes: 12,
      downvotes: 0,
      userVote: null,
      isBestAnswer: true
    },
    {
      id: 3,
      authorId: 3,
      content: 'Totalment d\'acord amb Maria. També caldria definir els criteris per determinar quins treballs són aptes per al teletreball.',
      createdAt: new Date('2024-01-15T10:45:00'),
      upvotes: 8,
      downvotes: 1,
      userVote: null,
      parentId: 2
    },
    {
      id: 4,
      authorId: 4,
      content: 'En el meu departament ja hem implementat quelcom similar. Us puc compartir la nostra experiència si us interessa.',
      createdAt: new Date('2024-01-15T11:00:00'),
      upvotes: 6,
      downvotes: 0,
      userVote: null
    },
    {
      id: 5,
      authorId: 1,
      content: 'Gràcies per les aportacions! @maria_dev @laura_puig teniu raó sobre l\'espai de treball. Ho afegiré a la proposta.',
      createdAt: new Date('2024-01-15T11:15:00'),
      upvotes: 3,
      downvotes: 0,
      userVote: null,
      mentions: [2, 3]
    }
  ],
  createdAt: new Date('2024-01-15T10:00:00'),
  lastReplyAt: new Date('2024-01-15T11:15:00'),
  viewCount: 234,
  replyCount: 12,
  upvotes: 45,
  downvotes: 2,
  isPinned: true,
  isClosed: false,
  isResolved: false,
  tags: ['teletreball', 'protocols', 'gestió'],
  userVote: null,
  isFollowing: false,
  isSaved: false
};

export default function ForumTopicPage() {
  const params = useParams();
  const router = useRouter();
  const [topic, setTopic] = useState<ForumTopic>(sampleTopic);
  const [loading, setLoading] = useState(false);
  const [users] = useState<User[]>(sampleUsers);
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ForumPost | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'oldest'>('popular');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const replyFormRef = useRef<HTMLTextAreaElement>(null);

  // Handle responsive design
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Obtener usuario por ID
  const getUserById = (id: number) => users.find(u => u.id === id);

  // Formatear tiempo
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `fa ${minutes} min`;
    } else if (hours < 24) {
      return `fa ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (days < 7) {
      return `fa ${days} dia${days > 1 ? 's' : ''}`;
    } else {
      // Formato manual para evitar hidratación mismatch
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Votar post
  const votePost = (postId: number, voteType: 'up' | 'down') => {
    if (postId === topic.originalPost.id) {
      setTopic(prev => ({
        ...prev,
        originalPost: {
          ...prev.originalPost,
          upvotes: voteType === 'up' && prev.originalPost.userVote !== 'up'
            ? prev.originalPost.upvotes + 1
            : voteType === 'up' && prev.originalPost.userVote === 'up'
            ? prev.originalPost.upvotes - 1
            : prev.originalPost.upvotes,
          downvotes: voteType === 'down' && prev.originalPost.userVote !== 'down'
            ? prev.originalPost.downvotes + 1
            : voteType === 'down' && prev.originalPost.userVote === 'down'
            ? prev.originalPost.downvotes - 1
            : prev.originalPost.downvotes,
          userVote: prev.originalPost.userVote === voteType ? null : voteType
        }
      }));
    } else {
      setTopic(prev => ({
        ...prev,
        replies: prev.replies.map(reply => {
          if (reply.id === postId) {
            return {
              ...reply,
              upvotes: voteType === 'up' && reply.userVote !== 'up'
                ? reply.upvotes + 1
                : voteType === 'up' && reply.userVote === 'up'
                ? reply.upvotes - 1
                : reply.upvotes,
              downvotes: voteType === 'down' && reply.userVote !== 'down'
                ? reply.downvotes + 1
                : voteType === 'down' && reply.userVote === 'down'
                ? reply.downvotes - 1
                : reply.downvotes,
              userVote: reply.userVote === voteType ? null : voteType
            };
          }
          return reply;
        })
      }));
    }
  };

  // Marcar como mejor respuesta
  const markAsBestAnswer = (postId: number) => {
    setTopic(prev => ({
      ...prev,
      replies: prev.replies.map(reply => ({
        ...reply,
        isBestAnswer: reply.id === postId ? !reply.isBestAnswer : false
      }))
    }));
  };

  // Publicar respuesta
  const submitReply = () => {
    if (!replyText.trim()) return;

    const newReply: ForumPost = {
      id: Date.now(),
      authorId: 1, // Usuario actual
      content: replyText,
      createdAt: new Date(),
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      parentId: replyingTo?.id
    };

    setTopic(prev => ({
      ...prev,
      replies: [...prev.replies, newReply],
      replyCount: prev.replyCount + 1,
      lastReplyAt: new Date()
    }));

    setReplyText('');
    setShowReplyForm(false);
    setReplyingTo(null);
  };

  // Alternar seguimiento
  const toggleFollow = () => {
    setTopic(prev => ({
      ...prev,
      isFollowing: !prev.isFollowing
    }));
  };

  // Alternar guardado
  const toggleSave = () => {
    setTopic(prev => ({
      ...prev,
      isSaved: !prev.isSaved
    }));
  };

  // Filtrar y ordenar respuestas
  const sortedReplies = [...topic.replies]
    .filter(reply => !searchTerm || reply.content.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        default:
          return 0;
      }
    });

  // Separar respuestas padre e hijas
  const parentReplies = sortedReplies.filter(reply => !reply.parentId);
  const childReplies = sortedReplies.filter(reply => reply.parentId);

  const author = getUserById(topic.authorId);
  const currentUser = getUserById(1); // Usuario actual

  const statsData = [
    { label: 'Vistes', value: topic.viewCount.toString(), trend: '+5%' },
    { label: 'Respostes', value: topic.replyCount.toString(), trend: `+${topic.replies.length}` },
    { label: 'Vots', value: (topic.upvotes - topic.downvotes).toString(), trend: topic.upvotes > topic.downvotes ? '+' : '' },
    { label: 'Participants', value: new Set([topic.authorId, ...topic.replies.map(r => r.authorId)]).size.toString(), trend: '' }
  ];

  return (
    <PageTemplate
      title="Fòrum"
      subtitle="Discussió i col·laboració"
      statsData={statsData}
    >
      <div style={{
        padding: '0 24px 24px 24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Breadcrumb */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
          fontSize: '14px',
          color: '#6c757d'
        }}>
          <button
            onClick={() => router.push('/dashboard/forums')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Fòrums
          </button>
          <span>›</span>
          <button
            onClick={() => router.push(`/dashboard/forums?category=${encodeURIComponent(topic.category)}`)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {topic.category}
          </button>
          <span>›</span>
          <span style={{ fontWeight: '500', color: '#2c3e50' }}>
            {topic.title.length > 50 ? topic.title.substring(0, 50) + '...' : topic.title}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 300px',
          gap: '24px'
        }}>
          {/* Contenido principal */}
          <div>
            {/* Header del tema */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}>
              {/* Badges y acciones */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {topic.isPinned && (
                    <span style={{
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      📌 Fixat
                    </span>
                  )}
                  {topic.isClosed && (
                    <span style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      🔒 Tancat
                    </span>
                  )}
                  {topic.isResolved && (
                    <span style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      ✓ Resolt
                    </span>
                  )}
                  <span style={{
                    backgroundColor: topic.categoryColor,
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {topic.category}
                  </span>
                </div>

                {/* Botons d'acció */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <button
                    onClick={toggleFollow}
                    style={{
                      backgroundColor: topic.isFollowing ? '#10b981' : 'transparent',
                      color: topic.isFollowing ? 'white' : '#6c757d',
                      border: `1px solid ${topic.isFollowing ? '#10b981' : '#e9ecef'}`,
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    ⭐ {topic.isFollowing ? 'Seguint' : 'Seguir'}
                  </button>

                  <button
                    onClick={toggleSave}
                    style={{
                      backgroundColor: 'transparent',
                      color: topic.isSaved ? '#3b82f6' : '#6c757d',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px',
                      fontSize: '16px',
                      cursor: 'pointer'
                    }}
                    title={topic.isSaved ? 'Desat' : 'Desar'}
                  >
                    🔖
                  </button>

                  <button
                    style={{
                      backgroundColor: 'transparent',
                      color: '#6c757d',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px',
                      fontSize: '16px',
                      cursor: 'pointer'
                    }}
                    title="Compartir"
                  >
                    🔗
                  </button>

                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowMoreOptions(!showMoreOptions)}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#6c757d',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px',
                        fontSize: '16px',
                        cursor: 'pointer'
                      }}
                    >
                      ⋮
                    </button>

                    {showMoreOptions && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        border: '1px solid #e9ecef',
                        padding: '8px 0',
                        minWidth: '180px',
                        zIndex: 10
                      }}>
                        <button style={{ width: '100%', padding: '8px 16px', backgroundColor: 'transparent', border: 'none', textAlign: 'left', fontSize: '14px', cursor: 'pointer' }}>
                          📝 Editar
                        </button>
                        <button style={{ width: '100%', padding: '8px 16px', backgroundColor: 'transparent', border: 'none', textAlign: 'left', fontSize: '14px', cursor: 'pointer' }}>
                          📌 Fixar
                        </button>
                        <button style={{ width: '100%', padding: '8px 16px', backgroundColor: 'transparent', border: 'none', textAlign: 'left', fontSize: '14px', cursor: 'pointer' }}>
                          🔒 Tancar
                        </button>
                        <button style={{ width: '100%', padding: '8px 16px', backgroundColor: 'transparent', border: 'none', textAlign: 'left', fontSize: '14px', cursor: 'pointer', color: '#ef4444' }}>
                          🚩 Reportar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Título */}
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#2c3e50',
                marginBottom: '16px',
                lineHeight: '1.3'
              }}>
                {topic.title}
              </h1>

              {/* Info del autor y estadísticas */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <img
                    src={author?.avatar}
                    alt={author?.name}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#2c3e50'
                    }}>
                      {author?.name}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      color: '#6c757d',
                      marginLeft: '8px'
                    }}>
                      • {formatTime(topic.createdAt)}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '14px',
                  color: '#6c757d'
                }}>
                  <span>👁️ {topic.viewCount} vistes</span>
                  <span>💬 {topic.replyCount} respostes</span>
                  <span>⬆️ {topic.upvotes - topic.downvotes} vots</span>
                </div>
              </div>

              {/* Tags */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {topic.tags.map((tag, index) => (
                  <button
                    key={index}
                    style={{
                      backgroundColor: '#f0f7ff',
                      color: '#3b82f6',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Post original */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '2px solid #3b82f6'
            }}>
              <div style={{
                display: 'flex',
                gap: '16px'
              }}>
                {/* Avatar i info de l'autor */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '80px'
                }}>
                  <img
                    src={author?.avatar}
                    alt={author?.name}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: '8px'
                    }}
                  />
                  <div style={{
                    textAlign: 'center',
                    fontSize: '12px'
                  }}>
                    <div style={{
                      fontWeight: '600',
                      color: '#2c3e50',
                      marginBottom: '2px'
                    }}>
                      {author?.name}
                    </div>
                    <div style={{
                      color: '#6c757d',
                      marginBottom: '4px'
                    }}>
                      @{author?.username}
                    </div>
                    <div style={{
                      color: '#6c757d',
                      marginBottom: '4px'
                    }}>
                      Membre des de {author?.joinDate}
                    </div>
                    <div style={{
                      color: '#6c757d'
                    }}>
                      {author?.postCount} posts • {author?.likesReceived} likes
                    </div>
                    {author?.role === 'admin' && (
                      <span style={{
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '500',
                        marginTop: '4px',
                        display: 'inline-block'
                      }}>
                        👑 Admin
                      </span>
                    )}
                    {author?.role === 'moderator' && (
                      <span style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '500',
                        marginTop: '4px',
                        display: 'inline-block'
                      }}>
                        🛡️ Moderador
                      </span>
                    )}
                  </div>
                </div>

                {/* Contingut del post */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '16px',
                    lineHeight: '1.6',
                    color: '#2c3e50',
                    marginBottom: '16px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {topic.originalPost.content}
                  </div>

                  {/* Adjunts */}
                  {topic.originalPost.attachments && topic.originalPost.attachments.length > 0 && (
                    <div style={{
                      marginBottom: '16px'
                    }}>
                      {topic.originalPost.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          style={{
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            borderRadius: '8px',
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}
                        >
                          <span style={{ fontSize: '24px' }}>📄</span>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontWeight: '500',
                              fontSize: '14px',
                              color: '#2c3e50'
                            }}>
                              {attachment.name}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#6c757d'
                            }}>
                              {formatFileSize(attachment.size)}
                            </div>
                          </div>
                          <button style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}>
                            Descarregar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Accions del post */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <button
                        onClick={() => votePost(topic.originalPost.id, 'up')}
                        style={{
                          backgroundColor: 'transparent',
                          color: topic.originalPost.userVote === 'up' ? '#3b82f6' : '#6c757d',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px',
                          fontSize: '16px',
                          cursor: 'pointer'
                        }}
                      >
                        ⬆️
                      </button>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#2c3e50',
                        minWidth: '24px',
                        textAlign: 'center'
                      }}>
                        {topic.originalPost.upvotes - topic.originalPost.downvotes}
                      </span>
                      <button
                        onClick={() => votePost(topic.originalPost.id, 'down')}
                        style={{
                          backgroundColor: 'transparent',
                          color: topic.originalPost.userVote === 'down' ? '#ef4444' : '#6c757d',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px',
                          fontSize: '16px',
                          cursor: 'pointer'
                        }}
                      >
                        ⬇️
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setReplyingTo(topic.originalPost);
                        setShowReplyForm(true);
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#6c757d',
                        border: '1px solid #e9ecef',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      💬 Respondre
                    </button>

                    <button
                      style={{
                        backgroundColor: 'transparent',
                        color: '#6c757d',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      🔗 Compartir
                    </button>

                    <button
                      style={{
                        backgroundColor: 'transparent',
                        color: '#6c757d',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      ⚑ Reportar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros y ordenación de respuestas */}
            {topic.replies.length > 0 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px 24px',
                marginBottom: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#2c3e50'
                  }}>
                    {topic.replyCount} respostes
                  </span>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'popular' | 'newest' | 'oldest')}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="popular">🔥 Més populars</option>
                    <option value="newest">🕐 Més recents</option>
                    <option value="oldest">🕑 Més antigues</option>
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Buscar en aquest tema..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    fontSize: '14px',
                    width: '200px'
                  }}
                />
              </div>
            )}

            {/* Respostes */}
            {parentReplies.map((reply) => {
              const replyAuthor = getUserById(reply.authorId);
              const replyChildren = childReplies.filter(child => child.parentId === reply.id);

              return (
                <div key={reply.id} style={{ marginBottom: '16px' }}>
                  {/* Resposta principal */}
                  <div style={{
                    backgroundColor: reply.isBestAnswer ? '#f0fdf4' : 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: reply.isBestAnswer ? '2px solid #10b981' : '1px solid #f0f0f0'
                  }}>
                    {reply.isBestAnswer && (
                      <div style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        marginBottom: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        ✓ Millor resposta
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      gap: '16px'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: '60px'
                      }}>
                        <img
                          src={replyAuthor?.avatar}
                          alt={replyAuthor?.name}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            marginBottom: '8px'
                          }}
                        />
                        <div style={{
                          textAlign: 'center',
                          fontSize: '11px'
                        }}>
                          <div style={{
                            fontWeight: '600',
                            color: '#2c3e50',
                            marginBottom: '2px'
                          }}>
                            {replyAuthor?.name}
                          </div>
                          <div style={{
                            color: '#6c757d'
                          }}>
                            @{replyAuthor?.username}
                          </div>
                          {replyAuthor?.id === topic.authorId && (
                            <span style={{
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              padding: '2px 4px',
                              borderRadius: '4px',
                              fontSize: '9px',
                              fontWeight: '500',
                              marginTop: '4px',
                              display: 'inline-block'
                            }}>
                              👨‍💼 Autor
                            </span>
                          )}
                          {replyAuthor?.role === 'admin' && (
                            <span style={{
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              padding: '2px 4px',
                              borderRadius: '4px',
                              fontSize: '9px',
                              fontWeight: '500',
                              marginTop: '4px',
                              display: 'inline-block'
                            }}>
                              👑 Admin
                            </span>
                          )}
                          {replyAuthor?.role === 'moderator' && (
                            <span style={{
                              backgroundColor: '#6c757d',
                              color: 'white',
                              padding: '2px 4px',
                              borderRadius: '4px',
                              fontSize: '9px',
                              fontWeight: '500',
                              marginTop: '4px',
                              display: 'inline-block'
                            }}>
                              🛡️ Mod
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '12px'
                        }}>
                          <span style={{
                            fontSize: '12px',
                            color: '#6c757d'
                          }}>
                            {formatTime(reply.createdAt)}
                          </span>
                        </div>

                        <div style={{
                          fontSize: '15px',
                          lineHeight: '1.6',
                          color: '#2c3e50',
                          marginBottom: '16px',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {reply.content}
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          paddingTop: '12px',
                          borderTop: '1px solid #f0f0f0'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <button
                              onClick={() => votePost(reply.id, 'up')}
                              style={{
                                backgroundColor: 'transparent',
                                color: reply.userVote === 'up' ? '#3b82f6' : '#6c757d',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '4px',
                                fontSize: '14px',
                                cursor: 'pointer'
                              }}
                            >
                              ⬆️
                            </button>
                            <span style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#2c3e50',
                              minWidth: '20px',
                              textAlign: 'center'
                            }}>
                              {reply.upvotes - reply.downvotes}
                            </span>
                            <button
                              onClick={() => votePost(reply.id, 'down')}
                              style={{
                                backgroundColor: 'transparent',
                                color: reply.userVote === 'down' ? '#ef4444' : '#6c757d',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '4px',
                                fontSize: '14px',
                                cursor: 'pointer'
                              }}
                            >
                              ⬇️
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              setReplyingTo(reply);
                              setShowReplyForm(true);
                            }}
                            style={{
                              backgroundColor: 'transparent',
                              color: '#6c757d',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            💬 Respondre
                          </button>

                          {(currentUser?.role === 'admin' || reply.authorId === topic.authorId) && !reply.isBestAnswer && (
                            <button
                              onClick={() => markAsBestAnswer(reply.id)}
                              style={{
                                backgroundColor: 'transparent',
                                color: '#10b981',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              📌 Millor resposta
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Respostes anidades */}
                  {replyChildren.map((childReply) => {
                    const childAuthor = getUserById(childReply.authorId);
                    return (
                      <div
                        key={childReply.id}
                        style={{
                          marginLeft: '40px',
                          marginTop: '12px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px',
                          padding: '16px',
                          border: '1px solid #e9ecef',
                          borderLeft: '3px solid #3b82f6'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          gap: '12px'
                        }}>
                          <img
                            src={childAuthor?.avatar}
                            alt={childAuthor?.name}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '8px'
                            }}>
                              <span style={{
                                fontWeight: '600',
                                fontSize: '14px',
                                color: '#2c3e50'
                              }}>
                                {childAuthor?.name}
                              </span>
                              <span style={{
                                fontSize: '12px',
                                color: '#6c757d'
                              }}>
                                {formatTime(childReply.createdAt)}
                              </span>
                            </div>

                            <div style={{
                              fontSize: '14px',
                              lineHeight: '1.6',
                              color: '#2c3e50',
                              marginBottom: '12px'
                            }}>
                              {childReply.content}
                            </div>

                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <button
                                  onClick={() => votePost(childReply.id, 'up')}
                                  style={{
                                    backgroundColor: 'transparent',
                                    color: childReply.userVote === 'up' ? '#3b82f6' : '#6c757d',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '2px',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  ⬆️
                                </button>
                                <span style={{
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  color: '#2c3e50'
                                }}>
                                  {childReply.upvotes - childReply.downvotes}
                                </span>
                                <button
                                  onClick={() => votePost(childReply.id, 'down')}
                                  style={{
                                    backgroundColor: 'transparent',
                                    color: childReply.userVote === 'down' ? '#ef4444' : '#6c757d',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '2px',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  ⬇️
                                </button>
                              </div>

                              <button
                                style={{
                                  backgroundColor: 'transparent',
                                  color: '#6c757d',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '2px 6px',
                                  fontSize: '11px',
                                  cursor: 'pointer'
                                }}
                              >
                                💬 Respondre
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Formulari de resposta */}
            {!topic.isClosed && (showReplyForm || true) && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                marginTop: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                {replyingTo && (
                  <div style={{
                    backgroundColor: '#f0f7ff',
                    borderLeft: '4px solid #3b82f6',
                    padding: '12px',
                    marginBottom: '16px',
                    borderRadius: '0 8px 8px 0'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#3b82f6',
                      fontWeight: '500',
                      marginBottom: '4px'
                    }}>
                      Responent a {getUserById(replyingTo.authorId)?.name}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6c757d',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {replyingTo.content.substring(0, 100)}...
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#3b82f6',
                        fontSize: '12px',
                        cursor: 'pointer',
                        marginTop: '4px'
                      }}
                    >
                      ✕ Cancel·lar resposta
                    </button>
                  </div>
                )}

                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '16px'
                }}>
                  Escriu la teva resposta
                </h3>

                <textarea
                  ref={replyFormRef}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Escriu la teva resposta aquí... Pots usar Markdown per al format."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />

                <div style={{
                  fontSize: '12px',
                  color: '#6c757d',
                  marginTop: '8px',
                  marginBottom: '16px'
                }}>
                  Markdown suportat: **bold** *italic* [link](url) `code`
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <button
                    style={{
                      backgroundColor: 'transparent',
                      color: '#6c757d',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    📎 Adjuntar fitxers
                  </button>

                  <div style={{
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <button
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#6c757d',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel·lar
                    </button>

                    <button
                      style={{
                        backgroundColor: '#f8f9fa',
                        color: '#6c757d',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Vista prèvia
                    </button>

                    <button
                      onClick={submitReply}
                      disabled={!replyText.trim()}
                      style={{
                        backgroundColor: replyText.trim() ? '#3b82f6' : '#e9ecef',
                        color: replyText.trim() ? 'white' : '#6c757d',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      Publicar resposta →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {topic.isClosed && (
              <div style={{
                backgroundColor: '#fef2f2',
                borderRadius: '12px',
                padding: '24px',
                marginTop: '24px',
                border: '1px solid #fecaca',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px'
                }}>
                  🔒
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#dc2626',
                  marginBottom: '8px'
                }}>
                  Aquest tema està tancat
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  margin: 0
                }}>
                  No s'accepten noves respostes en aquest tema
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {!isMobile && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              {/* Estadístiques del tema */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '16px'
                }}>
                  📊 Estadístiques
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Creat:</span>
                    <span>{formatTime(topic.createdAt)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Última resposta:</span>
                    <span>{formatTime(topic.lastReplyAt)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Vistes:</span>
                    <span>{topic.viewCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Respostes:</span>
                    <span>{topic.replyCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Participants:</span>
                    <span>{new Set([topic.authorId, ...topic.replies.map(r => r.authorId)]).size}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Vots:</span>
                    <span style={{ color: topic.upvotes > topic.downvotes ? '#10b981' : '#ef4444' }}>
                      {topic.upvotes - topic.downvotes} ({topic.upvotes} ⬆️ {topic.downvotes} ⬇️)
                    </span>
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '16px'
                }}>
                  👥 Participants ({new Set([topic.authorId, ...topic.replies.map(r => r.authorId)]).size})
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {Array.from(new Set([topic.authorId, ...topic.replies.map(r => r.authorId)]))
                    .map(userId => getUserById(userId))
                    .filter(Boolean)
                    .slice(0, 5)
                    .map((participant) => (
                      <div
                        key={participant!.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <img
                          src={participant!.avatar}
                          alt={participant!.name}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                        <span style={{
                          fontSize: '14px',
                          color: '#2c3e50'
                        }}>
                          {participant!.name}
                        </span>
                        {participant!.id === topic.authorId && (
                          <span style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '1px 4px',
                            borderRadius: '3px',
                            fontSize: '10px',
                            fontWeight: '500'
                          }}>
                            OP
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Etiquetes */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '16px'
                }}>
                  🏷️ Etiquetes
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {topic.tags.map((tag, index) => (
                    <button
                      key={index}
                      style={{
                        backgroundColor: '#f0f7ff',
                        color: '#3b82f6',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temes relacionats */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '16px'
                }}>
                  🔗 Temes similars
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {[
                    'Protocol de reunions virtuals',
                    'Normativa home office actualitzada',
                    'Horaris flexibles per funcionaris',
                    'Eines de productivitat recomanades'
                  ].map((relatedTopic, index) => (
                    <button
                      key={index}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#3b82f6',
                        fontSize: '14px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        textDecoration: 'underline'
                      }}
                    >
                      • {relatedTopic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}