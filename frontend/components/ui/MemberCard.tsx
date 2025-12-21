'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Member {
  id: string;
  username: string;
  name: string;
  role: string;
  department: string;
  location: string;
  administration: 'LOCAL' | 'AUTONOMICA' | 'CENTRAL';
  avatar: string;
  coverImage: string;
  coverColor?: string;
  isOnline: boolean;
  lastActive: string;
  mutualConnections: number;
  isConnected: boolean;
  connectionStatus: 'none' | 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';
  connectionId?: string | null;
  isIncoming?: boolean;
  expiresAt?: string | null;
  bio: string;
}

interface ConnectionActions {
  onConnect: (memberId: string) => Promise<void>;
  onAccept: (connectionId: string, memberId: string) => Promise<void>;
  onReject: (connectionId: string, memberId: string) => Promise<void>;
  onDisconnect: (connectionId: string, memberId: string) => Promise<void>;
  onCancel: (connectionId: string, memberId: string) => Promise<void>;
}

interface MemberCardProps {
  member: Member;
  viewMode: 'grid' | 'list';
  connectionActions?: ConnectionActions;
}

export function MemberCard({ member, viewMode, connectionActions }: MemberCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const getAvatarInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getDaysRemaining = (expirationDate?: string | null) => {
    if (!expirationDate) return 15;
    const now = new Date();
    const expires = new Date(expirationDate);
    const diffTime = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleConnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!connectionActions) return;

    setIsConnecting(true);
    try {
      await connectionActions.onConnect(member.id);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!connectionActions || !member.connectionId) return;

    setIsConnecting(true);
    try {
      await connectionActions.onAccept(member.connectionId, member.id);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!connectionActions || !member.connectionId) return;

    setIsConnecting(true);
    try {
      await connectionActions.onReject(member.connectionId, member.id);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!connectionActions || !member.connectionId) return;

    setIsConnecting(true);
    try {
      await connectionActions.onCancel(member.connectionId, member.id);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!connectionActions || !member.connectionId) return;

    setIsConnecting(true);
    try {
      await connectionActions.onDisconnect(member.connectionId, member.id);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Redirigir a missatges amb aquest usuari
    router.push(`/dashboard/missatges?user=${member.username}`);
  };

  const handleViewProfile = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    router.push(`/dashboard/membres/${member.username}`);
  };

  // Determinar l'estat de connexió normalitzat
  const getConnectionState = () => {
    if (member.connectionStatus === 'accepted' || member.isConnected) return 'connected';
    if (member.connectionStatus === 'pending' && member.isIncoming) return 'pending_received';
    if (member.connectionStatus === 'pending' && !member.isIncoming) return 'pending_sent';
    return 'none';
  };

  const connectionState = getConnectionState();

  // Renderitzar botons segons estat
  const renderActionButtons = () => {
    switch (connectionState) {
      case 'connected':
        return (
          <>
            <button
              onClick={handleMessage}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: 'transparent',
                color: '#3b82f6',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Missatge
            </button>
            <button
              onClick={handleDisconnect}
              disabled={isConnecting}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: isConnecting ? '#9ca3af' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isConnecting ? 'not-allowed' : 'pointer'
              }}
            >
              {isConnecting ? '...' : 'Desconnectar'}
            </button>
          </>
        );

      case 'pending_sent':
        return (
          <>
            <button
              onClick={handleCancel}
              disabled={isConnecting}
              style={{
                flex: 2,
                padding: '8px 12px',
                backgroundColor: isConnecting ? '#9ca3af' : '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isConnecting ? 'not-allowed' : 'pointer'
              }}
              title={`Expira en ${getDaysRemaining(member.expiresAt)} dies`}
            >
              {isConnecting ? 'Cancel·lant...' : `Pendent (${getDaysRemaining(member.expiresAt)}d)`}
            </button>
            <button
              onClick={handleViewProfile}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: 'transparent',
                color: '#6c757d',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Perfil
            </button>
          </>
        );

      case 'pending_received':
        return (
          <>
            <button
              onClick={handleAccept}
              disabled={isConnecting}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: isConnecting ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isConnecting ? 'not-allowed' : 'pointer'
              }}
            >
              {isConnecting ? '...' : 'Acceptar'}
            </button>
            <button
              onClick={handleReject}
              disabled={isConnecting}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: 'transparent',
                color: '#dc3545',
                border: '2px solid #dc3545',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isConnecting ? 'not-allowed' : 'pointer'
              }}
            >
              {isConnecting ? '...' : 'Rebutjar'}
            </button>
          </>
        );

      default:
        return (
          <>
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              style={{
                flex: 2,
                padding: '8px 12px',
                backgroundColor: isConnecting ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isConnecting ? 'not-allowed' : 'pointer'
              }}
            >
              {isConnecting ? 'Enviant...' : 'Connectar'}
            </button>
            <button
              onClick={handleViewProfile}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: 'transparent',
                color: '#6c757d',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Perfil
            </button>
          </>
        );
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleViewProfile}
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          border: isHovered ? '2px solid #3b82f6' : '2px solid #e5e7eb',
          boxShadow: isHovered ? '0 10px 15px -3px rgba(59, 130, 246, 0.2)' : '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
          cursor: 'pointer',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'all 0.2s ease-in-out',
          marginBottom: '12px'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '3px solid #fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: member.coverColor || '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                    {getAvatarInitials(member.name)}
                  </span>
                </div>
              )}
            </div>
            {member.isOnline && (
              <div style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '16px',
                height: '16px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                border: '2px solid #fff'
              }} />
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50', marginBottom: '4px' }}>
              {member.name}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>
              {member.role} {member.department && `• ${member.department}`}
            </div>
            <div style={{ fontSize: '13px', color: '#8e8e93', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {member.location && <span>{member.location}</span>}
              {member.mutualConnections > 0 && <span>{member.mutualConnections} connexions mútues</span>}
              <span>{member.isOnline ? '🟢 En línia' : member.lastActive}</span>
            </div>
          </div>

          {/* Botons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {renderActionButtons()}
          </div>
        </div>
      </div>
    );
  }

  // Vista Grid
  return (
    <div
      onClick={handleViewProfile}
      style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        border: isHovered ? '2px solid #3b82f6' : '2px solid #e5e7eb',
        boxShadow: isHovered ? '0 10px 15px -3px rgba(59, 130, 246, 0.2)' : '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease-in-out'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover */}
      <div style={{
        height: '80px',
        backgroundImage: member.coverImage ? `url(${member.coverImage})` : undefined,
        backgroundColor: member.coverColor || '#3b82f6',
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
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(16, 185, 129, 0.3) 100%)'
        }} />
      </div>

      {/* Avatar */}
      <div style={{ position: 'relative', marginTop: '-30px', textAlign: 'center', marginBottom: '10px' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '4px solid #fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            margin: '0 auto',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {member.avatar ? (
              <img src={member.avatar} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: member.coverColor || '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                  {getAvatarInitials(member.name)}
                </span>
              </div>
            )}
          </div>
          {member.isOnline && (
            <div style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '18px',
              height: '18px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              border: '3px solid #fff'
            }} />
          )}
        </div>
      </div>

      {/* Contingut */}
      <div style={{ padding: '0 16px 16px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50', margin: '0 0 4px 0' }}>
            {member.name}
          </h3>
          <p style={{ fontSize: '13px', color: '#6c757d', margin: '0 0 2px 0' }}>
            {member.role}
          </p>
          {member.department && (
            <p style={{ fontSize: '12px', color: '#8e8e93', margin: 0 }}>
              {member.department}
            </p>
          )}
        </div>

        {member.bio && (
          <div style={{
            fontSize: '12px',
            color: '#6c757d',
            lineHeight: '1.4',
            marginBottom: '12px',
            textAlign: 'center',
            height: '32px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {member.bio}
          </div>
        )}

        <div style={{
          fontSize: '11px',
          color: '#8e8e93',
          textAlign: 'center',
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {member.location && <span>{member.location}</span>}
          {member.mutualConnections > 0 && <span>• {member.mutualConnections} mútues</span>}
        </div>

        <div style={{
          fontSize: '11px',
          color: member.isOnline ? '#10b981' : '#8e8e93',
          textAlign: 'center',
          marginBottom: '16px',
          fontWeight: '500'
        }}>
          {member.isOnline ? '🟢 En línia ara' : member.lastActive}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {renderActionButtons()}
        </div>
      </div>
    </div>
  );
}
