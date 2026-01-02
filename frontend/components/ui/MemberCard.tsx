'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Users,
  UserPlus,
  MessageCircle,
  User,
  Building2,
  Briefcase,
  Calendar,
  MoreHorizontal,
  Check,
  X,
  Lock
} from 'lucide-react';

interface PrivacySettings {
  showRealName?: boolean;
  showPosition?: boolean;
  showDepartment?: boolean;
  showBio?: boolean;
  showLocation?: boolean;
  showJoinedDate?: boolean;
  showLastActive?: boolean;
  showConnections?: boolean;
}

interface Member {
  id: string;
  username: string;
  name: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role: string | null;
  department: string | null;
  departmentPublic?: boolean;
  location: string | null;
  administration: 'LOCAL' | 'AUTONOMICA' | 'CENTRAL';
  avatar: string;
  coverImage: string;
  coverColor?: string;
  isOnline: boolean;
  lastActive: string | null;
  joinedAt?: string | null;
  createdAt?: string | Date | null;
  mutualConnections: number;
  isConnected: boolean;
  connectionStatus: 'none' | 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';
  connectionId?: string | null;
  isIncoming?: boolean;
  expiresAt?: string | null;
  bio: string | null;
  connectionsCount?: number | null;
  totalConnections?: number | null;
  followersCount?: number;
  privacySettings?: PrivacySettings;
  hasSystemRestrictions?: boolean;
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

const adminLabels = {
  LOCAL: { label: 'Administracio Local', bgColor: '#dbeafe', color: '#1d4ed8', borderColor: '#bfdbfe' },
  AUTONOMICA: { label: 'Administracio Autonomica', bgColor: '#f3e8ff', color: '#7c3aed', borderColor: '#e9d5ff' },
  CENTRAL: { label: 'Administracio Central', bgColor: '#fef3c7', color: '#b45309', borderColor: '#fde68a' },
};

const coverGradients = [
  'linear-gradient(135deg, #fb7185 0%, #d946ef 50%, #6366f1 100%)',
  'linear-gradient(135deg, #60a5fa 0%, #22d3ee 50%, #14b8a6 100%)',
  'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)',
  'linear-gradient(135deg, #34d399 0%, #14b8a6 50%, #22d3ee 100%)',
  'linear-gradient(135deg, #a78bfa 0%, #a855f7 50%, #d946ef 100%)',
  'linear-gradient(135deg, #f472b6 0%, #fb7185 50%, #ef4444 100%)',
  'linear-gradient(135deg, #818cf8 0%, #3b82f6 50%, #22d3ee 100%)',
  'linear-gradient(135deg, #4ade80 0%, #10b981 50%, #14b8a6 100%)',
];

export function MemberCard({ member, viewMode, connectionActions }: MemberCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Generar gradient consistent basat en l'id
  const gradientIndex = member.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % coverGradients.length;
  const gradient = coverGradients[gradientIndex];

  // Privacitat - per defecte tot és públic
  const privacy = member.privacySettings || {};

  // Nom a mostrar: si showRealName és false o name és null, mostrar nick
  const displayName = (privacy.showRealName !== false && member.name)
    ? member.name
    : `@${member.username}`;

  // Determinar si mostrar el nick separat (només si estem mostrant el nom real)
  const showNickSeparate = privacy.showRealName !== false && member.name;

  // Inicials per l'avatar (basat en displayName)
  const initials = displayName
    .replace('@', '')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '??';

  const adminInfo = member.administration ? adminLabels[member.administration] : null;

  // Camps amb privacitat aplicada
  const showDepartment = privacy.showDepartment !== false && member.department;
  const showRole = privacy.showPosition !== false && member.role;
  const showLastActive = privacy.showLastActive !== false && member.lastActive;
  const showJoinedDate = privacy.showJoinedDate !== false && (member.joinedAt || member.createdAt);
  const showConnections = privacy.showConnections !== false && (member.connectionsCount != null || member.totalConnections != null);
  const connectionsToShow = member.connectionsCount ?? member.totalConnections ?? member.mutualConnections ?? 0;

  // Format joined date
  const formatJoinedDate = (date?: string) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('ca-ES', { month: 'short', year: 'numeric' });
  };

  // Format last active
  const formatLastActive = (date?: string) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 5) return 'Ara mateix';
    if (diffMins < 60) return `Fa ${diffMins} min`;
    if (diffHours < 24) return `Fa ${diffHours}h`;
    if (diffDays < 7) return `Fa ${diffDays} dies`;
    return d.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' });
  };

  const getDaysRemaining = (expirationDate?: string | null) => {
    if (!expirationDate) return 15;
    const now = new Date();
    const expires = new Date(expirationDate);
    const diffTime = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Determinar l'estat de connexio normalitzat
  const getConnectionState = () => {
    if (member.connectionStatus === 'accepted' || member.isConnected) return 'connected';
    if (member.connectionStatus === 'pending' && member.isIncoming) return 'pending_received';
    if (member.connectionStatus === 'pending' && !member.isIncoming) return 'pending_sent';
    return 'none';
  };

  const connectionState = getConnectionState();

  // Handlers
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
    router.push(`/dashboard/missatges?user=${member.username}`);
  };

  const handleViewProfile = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    router.push(`/dashboard/membres/${member.username}`);
  };

  // Button styles
  const primaryButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: 'var(--MemberCard-primary-button-bg, #4f46e5)',
    color: 'var(--MemberCard-primary-button-color, #ffffff)',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: 'var(--MemberCard-secondary-button-bg, #f3f4f6)',
    color: 'var(--MemberCard-secondary-button-color, #374151)',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  };

  const dangerButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: 'var(--MemberCard-danger-button-bg, #fef2f2)',
    color: 'var(--MemberCard-danger-button-color, #dc2626)',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  };

  const warningButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: 'var(--MemberCard-warning-button-bg, #fef3c7)',
    color: 'var(--MemberCard-warning-button-color, #b45309)',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  };

  const successButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: 'var(--MemberCard-success-button-bg, #16a34a)',
    color: 'var(--MemberCard-success-button-color, #ffffff)',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  };

  // ==================== VISTA GRID ====================
  if (viewMode === 'grid') {
    return (
      <div
        style={{
          backgroundColor: 'var(--MemberCard-background, #ffffff)',
          borderRadius: 'var(--MemberCard-border-radius, 16px)',
          overflow: 'hidden',
          border: `2px solid ${isHovered ? 'var(--MemberCard-hover-border-color, #818cf8)' : 'var(--MemberCard-border-color, #e5e7eb)'}`,
          boxShadow: isHovered
            ? 'var(--MemberCard-hover-shadow, 0 20px 25px -5px rgba(99, 102, 241, 0.1), 0 0 0 2px #818cf8, 0 0 0 4px rgba(129, 140, 248, 0.3))'
            : 'var(--MemberCard-shadow, 0 1px 3px 0 rgb(0 0 0 / 0.1))',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleViewProfile}
      >
        {/* ========== CONTINGUT NORMAL DE LA TARGETA ========== */}

        {/* Cover Image */}
        <div
          style={{
            height: 'var(--MemberCard-cover-height, 112px)',
            flexShrink: 0,
            background: member.coverImage ? undefined : gradient,
            position: 'relative',
          }}
        >
          {member.coverImage && (
            <img
              src={member.coverImage}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
          }} />
          {/* Indicador de perfil amb restriccions */}
          {member.hasSystemRestrictions && (
            <div
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                padding: '6px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(4px)',
                borderRadius: '9999px',
              }}
              title="Perfil amb restriccions de privacitat"
            >
              <Lock style={{ width: '14px', height: '14px', color: 'white' }} />
            </div>
          )}
        </div>

        {/* Avatar */}
        <div style={{ position: 'relative', padding: '0 16px', marginTop: '-44px', zIndex: 10, flexShrink: 0 }}>
          <div style={{ position: 'relative', width: 'var(--MemberCard-avatar-size, 88px)', height: 'var(--MemberCard-avatar-size, 88px)', margin: '0 auto' }}>
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '4px solid white',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                background: 'var(--MemberCard-avatar-gradient, linear-gradient(135deg, #6366f1, #a855f7))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {member.avatar ? (
                <img src={member.avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>{initials}</span>
              )}
            </div>
            {member.isOnline && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'var(--MemberCard-online-color, #22c55e)',
                  border: '3px solid white',
                  borderRadius: '50%',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 16px 12px', textAlign: 'center' }}>
          <h3 style={{
            fontWeight: '600',
            color: 'var(--MemberCard-title-color, #111827)',
            fontSize: '16px',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {displayName}
          </h3>
          {showNickSeparate && (
            <p style={{
              fontSize: '14px',
              color: 'var(--MemberCard-text-color, #6b7280)',
              margin: 0,
            }}>
              @{member.username}
            </p>
          )}

          <div style={{ marginTop: '8px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {adminInfo ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '500',
                border: `1px solid ${adminInfo.borderColor}`,
                backgroundColor: adminInfo.bgColor,
                color: adminInfo.color,
              }}>
                <Building2 style={{ width: '12px', height: '12px' }} />
                {adminInfo.label}
              </span>
            ) : (
              <span style={{ visibility: 'hidden', fontSize: '12px' }}>placeholder</span>
            )}
          </div>

          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '20px', flex: 1 }}>
            {showConnections ? (
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: 'var(--MemberCard-stats-value-color, #111827)',
                }}>
                  {connectionsToShow}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--MemberCard-text-color, #6b7280)' }}>Connexions</span>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#9ca3af' }}>-</span>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Privat</span>
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <span style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'var(--MemberCard-stats-value-color, #111827)',
              }}>
                {member.followersCount || 0}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--MemberCard-text-color, #6b7280)' }}>Seguidors</span>
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {connectionState === 'connected' ? (
              <>
                <button onClick={handleMessage} style={{ ...primaryButtonStyle, width: '100%' }}>
                  <MessageCircle style={{ width: '16px', height: '16px' }} />
                  Enviar missatge
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleViewProfile} style={{ ...secondaryButtonStyle, flex: 1, padding: '6px 16px' }}>
                    <User style={{ width: '16px', height: '16px' }} />
                    Perfil
                  </button>
                  <button
                    onClick={handleDisconnect}
                    disabled={isConnecting}
                    style={{ ...dangerButtonStyle, flex: 1, padding: '6px 16px', opacity: isConnecting ? 0.5 : 1 }}
                  >
                    {isConnecting ? '...' : 'Desconnectar'}
                  </button>
                </div>
              </>
            ) : connectionState === 'pending_sent' ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isConnecting}
                  style={{ ...warningButtonStyle, width: '100%', opacity: isConnecting ? 0.5 : 1 }}
                >
                  <Clock style={{ width: '16px', height: '16px' }} />
                  {isConnecting ? 'Cancel-lant...' : `Sol-licitud enviada (${getDaysRemaining(member.expiresAt)}d)`}
                </button>
                <button onClick={handleViewProfile} style={{ ...secondaryButtonStyle, width: '100%', padding: '6px 16px' }}>
                  <User style={{ width: '16px', height: '16px' }} />
                  Veure perfil
                </button>
              </>
            ) : connectionState === 'pending_received' ? (
              <>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleAccept}
                    disabled={isConnecting}
                    style={{ ...successButtonStyle, flex: 1, opacity: isConnecting ? 0.5 : 1 }}
                  >
                    <Check style={{ width: '16px', height: '16px' }} />
                    {isConnecting ? '...' : 'Acceptar'}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isConnecting}
                    style={{ ...dangerButtonStyle, flex: 1, opacity: isConnecting ? 0.5 : 1 }}
                  >
                    <X style={{ width: '16px', height: '16px' }} />
                    {isConnecting ? '...' : 'Rebutjar'}
                  </button>
                </div>
                <button onClick={handleViewProfile} style={{ ...secondaryButtonStyle, width: '100%', padding: '6px 16px' }}>
                  <User style={{ width: '16px', height: '16px' }} />
                  Veure perfil
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  style={{ ...primaryButtonStyle, width: '100%', opacity: isConnecting ? 0.5 : 1 }}
                >
                  <UserPlus style={{ width: '16px', height: '16px' }} />
                  {isConnecting ? 'Enviant...' : 'Connectar'}
                </button>
                <button onClick={handleViewProfile} style={{ ...secondaryButtonStyle, width: '100%', padding: '6px 16px' }}>
                  <User style={{ width: '16px', height: '16px' }} />
                  Veure perfil
                </button>
              </>
            )}
          </div>
        </div>

        {/* ========== HOVER OVERLAY COMPLET ========== */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            background: 'var(--MemberCard-overlay-gradient, linear-gradient(to bottom, rgba(79, 70, 229, 0.95), rgba(109, 40, 217, 0.95)))',
            opacity: isHovered ? 1 : 0,
            transition: 'all 0.3s ease-out',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            color: 'white',
            pointerEvents: isHovered ? 'auto' : 'none',
            borderRadius: 'var(--MemberCard-border-radius, 16px)',
          }}
        >
          {/* Avatar */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {member.avatar ? (
                <img src={member.avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>{initials}</span>
              )}
            </div>
            {member.isOnline && (
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#4ade80',
                  border: '2px solid white',
                  borderRadius: '50%',
                }}
              />
            )}
          </div>

          {/* Nom i nick - respectant privacitat */}
          <h4 style={{ fontWeight: '600', fontSize: '18px', textAlign: 'center', margin: 0 }}>{displayName}</h4>
          {showNickSeparate && (
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>@{member.username}</p>
          )}

          {/* Indicador de restriccions */}
          {member.hasSystemRestrictions && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
              <Lock style={{ width: '12px', height: '12px' }} />
              <span>Perfil restringit</span>
            </div>
          )}

          {/* Administracio - sempre visible */}
          {adminInfo && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
              <Building2 style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.7)' }} />
              <span>{adminInfo.label}</span>
            </div>
          )}

          {/* Departament - només si és públic */}
          {showDepartment && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>
              <Briefcase style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.6)' }} />
              <span>{member.department}</span>
            </div>
          )}

          {/* Separador */}
          <div style={{ width: '64px', height: '1px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '16px 0' }} />

          {/* Meta info - respectant privacitat */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            {member.isOnline ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: '#4ade80', borderRadius: '50%' }} />
                En linia
              </span>
            ) : showLastActive && member.lastActive && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock style={{ width: '12px', height: '12px' }} />
                {formatLastActive(member.lastActive)}
              </span>
            )}

            {(member.isOnline || (showLastActive && member.lastActive)) && showJoinedDate && (
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>-</span>
            )}

            {showJoinedDate && (member.joinedAt || member.createdAt) && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar style={{ width: '12px', height: '12px' }} />
                {formatJoinedDate(member.joinedAt || (member.createdAt ? new Date(member.createdAt).toISOString() : undefined))}
              </span>
            )}
          </div>

          {/* Connexions - respectant privacitat */}
          {showConnections ? (
            <p style={{ marginTop: '12px', fontSize: '14px' }}>
              <span style={{ fontWeight: '600' }}>{connectionsToShow}</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', marginLeft: '4px' }}>Connexions</span>
            </p>
          ) : (
            <p style={{ marginTop: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
              <Lock style={{ width: '12px', height: '12px', display: 'inline', marginRight: '4px' }} />
              Connexions privades
            </p>
          )}

          {/* Botons d'accio */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            {connectionState === 'connected' ? (
              <>
                <button
                  onClick={handleMessage}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'white',
                    color: 'var(--MemberCard-primary-button-bg, #4f46e5)',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <MessageCircle style={{ width: '16px', height: '16px' }} />
                  Missatge
                </button>
                <button
                  onClick={handleViewProfile}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <User style={{ width: '16px', height: '16px' }} />
                  Perfil
                </button>
              </>
            ) : connectionState === 'pending_sent' ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isConnecting}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#fbbf24',
                    color: '#78350f',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: isConnecting ? 0.5 : 1,
                  }}
                >
                  <Clock style={{ width: '16px', height: '16px' }} />
                  {isConnecting ? '...' : 'Cancel-lar'}
                </button>
                <button
                  onClick={handleViewProfile}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <User style={{ width: '16px', height: '16px' }} />
                  Perfil
                </button>
              </>
            ) : connectionState === 'pending_received' ? (
              <>
                <button
                  onClick={handleAccept}
                  disabled={isConnecting}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#4ade80',
                    color: '#14532d',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: isConnecting ? 0.5 : 1,
                  }}
                >
                  <Check style={{ width: '16px', height: '16px' }} />
                  {isConnecting ? '...' : 'Acceptar'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={isConnecting}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f87171',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: isConnecting ? 0.5 : 1,
                  }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                  {isConnecting ? '...' : 'Rebutjar'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'white',
                    color: 'var(--MemberCard-primary-button-bg, #4f46e5)',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: isConnecting ? 0.5 : 1,
                  }}
                >
                  <UserPlus style={{ width: '16px', height: '16px' }} />
                  {isConnecting ? '...' : 'Connectar'}
                </button>
                <button
                  onClick={handleViewProfile}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <User style={{ width: '16px', height: '16px' }} />
                  Perfil
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== VISTA LIST ====================
  return (
    <div
      style={{
        backgroundColor: isHovered ? 'var(--MemberCard-hover-background, #f9fafb)' : 'var(--MemberCard-background, #ffffff)',
        borderRadius: 'var(--MemberCard-border-radius-list, 12px)',
        padding: 'var(--MemberCard-padding, 16px)',
        border: `2px solid ${isHovered ? 'var(--MemberCard-hover-border-color, #818cf8)' : 'var(--MemberCard-border-color, #e5e7eb)'}`,
        boxShadow: isHovered
          ? 'var(--MemberCard-hover-shadow-list, 0 4px 12px -2px rgba(99, 102, 241, 0.15), 0 0 0 2px #818cf8, 0 0 0 4px rgba(129, 140, 248, 0.2))'
          : 'var(--MemberCard-shadow, 0 1px 3px 0 rgb(0 0 0 / 0.1))',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginBottom: '12px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewProfile}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Avatar amb online indicator */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            style={{
              width: 'var(--MemberCard-avatar-size-list, 56px)',
              height: 'var(--MemberCard-avatar-size-list, 56px)',
              borderRadius: '50%',
              background: 'var(--MemberCard-avatar-gradient, linear-gradient(135deg, #6366f1, #a855f7))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {member.avatar ? (
              <img src={member.avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>{initials}</span>
            )}
          </div>
          {member.isOnline && (
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '16px',
                height: '16px',
                backgroundColor: 'var(--MemberCard-online-color, #22c55e)',
                border: '2px solid white',
                borderRadius: '50%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            />
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3 style={{
              fontWeight: '600',
              color: 'var(--MemberCard-title-color, #111827)',
              fontSize: '15px',
              margin: 0,
            }}>
              {displayName}
            </h3>
            {showNickSeparate && (
              <span style={{ fontSize: '14px', color: 'var(--MemberCard-text-color, #6b7280)' }}>
                @{member.username}
              </span>
            )}
            {adminInfo && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '500',
                border: `1px solid ${adminInfo.borderColor}`,
                backgroundColor: adminInfo.bgColor,
                color: adminInfo.color,
              }}>
                <Building2 style={{ width: '12px', height: '12px' }} />
                {adminInfo.label}
              </span>
            )}
            {member.hasSystemRestrictions && (
              <span title="Perfil amb restriccions de privacitat">
                <Lock style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
              </span>
            )}
          </div>
          {/* Rol i departament - respectant privacitat */}
          {(showRole || showDepartment) && (
            <p style={{
              fontSize: '14px',
              color: 'var(--MemberCard-description-color, #4b5563)',
              margin: '2px 0 0 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {showRole && member.role}
              {showRole && showDepartment && member.role && member.department && ' - '}
              {showDepartment && member.department}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '12px', color: 'var(--MemberCard-text-color, #6b7280)' }}>
            {showConnections ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users style={{ width: '12px', height: '12px' }} />
                {connectionsToShow} connexions
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9ca3af' }}>
                <Lock style={{ width: '12px', height: '12px' }} />
                Privat
              </span>
            )}
            {member.isOnline ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%' }} />
                En linia
              </span>
            ) : showLastActive && member.lastActive && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock style={{ width: '12px', height: '12px' }} />
                {formatLastActive(member.lastActive)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {connectionState === 'connected' ? (
            <>
              <button onClick={handleMessage} style={primaryButtonStyle}>
                Missatge
              </button>
              <button
                onClick={handleDisconnect}
                disabled={isConnecting}
                style={{ ...dangerButtonStyle, opacity: isConnecting ? 0.5 : 1 }}
              >
                {isConnecting ? '...' : 'Desconnectar'}
              </button>
            </>
          ) : connectionState === 'pending_sent' ? (
            <button
              onClick={handleCancel}
              disabled={isConnecting}
              style={{ ...warningButtonStyle, opacity: isConnecting ? 0.5 : 1 }}
            >
              {isConnecting ? '...' : `Pendent (${getDaysRemaining(member.expiresAt)}d)`}
            </button>
          ) : connectionState === 'pending_received' ? (
            <>
              <button
                onClick={handleAccept}
                disabled={isConnecting}
                style={{ ...successButtonStyle, opacity: isConnecting ? 0.5 : 1 }}
              >
                {isConnecting ? '...' : 'Acceptar'}
              </button>
              <button
                onClick={handleReject}
                disabled={isConnecting}
                style={{ ...dangerButtonStyle, opacity: isConnecting ? 0.5 : 1 }}
              >
                {isConnecting ? '...' : 'Rebutjar'}
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              style={{ ...primaryButtonStyle, opacity: isConnecting ? 0.5 : 1 }}
            >
              {isConnecting ? '...' : 'Connectar'}
            </button>
          )}
          <button
            onClick={handleViewProfile}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'var(--MemberCard-secondary-button-color, #374151)',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '8px',
              border: '1px solid var(--MemberCard-border-color, #e5e7eb)',
              cursor: 'pointer',
            }}
          >
            Perfil
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              color: '#9ca3af',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <MoreHorizontal style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
