'use client'

import { useState } from 'react'
import {
  X,
  Calendar,
  Clock,
  Star,
  Pin,
  Heart,
  MessageSquare,
  Share2,
  BarChart3,
  Flag,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Loader2,
  Eye,
  Image,
  ExternalLink
} from 'lucide-react'

interface Post {
  id: string
  content: string
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'POLL' | 'EVENT'
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'
  visibility: 'PUBLIC' | 'GROUPS' | 'PRIVATE'
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED'
  moderationNote?: string
  isOfficial: boolean
  officialBadge: string | null
  isPinned: boolean
  pinnedUntil?: string
  isFeatured: boolean
  scheduledAt: string | null
  publishedAt: string | null
  createdAt: string
  author: {
    id: string
    name: string | null
    nick: string | null
    image: string | null
    role: string
  }
  group: { id: string; name: string } | null
  poll?: {
    id: string
    question: string
    type: 'SINGLE' | 'MULTIPLE'
    totalVotes: number
    endsAt?: string
    isAnonymous: boolean
    options: { id: string; text: string; voteCount: number }[]
  }
  attachments: { id: string; type: string; url: string; filename?: string }[]
  _count: {
    likes: number
    comments: number
    shares: number
    reports: number
  }
}

interface PostDetailModalProps {
  post: Post
  onClose: () => void
  onUpdated: () => void
}

const STATUS_CONFIG = {
  DRAFT: { label: 'Esborrany', color: 'bg-gray-100 text-gray-700' },
  SCHEDULED: { label: 'Programat', color: 'bg-amber-100 text-amber-700' },
  PUBLISHED: { label: 'Publicat', color: 'bg-green-100 text-green-700' },
  ARCHIVED: { label: 'Arxivat', color: 'bg-red-100 text-red-700' }
}

const MODERATION_CONFIG = {
  PENDING: { label: 'Pendent', color: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Aprovat', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Rebutjat', color: 'bg-red-100 text-red-700' },
  FLAGGED: { label: 'Marcat', color: 'bg-orange-100 text-orange-700' }
}

export default function PostDetailModal({ post, onClose, onUpdated }: PostDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [moderationNote, setModerationNote] = useState('')
  const [showModerationForm, setShowModerationForm] = useState(false)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleAction = async (action: string, data?: any) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/gestio/feed-posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      })

      if (res.ok) {
        onUpdated()
        if (action === 'moderate') {
          setShowModerationForm(false)
          setModerationNote('')
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Segur que vols eliminar aquest post? Aquesta acció no es pot desfer.')) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/gestio/feed-posts/${post.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        onUpdated()
        onClose()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModerate = (status: string) => {
    setSelectedAction(status)
    setShowModerationForm(true)
  }

  const submitModeration = () => {
    if (selectedAction) {
      handleAction('moderate', {
        moderationStatus: selectedAction,
        moderationNote: moderationNote.trim() || undefined
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Detall del Post</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Author & Status */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {post.author.image ? (
                <img
                  src={post.author.image}
                  alt={post.author.name || ''}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-medium text-lg">
                    {(post.author.name || post.author.nick || '?')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {post.author.name || post.author.nick}
                  {post.author.role !== 'MEMBRE' && (
                    <span className="ml-2 text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                      {post.author.role}
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(post.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {post.isOfficial && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                  <Star className="w-3 h-3" />
                  {post.officialBadge || 'Oficial'}
                </span>
              )}
              {post.isPinned && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                  <Pin className="w-3 h-3" />
                  Fixat
                </span>
              )}
              {post.isFeatured && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                  <Star className="w-3 h-3" />
                  Destacat
                </span>
              )}
              <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_CONFIG[post.status]?.color || ''}`}>
                {STATUS_CONFIG[post.status]?.label || post.status}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${MODERATION_CONFIG[post.moderationStatus]?.color || ''}`}>
                {MODERATION_CONFIG[post.moderationStatus]?.label || post.moderationStatus}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Attachments */}
          {post.attachments.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Adjunts</h3>
              <div className="grid grid-cols-2 gap-2">
                {post.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                  >
                    {att.type === 'IMAGE' ? (
                      <Image className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    )}
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline truncate"
                    >
                      {att.filename || att.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Poll */}
          {post.poll && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-medium text-gray-900">{post.poll.question}</h3>
              </div>
              <div className="space-y-2 mb-3">
                {post.poll.options.map((option) => {
                  const percentage = post.poll!.totalVotes > 0
                    ? Math.round((option.voteCount / post.poll!.totalVotes) * 100)
                    : 0
                  return (
                    <div key={option.id} className="relative">
                      <div
                        className="absolute inset-0 bg-indigo-100 rounded"
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="relative flex items-center justify-between px-3 py-2">
                        <span className="text-sm text-gray-900">{option.text}</span>
                        <span className="text-sm font-medium text-gray-700">
                          {option.voteCount} ({percentage}%)
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Total: {post.poll.totalVotes} vots</span>
                <span>Tipus: {post.poll.type === 'SINGLE' ? 'Resposta única' : 'Resposta múltiple'}</span>
                {post.poll.isAnonymous && <span>Anònim</span>}
                {post.poll.endsAt && (
                  <span>Finalitza: {formatDate(post.poll.endsAt)}</span>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Heart className="w-4 h-4" />
              <span>{post._count.likes} likes</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MessageSquare className="w-4 h-4" />
              <span>{post._count.comments} comentaris</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Share2 className="w-4 h-4" />
              <span>{post._count.shares} compartits</span>
            </div>
            {post._count.reports > 0 && (
              <div className="flex items-center gap-2 text-red-600">
                <Flag className="w-4 h-4" />
                <span>{post._count.reports} reports</span>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Eye className="w-4 h-4" />
              <span>Visibilitat: {post.visibility}</span>
            </div>
            {post.group && (
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span>Grup: {post.group.name}</span>
              </div>
            )}
            {post.scheduledAt && (
              <div className="flex items-center gap-2 text-amber-600">
                <Clock className="w-4 h-4" />
                <span>Programat: {formatDate(post.scheduledAt)}</span>
              </div>
            )}
            {post.publishedAt && (
              <div className="flex items-center gap-2 text-green-600">
                <Calendar className="w-4 h-4" />
                <span>Publicat: {formatDate(post.publishedAt)}</span>
              </div>
            )}
          </div>

          {/* Moderation Note */}
          {post.moderationNote && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm font-medium text-orange-800 mb-1">Nota de moderació:</p>
              <p className="text-sm text-orange-700">{post.moderationNote}</p>
            </div>
          )}

          {/* Moderation Form */}
          {showModerationForm && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">
                {selectedAction === 'APPROVED' && 'Aprovar post'}
                {selectedAction === 'REJECTED' && 'Rebutjar post'}
                {selectedAction === 'FLAGGED' && 'Marcar post'}
              </h4>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nota de moderació (opcional)
                </label>
                <textarea
                  value={moderationNote}
                  onChange={(e) => setModerationNote(e.target.value)}
                  placeholder="Explica el motiu de la decisió..."
                  rows={3}
                  className="w-full px-4 py-2 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={submitModeration}
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isLoading ? 'Processant...' : 'Confirmar'}
                </button>
                <button
                  onClick={() => {
                    setShowModerationForm(false)
                    setModerationNote('')
                    setSelectedAction(null)
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel·lar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction('pin', { isPinned: !post.isPinned })}
              disabled={isLoading}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                post.isPinned
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Pin className="w-4 h-4" />
              {post.isPinned ? 'Desfixar' : 'Fixar'}
            </button>
            <button
              onClick={() => handleAction('feature', { isFeatured: !post.isFeatured })}
              disabled={isLoading}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                post.isFeatured
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Star className="w-4 h-4" />
              {post.isFeatured ? 'Treure destacat' : 'Destacar'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!showModerationForm && (
              <>
                <button
                  onClick={() => handleModerate('APPROVED')}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Aprovar
                </button>
                <button
                  onClick={() => handleModerate('FLAGGED')}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Marcar
                </button>
                <button
                  onClick={() => handleModerate('REJECTED')}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Rebutjar
                </button>
              </>
            )}
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
