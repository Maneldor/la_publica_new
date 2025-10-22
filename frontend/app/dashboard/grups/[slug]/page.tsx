'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageTemplate } from '../../../../components/ui/PageTemplate';

// Tipos e interfaces
interface GroupMember {
  id: number;
  username: string;
  name: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'member';
  joinDate: string;
  lastActive: string;
  department: string;
}

interface GroupPost {
  id: number;
  authorId: number;
  authorName: string;
  authorAvatar: string;
  content: string;
  images?: string[];
  createdAt: string;
  likes: number;
  loves: number;
  useful: number;
  comments: number;
  isLiked: boolean;
  isLoved: boolean;
  isUseful: boolean;
  isPinned: boolean;
  visibility: 'all' | 'members';
}

interface GroupOffer {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  discount: string;
  companyName: string;
  companyLogo: string;
  validUntil: string;
  promoCode?: string;
  externalLink?: string;
  maxUses?: number;
  currentUses: number;
  rating: number;
  isExclusive: boolean;
  createdBy: 'admin' | 'company' | 'member';
}

interface Group {
  id: number;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  privacy: 'public' | 'private' | 'secret';
  coverImage: string;
  groupAvatar: string;
  membersCount: number;
  postsCount: number;
  lastActivity: string;
  isMember: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  adminName: string;
  tags: string[];
  membershipStatus: 'none' | 'pending' | 'approved' | 'rejected';
  createdDate: string;
  members: GroupMember[];
  posts: GroupPost[];
  offers: GroupOffer[];
}

// Datos de ejemplo expandidos
const sampleGroups: Group[] = [
  {
    id: 1,
    slug: 'desenvolupadors-frontend',
    name: 'Desenvolupadors Frontend',
    description: 'Comunitat de desenvolupadors especialitzats en tecnologies frontend',
    longDescription: 'Comunitat de desenvolupadors especialitzats en tecnologies frontend: React, Vue, Angular, TypeScript i les últimes tendències en desenvolupament web. Aquest grup està dedicat a compartir coneixements, bones pràctiques i ajudar-nos mútuament en els reptes tècnics del dia a dia.',
    category: 'Tecnologia',
    privacy: 'public',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=300&fit=crop',
    groupAvatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&h=150&fit=crop',
    membersCount: 247,
    postsCount: 89,
    lastActivity: 'fa 2 hores',
    isMember: true,
    isAdmin: false,
    isModerator: false,
    adminName: 'Marc Torres',
    tags: ['React', 'TypeScript', 'Frontend', 'JavaScript'],
    membershipStatus: 'approved',
    createdDate: '2025-01-15T10:00:00Z',
    members: [
      {
        id: 1,
        username: 'marc_torres',
        name: 'Marc Torres',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        role: 'admin',
        joinDate: '2025-01-15T10:00:00Z',
        lastActive: 'fa 1 hora',
        department: 'Departament de Tecnologia'
      },
      {
        id: 2,
        username: 'anna_garcia',
        name: 'Anna García',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        role: 'moderator',
        joinDate: '2025-01-16T14:30:00Z',
        lastActive: 'fa 30 min',
        department: 'Departament de Disseny'
      },
      {
        id: 3,
        username: 'david_fernandez',
        name: 'David Fernández',
        avatar: '',
        role: 'member',
        joinDate: '2025-01-18T09:15:00Z',
        lastActive: 'fa 3 hores',
        department: 'Departament de Tecnologia'
      }
    ],
    posts: [
      {
        id: 1,
        authorId: 1,
        authorName: 'Marc Torres',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        content: 'Hola compañeros! He trobat aquest nou framework de React que pot ser molt útil per optimitzar el rendiment de les nostres aplicacions. Què en penseu? 🚀\n\nHe estat provant-lo en un projecte pilot i els resultats són impressionants. Redueix el bundle size en un 30% aproximadament.',
        images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=300&fit=crop'],
        createdAt: '2025-10-15T10:30:00Z',
        likes: 12,
        loves: 3,
        useful: 8,
        comments: 5,
        isLiked: false,
        isLoved: false,
        isUseful: true,
        isPinned: true,
        visibility: 'members'
      },
      {
        id: 2,
        authorId: 2,
        authorName: 'Anna García',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        content: 'Comparteixo aquest article sobre les millors pràctiques en TypeScript. Molt recomanable! 👨‍💻\n\nhttps://typescript-best-practices.dev',
        createdAt: '2025-10-14T16:45:00Z',
        likes: 8,
        loves: 2,
        useful: 6,
        comments: 3,
        isLiked: true,
        isLoved: false,
        isUseful: false,
        isPinned: false,
        visibility: 'all'
      },
      {
        id: 3,
        authorId: 3,
        authorName: 'David Fernández',
        authorAvatar: '',
        content: 'Algú ha provat les noves funcionalitats de React 18? M\'agradaria escoltar les vostres experiències amb Concurrent Features.',
        createdAt: '2025-10-13T11:20:00Z',
        likes: 15,
        loves: 1,
        useful: 4,
        comments: 8,
        isLiked: false,
        isLoved: false,
        isUseful: false,
        isPinned: false,
        visibility: 'members'
      }
    ],
    offers: [
      {
        id: 1,
        title: 'Curs Avançat de React - 50% descompte',
        description: 'Curs intensiu de React amb les últimes funcionalitats. Inclou hooks avançats, Context API, i optimització de rendiment.',
        category: 'Formació',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop',
        discount: '50% OFF',
        companyName: 'TechAcademy Barcelona',
        companyLogo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=80&h=80&fit=crop',
        validUntil: '2025-12-31',
        promoCode: 'FRONTEND50',
        externalLink: 'https://techacademy.barcelona/react-course',
        maxUses: 50,
        currentUses: 23,
        rating: 4.8,
        isExclusive: true,
        createdBy: 'company'
      },
      {
        id: 2,
        title: 'Llicències JetBrains - Preu especial',
        description: 'Accés complet a totes les eines JetBrains: WebStorm, IntelliJ IDEA, PhpStorm i més.',
        category: 'Eines',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop',
        discount: '30% OFF',
        companyName: 'JetBrains',
        companyLogo: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=80&h=80&fit=crop',
        validUntil: '2025-11-30',
        promoCode: 'DEV30',
        maxUses: 100,
        currentUses: 67,
        rating: 4.9,
        isExclusive: true,
        createdBy: 'admin'
      },
      {
        id: 3,
        title: 'Consultoria gratuïta en arquitectura Frontend',
        description: 'Sessió de consultoria d\'1 hora amb experts en arquitectura de projectes React/Vue.',
        category: 'Serveis',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop',
        discount: 'GRATUÏT',
        companyName: 'Frontend Experts',
        companyLogo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop',
        validUntil: '2025-10-31',
        maxUses: 20,
        currentUses: 8,
        rating: 4.7,
        isExclusive: true,
        createdBy: 'member'
      }
    ]
  }
];

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupSlug = params.slug as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'members' | 'offers' | 'documents' | 'photos' | 'events' | 'settings'>('feed');
  const [isLoading, setIsLoading] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Estados para el feed
  const [newPost, setNewPost] = useState('');
  const [postVisibility, setPostVisibility] = useState<'all' | 'members'>('members');
  const [feedSortBy, setSortBy] = useState<'recent' | 'popular' | 'pinned'>('recent');

  // Estados para las ofertas
  const [offerFilter, setOfferFilter] = useState<'all' | 'active' | 'expiring'>('active');
  const [offerCategory, setOfferCategory] = useState<string>('');
  const [selectedOffer, setSelectedOffer] = useState<GroupOffer | null>(null);

  // Estados para miembros
  const [memberFilter, setMemberFilter] = useState<'all' | 'admins' | 'moderators' | 'members'>('all');
  const [memberSearch, setMemberSearch] = useState('');

  useEffect(() => {
    // Buscar el grupo por slug
    const foundGroup = sampleGroups.find(g => g.slug === groupSlug);
    setGroup(foundGroup || null);
  }, [groupSlug]);

  // Función para obtener iniciales del avatar
  const getAvatarInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    console.log(`🔔 ${type.toUpperCase()}: ${message}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPrivacyInfo = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return { icon: '🌐', label: 'Públic', color: '#10b981' };
      case 'private':
        return { icon: '🔒', label: 'Privat', color: '#f59e0b' };
      case 'secret':
        return { icon: '🤫', label: 'Secret', color: '#ef4444' };
      default:
        return { icon: '🌐', label: 'Públic', color: '#10b981' };
    }
  };

  // Handlers para acciones del grupo
  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const post: GroupPost = {
        id: Date.now(),
        authorId: 999, // Usuario actual
        authorName: 'Usuari Actual',
        authorAvatar: '',
        content: newPost,
        createdAt: new Date().toISOString(),
        likes: 0,
        loves: 0,
        useful: 0,
        comments: 0,
        isLiked: false,
        isLoved: false,
        isUseful: false,
        isPinned: false,
        visibility: postVisibility
      };

      setGroup(prev => prev ? {
        ...prev,
        posts: [post, ...prev.posts],
        postsCount: prev.postsCount + 1
      } : null);

      setNewPost('');
      showNotification('success', 'Publicació creada correctament!');

    } catch (error) {
      showNotification('error', 'Error al crear la publicació');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (postId: number, reactionType: 'like' | 'love' | 'useful') => {
    if (!group) return;

    try {
      setGroup(prev => prev ? {
        ...prev,
        posts: prev.posts.map(post => {
          if (post.id === postId) {
            const currentReaction = post[`is${reactionType.charAt(0).toUpperCase() + reactionType.slice(1)}`];
            return {
              ...post,
              [reactionType + 's']: currentReaction ? post[reactionType + 's'] - 1 : post[reactionType + 's'] + 1,
              [`is${reactionType.charAt(0).toUpperCase() + reactionType.slice(1)}`]: !currentReaction
            };
          }
          return post;
        })
      } : null);
    } catch (error) {
      showNotification('error', 'Error al processar la reacció');
    }
  };

  const handleUseOffer = (offer: GroupOffer) => {
    if (offer.promoCode) {
      navigator.clipboard.writeText(offer.promoCode);
      showNotification('success', `Codi "${offer.promoCode}" copiat al portapapers!`);
    }

    if (offer.externalLink) {
      window.open(offer.externalLink, '_blank');
    }

    // Incrementar usos
    setGroup(prev => prev ? {
      ...prev,
      offers: prev.offers.map(o =>
        o.id === offer.id ? { ...o, currentUses: o.currentUses + 1 } : o
      )
    } : null);
  };

  if (!group) {
    return (
      <PageTemplate
        title="Grup no trobat"
        subtitle="El grup que busques no existeix"
        statsData={[]}
      >
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
            Grup no trobat
          </h3>
          <p style={{ fontSize: '14px', color: '#8e8e93', marginBottom: '20px' }}>
            El grup que busques no existeix o ha estat eliminat
          </p>
          <button
            onClick={() => router.push('/dashboard/grups')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Tornar als grups
          </button>
        </div>
      </PageTemplate>
    );
  }

  const statsData = [
    { label: 'Membres', value: group.membersCount.toString(), trend: '+12' },
    { label: 'Publicacions', value: group.postsCount.toString(), trend: '+5' },
    { label: 'Ofertes actives', value: group.offers.filter(o => new Date(o.validUntil) > new Date()).length.toString(), trend: '+2' },
    { label: 'Activitat', value: group.lastActivity, trend: 'recent' }
  ];

  const privacy = getPrivacyInfo(group.privacy);

  // Filtrar posts
  const filteredPosts = group.posts
    .filter(post => {
      if (feedSortBy === 'pinned') return post.isPinned;
      return true;
    })
    .sort((a, b) => {
      if (feedSortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (feedSortBy === 'popular') return (b.likes + b.loves + b.useful) - (a.likes + a.loves + a.useful);
      if (feedSortBy === 'pinned') return b.isPinned ? 1 : -1;
      return 0;
    });

  // Filtrar ofertas
  const filteredOffers = group.offers
    .filter(offer => {
      const now = new Date();
      const validUntil = new Date(offer.validUntil);
      const daysUntilExpiry = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (offerFilter === 'active') return validUntil > now;
      if (offerFilter === 'expiring') return daysUntilExpiry <= 7 && validUntil > now;
      return true;
    })
    .filter(offer => offerCategory ? offer.category === offerCategory : true);

  // Filtrar miembros
  const filteredMembers = group.members
    .filter(member => {
      if (memberFilter === 'all') return true;
      if (memberFilter === 'admins') return member.role === 'admin';
      if (memberFilter === 'moderators') return member.role === 'moderator';
      if (memberFilter === 'members') return member.role === 'member';
      return true;
    })
    .filter(member =>
      memberSearch ? member.name.toLowerCase().includes(memberSearch.toLowerCase()) : true
    );

  return (
    <PageTemplate
      title={group.name}
      subtitle={group.description}
      statsData={statsData}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* 1. CAPÇALERA DEL GRUP MILLORADA */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '32px',
          border: '1px solid #f0f0f0'
        }}>
          {/* Cover Image */}
          <div style={{
            height: '250px',
            backgroundImage: `url(${group.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%)'
            }} />

            {/* Avatar del grup superposat */}
            <div style={{
              position: 'absolute',
              bottom: '-40px',
              left: '30px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '4px solid #fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              backgroundColor: '#fff'
            }}>
              {group.groupAvatar ? (
                <img
                  src={group.groupAvatar}
                  alt={group.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    {getAvatarInitials(group.name)}
                  </span>
                </div>
              )}
            </div>

            {/* Badge de privacitat */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: privacy.color,
              color: 'white',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {privacy.icon} {privacy.label}
            </div>
          </div>

          {/* Informació del grup */}
          <div style={{
            padding: '50px 30px 20px 30px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <div style={{ flex: 1 }}>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#2c3e50',
                  margin: '0 0 8px 0'
                }}>
                  {group.name}
                </h1>
                <p style={{
                  fontSize: '16px',
                  color: '#6c757d',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  {group.description}
                </p>

                {/* Tags */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  {group.tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: '#f0f7ff',
                        color: '#3b82f6',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Botons d'acció */}
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                <button
                  onClick={() => setActiveTab('members')}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  👥 Veure membres
                </button>

                {(group.isAdmin || group.isModerator) && (
                  <button
                    onClick={() => setActiveTab('settings')}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: 'transparent',
                      color: '#6c757d',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    ⚙️ Configuració
                  </button>
                )}

                {/* Dropdown de més opcions */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'transparent',
                      color: '#6c757d',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '16px',
                      cursor: 'pointer'
                    }}
                  >
                    ⋯
                  </button>

                  {showMoreOptions && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      border: '1px solid #e9ecef',
                      padding: '8px 0',
                      minWidth: '180px',
                      zIndex: 1000
                    }}>
                      <button
                        onClick={() => {
                          showNotification('info', 'Grup silenciat');
                          setShowMoreOptions(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        🔕 Silenciar notificacions
                      </button>
                      <button
                        onClick={() => {
                          showNotification('warning', 'Grup reportat');
                          setShowMoreOptions(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          fontSize: '14px',
                          cursor: 'pointer',
                          color: '#ef4444'
                        }}
                      >
                        🚨 Reportar grup
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Estadístiques ràpides */}
            <div style={{
              display: 'flex',
              gap: '24px',
              fontSize: '14px',
              color: '#8e8e93'
            }}>
              <span>👥 {group.membersCount} membres</span>
              <span>📝 {group.postsCount} publicacions</span>
              <span>🎯 {group.offers.length} ofertes</span>
              <span>📅 Creat {formatDate(group.createdDate)}</span>
              <span>⚡ Actiu {group.lastActivity}</span>
            </div>
          </div>
        </div>

        {/* 2. NAVEGACIÓ PER PESTANYES */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '32px',
          border: '1px solid #f0f0f0',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #f0f0f0'
          }}>
            {[
              { key: 'feed', label: '📱 Feed', icon: '📱' },
              { key: 'members', label: '👥 Membres', icon: '👥' },
              { key: 'offers', label: '📢 Ofertes', icon: '📢' },
              { key: 'documents', label: '📁 Documents', icon: '📁' },
              { key: 'photos', label: '📸 Fotos', icon: '📸' },
              { key: 'events', label: '📅 Esdeveniments', icon: '📅' },
              ...(group.isAdmin || group.isModerator ? [{ key: 'settings', label: '⚙️ Configuració', icon: '⚙️' }] : [])
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  padding: '16px 24px',
                  backgroundColor: activeTab === tab.key ? '#f0f7ff' : 'transparent',
                  color: activeTab === tab.key ? '#3b82f6' : '#6c757d',
                  border: 'none',
                  borderBottom: activeTab === tab.key ? '3px solid #3b82f6' : '3px solid transparent',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. CONTINGUT DE LES PESTANYES */}
        <div>

          {/* PESTANYA: FEED/TIMELINE */}
          {activeTab === 'feed' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 330px',
              gap: '24px'
            }}>
              {/* Columna principal */}
              <div>
                {/* Crear nova publicació */}
                {group.isMember && (
                  <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: '24px',
                    border: '1px solid #f0f0f0'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: 'white'
                        }}>
                          {getAvatarInitials('Usuari Actual')}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <textarea
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          placeholder="Comparteix quelcom interessant amb el grup..."
                          style={{
                            width: '100%',
                            minHeight: '80px',
                            padding: '12px',
                            border: '2px solid #e9ecef',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                    </div>

                    {/* Opcions de publicació */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center'
                      }}>
                        <button
                          onClick={() => showNotification('info', 'Funcionalitat en desenvolupament')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'transparent',
                            color: '#6c757d',
                            border: '1px solid #e9ecef',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          📷 Imatge
                        </button>
                        <button
                          onClick={() => showNotification('info', 'Funcionalitat en desenvolupament')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'transparent',
                            color: '#6c757d',
                            border: '1px solid #e9ecef',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          📎 Document
                        </button>
                        <button
                          onClick={() => showNotification('info', 'Funcionalitat en desenvolupament')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'transparent',
                            color: '#6c757d',
                            border: '1px solid #e9ecef',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          📊 Enquesta
                        </button>

                        {/* Selector de visibilitat */}
                        <select
                          value={postVisibility}
                          onChange={(e) => setPostVisibility(e.target.value as any)}
                          style={{
                            padding: '6px 8px',
                            border: '1px solid #e9ecef',
                            borderRadius: '6px',
                            fontSize: '12px',
                            backgroundColor: '#fff'
                          }}
                        >
                          <option value="members">👥 Només membres</option>
                          <option value="all">🌐 Tots</option>
                        </select>
                      </div>

                      <button
                        onClick={handleCreatePost}
                        disabled={isLoading || !newPost.trim()}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: isLoading || !newPost.trim() ? '#9ca3af' : '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: isLoading || !newPost.trim() ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isLoading ? 'Publicant...' : 'Publicar'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Controls d'ordenació */}
                <div style={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                  marginBottom: '16px',
                  border: '1px solid #f0f0f0',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>
                    Ordenar per:
                  </span>
                  {[
                    { key: 'recent', label: '🕒 Més recents' },
                    { key: 'popular', label: '🔥 Més populars' },
                    { key: 'pinned', label: '📌 Fixades' }
                  ].map((sort) => (
                    <button
                      key={sort.key}
                      onClick={() => setSortBy(sort.key as any)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: feedSortBy === sort.key ? '#3b82f6' : 'transparent',
                        color: feedSortBy === sort.key ? 'white' : '#6c757d',
                        border: `1px solid ${feedSortBy === sort.key ? '#3b82f6' : '#e9ecef'}`,
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {sort.label}
                    </button>
                  ))}
                </div>

                {/* Feed de publicacions */}
                {filteredPosts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredPosts.map((post) => (
                      <div
                        key={post.id}
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: '12px',
                          padding: '24px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          border: post.isPinned ? '2px solid #f59e0b' : '1px solid #f0f0f0',
                          marginBottom: '24px'
                        }}
                      >
                        {/* Header del post */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '12px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden'
                            }}>
                              {post.authorAvatar ? (
                                <img
                                  src={post.authorAvatar}
                                  alt={post.authorName}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              ) : (
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  backgroundColor: '#3b82f6',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <span style={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: 'white'
                                  }}>
                                    {getAvatarInitials(post.authorName)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#2c3e50'
                              }}>
                                {post.authorName}
                                {post.isPinned && (
                                  <span style={{
                                    marginLeft: '8px',
                                    backgroundColor: '#f59e0b',
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10px'
                                  }}>
                                    📌 FIXAT
                                  </span>
                                )}
                              </div>
                              <div style={{
                                fontSize: '12px',
                                color: '#8e8e93'
                              }}>
                                {formatDate(post.createdAt)} • {post.visibility === 'members' ? '👥 Només membres' : '🌐 Públic'}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => showNotification('info', 'Funcionalitat en desenvolupament')}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '16px',
                              cursor: 'pointer',
                              color: '#6c757d'
                            }}
                          >
                            ⋯
                          </button>
                        </div>

                        {/* Contingut del post */}
                        <div style={{
                          fontSize: '14px',
                          color: '#2c3e50',
                          lineHeight: '1.6',
                          margin: '0 0 16px 0',
                          whiteSpace: 'pre-line'
                        }}>
                          {post.content}
                        </div>

                        {/* Imatges del post */}
                        {post.images && post.images.length > 0 && (
                          <div style={{
                            marginBottom: '16px',
                            borderRadius: '8px',
                            overflow: 'hidden'
                          }}>
                            <img
                              src={post.images[0]}
                              alt="Post image"
                              style={{
                                width: '100%',
                                maxHeight: '400px',
                                objectFit: 'cover'
                              }}
                            />
                          </div>
                        )}

                        {/* Reaccions i comentaris */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          paddingTop: '12px',
                          borderTop: '1px solid #f0f0f0'
                        }}>
                          <button
                            onClick={() => handleReaction(post.id, 'like')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              backgroundColor: post.isLiked ? '#fee2e2' : 'transparent',
                              color: post.isLiked ? '#ef4444' : '#6c757d',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {post.isLiked ? '❤️' : '🤍'} {post.likes}
                          </button>
                          <button
                            onClick={() => handleReaction(post.id, 'love')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              backgroundColor: post.isLoved ? '#fef3c7' : 'transparent',
                              color: post.isLoved ? '#d97706' : '#6c757d',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {post.isLoved ? '😍' : '😊'} {post.loves}
                          </button>
                          <button
                            onClick={() => handleReaction(post.id, 'useful')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              backgroundColor: post.isUseful ? '#dcfce7' : 'transparent',
                              color: post.isUseful ? '#16a34a' : '#6c757d',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {post.isUseful ? '💡' : '🔸'} {post.useful}
                          </button>
                          <button
                            onClick={() => showNotification('info', 'Funcionalitat en desenvolupament')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              backgroundColor: 'transparent',
                              color: '#6c757d',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            💬 {post.comments}
                          </button>
                          <button
                            onClick={() => showNotification('info', 'Funcionalitat en desenvolupament')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              backgroundColor: 'transparent',
                              color: '#6c757d',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            📤 Compartir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '40px 24px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '2px dashed #e9ecef'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#6c757d',
                      marginBottom: '8px'
                    }}>
                      {feedSortBy === 'pinned' ? 'No hi ha publicacions fixades' : 'No hi ha publicacions encara'}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#8e8e93',
                      margin: 0
                    }}>
                      {feedSortBy === 'pinned'
                        ? 'Els administradors poden fixar publicacions importants'
                        : 'Sigues el primer en compartir quelcom interessant!'
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div>
                <div style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #f0f0f0',
                  position: 'sticky',
                  top: '24px'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#2c3e50',
                    margin: '0 0 16px 0'
                  }}>
                    Activitat recent
                  </h4>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#6c757d'
                    }}>
                      📊 {group.postsCount} publicacions totals
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6c757d'
                    }}>
                      👥 {group.membersCount} membres actius
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6c757d'
                    }}>
                      📈 Última activitat {group.lastActivity}
                    </div>
                  </div>

                  <div style={{
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <h5 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2c3e50',
                      margin: '0 0 12px 0'
                    }}>
                      Membres destacats
                    </h5>
                    {group.members.slice(0, 3).map((member) => (
                      <div key={member.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: member.avatar ? 'transparent' : '#3b82f6',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 'bold',
                              color: 'white'
                            }}>
                              {getAvatarInitials(member.name)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#2c3e50'
                          }}>
                            {member.name}
                          </div>
                          <div style={{
                            fontSize: '10px',
                            color: '#8e8e93'
                          }}>
                            {member.role === 'admin' ? '👑 Admin' : member.role === 'moderator' ? '🛡️ Mod' : '👤 Membre'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PESTANYA: OFERTES */}
          {activeTab === 'offers' && (
            <div>
              {/* Filtres d'ofertes */}
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '32px',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#2c3e50'
                    }}>
                      Estat:
                    </span>
                    {[
                      { key: 'active', label: '✅ Actives' },
                      { key: 'expiring', label: '⏰ Expiren aviat' },
                      { key: 'all', label: '📋 Totes' }
                    ].map((filter) => (
                      <button
                        key={filter.key}
                        onClick={() => setOfferFilter(filter.key as any)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: offerFilter === filter.key ? '#3b82f6' : 'transparent',
                          color: offerFilter === filter.key ? 'white' : '#6c757d',
                          border: `1px solid ${offerFilter === filter.key ? '#3b82f6' : '#e9ecef'}`,
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#2c3e50'
                    }}>
                      Categoria:
                    </span>
                    <select
                      value={offerCategory}
                      onChange={(e) => setOfferCategory(e.target.value)}
                      style={{
                        padding: '6px 8px',
                        border: '1px solid #e9ecef',
                        borderRadius: '6px',
                        fontSize: '12px',
                        backgroundColor: '#fff'
                      }}
                    >
                      <option value="">Totes les categories</option>
                      <option value="Formació">Formació</option>
                      <option value="Eines">Eines</option>
                      <option value="Serveis">Serveis</option>
                      <option value="Productes">Productes</option>
                    </select>
                  </div>

                  {(group.isAdmin || group.isModerator) && (
                    <button
                      onClick={() => showNotification('info', 'Funcionalitat en desenvolupament')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        marginLeft: 'auto'
                      }}
                    >
                      ➕ Nova oferta
                    </button>
                  )}
                </div>
              </div>

              {/* Grid d'ofertes */}
              {filteredOffers.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                  gap: '20px'
                }}>
                  {filteredOffers.map((offer) => {
                    const daysUntilExpiry = Math.ceil((new Date(offer.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const isExpiring = daysUntilExpiry <= 7;

                    return (
                      <div
                        key={offer.id}
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          border: isExpiring ? '2px solid #f59e0b' : '1px solid #f0f0f0',
                          transition: 'transform 0.2s',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {/* Imatge de l'oferta */}
                        <div style={{
                          height: '160px',
                          backgroundImage: `url(${offer.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative'
                        }}>
                          {/* Badge de descompte */}
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {offer.discount}
                          </div>

                          {/* Badge exclusiva */}
                          {offer.isExclusive && (
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              backgroundColor: '#8b5cf6',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: '600'
                            }}>
                              🎯 EXCLUSIVA GRUP
                            </div>
                          )}

                          {/* Badge expira aviat */}
                          {isExpiring && (
                            <div style={{
                              position: 'absolute',
                              bottom: '12px',
                              left: '12px',
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: '600'
                            }}>
                              ⏰ EXPIRA EN {daysUntilExpiry} {daysUntilExpiry === 1 ? 'DIA' : 'DIES'}
                            </div>
                          )}
                        </div>

                        {/* Contingut de l'oferta */}
                        <div style={{ padding: '16px' }}>
                          {/* Header amb empresa */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px'
                          }}>
                            <img
                              src={offer.companyLogo}
                              alt={offer.companyName}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                objectFit: 'cover'
                              }}
                            />
                            <span style={{
                              fontSize: '12px',
                              fontWeight: '500',
                              color: '#6c757d'
                            }}>
                              {offer.companyName}
                            </span>
                            <span style={{
                              fontSize: '10px',
                              backgroundColor: '#f0f7ff',
                              color: '#3b82f6',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              {offer.category}
                            </span>
                          </div>

                          {/* Títol */}
                          <h3 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#2c3e50',
                            margin: '0 0 8px 0',
                            lineHeight: '1.3'
                          }}>
                            {offer.title}
                          </h3>

                          {/* Descripció */}
                          <p style={{
                            fontSize: '13px',
                            color: '#6c757d',
                            lineHeight: '1.4',
                            margin: '0 0 12px 0',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {offer.description}
                          </p>

                          {/* Vigència */}
                          <div style={{
                            fontSize: '12px',
                            color: '#8e8e93',
                            marginBottom: '12px'
                          }}>
                            📅 Vàlida fins {new Date(offer.validUntil).toLocaleDateString('ca-ES')}
                          </div>

                          {/* Estadístiques */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px',
                            fontSize: '11px',
                            color: '#8e8e93'
                          }}>
                            <span>⭐ {offer.rating}/5</span>
                            {offer.maxUses && (
                              <span>{offer.currentUses}/{offer.maxUses} usos</span>
                            )}
                          </div>

                          {/* Botó d'acció */}
                          <button
                            onClick={() => handleUseOffer(offer)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {offer.promoCode ? `🎫 Copiar codi: ${offer.promoCode}` : '🔗 Veure oferta'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '40px 24px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '2px dashed #e9ecef'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎁</div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#6c757d',
                    marginBottom: '8px'
                  }}>
                    No hi ha ofertes disponibles
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#8e8e93',
                    margin: 0
                  }}>
                    Les ofertes per aquest grup apareixeran aquí
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PESTANYA: MEMBRES */}
          {activeTab === 'members' && (
            <div>
              {/* Filtres de membres */}
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '32px',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#2c3e50'
                    }}>
                      Filtrar per rol:
                    </span>
                    {[
                      { key: 'all', label: '👥 Tots' },
                      { key: 'admins', label: '👑 Admins' },
                      { key: 'moderators', label: '🛡️ Moderadors' },
                      { key: 'members', label: '👤 Membres' }
                    ].map((filter) => (
                      <button
                        key={filter.key}
                        onClick={() => setMemberFilter(filter.key as any)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: memberFilter === filter.key ? '#3b82f6' : 'transparent',
                          color: memberFilter === filter.key ? 'white' : '#6c757d',
                          border: `1px solid ${memberFilter === filter.key ? '#3b82f6' : '#e9ecef'}`,
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Cerca per nom..."
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #e9ecef',
                      borderRadius: '6px',
                      fontSize: '12px',
                      width: '200px'
                    }}
                  />

                  {(group.isAdmin || group.isModerator) && (
                    <button
                      onClick={() => showNotification('info', 'Funcionalitat en desenvolupament')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        marginLeft: 'auto'
                      }}
                    >
                      ✉️ Convidar membres
                    </button>
                  )}
                </div>
              </div>

              {/* Stats de membres */}
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '32px',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#2c3e50'
                    }}>
                      {filteredMembers.length}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6c757d'
                    }}>
                      Membres trobats
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#10b981'
                    }}>
                      {group.members.filter(m => m.role === 'admin').length}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6c757d'
                    }}>
                      Administradors
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#f59e0b'
                    }}>
                      {group.members.filter(m => m.role === 'moderator').length}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6c757d'
                    }}>
                      Moderadors
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#3b82f6'
                    }}>
                      {group.members.filter(m => m.lastActive.includes('hora') || m.lastActive.includes('min')).length}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6c757d'
                    }}>
                      Actius avui
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de membres */}
              {filteredMembers.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px'
                }}>
                  {filteredMembers.map((member) => {
                    const getRoleInfo = (role: string) => {
                      switch (role) {
                        case 'admin':
                          return { icon: '👑', label: 'Administrador', color: '#ef4444' };
                        case 'moderator':
                          return { icon: '🛡️', label: 'Moderador', color: '#f59e0b' };
                        default:
                          return { icon: '👤', label: 'Membre', color: '#6c757d' };
                      }
                    };

                    const roleInfo = getRoleInfo(member.role);

                    return (
                      <div
                        key={member.id}
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: '12px',
                          padding: '20px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          border: '1px solid #f0f0f0',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '12px'
                        }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {member.avatar ? (
                              <img
                                src={member.avatar}
                                alt={member.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#3b82f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <span style={{
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                  color: 'white'
                                }}>
                                  {getAvatarInitials(member.name)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#2c3e50',
                              marginBottom: '2px'
                            }}>
                              {member.name}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#8e8e93',
                              marginBottom: '4px'
                            }}>
                              @{member.username}
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <span style={{
                                fontSize: '10px',
                                backgroundColor: roleInfo.color,
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: '500'
                              }}>
                                {roleInfo.icon} {roleInfo.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{
                          fontSize: '12px',
                          color: '#6c757d',
                          marginBottom: '8px'
                        }}>
                          {member.department}
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '11px',
                          color: '#8e8e93',
                          marginBottom: '12px'
                        }}>
                          <span>📅 Unit {formatDate(member.joinDate)}</span>
                          <span>⚡ Actiu {member.lastActive}</span>
                        </div>

                        <button
                          onClick={() => router.push(`/dashboard/membres/${member.username}`)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            backgroundColor: 'transparent',
                            color: '#3b82f6',
                            border: '1px solid #3b82f6',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#3b82f6';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#3b82f6';
                          }}
                        >
                          👁️ Veure perfil
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '40px 24px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '2px dashed #e9ecef'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#6c757d',
                    marginBottom: '8px'
                  }}>
                    No s'han trobat membres
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#8e8e93',
                    margin: 0
                  }}>
                    Prova a ajustar els filtres de cerca
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PESTANYES PENDENTS D'IMPLEMENTAR */}
          {['documents', 'photos', 'events', 'settings'].includes(activeTab) && (
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '40px 24px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '2px dashed #e9ecef'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#6c757d',
                marginBottom: '8px'
              }}>
                Funcionalitat en desenvolupament
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#8e8e93',
                margin: 0
              }}>
                Aquesta pestanya està sent desenvolupada i estarà disponible aviat
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}