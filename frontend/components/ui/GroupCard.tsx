'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  MessageSquare,
  Clock,
  Lock,
  Globe,
  Eye,
  LogIn,
  LogOut,
  UserPlus,
  X,
  Loader2
} from 'lucide-react';

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

const privacyConfig = {
  public: {
    label: 'Públic',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: Globe
  },
  private: {
    label: 'Privat',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Lock
  },
  secret: {
    label: 'Secret',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: Eye
  }
};

export function GroupCard({ group, viewMode }: GroupCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(group);
  const [isLoading, setIsLoading] = useState(false);

  const privacy = privacyConfig[currentGroup.privacy];
  const PrivacyIcon = privacy.icon;

  // Generar slug per navegació
  const getSlug = () => {
    return group.name
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
  };

  const handleViewGroup = () => {
    router.push(`/dashboard/grups/${getSlug()}`);
  };

  const handleJoinGroup = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (currentGroup.privacy === 'public') {
        setCurrentGroup(prev => ({
          ...prev,
          isMember: true,
          membersCount: prev.membersCount + 1,
          membershipStatus: 'approved'
        }));
      } else if (currentGroup.privacy === 'private') {
        setCurrentGroup(prev => ({
          ...prev,
          membershipStatus: 'pending',
          joinRequestDate: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Error al unir-se al grup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentGroup(prev => ({
        ...prev,
        isMember: false,
        membersCount: Math.max(0, prev.membersCount - 1),
        membershipStatus: 'none'
      }));
    } catch (error) {
      console.error('Error al abandonar grup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentGroup(prev => ({
        ...prev,
        membershipStatus: 'none',
        joinRequestDate: undefined
      }));
    } catch (error) {
      console.error('Error al cancel·lar sol·licitud:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== VISTA LIST ====================
  if (viewMode === 'list') {
    return (
      <div
        onClick={handleViewGroup}
        className={`bg-white rounded-xl p-4 border-2 transition-all duration-200 cursor-pointer ${
          isHovered
            ? 'border-indigo-400 shadow-md bg-gray-50 ring-2 ring-indigo-500 ring-offset-1'
            : 'border-gray-200 shadow-sm'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-4">
          {/* Imatge del grup */}
          <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
            {currentGroup.coverImage ? (
              <img
                src={currentGroup.coverImage}
                alt={currentGroup.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            )}
            {/* Badge privacitat */}
            <div className="absolute top-1 right-1">
              <PrivacyIcon className="w-3 h-3 text-white drop-shadow-md" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-gray-900">{currentGroup.name}</h3>
              {currentGroup.isMember && (
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                  Membre
                </span>
              )}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${privacy.color}`}>
                <PrivacyIcon className="w-3 h-3" />
                {privacy.label}
              </span>
            </div>
            <p className="text-sm text-gray-500">{currentGroup.category}</p>
            <p className="text-sm text-gray-600 line-clamp-1 mt-1">{currentGroup.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {currentGroup.membersCount} membres
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {currentGroup.postsCount} posts
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {currentGroup.lastActivity}
              </span>
            </div>
          </div>

          {/* Accions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {currentGroup.isMember ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewGroup();
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </button>
                <button
                  onClick={handleLeaveGroup}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  {isLoading ? '...' : 'Abandonar'}
                </button>
              </>
            ) : currentGroup.membershipStatus === 'pending' ? (
              <>
                <button
                  onClick={handleCancelRequest}
                  disabled={isLoading}
                  className="px-4 py-2 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                  {isLoading ? '...' : 'Pendent'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewGroup();
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Veure
                </button>
              </>
            ) : (
              <button
                onClick={handleJoinGroup}
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {isLoading ? 'Processant...' : currentGroup.privacy === 'private' ? 'Sol·licitar' : 'Unir-se'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== VISTA GRID ====================
  return (
    <div
      onClick={handleViewGroup}
      className={`bg-white rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer h-full flex flex-col group ${
        isHovered
          ? 'border-indigo-400 shadow-xl -translate-y-1 ring-2 ring-indigo-500 ring-offset-2'
          : 'border-gray-200 shadow-sm'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover Image */}
      <div className="h-32 relative flex-shrink-0">
        {currentGroup.coverImage ? (
          <img
            src={currentGroup.coverImage}
            alt={currentGroup.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Badge Membre */}
        {currentGroup.isMember && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-indigo-600 text-white text-xs font-medium rounded-md">
              Membre
            </span>
          </div>
        )}

        {/* Badge Privacitat */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${privacy.color}`}>
            <PrivacyIcon className="w-3 h-3" />
            {privacy.label}
          </span>
        </div>
      </div>

      {/* Contingut */}
      <div className="flex-1 flex flex-col p-4">
        {/* Nom i categoria */}
        <h3 className="font-semibold text-gray-900 text-base line-clamp-1">{currentGroup.name}</h3>
        <p className="text-xs text-gray-500 font-medium mt-0.5">{currentGroup.category}</p>

        {/* Descripció */}
        <p className="text-sm text-gray-600 line-clamp-2 mt-2 flex-1">{currentGroup.description}</p>

        {/* Tags */}
        {currentGroup.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {currentGroup.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {currentGroup.membersCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            {currentGroup.postsCount}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {currentGroup.lastActivity}
          </span>
        </div>

        {/* Botons d'acció */}
        <div className="flex gap-2 mt-4">
          {currentGroup.isMember ? (
            <>
              <button
                onClick={handleLeaveGroup}
                disabled={isLoading}
                className="flex-1 py-2 px-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                {isLoading ? '...' : 'Abandonar'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewGroup();
                }}
                className="flex-[2] py-2 px-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                Entrar al grup
              </button>
            </>
          ) : currentGroup.membershipStatus === 'pending' ? (
            <>
              <button
                onClick={handleCancelRequest}
                disabled={isLoading}
                className="flex-[2] py-2 px-3 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                {isLoading ? 'Cancel·lant...' : 'Sol·licitud pendent'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewGroup();
                }}
                className="flex-1 py-2 px-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                Veure
              </button>
            </>
          ) : (
            <button
              onClick={handleJoinGroup}
              disabled={isLoading}
              className="w-full py-2 px-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {isLoading ? 'Processant...' : currentGroup.privacy === 'private' ? 'Sol·licitar unir-se' : 'Unir-se al grup'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
