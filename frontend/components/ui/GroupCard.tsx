'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Group {
  id: number;
  name: string;
  description: string;
  category: string;
  privacy: 'public' | 'private' | 'secret';
  coverImage: string;
  membersCount: number;
  postsCount: number;
  lastActivity: string;
  isMember: boolean;
  isAdmin: boolean;
  adminName: string;
  tags: string[];
  membershipStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  joinRequestDate?: string;
}

interface GroupCardProps {
  group: Group;
  viewMode: 'grid' | 'list';
}

export function GroupCard({ group, viewMode }: GroupCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(group);
  const [isLoading, setIsLoading] = useState(false);

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    console.log(`🔔 ${type.toUpperCase()}: ${message}`);
    // Aquí se podría integrar con un sistema de notificaciones real
  };

  const handleJoinGroup = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (currentGroup.privacy === 'public') {
        // Unirse directamente a grupos públicos
        setCurrentGroup(prev => ({
          ...prev,
          isMember: true,
          membersCount: prev.membersCount + 1,
          membershipStatus: 'approved'
        }));
        showNotification('success', `T'has unit al grup "${currentGroup.name}"`);
      } else if (currentGroup.privacy === 'private') {
        // Enviar solicitud para grupos privados
        setCurrentGroup(prev => ({
          ...prev,
          membershipStatus: 'pending',
          joinRequestDate: new Date().toISOString()
        }));
        showNotification('info', `Sol·licitud enviada per unir-te al grup "${currentGroup.name}". L'administrador revisarà la teva petició.`);
        showNotification('success', `📧 Notificació enviada a ${currentGroup.adminName}: Nova sol·licitud de ${currentGroup.name}`);
      } else {
        // Grupos secretos - no deberían aparecer en la lista
        showNotification('error', 'Aquest grup no accepta noves sol·licituds');
      }

    } catch (error) {
      showNotification('error', 'Error al processar la sol·licitud');
      console.error('Error al unir-se al grup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCurrentGroup(prev => ({
        ...prev,
        isMember: false,
        membersCount: Math.max(0, prev.membersCount - 1),
        membershipStatus: 'none'
      }));

      showNotification('info', `Has abandonat el grup "${currentGroup.name}"`);

    } catch (error) {
      showNotification('error', 'Error al abandonar el grup');
      console.error('Error al abandonar grup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCurrentGroup(prev => ({
        ...prev,
        membershipStatus: 'none',
        joinRequestDate: undefined
      }));

      showNotification('info', `Sol·licitud cancel·lada per al grup "${currentGroup.name}"`);

    } catch (error) {
      showNotification('error', 'Error al cancel·lar la sol·licitud');
      console.error('Error al cancel·lar sol·licitud:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewGroup = () => {
    // Convertir el nombre a slug
    const slug = group.name
      .toLowerCase()
      .replace(/[àáäâ]/g, 'a')
      .replace(/[èéëê]/g, 'e')
      .replace(/[ìíïî]/g, 'i')
      .replace(/[òóöô]/g, 'o')
      .replace(/[ùúüû]/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    router.push(`/dashboard/grups/${slug}`);
  };

  const getPrivacyInfo = () => {
    switch (group.privacy) {
      case 'public':
        return { icon: '', label: 'Públic', color: '#10b981' };
      case 'private':
        return { icon: '', label: 'Privat', color: '#f59e0b' };
      case 'secret':
        return { icon: '', label: 'Secret', color: '#ef4444' };
      default:
        return { icon: '', label: 'Públic', color: '#10b981' };
    }
  };

  const privacy = getPrivacyInfo();

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleViewGroup}
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          border: isHovered ? '2px solid #3b82f6' : '2px solid #e5e7eb',
          boxShadow: isHovered ? '0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1)' : '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
          cursor: 'pointer',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'all 0.2s ease-in-out',
          marginBottom: '12px'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          {/* Cover image pequeña */}
          <div style={{
            width: '80px',
            height: '60px',
            borderRadius: '8px',
            backgroundImage: `url(${group.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            flexShrink: 0
          }}>
            {/* Overlay con icono de privacidad */}
            <div style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              backgroundColor: privacy.color,
              color: 'white',
              borderRadius: '4px',
              padding: '2px 4px',
              fontSize: '8px',
              fontWeight: '600'
            }}>
              {privacy.icon}
            </div>
          </div>

          {/* Información del grupo */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  margin: '0 0 4px 0',
                  lineHeight: '1.2'
                }}>
                  {group.name}
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '6px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: privacy.color,
                    fontWeight: '500'
                  }}>
                    {privacy.icon} {privacy.label}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#8e8e93'
                  }}>
                    {group.category}
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {currentGroup.isMember ? (
                  <>
                    <button
                      onClick={handleLeaveGroup}
                      disabled={isLoading}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: isLoading ? '#e5e7eb' : 'transparent',
                        color: isLoading ? '#9ca3af' : '#ef4444',
                        border: `1px solid ${isLoading ? '#e5e7eb' : '#ef4444'}`,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.backgroundColor = '#ef4444';
                          e.currentTarget.style.color = 'white';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#ef4444';
                        }
                      }}
                    >
                      {isLoading ? 'Abandonant...' : 'Abandonar'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewGroup();
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Entrar
                    </button>
                  </>
                ) : currentGroup.membershipStatus === 'pending' ? (
                  <>
                    <button
                      onClick={handleCancelRequest}
                      disabled={isLoading}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: isLoading ? '#9ca3af' : '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {isLoading ? 'Cancel·lant...' : 'Sol·licitud pendent'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewGroup();
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'transparent',
                        color: '#6c757d',
                        border: '1px solid #e9ecef',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Veure
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleJoinGroup}
                    disabled={isLoading}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isLoading ? 'Processant...' : (currentGroup.privacy === 'private' ? 'Sol·licitar' : 'Unir-se')}
                  </button>
                )}
              </div>
            </div>

            <p style={{
              fontSize: '13px',
              color: '#6c757d',
              margin: '0 0 8px 0',
              lineHeight: '1.4',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {group.description}
            </p>

            {/* Stats */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '11px',
              color: '#8e8e93'
            }}>
              <span>{group.membersCount} membres</span>
              <span>{group.postsCount} posts</span>
              <span>{group.lastActivity}</span>
              <span>Admin: {group.adminName}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista Grid (por defecto)
  return (
    <div
      onClick={handleViewGroup}
      style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        border: isHovered ? '2px solid #3b82f6' : '2px solid #e5e7eb',
        boxShadow: isHovered ? '0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1)' : '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease-in-out',
        height: '380px',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover Image */}
      <div style={{
        height: '140px',
        backgroundImage: `url(${group.coverImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        {/* Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.4) 100%)'
        }} />

        {/* Badge de privacidad */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: privacy.color,
          color: 'white',
          borderRadius: '6px',
          padding: '4px 8px',
          fontSize: '11px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {privacy.icon} {privacy.label}
        </div>

        {/* Información de miembro */}
        {group.isMember && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.9)',
            color: 'white',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            Membre
          </div>
        )}
      </div>

      {/* Contenido del grupo */}
      <div style={{
        padding: '16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Nombre y categoría */}
        <div style={{ marginBottom: '12px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#2c3e50',
            margin: '0 0 4px 0',
            lineHeight: '1.2'
          }}>
            {group.name}
          </h3>
          <p style={{
            fontSize: '12px',
            color: '#8e8e93',
            margin: 0,
            fontWeight: '500'
          }}>
            {group.category}
          </p>
        </div>

        {/* Descripción */}
        <p style={{
          fontSize: '13px',
          color: '#6c757d',
          lineHeight: '1.4',
          margin: '0 0 12px 0',
          flex: 1,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>
          {group.description}
        </p>

        {/* Tags */}
        {group.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            marginBottom: '12px'
          }}>
            {group.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#f0f7ff',
                  color: '#3b82f6',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '500'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          fontSize: '11px',
          color: '#8e8e93'
        }}>
          <span>{group.membersCount}</span>
          <span>{group.postsCount}</span>
          <span>{group.lastActivity}</span>
        </div>

        {/* Admin info */}
        <div style={{
          fontSize: '11px',
          color: '#8e8e93',
          marginBottom: '12px',
          textAlign: 'center'
        }}>
          Admin: {group.adminName}
        </div>

        {/* Botones de acción */}
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          {currentGroup.isMember ? (
            <>
              <button
                onClick={handleLeaveGroup}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: isLoading ? '#e5e7eb' : 'transparent',
                  color: isLoading ? '#9ca3af' : '#ef4444',
                  border: `2px solid ${isLoading ? '#e5e7eb' : '#ef4444'}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#ef4444';
                  }
                }}
              >
                {isLoading ? 'Abandonant...' : 'Abandonar'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewGroup();
                }}
                style={{
                  flex: 2,
                  padding: '8px 12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Entrar al grup
              </button>
            </>
          ) : currentGroup.membershipStatus === 'pending' ? (
            <>
              <button
                onClick={handleCancelRequest}
                disabled={isLoading}
                style={{
                  flex: 2,
                  padding: '8px 12px',
                  backgroundColor: isLoading ? '#9ca3af' : '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isLoading ? 'Cancel·lant...' : 'Sol·licitud pendent'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewGroup();
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  color: '#6c757d',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Veure
              </button>
            </>
          ) : (
            <button
              onClick={handleJoinGroup}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              {isLoading ? 'Processant...' : (currentGroup.privacy === 'private' ? 'Sol·licitar unir-se' : 'Unir-se al grup')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}