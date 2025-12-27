'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Shield,
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  MessageSquare,
  Calendar,
  Eye,
  User,
  FileText
} from 'lucide-react'

interface ModerationPost {
  id: string
  content: string
  type: string
  moderationStatus: 'PENDING' | 'FLAGGED'
  reportCount: number
  createdAt: string
  author: {
    id: string
    name: string | null
    nick: string | null
    image: string | null
  }
  reports?: {
    id: string
    reason: string
    description: string | null
    createdAt: string
    reporter: {
      id: string
      name: string | null
    }
  }[]
  _count: {
    likes: number
    comments: number
    reports: number
  }
}

interface Report {
  id: string
  reason: string
  description: string | null
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTIONED'
  createdAt: string
  post: {
    id: string
    content: string
    author: {
      id: string
      name: string | null
      nick: string | null
      image: string | null
    }
  }
  reporter: {
    id: string
    name: string | null
  }
}

interface ModerationPanelProps {
  onClose: () => void
  onUpdated: () => void
}

const REASON_LABELS: Record<string, string> = {
  SPAM: 'Spam',
  HARASSMENT: 'Assetjament',
  HATE_SPEECH: 'Discurs d\'odi',
  VIOLENCE: 'Violència',
  SEXUAL_CONTENT: 'Contingut sexual',
  MISINFORMATION: 'Desinformació',
  COPYRIGHT: 'Infracció de copyright',
  PRIVACY: 'Violació de privacitat',
  OTHER: 'Altres'
}

export default function ModerationPanel({ onClose, onUpdated }: ModerationPanelProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'reports'>('posts')
  const [posts, setPosts] = useState<ModerationPost[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [moderationNote, setModerationNote] = useState('')
  const [showNoteFor, setShowNoteFor] = useState<string | null>(null)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        type: activeTab === 'reports' ? 'reports' : 'posts',
        limit: '50'
      })
      const res = await fetch(`/api/gestio/feed-posts/moderation?${params}`)
      const data = await res.json()

      if (res.ok) {
        if (activeTab === 'reports') {
          setReports(data.reports || [])
        } else {
          setPosts(data.posts || [])
        }
      }
    } catch (error) {
      console.error('Error carregant dades:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModeratePost = async (postId: string, status: string, note?: string) => {
    setProcessingId(postId)
    try {
      const res = await fetch(`/api/gestio/feed-posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'moderate',
          moderationStatus: status,
          moderationNote: note
        })
      })

      if (res.ok) {
        setPosts(posts.filter(p => p.id !== postId))
        onUpdated()
      }
    } catch (error) {
      console.error('Error moderant post:', error)
    } finally {
      setProcessingId(null)
      setShowNoteFor(null)
      setModerationNote('')
      setSelectedAction(null)
    }
  }

  const handleResolveReport = async (reportId: string, status: string, note?: string) => {
    setProcessingId(reportId)
    try {
      const res = await fetch('/api/gestio/feed-posts/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status, note })
      })

      if (res.ok) {
        setReports(reports.filter(r => r.id !== reportId))
        onUpdated()
      }
    } catch (error) {
      console.error('Error resolent report:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600" />
            Panell de Moderació
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'posts'
                ? 'border-orange-600 text-orange-600 bg-orange-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Posts Pendents
              {posts.length > 0 && (
                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                  {posts.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'reports'
                ? 'border-red-600 text-red-600 bg-red-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Flag className="w-4 h-4" />
              Reports
              {reports.length > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {reports.length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
          ) : activeTab === 'posts' ? (
            // Posts Tab
            posts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tot al dia!</h3>
                <p className="text-gray-500">No hi ha posts pendents de moderació</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Author avatar */}
                      <div className="flex-shrink-0">
                        {post.author.image ? (
                          <img
                            src={post.author.image}
                            alt={post.author.name || ''}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {post.author.name || post.author.nick}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            post.moderationStatus === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {post.moderationStatus === 'PENDING' ? 'Pendent' : 'Marcat'}
                          </span>
                          {post._count.reports > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                              <Flag className="w-3 h-3" />
                              {post._count.reports} reports
                            </span>
                          )}
                        </div>

                        <p className="text-gray-700 text-sm mb-3">
                          {truncateContent(post.content)}
                        </p>

                        {/* Reports preview */}
                        {post.reports && post.reports.length > 0 && (
                          <div className="mb-3 p-3 bg-red-50 rounded-lg">
                            <p className="text-xs font-medium text-red-800 mb-2">Últims reports:</p>
                            <div className="space-y-1">
                              {post.reports.slice(0, 3).map((report) => (
                                <div key={report.id} className="text-xs text-red-700">
                                  <span className="font-medium">{REASON_LABELS[report.reason] || report.reason}</span>
                                  {report.description && (
                                    <span className="text-red-600"> - {report.description}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {post._count.comments}
                          </span>
                        </div>

                        {/* Note form */}
                        {showNoteFor === post.id && (
                          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                            <textarea
                              value={moderationNote}
                              onChange={(e) => setModerationNote(e.target.value)}
                              placeholder="Nota de moderació (opcional)..."
                              rows={2}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none mb-2"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleModeratePost(post.id, selectedAction!, moderationNote.trim() || undefined)}
                                disabled={processingId === post.id}
                                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                              >
                                {processingId === post.id ? 'Processant...' : 'Confirmar'}
                              </button>
                              <button
                                onClick={() => {
                                  setShowNoteFor(null)
                                  setModerationNote('')
                                  setSelectedAction(null)
                                }}
                                className="px-3 py-1.5 text-gray-700 text-sm hover:bg-gray-100 rounded-lg"
                              >
                                Cancel·lar
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        {showNoteFor !== post.id && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedAction('APPROVED')
                                setShowNoteFor(post.id)
                              }}
                              disabled={processingId === post.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Aprovar
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAction('REJECTED')
                                setShowNoteFor(post.id)
                              }}
                              disabled={processingId === post.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              Rebutjar
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAction('FLAGGED')
                                setShowNoteFor(post.id)
                              }}
                              disabled={processingId === post.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors disabled:opacity-50"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              Marcar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Reports Tab
            reports.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tot al dia!</h3>
                <p className="text-gray-500">No hi ha reports pendents</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="border border-red-200 rounded-lg p-4 hover:border-red-300 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <Flag className="w-5 h-5 text-red-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                            {REASON_LABELS[report.reason] || report.reason}
                          </span>
                          <span className="text-xs text-gray-500">
                            Reportat per {report.reporter.name || 'Anònim'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(report.createdAt)}
                          </span>
                        </div>

                        {report.description && (
                          <p className="text-sm text-gray-700 mb-3">
                            "{report.description}"
                          </p>
                        )}

                        {/* Post preview */}
                        <div className="p-3 bg-gray-50 rounded-lg mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            {report.post.author.image ? (
                              <img
                                src={report.post.author.image}
                                alt=""
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-3 h-3 text-gray-400" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {report.post.author.name || report.post.author.nick}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {truncateContent(report.post.content, 150)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResolveReport(report.id, 'DISMISSED')}
                            disabled={processingId === report.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                          >
                            {processingId === report.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Descartar
                          </button>
                          <button
                            onClick={() => handleResolveReport(report.id, 'ACTIONED')}
                            disabled={processingId === report.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            {processingId === report.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Actuar
                          </button>
                          <button
                            onClick={() => {
                              // Navigate to post detail
                              window.open(`/gestio/contingut/feed-posts?postId=${report.post.id}`, '_blank')
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Veure post
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
