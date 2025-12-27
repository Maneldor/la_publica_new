'use client'

import { useState } from 'react'
import { X, Sparkles, Loader2, BookOpen, ChevronRight, Check, AlertCircle } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface CourseOutline {
  title: string
  description: string
  objectives: string[]
  requirements: string[]
  modules: {
    title: string
    description: string
    lessons: {
      title: string
      type: string
      estimatedDuration: number
    }[]
  }[]
}

interface GenerateCourseModalProps {
  categories: Category[]
  onClose: () => void
  onSuccess: (courseId: string) => void
}

export function GenerateCourseModal({ categories, onClose, onSuccess }: GenerateCourseModalProps) {
  const [step, setStep] = useState<'input' | 'preview' | 'generating'>('input')
  const [topic, setTopic] = useState('')
  const [type, setType] = useState<'MICRO' | 'BASIC' | 'COMPLETE' | 'PREMIUM'>('BASIC')
  const [level, setLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'>('BEGINNER')
  const [categoryId, setCategoryId] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [additionalInstructions, setAdditionalInstructions] = useState('')
  const [language, setLanguage] = useState('ca')

  const [outline, setOutline] = useState<CourseOutline | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generationProgress, setGenerationProgress] = useState<string>('')

  async function handleGenerateOutline() {
    if (!topic.trim()) {
      setError('El tema és obligatori')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gestio/courses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'outline',
          topic,
          type,
          level,
          targetAudience,
          additionalInstructions,
          language
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error generant el curs')
      }

      setOutline(data.outline)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut')
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateFull() {
    setStep('generating')
    setGenerationProgress('Iniciant generació del curs...')
    setError(null)

    try {
      const response = await fetch('/api/gestio/courses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'full',
          topic,
          type,
          level,
          categoryId: categoryId || undefined,
          targetAudience,
          additionalInstructions,
          language
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error generant el curs')
      }

      onSuccess(data.courseId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut')
      setStep('preview')
    }
  }

  function getTypeInfo(t: string) {
    const info: Record<string, { label: string; description: string; modules: string }> = {
      MICRO: { label: 'Micro', description: 'Curs ràpid de 5-15 min', modules: '1 mòdul, 3-5 lliçons' },
      BASIC: { label: 'Bàsic', description: 'Curs introductori', modules: '2-3 mòduls, 5-10 lliçons' },
      COMPLETE: { label: 'Complet', description: 'Curs exhaustiu', modules: '4-6 mòduls, 15-25 lliçons' },
      PREMIUM: { label: 'Premium', description: 'Curs professional', modules: '6-10 mòduls, 25-40 lliçons' }
    }
    return info[t] || info.BASIC
  }

  function getLevelLabel(l: string) {
    const labels: Record<string, string> = {
      BEGINNER: 'Principiant',
      INTERMEDIATE: 'Intermedi',
      ADVANCED: 'Avançat',
      EXPERT: 'Expert'
    }
    return labels[l] || l
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Generar curs amb IA</h2>
              <p className="text-sm text-gray-500">
                {step === 'input' && 'Defineix el tema i les característiques'}
                {step === 'preview' && 'Revisa l\'estructura proposada'}
                {step === 'generating' && 'Generant el curs...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {step === 'input' && (
            <div className="space-y-6">
              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema del curs *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: Introducció a la Intel·ligència Artificial"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipus de curs
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['MICRO', 'BASIC', 'COMPLETE', 'PREMIUM'] as const).map((t) => {
                    const info = getTypeInfo(t)
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          type === t
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">{info.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{info.modules}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivell
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLevel(l)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        level === l
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {getLevelLabel(l)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                >
                  <option value="">Sense categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audiència objectiu
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Ex: Professionals del sector tecnològic sense experiència en IA"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-400"
                />
              </div>

              {/* Additional Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instruccions addicionals
                </label>
                <textarea
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="Ex: Inclou exemples pràctics del sector sanitari, enfoca't en aplicacions empresarials..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-gray-900 bg-white placeholder:text-gray-400"
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma del contingut
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                >
                  <option value="ca">Català</option>
                  <option value="es">Castellà</option>
                  <option value="en">Anglès</option>
                </select>
              </div>
            </div>
          )}

          {step === 'preview' && outline && (
            <div className="space-y-6">
              {/* Course Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{outline.title}</h3>
                <p className="text-gray-600">{outline.description}</p>
              </div>

              {/* Objectives */}
              {outline.objectives.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Objectius d'aprenentatge</h4>
                  <ul className="space-y-2">
                    {outline.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Modules */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Estructura del curs</h4>
                <div className="space-y-4">
                  {outline.modules.map((mod, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-purple-600">
                            Mòdul {i + 1}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{mod.title}</span>
                        </div>
                        {mod.description && (
                          <p className="text-sm text-gray-500 mt-1">{mod.description}</p>
                        )}
                      </div>
                      <div className="divide-y divide-gray-100">
                        {mod.lessons.map((lesson, j) => (
                          <div key={j} className="px-4 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{lesson.title}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {lesson.estimatedDuration} min
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600" />
                <Sparkles className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-6 text-lg font-medium text-gray-900">Generant el curs...</p>
              <p className="mt-2 text-gray-500">{generationProgress}</p>
              <p className="mt-4 text-sm text-gray-400">
                Això pot trigar uns minuts depenent de la complexitat
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'generating' && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            {step === 'input' ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel·lar
                </button>
                <button
                  onClick={handleGenerateOutline}
                  disabled={loading || !topic.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generant...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generar estructura
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep('input')}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Tornar enrere
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleGenerateOutline}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Regenerar
                  </button>
                  <button
                    onClick={handleGenerateFull}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700"
                  >
                    <Check className="w-4 h-4" />
                    Crear curs complet
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
