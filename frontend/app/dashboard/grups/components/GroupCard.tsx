'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Users,
  Globe,
  Lock,
  EyeOff,
  Briefcase,
  ChevronRight,
  UserPlus,
  Clock,
  MessageCircle,
  Shield,
  Loader2
} from 'lucide-react'

interface SensitiveCategory {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
}

interface Group {
  id: string
  name: string
  slug: string
  description?: string | null
  type: 'PUBLIC' | 'PRIVATE' | 'PROFESSIONAL' | 'SECRET'
  image?: string | null
  coverImage?: string | null
  membersCount: number
  isMember?: boolean
  userRole?: 'ADMIN' | 'MODERATOR' | 'MEMBER' | null
  requestStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null
  hasSensitiveCategory?: boolean
  sensitiveJobCategory?: SensitiveCategory | null
}

interface GroupCardProps {
  group: Group
  onRequestJoin?: (groupId: string) => Promise<void>
  onJoin?: (groupId: string) => Promise<void>
  isProcessing?: boolean
}

const TYPE_CONFIG = {
  PUBLIC: {
    label: 'Públic',
    icon: Globe,
    color: 'bg-green-100 text-green-700',
    gradient: 'from-green-400 to-emerald-500',
  },
  PRIVATE: {
    label: 'Privat',
    icon: Lock,
    color: 'bg-amber-100 text-amber-700',
    gradient: 'from-amber-400 to-orange-500',
  },
  PROFESSIONAL: {
    label: 'Professional',
    icon: Briefcase,
    color: 'bg-indigo-100 text-indigo-700',
    gradient: 'from-indigo-400 to-purple-500',
  },
  SECRET: {
    label: 'Secret',
    icon: EyeOff,
    color: 'bg-red-100 text-red-700',
    gradient: 'from-red-400 to-rose-500',
  },
}

export function GroupCard({ group, onRequestJoin, onJoin, isProcessing }: GroupCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const config = TYPE_CONFIG[group.type]
  const TypeIcon = config.icon

  const handleJoin = async () => {
    if (!onJoin || isLoading || isProcessing) return
    setIsLoading(true)
    try {
      await onJoin(group.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestJoin = async () => {
    if (!onRequestJoin || isLoading || isProcessing) return
    setIsLoading(true)
    try {
      await onRequestJoin(group.id)
    } finally {
      setIsLoading(false)
    }
  }

  const renderActionButton = () => {
    const buttonLoading = isLoading || isProcessing

    // Ja és membre
    if (group.isMember) {
      return (
        <Link
          href={`/dashboard/grups/${group.slug}`}
          className="w-full py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Entrar al grup
        </Link>
      )
    }

    // Sol·licitud pendent
    if (group.requestStatus === 'PENDING') {
      return (
        <button
          disabled
          className="w-full py-2.5 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <Clock className="w-4 h-4" />
          Sol·licitud pendent
        </button>
      )
    }

    // Grup públic - unió directa
    if (group.type === 'PUBLIC') {
      return (
        <button
          onClick={handleJoin}
          disabled={buttonLoading}
          className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {buttonLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          Unir-se
        </button>
      )
    }

    // Grups privats/professionals - sol·licitud
    if (group.type === 'PRIVATE' || group.type === 'PROFESSIONAL') {
      return (
        <button
          onClick={handleRequestJoin}
          disabled={buttonLoading}
          className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {buttonLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          Sol·licitar accés
        </button>
      )
    }

    // Secret - no hauria d'arribar aquí (no es mostren a la llista)
    return null
  }

  return (
    <div
      className="overflow-hidden border transition-all duration-300 flex flex-col h-full hover:border-indigo-300"
      style={{
        background: 'var(--GroupCard-background, #ffffff)',
        borderRadius: 'var(--GroupCard-border-radius, 12px)',
        borderColor: 'var(--GroupCard-border-color, #e5e7eb)',
        boxShadow: isHovered
          ? 'var(--GroupCard-hover-shadow, 0 10px 15px -3px rgb(0 0 0 / 0.1))'
          : 'var(--GroupCard-shadow, 0 1px 3px 0 rgb(0 0 0 / 0.1))',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover Image */}
      <div
        className={`bg-gradient-to-br ${config.gradient} relative overflow-hidden`}
        style={{ height: 'var(--GroupCard-header-height, 128px)' }}
      >
        {group.coverImage && (
          <Image
            src={group.coverImage}
            alt=""
            fill
            className="object-cover"
          />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Badge de tipus */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${config.color} backdrop-blur-sm bg-opacity-90`}>
            <TypeIcon className="w-3.5 h-3.5" />
            {config.label}
          </span>
        </div>

        {/* Badge de membre/rol */}
        {group.isMember && group.userRole && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
              {group.userRole === 'ADMIN' ? 'Admin' : group.userRole === 'MODERATOR' ? 'Moderador' : 'Membre'}
            </span>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="flex justify-start px-4 -mt-8 relative z-10">
        <div className="w-16 h-16 rounded-xl border-4 border-white shadow-md overflow-hidden bg-white">
          {group.image ? (
            <Image
              src={group.image}
              alt={group.name}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white`}>
              <TypeIcon className="w-7 h-7" />
            </div>
          )}
        </div>
      </div>

      {/* Contingut */}
      <div
        className="flex-1 flex flex-col pt-3"
        style={{ padding: 'var(--GroupCard-padding, 16px)', paddingTop: '12px' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/dashboard/grups/${group.slug}`}
            className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1"
          >
            {group.name}
          </Link>
          <ChevronRight className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
        </div>

        {/* Membres i categoria sensible */}
        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {group.membersCount} membres
          </span>
          {group.hasSensitiveCategory && group.sensitiveJobCategory && (
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: group.sensitiveJobCategory.color || '#6366f1' }}
              title={group.sensitiveJobCategory.name}
            >
              <Shield className="w-3.5 h-3.5" />
              Protegit
            </span>
          )}
        </div>

        {/* Descripció */}
        {group.description && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-3 flex-1">
            {group.description}
          </p>
        )}

        {/* Spacer per empènyer el botó a baix */}
        {!group.description && <div className="flex-1" />}

        {/* Acció */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          {renderActionButton()}
        </div>
      </div>
    </div>
  )
}
