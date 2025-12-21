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
  LOCAL: { label: 'Administracio Local', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  AUTONOMICA: { label: 'Administracio Autonomica', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  CENTRAL: { label: 'Administracio Central', color: 'bg-amber-100 text-amber-700 border-amber-200' },
};

const coverGradients = [
  'from-rose-400 via-fuchsia-500 to-indigo-500',
  'from-blue-400 via-cyan-500 to-teal-500',
  'from-amber-400 via-orange-500 to-red-500',
  'from-emerald-400 via-teal-500 to-cyan-500',
  'from-violet-400 via-purple-500 to-fuchsia-500',
  'from-pink-400 via-rose-500 to-red-500',
  'from-indigo-400 via-blue-500 to-cyan-500',
  'from-green-400 via-emerald-500 to-teal-500',
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

  // ==================== VISTA GRID ====================
  if (viewMode === 'grid') {
    return (
      <div
        className={`bg-white rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer h-full flex flex-col group relative ${
          isHovered
            ? 'border-indigo-400 shadow-xl -translate-y-1 ring-2 ring-indigo-500 ring-offset-2'
            : 'border-gray-200 shadow-sm'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleViewProfile}
      >
        {/* ========== CONTINGUT NORMAL DE LA TARGETA ========== */}

        {/* Cover Image */}
        <div className={`h-28 flex-shrink-0 bg-gradient-to-br ${gradient} relative`}>
          {member.coverImage && (
            <img
              src={member.coverImage}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {/* Indicador de perfil amb restriccions */}
          {member.hasSystemRestrictions && (
            <div className="absolute top-2 right-2 p-1.5 bg-white/20 backdrop-blur-sm rounded-full" title="Perfil amb restriccions de privacitat">
              <Lock className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="relative px-4 -mt-11 z-10 flex-shrink-0">
          <div className="relative w-[88px] h-[88px] mx-auto">
            <div className="w-full h-full rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
              {member.avatar ? (
                <img src={member.avatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-2xl font-bold">{initials}</span>
              )}
            </div>
            {member.isOnline && (
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-[3px] border-white rounded-full shadow-md" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col px-4 pb-3 pt-2 text-center">
          <h3 className="font-semibold text-gray-900 text-base truncate">
            {displayName}
          </h3>
          {showNickSeparate && (
            <p className="text-sm text-gray-500">@{member.username}</p>
          )}

          <div className="mt-2 h-6 flex justify-center items-center">
            {adminInfo ? (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${adminInfo.color}`}>
                <Building2 className="w-3 h-3" />
                {adminInfo.label}
              </span>
            ) : (
              <span className="invisible text-xs">placeholder</span>
            )}
          </div>

          <div className="mt-3 flex justify-center gap-5 flex-1">
            {showConnections ? (
              <div className="text-center">
                <span className="block text-base font-bold text-gray-900">
                  {connectionsToShow}
                </span>
                <span className="text-xs text-gray-500">Connexions</span>
              </div>
            ) : (
              <div className="text-center">
                <span className="block text-base font-bold text-gray-400">-</span>
                <span className="text-xs text-gray-400">Privat</span>
              </div>
            )}
            <div className="text-center">
              <span className="block text-base font-bold text-gray-900">
                {member.followersCount || 0}
              </span>
              <span className="text-xs text-gray-500">Seguidors</span>
            </div>
          </div>

          <div className="mt-auto pt-3 space-y-2">
            {connectionState === 'connected' ? (
              <>
                <button
                  onClick={handleMessage}
                  className="w-full py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Enviar missatge
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleViewProfile}
                    className="flex-1 py-1.5 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Perfil
                  </button>
                  <button
                    onClick={handleDisconnect}
                    disabled={isConnecting}
                    className="flex-1 py-1.5 px-4 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
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
                  className="w-full py-2 px-4 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Clock className="w-4 h-4" />
                  {isConnecting ? 'Cancel-lant...' : `Sol-licitud enviada (${getDaysRemaining(member.expiresAt)}d)`}
                </button>
                <button
                  onClick={handleViewProfile}
                  className="w-full py-1.5 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Veure perfil
                </button>
              </>
            ) : connectionState === 'pending_received' ? (
              <>
                <div className="flex gap-2">
                  <button
                    onClick={handleAccept}
                    disabled={isConnecting}
                    className="flex-1 py-2 px-4 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    {isConnecting ? '...' : 'Acceptar'}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isConnecting}
                    className="flex-1 py-2 px-4 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    {isConnecting ? '...' : 'Rebutjar'}
                  </button>
                </div>
                <button
                  onClick={handleViewProfile}
                  className="w-full py-1.5 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Veure perfil
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  {isConnecting ? 'Enviant...' : 'Connectar'}
                </button>
                <button
                  onClick={handleViewProfile}
                  className="w-full py-1.5 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Veure perfil
                </button>
              </>
            )}
          </div>
        </div>

        {/* ========== HOVER OVERLAY COMPLET ========== */}
        <div className="absolute inset-0 z-20
                        bg-gradient-to-b from-indigo-600/95 via-indigo-700/95 to-purple-800/95
                        opacity-0 group-hover:opacity-100
                        transition-all duration-300 ease-out
                        flex flex-col items-center justify-center
                        p-4 text-white
                        pointer-events-none group-hover:pointer-events-auto
                        rounded-2xl">

          {/* Avatar */}
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-full border-2 border-white/30 shadow-lg
                            bg-gradient-to-br from-white/20 to-white/5
                            flex items-center justify-center overflow-hidden">
              {member.avatar ? (
                <img src={member.avatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xl font-bold">{initials}</span>
              )}
            </div>
            {member.isOnline && (
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full" />
            )}
          </div>

          {/* Nom i nick - respectant privacitat */}
          <h4 className="font-semibold text-lg text-center">{displayName}</h4>
          {showNickSeparate && (
            <p className="text-sm text-white/70">@{member.username}</p>
          )}

          {/* Indicador de restriccions */}
          {member.hasSystemRestrictions && (
            <div className="flex items-center gap-1.5 text-xs text-white/60 mt-1">
              <Lock className="w-3 h-3" />
              <span>Perfil restringit</span>
            </div>
          )}

          {/* Administracio - sempre visible */}
          {adminInfo && (
            <div className="mt-3 flex items-center gap-1.5 text-sm">
              <Building2 className="w-4 h-4 text-white/70" />
              <span>{adminInfo.label}</span>
            </div>
          )}

          {/* Departament - només si és públic */}
          {showDepartment && (
            <div className="flex items-center gap-1.5 text-sm text-white/80 mt-1">
              <Briefcase className="w-4 h-4 text-white/60" />
              <span>{member.department}</span>
            </div>
          )}

          {/* Separador */}
          <div className="w-16 h-px bg-white/20 my-4" />

          {/* Meta info - respectant privacitat */}
          <div className="flex items-center gap-3 text-xs text-white/70">
            {member.isOnline ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                En linia
              </span>
            ) : showLastActive && member.lastActive && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatLastActive(member.lastActive)}
              </span>
            )}

            {(member.isOnline || (showLastActive && member.lastActive)) && showJoinedDate && (
              <span className="text-white/30">-</span>
            )}

            {showJoinedDate && (member.joinedAt || member.createdAt) && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatJoinedDate(member.joinedAt || (member.createdAt ? new Date(member.createdAt).toISOString() : undefined))}
              </span>
            )}
          </div>

          {/* Connexions - respectant privacitat */}
          {showConnections ? (
            <p className="mt-3 text-sm">
              <span className="font-semibold">{connectionsToShow}</span>
              <span className="text-white/70 ml-1">Connexions</span>
            </p>
          ) : (
            <p className="mt-3 text-sm text-white/50">
              <Lock className="w-3 h-3 inline mr-1" />
              Connexions privades
            </p>
          )}

          {/* Botons d'accio */}
          <div className="flex gap-2 mt-4">
            {connectionState === 'connected' ? (
              <>
                <button
                  onClick={handleMessage}
                  className="px-4 py-2 bg-white text-indigo-700 text-sm font-medium rounded-lg
                             hover:bg-white/90 transition-colors
                             flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  Missatge
                </button>
                <button
                  onClick={handleViewProfile}
                  className="px-4 py-2 bg-white/20 text-white text-sm font-medium rounded-lg
                             hover:bg-white/30 transition-colors
                             flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  Perfil
                </button>
              </>
            ) : connectionState === 'pending_sent' ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isConnecting}
                  className="px-4 py-2 bg-amber-400 text-amber-900 text-sm font-medium rounded-lg
                             hover:bg-amber-300 transition-colors disabled:opacity-50
                             flex items-center gap-1.5"
                >
                  <Clock className="w-4 h-4" />
                  {isConnecting ? '...' : 'Cancel-lar'}
                </button>
                <button
                  onClick={handleViewProfile}
                  className="px-4 py-2 bg-white/20 text-white text-sm font-medium rounded-lg
                             hover:bg-white/30 transition-colors
                             flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  Perfil
                </button>
              </>
            ) : connectionState === 'pending_received' ? (
              <>
                <button
                  onClick={handleAccept}
                  disabled={isConnecting}
                  className="px-4 py-2 bg-green-400 text-green-900 text-sm font-medium rounded-lg
                             hover:bg-green-300 transition-colors disabled:opacity-50
                             flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {isConnecting ? '...' : 'Acceptar'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={isConnecting}
                  className="px-4 py-2 bg-red-400 text-white text-sm font-medium rounded-lg
                             hover:bg-red-300 transition-colors disabled:opacity-50
                             flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  {isConnecting ? '...' : 'Rebutjar'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="px-4 py-2 bg-white text-indigo-700 text-sm font-medium rounded-lg
                             hover:bg-white/90 transition-colors disabled:opacity-50
                             flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  {isConnecting ? '...' : 'Connectar'}
                </button>
                <button
                  onClick={handleViewProfile}
                  className="px-4 py-2 bg-white/20 text-white text-sm font-medium rounded-lg
                             hover:bg-white/30 transition-colors
                             flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
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
      className={`bg-white rounded-xl p-4 border-2 transition-all duration-200 cursor-pointer mb-3 ${
        isHovered
          ? 'border-indigo-400 shadow-md bg-gray-50 ring-2 ring-indigo-500 ring-offset-1'
          : 'border-gray-200 shadow-sm'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewProfile}
    >
      <div className="flex items-center gap-4">
        {/* Avatar amb online indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
            {member.avatar ? (
              <img src={member.avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-lg font-bold">{initials}</span>
            )}
          </div>
          {member.isOnline && (
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">{displayName}</h3>
            {showNickSeparate && (
              <span className="text-sm text-gray-500">@{member.username}</span>
            )}
            {adminInfo && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${adminInfo.color}`}>
                <Building2 className="w-3 h-3" />
                {adminInfo.label}
              </span>
            )}
            {member.hasSystemRestrictions && (
              <span title="Perfil amb restriccions de privacitat">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
              </span>
            )}
          </div>
          {/* Rol i departament - respectant privacitat */}
          {(showRole || showDepartment) && (
            <p className="text-sm text-gray-600 truncate">
              {showRole && member.role}
              {showRole && showDepartment && member.role && member.department && ' - '}
              {showDepartment && member.department}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            {showConnections ? (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {connectionsToShow} connexions
              </span>
            ) : (
              <span className="flex items-center gap-1 text-gray-400">
                <Lock className="w-3 h-3" />
                Privat
              </span>
            )}
            {member.isOnline ? (
              <span className="flex items-center gap-1 text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                En linia
              </span>
            ) : showLastActive && member.lastActive && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatLastActive(member.lastActive)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {connectionState === 'connected' ? (
            <>
              <button
                onClick={handleMessage}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Missatge
              </button>
              <button
                onClick={handleDisconnect}
                disabled={isConnecting}
                className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {isConnecting ? '...' : 'Desconnectar'}
              </button>
            </>
          ) : connectionState === 'pending_sent' ? (
            <button
              onClick={handleCancel}
              disabled={isConnecting}
              className="px-4 py-2 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50"
            >
              {isConnecting ? '...' : `Pendent (${getDaysRemaining(member.expiresAt)}d)`}
            </button>
          ) : connectionState === 'pending_received' ? (
            <>
              <button
                onClick={handleAccept}
                disabled={isConnecting}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isConnecting ? '...' : 'Acceptar'}
              </button>
              <button
                onClick={handleReject}
                disabled={isConnecting}
                className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {isConnecting ? '...' : 'Rebutjar'}
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isConnecting ? '...' : 'Connectar'}
            </button>
          )}
          <button
            onClick={handleViewProfile}
            className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Perfil
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
