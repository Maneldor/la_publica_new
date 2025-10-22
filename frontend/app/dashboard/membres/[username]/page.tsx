'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageTemplate } from '../../../../components/ui/PageTemplate';
import {
  Camera, User, UserPlus, MessageSquare, Heart, Activity, Info, Users,
  FileText, Image, Calendar, MapPin, Briefcase, Globe, GraduationCap,
  ArrowLeft, ChevronRight
} from 'lucide-react';

type AdministrationType = 'LOCAL' | 'AUTONOMICA' | 'CENTRAL';

interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  administration: AdministrationType;
  createdAt: string;
  avatar?: string;
  coverImage?: string;
}

interface PublicUserData {
  profile: UserProfile;
  aboutData: {
    bio: string;
    birthDate: string;
    location: string;
    workplace: string;
    position: string;
    website: string;
    socialNetworks: {
      twitter: string;
      linkedin: string;
      instagram: string;
    };
  };
  education: Array<{
    id: string;
    title: string;
    institution: string;
    startYear: string;
    endYear: string;
    description: string;
  }>;
  experience: Array<{
    id: string;
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills: string[];
  interests: string[];
  languages: Array<{
    name: string;
    level: string;
  }>;
  activities: Array<{
    id: string;
    type: 'post' | 'group' | 'comment' | 'like' | 'share';
    content: string;
    timestamp: string;
    icon: any;
  }>;
  friends: Array<{
    id: string;
    name: string;
    nick: string;
    avatar: string;
    administration: AdministrationType;
  }>;
  groups: Array<{
    id: string;
    name: string;
    avatar: string;
    members: number;
    lastActivity: string;
    role: 'admin' | 'moderator' | 'member';
  }>;
  stats: {
    posts: number;
    connections: number;
    likes: number;
    profileCompletion: number;
  };
}

type TabType = 'timeline' | 'about' | 'friends' | 'groups' | 'posts' | 'photos';

// Helper function para comprobar si es el propio perfil
const isOwnProfile = (currentUsername: string, profileUsername: string): boolean => {
  return currentUsername === profileUsername;
};

// Helper function para obtener badge de administración
const getAdministrationBadge = (type: AdministrationType) => {
  const badges = {
    LOCAL: { label: 'Local', color: '#10b981' },
    AUTONOMICA: { label: 'Autonòmica', color: '#8b5cf6' },
    CENTRAL: { label: 'Central', color: '#3b82f6' }
  };
  return badges[type];
};

// Helper function para obtener iniciales
const getAvatarInitials = (firstName: string, lastName: string) => {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
};

// Sample data para el perfil
const getSampleUserData = (username: string): PublicUserData | null => {
  // Simular que "jordi_funcionari" es el usuario actual
  const currentUser = 'jordi_funcionari';

  if (username === 'jordi_funcionari') {
    return {
      profile: {
        id: '1',
        username: 'jordi_funcionari',
        firstName: 'Jordi',
        lastName: 'García Martínez',
        email: 'jordi.garcia@lapublica.cat',
        administration: 'LOCAL',
        createdAt: '2024-01-15',
        avatar: '',
        coverImage: ''
      },
      aboutData: {
        bio: "Funcionari públic apassionat per la innovació tecnològica i la modernització de l'administració. M'especialitzo en transformació digital i processos administratius eficients.",
        birthDate: '1985-03-15',
        location: 'Barcelona, Catalunya',
        workplace: 'Ajuntament de Barcelona',
        position: 'Tècnic en Transformació Digital',
        website: 'https://jordi-garcia.dev',
        socialNetworks: {
          twitter: '@jordi_garcia',
          linkedin: 'jordi-garcia-martinez',
          instagram: '@jordigarcia_public'
        }
      },
      education: [
        {
          id: '1',
          title: 'Màster en Administració i Direcció d\'Empreses (MBA)',
          institution: 'ESADE Business School',
          startYear: '2010',
          endYear: '2012',
          description: 'Especialització en Gestió Pública i Transformació Digital'
        }
      ],
      experience: [
        {
          id: '1',
          position: 'Tècnic en Transformació Digital',
          company: 'Ajuntament de Barcelona',
          startDate: '2015-09',
          endDate: 'Present',
          description: 'Lidero projectes de digitalització de serveis ciutadans.'
        }
      ],
      skills: [
        'Transformació Digital', 'Gestió de Projectes', 'Administració Electrònica',
        'React', 'Node.js', 'TypeScript'
      ],
      interests: [
        'Innovació Pública', 'Smart Cities', 'Sostenibilitat', 'Ciclisme'
      ],
      languages: [
        { name: 'Català', level: 'Natiu' },
        { name: 'Castellà', level: 'Natiu' },
        { name: 'Anglès', level: 'Avançat (C1)' }
      ],
      activities: [
        {
          id: '1',
          type: 'post',
          content: 'Ha publicat: "Nou sistema de cita prèvia digital implementat amb èxit"',
          timestamp: 'fa 2 hores',
          icon: FileText
        }
      ],
      friends: [
        { id: '1', name: 'Maria González', nick: 'maria_dev', avatar: '', administration: 'LOCAL' },
        { id: '2', name: 'Anna Soler', nick: 'anna_ux', avatar: '', administration: 'LOCAL' }
      ],
      groups: [
        { id: '1', name: 'Innovació en Administració', avatar: '', members: 247, lastActivity: 'fa 2 hores', role: 'admin' }
      ],
      stats: {
        posts: 23,
        connections: 142,
        likes: 367,
        profileCompletion: 85
      }
    };
  }

  // Para otros usuarios, mostrar datos públicos limitados
  if (username === 'maria_dev') {
    return {
      profile: {
        id: '2',
        username: 'maria_dev',
        firstName: 'Maria',
        lastName: 'González',
        email: '', // No mostrar email en perfiles públicos
        administration: 'LOCAL',
        createdAt: '2023-12-10',
        avatar: '',
        coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=150&fit=crop'
      },
      aboutData: {
        bio: 'Especialista en React i TypeScript amb 8 anys d\'experiència. M\'agrada crear interfícies d\'usuari intuïtives.',
        birthDate: '', // No mostrar fecha nacimiento completa
        location: 'Barcelona', // Solo ciudad, no dirección completa
        workplace: 'Ajuntament de Barcelona', // Genérico
        position: 'Desenvolupadora Senior Frontend',
        website: '',
        socialNetworks: {
          twitter: '@maria_dev',
          linkedin: 'maria-gonzalez-dev',
          instagram: ''
        }
      },
      education: [], // Información privada
      experience: [
        {
          id: '1',
          position: 'Desenvolupadora Senior Frontend',
          company: 'Ajuntament de Barcelona',
          startDate: '2020-01',
          endDate: 'Present',
          description: 'Desenvolupament d\'aplicacions web modernes.'
        }
      ],
      skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML'],
      interests: ['Tecnologia', 'Disseny', 'Ciclisme'],
      languages: [
        { name: 'Català', level: 'Natiu' },
        { name: 'Anglès', level: 'Avançat' }
      ],
      activities: [
        {
          id: '1',
          type: 'post',
          content: 'Ha publicat sobre desenvolupament frontend',
          timestamp: 'fa 1 dia',
          icon: FileText
        }
      ],
      friends: [
        { id: '1', name: 'Anna S.', nick: 'anna_ux', avatar: '', administration: 'LOCAL' }
      ],
      groups: [
        { id: '1', name: 'Desenvolupadors Frontend', avatar: '', members: 189, lastActivity: 'fa 1 dia', role: 'member' }
      ],
      stats: {
        posts: 15,
        connections: 89,
        likes: 234,
        profileCompletion: 75
      }
    };
  }

  return null;
};

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [userData, setUserData] = useState<PublicUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [isFollowing, setIsFollowing] = useState(false);

  // Simular usuario actual
  const currentUsername = 'jordi_funcionari';

  useEffect(() => {
    // Simular carga de datos
    const loadUserData = async () => {
      setLoading(true);

      // Redirección inteligente: si es el propio usuario, redirigir al perfil privado
      if (username === currentUsername) {
        router.push('/dashboard/perfil');
        return;
      }

      const data = getSampleUserData(username);
      if (data) {
        setUserData(data);
      }
      setLoading(false);
    };

    loadUserData();
  }, [username, router]);

  if (loading) {
    return (
      <PageTemplate
        title="Carregant perfil..."
        subtitle=""
        statsData={[
          { label: 'Carregant...', value: '---', trend: '' }
        ]}
      >
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p>Carregant perfil d'usuari...</p>
        </div>
      </PageTemplate>
    );
  }

  if (!userData) {
    return (
      <PageTemplate
        title="Usuari no trobat"
        subtitle=""
        statsData={[
          { label: 'Error', value: '404', trend: '' }
        ]}
      >
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😔</div>
          <h2>Usuari no trobat</h2>
          <p>L'usuari @{username} no existeix o no està disponible.</p>
          <Link
            href="/dashboard/membres"
            style={{
              display: 'inline-block',
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none'
            }}
          >
            Tornar a Membres
          </Link>
        </div>
      </PageTemplate>
    );
  }

  const isOwn = isOwnProfile(currentUsername, username);
  const statsData = [
    {
      label: 'Publicacions',
      value: userData.stats.posts.toString(),
      trend: '+3',
      icon: FileText,
      color: '#8b5cf6'
    },
    {
      label: 'Connexions',
      value: userData.stats.connections.toString(),
      trend: '+12',
      icon: Users,
      color: '#3b82f6'
    },
    {
      label: 'Likes Rebuts',
      value: userData.stats.likes.toString(),
      trend: '+45',
      icon: Heart,
      color: '#ef4444'
    },
    {
      label: 'Perfil Completat',
      value: `${userData.stats.profileCompletion}%`,
      trend: '+5%',
      icon: User,
      color: '#10b981'
    }
  ];

  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: Activity },
    { id: 'about', label: 'Sobre ell/ella', icon: Info },
    { id: 'friends', label: 'Amistats', icon: UserPlus },
    { id: 'groups', label: 'Grups', icon: Users },
    { id: 'posts', label: 'Publicacions', icon: FileText },
    { id: 'photos', label: 'Fotos', icon: Image }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <PageTemplate
      title={`Perfil de ${userData.profile.firstName}`}
      subtitle="Perfil públic de membre de la comunitat"
      statsData={statsData}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Breadcrumb Navigation */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <Link
            href="/dashboard/membres"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#3b82f6',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Membres
          </Link>
          <ChevronRight style={{ width: '16px', height: '16px' }} />
          <span>Perfil de {userData.profile.firstName}</span>
        </nav>

        {/* Cover Image Section */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          {/* Portada */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              height: '310px',
              borderRadius: '12px',
              overflow: 'hidden',
              background: userData.profile.coverImage ?
                `url(${userData.profile.coverImage}) center/cover` :
                'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
            }}
          />

          {/* Avatar - SENSE elements interactius (perfil públic) */}
          <div
            style={{
              position: 'relative',
              zIndex: 50,
              marginTop: '-64px',
              paddingLeft: '24px',
              marginBottom: '16px'
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '128px',
                height: '128px'
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '4px solid white',
                  backgroundColor: 'white',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }}
              >
                {userData.profile.avatar ? (
                  <img
                    src={userData.profile.avatar}
                    alt="Avatar"
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
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: 'white'
                    }}>
                      {getAvatarInitials(userData.profile.firstName, userData.profile.lastName)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User info below avatar */}
          <div style={{ marginTop: '16px', padding: '0 24px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{
                  fontSize: '30px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: 0
                }}>
                  {userData.profile.firstName} {isOwn ? userData.profile.lastName : `${userData.profile.lastName[0]}.`}
                </h2>
                <p style={{
                  fontSize: '20px',
                  color: '#6b7280',
                  margin: '4px 0 0 0'
                }}>
                  @{userData.profile.username}
                </p>

                <div style={{
                  marginTop: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: getAdministrationBadge(userData.profile.administration).color + '20',
                    color: getAdministrationBadge(userData.profile.administration).color
                  }}>
                    {getAdministrationBadge(userData.profile.administration).label}
                  </span>
                  <span style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    Registrat el {formatDate(userData.profile.createdAt)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {isOwn ? (
                  <Link
                    href="/dashboard/perfil"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    <User style={{ width: '18px', height: '18px' }} />
                    Editar perfil
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => setIsFollowing(!isFollowing)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        backgroundColor: isFollowing ? '#10b981' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      <UserPlus style={{ width: '18px', height: '18px' }} />
                      {isFollowing ? 'Connectat' : 'Connectar'}
                    </button>
                    <button
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        backgroundColor: 'transparent',
                        color: '#6b7280',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      <MessageSquare style={{ width: '18px', height: '18px' }} />
                      Enviar missatge
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px',
          border: '1px solid #f0f0f0',
          position: 'sticky',
          top: '80px',
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            borderBottom: '1px solid #f0f0f0'
          }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 24px',
                    border: 'none',
                    background: 'none',
                    color: isActive ? '#3b82f6' : '#6b7280',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '500',
                    cursor: 'pointer',
                    borderBottom: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    minWidth: 'fit-content'
                  }}
                >
                  <Icon style={{ width: '18px', height: '18px' }} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'timeline' && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '20px',
            border: '1px solid #f0f0f0'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Activity style={{ width: '20px', height: '20px' }} />
              Activitat Recent
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {userData.activities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '14px',
                        color: '#374151',
                        margin: '0 0 4px 0',
                        lineHeight: '1.4'
                      }}>
                        {activity.content}
                      </p>
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {activity.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Bio */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 16px 0'
              }}>
                Sobre {userData.profile.firstName}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#374151',
                lineHeight: '1.6',
                margin: 0
              }}>
                {userData.aboutData.bio}
              </p>
            </div>

            {/* Informació Professional */}
            {userData.aboutData.position && (
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 16px 0'
                }}>
                  Informació Professional
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Briefcase style={{ width: '12px', height: '12px' }} />
                      Càrrec
                    </label>
                    <p style={{ fontSize: '14px', color: '#374151', margin: '4px 0 0 0' }}>
                      {userData.aboutData.position}
                    </p>
                  </div>
                  <div>
                    <label style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <MapPin style={{ width: '12px', height: '12px' }} />
                      Ubicació
                    </label>
                    <p style={{ fontSize: '14px', color: '#374151', margin: '4px 0 0 0' }}>
                      {userData.aboutData.location}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Habilitats i Interessos - només si l'usuari els ha fet públics */}
            {(userData.skills.length > 0 || userData.interests.length > 0) && (
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 20px 0'
                }}>
                  Habilitats i Interessos
                </h3>

                {userData.skills.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      margin: '0 0 12px 0'
                    }}>
                      Habilitats
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {userData.skills.map((skill, index) => (
                        <span key={index} style={{
                          padding: '4px 12px',
                          backgroundColor: '#dbeafe',
                          color: '#1d4ed8',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {userData.interests.length > 0 && (
                  <div>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      margin: '0 0 12px 0'
                    }}>
                      Interessos
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {userData.interests.map((interest, index) => (
                        <span key={index} style={{
                          padding: '4px 12px',
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '20px',
            border: '1px solid #f0f0f0'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <UserPlus style={{ width: '20px', height: '20px' }} />
              Connexions ({userData.friends.length})
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {userData.friends.map((friend) => (
                <div key={friend.id} style={{
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: '0 auto 12px'
                  }}>
                    {friend.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    {friend.name}
                  </h4>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: '0 0 8px 0'
                  }}>
                    @{friend.nick}
                  </p>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    backgroundColor: getAdministrationBadge(friend.administration).color + '20',
                    color: getAdministrationBadge(friend.administration).color,
                    borderRadius: '10px',
                    fontWeight: '500'
                  }}>
                    {getAdministrationBadge(friend.administration).label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '20px',
            border: '1px solid #f0f0f0'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Users style={{ width: '20px', height: '20px' }} />
              Grups Públics ({userData.groups.length})
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {userData.groups.map((group) => (
                <div key={group.id} style={{
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      backgroundColor: '#8b5cf6',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {group.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 4px 0'
                      }}>
                        {group.name}
                      </h4>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '0 0 8px 0'
                      }}>
                        {group.members.toLocaleString()} membres
                      </p>
                      <p style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        margin: 0
                      }}>
                        Última activitat: {group.lastActivity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'posts' || activeTab === 'photos') && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '20px',
            border: '1px solid #f0f0f0'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {activeTab === 'posts' ? <FileText style={{ width: '20px', height: '20px' }} /> : <Image style={{ width: '20px', height: '20px' }} />}
              {activeTab === 'posts' ? 'Publicacions Públiques' : 'Fotos Públiques'}
            </h3>

            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6b7280'
            }}>
              {activeTab === 'posts' ? <FileText style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} /> : <Image style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />}
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                margin: '0 0 8px 0'
              }}>
                {activeTab === 'posts' ? 'Publicacions privades' : 'Fotos privades'}
              </p>
              <p style={{
                fontSize: '14px',
                margin: 0
              }}>
                {userData.profile.firstName} mantén aquesta secció privada
              </p>
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}