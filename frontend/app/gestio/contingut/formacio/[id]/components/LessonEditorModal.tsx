'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2, AlertCircle, BookOpen, Video, FileText, ExternalLink, HelpCircle, Play, Sparkles } from 'lucide-react'
import { PostEditor } from '@/components/feed/PostEditor'

interface Lesson {
  id: string
  title: string
  type: 'TEXT' | 'VIDEO' | 'QUIZ' | 'DOCUMENT' | 'EXTERNAL' | 'INTERACTIVE'
  content?: string | null
  videoUrl?: string | null
  videoDuration?: number | null
  documentUrl?: string | null
  externalUrl?: string | null
  description?: string | null
  estimatedDuration: number | null
  isFree: boolean
  isPublished: boolean
  order: number
}

interface LessonEditorModalProps {
  moduleId: string
  lesson: Lesson | null
  onClose: () => void
  onSuccess: () => void
}

const LESSON_TYPES = [
  { value: 'TEXT', label: 'Text', icon: BookOpen, color: 'text-gray-500' },
  { value: 'VIDEO', label: 'Vídeo', icon: Video, color: 'text-purple-500' },
  { value: 'QUIZ', label: 'Quiz', icon: HelpCircle, color: 'text-amber-500' },
  { value: 'DOCUMENT', label: 'Document', icon: FileText, color: 'text-blue-500' },
  { value: 'EXTERNAL', label: 'Enllaç extern', icon: ExternalLink, color: 'text-green-500' },
  { value: 'INTERACTIVE', label: 'Interactiu', icon: Play, color: 'text-pink-500' }
]

export function LessonEditorModal({ moduleId, lesson, onClose, onSuccess }: LessonEditorModalProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<Lesson['type']>('TEXT')
  const [content, setContent] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoDuration, setVideoDuration] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [isPublished, setIsPublished] = useState(true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const isEditing = !!lesson

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title)
      setType(lesson.type)
      setContent(lesson.content || '')
      setDescription(lesson.description || '')
      setVideoUrl(lesson.videoUrl || '')
      setVideoDuration(lesson.videoDuration?.toString() || '')
      setDocumentUrl(lesson.documentUrl || '')
      setExternalUrl(lesson.externalUrl || '')
      setEstimatedDuration(lesson.estimatedDuration?.toString() || '')
      setIsFree(lesson.isFree)
      setIsPublished(lesson.isPublished)
    }
  }, [lesson])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim()) {
      setError('El títol és obligatori')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data: any = {
        title,
        type,
        description: description || null,
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null,
        isFree,
        isPublished
      }

      // Add type-specific fields
      if (type === 'TEXT') {
        data.content = content
      } else if (type === 'VIDEO') {
        data.videoUrl = videoUrl
        data.videoDuration = videoDuration ? parseInt(videoDuration) : null
      } else if (type === 'DOCUMENT') {
        data.documentUrl = documentUrl
      } else if (type === 'EXTERNAL') {
        data.externalUrl = externalUrl
      }

      if (isEditing) {
        // Update
        const response = await fetch('/api/gestio/courses/lessons', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: lesson.id, ...data })
        })

        if (!response.ok) {
          const resData = await response.json()
          throw new Error(resData.error || 'Error actualitzant la lliçó')
        }
      } else {
        // Create
        const response = await fetch('/api/gestio/courses/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId, ...data })
        })

        if (!response.ok) {
          const resData = await response.json()
          throw new Error(resData.error || 'Error creant la lliçó')
        }
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut')
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateContent() {
    if (!title.trim()) {
      setError('Primer introdueix un títol per generar contingut')
      return
    }

    setGenerating(true)
    setError(null)

    // This would call the AI to generate content
    // For now, just a placeholder
    setTimeout(() => {
      setContent(`<h2>${title}</h2><p>Contingut generat per IA per a la lliçó "${title}".</p><p>Aquí aniria el contingut detallat de la lliçó...</p>`)
      setGenerating(false)
    }, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Editar lliçó' : 'Nova lliçó'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Títol de la lliçó *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Què és la Intel·ligència Artificial?"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400"
                autoFocus
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipus de lliçó
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {LESSON_TYPES.map((t) => {
                  const Icon = t.icon
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value as Lesson['type'])}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        type === t.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${t.color}`} />
                      <span className="text-xs font-medium">{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripció breu
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Una breu descripció del que s'aprendrà en aquesta lliçó"
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-gray-900 bg-white placeholder:text-gray-400"
              />
            </div>

            {/* Type-specific fields */}
            {type === 'TEXT' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Contingut
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateContent}
                    disabled={generating}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generant...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generar amb IA
                      </>
                    )}
                  </button>
                </div>
                <PostEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Escriu el contingut de la lliçó..."
                  minHeight="200px"
                />
              </div>
            )}

            {type === 'VIDEO' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL del vídeo
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">Suporta YouTube, Vimeo i altres plataformes</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duració del vídeo (minuts)
                  </label>
                  <input
                    type="number"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    placeholder="10"
                    min="1"
                    className="w-32 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}

            {type === 'DOCUMENT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del document
                </label>
                <input
                  type="url"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, PowerPoint...</p>
              </div>
            )}

            {type === 'EXTERNAL' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL extern
                </label>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-400"
                />
              </div>
            )}

            {type === 'QUIZ' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  Guarda la lliçó primer i després podràs configurar les preguntes del quiz.
                </p>
              </div>
            )}

            {/* Duration & Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duració estimada (minuts)
                </label>
                <input
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  placeholder="15"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Lliçó gratuïta</span>
                  <p className="text-xs text-gray-500">Visible sense haver de pagar el curs</p>
                </div>
              </label>

              {isEditing && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Publicada</span>
                    <p className="text-xs text-gray-500">La lliçó serà visible pels estudiants</p>
                  </div>
                </label>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel·lar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardant...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Guardar canvis' : 'Crear lliçó'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
