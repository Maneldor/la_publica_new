'use client'

import { useState } from 'react'
import {
  Sparkles,
  Wand2,
  FileText,
  Hash,
  Languages,
  CheckCircle,
  Expand,
  Minimize2,
  List,
  Loader2,
  ChevronDown,
  Type,
  X
} from 'lucide-react'
import { toast } from 'sonner'

interface BlogAIToolbarProps {
  content: string
  selectedText?: string
  onInsert: (text: string) => void
  onReplace: (text: string) => void
  onTitleSelect?: (title: string) => void
  onTagsSelect?: (tags: string[]) => void
  onExcerptSelect?: (excerpt: string) => void
  title?: string
  category?: string
}

type AIAction =
  | 'generate_article'
  | 'improve_text'
  | 'generate_title'
  | 'generate_excerpt'
  | 'suggest_tags'
  | 'fix_grammar'
  | 'translate_ca_es'
  | 'translate_es_ca'
  | 'expand_text'
  | 'simplify_text'
  | 'generate_outline'

interface ActionConfig {
  label: string
  icon: React.ReactNode
  description: string
  needsSelection?: boolean
  needsContent?: boolean
}

const ACTIONS: Record<AIAction, ActionConfig> = {
  generate_article: {
    label: 'Generar article',
    icon: <FileText className="w-4 h-4" />,
    description: 'Genera un article complet sobre un tema'
  },
  generate_outline: {
    label: 'Generar estructura',
    icon: <List className="w-4 h-4" />,
    description: 'Crea una estructura/índex per l\'article'
  },
  improve_text: {
    label: 'Millorar text',
    icon: <Wand2 className="w-4 h-4" />,
    description: 'Millora la qualitat del text seleccionat',
    needsSelection: true
  },
  expand_text: {
    label: 'Ampliar',
    icon: <Expand className="w-4 h-4" />,
    description: 'Amplia i desenvolupa el text',
    needsSelection: true
  },
  simplify_text: {
    label: 'Simplificar',
    icon: <Minimize2 className="w-4 h-4" />,
    description: 'Simplifica el text per fer-lo més clar',
    needsSelection: true
  },
  fix_grammar: {
    label: 'Corregir',
    icon: <CheckCircle className="w-4 h-4" />,
    description: 'Corregeix errors ortogràfics i gramaticals',
    needsSelection: true
  },
  generate_title: {
    label: 'Generar títols',
    icon: <Type className="w-4 h-4" />,
    description: 'Genera títols atractius',
    needsContent: true
  },
  generate_excerpt: {
    label: 'Generar resum',
    icon: <FileText className="w-4 h-4" />,
    description: 'Genera un resum curt de l\'article',
    needsContent: true
  },
  suggest_tags: {
    label: 'Suggerir tags',
    icon: <Hash className="w-4 h-4" />,
    description: 'Suggereix etiquetes per l\'article',
    needsContent: true
  },
  translate_ca_es: {
    label: 'Traduir a castellà',
    icon: <Languages className="w-4 h-4" />,
    description: 'Tradueix de català a castellà',
    needsSelection: true
  },
  translate_es_ca: {
    label: 'Traduir a català',
    icon: <Languages className="w-4 h-4" />,
    description: 'Tradueix de castellà a català',
    needsSelection: true
  }
}

export function BlogAIToolbar({
  content,
  selectedText,
  onInsert,
  onReplace,
  onTitleSelect,
  onTagsSelect,
  onExcerptSelect,
  title,
  category
}: BlogAIToolbarProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentAction, setCurrentAction] = useState<AIAction | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [topicInput, setTopicInput] = useState('')
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<AIAction | null>(null)

  // Resultats
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([])
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const [excerptResult, setExcerptResult] = useState<string>('')
  const [showResults, setShowResults] = useState(false)

  const callAI = async (action: AIAction, input: string) => {
    setIsLoading(true)
    setCurrentAction(action)

    try {
      const response = await fetch('/api/ai/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          input,
          context: {
            title,
            category,
            targetAudience: 'empleats públics',
            language: 'ca'
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error de l\'API')
      }

      return data.result

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error processant la sol·licitud')
      return null
    } finally {
      setIsLoading(false)
      setCurrentAction(null)
    }
  }

  const handleAction = async (action: AIAction) => {
    const config = ACTIONS[action]
    setShowDropdown(false)

    // Accions que necessiten selecció
    if (config.needsSelection) {
      if (!selectedText?.trim()) {
        toast.error('Selecciona primer el text que vols processar')
        return
      }

      const result = await callAI(action, selectedText)
      if (result) {
        onReplace(result)
        toast.success('Text processat correctament')
      }
      return
    }

    // Accions que necessiten contingut
    if (config.needsContent) {
      if (!content?.trim()) {
        toast.error('L\'article ha de tenir contingut')
        return
      }

      const result = await callAI(action, content)

      if (result) {
        if (action === 'generate_title' && Array.isArray(result)) {
          setTitleSuggestions(result)
          setShowResults(true)
        } else if (action === 'suggest_tags' && Array.isArray(result)) {
          setTagSuggestions(result)
          setShowResults(true)
        } else if (action === 'generate_excerpt') {
          setExcerptResult(result)
          setShowResults(true)
        }
      }
      return
    }

    // Accions que necessiten un tema (generate_article, generate_outline)
    setPendingAction(action)
    setShowTopicModal(true)
  }

  const handleGenerateWithTopic = async () => {
    if (!topicInput.trim() || !pendingAction) return

    setShowTopicModal(false)
    const result = await callAI(pendingAction, topicInput)

    if (result) {
      if (pendingAction === 'generate_outline') {
        // Convertir outline a HTML
        const outline = typeof result === 'string' ? JSON.parse(result) : result
        const html = outlineToHtml(outline)
        onInsert(html)
      } else {
        onInsert(result)
      }
      toast.success('Contingut generat correctament')
    }

    setTopicInput('')
    setPendingAction(null)
  }

  const outlineToHtml = (outline: { title?: string; sections?: { heading: string; points?: string[] }[] }): string => {
    if (!outline?.sections) return ''

    let html = ''
    if (outline.title) {
      html += `<h1>${outline.title}</h1>\n\n`
    }

    for (const section of outline.sections) {
      html += `<h2>${section.heading}</h2>\n`
      if (section.points?.length) {
        html += '<ul>\n'
        for (const point of section.points) {
          html += `  <li>${point}</li>\n`
        }
        html += '</ul>\n'
      }
      html += '\n'
    }

    return html
  }

  const handleSelectTitle = (selectedTitle: string) => {
    if (onTitleSelect) {
      onTitleSelect(selectedTitle)
      toast.success('Títol aplicat')
    } else {
      navigator.clipboard.writeText(selectedTitle)
      toast.success('Títol copiat al portapapers')
    }
  }

  const handleSelectTags = (tags: string[]) => {
    if (onTagsSelect) {
      onTagsSelect(tags)
      toast.success('Tags aplicats')
    }
    setShowResults(false)
    setTagSuggestions([])
  }

  const handleSelectExcerpt = () => {
    if (onExcerptSelect && excerptResult) {
      onExcerptSelect(excerptResult)
      toast.success('Resum aplicat')
    } else if (excerptResult) {
      navigator.clipboard.writeText(excerptResult)
      toast.success('Resum copiat al portapapers')
    }
    setShowResults(false)
    setExcerptResult('')
  }

  return (
    <div className="relative">
      {/* Botó principal */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Assistent IA</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {selectedText && (
          <span className="text-xs text-gray-500">
            {selectedText.length} caràcters seleccionats
          </span>
        )}
      </div>

      {/* Dropdown d'accions */}
      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase">Accions disponibles</p>
          </div>

          {/* Generació */}
          <div className="py-1">
            <p className="px-3 py-1 text-xs text-gray-400">Generar contingut</p>
            {(['generate_article', 'generate_outline'] as AIAction[]).map(action => (
              <ActionButton
                key={action}
                action={action}
                config={ACTIONS[action]}
                onClick={() => handleAction(action)}
                isLoading={isLoading && currentAction === action}
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Edició */}
          <div className="py-1 border-t border-gray-100">
            <p className="px-3 py-1 text-xs text-gray-400">Editar text</p>
            {(['improve_text', 'expand_text', 'simplify_text', 'fix_grammar'] as AIAction[]).map(action => (
              <ActionButton
                key={action}
                action={action}
                config={ACTIONS[action]}
                onClick={() => handleAction(action)}
                isLoading={isLoading && currentAction === action}
                disabled={isLoading || !selectedText}
              />
            ))}
          </div>

          {/* Traducció */}
          <div className="py-1 border-t border-gray-100">
            <p className="px-3 py-1 text-xs text-gray-400">Traducció</p>
            {(['translate_ca_es', 'translate_es_ca'] as AIAction[]).map(action => (
              <ActionButton
                key={action}
                action={action}
                config={ACTIONS[action]}
                onClick={() => handleAction(action)}
                isLoading={isLoading && currentAction === action}
                disabled={isLoading || !selectedText}
              />
            ))}
          </div>

          {/* Metadades */}
          <div className="py-1 border-t border-gray-100">
            <p className="px-3 py-1 text-xs text-gray-400">Metadades</p>
            {(['generate_title', 'generate_excerpt', 'suggest_tags'] as AIAction[]).map(action => (
              <ActionButton
                key={action}
                action={action}
                config={ACTIONS[action]}
                onClick={() => handleAction(action)}
                isLoading={isLoading && currentAction === action}
                disabled={isLoading || !content}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal per introduir tema */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {pendingAction === 'generate_article' ? 'Generar article' : 'Generar estructura'}
              </h3>
              <button
                type="button"
                onClick={() => { setShowTopicModal(false); setPendingAction(null); setTopicInput('') }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Introdueix el tema sobre el qual vols generar contingut
            </p>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Ex: Novetats en teletreball per a funcionaris"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4 text-gray-900 placeholder:text-gray-400"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerateWithTopic()
              }}
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowTopicModal(false); setPendingAction(null); setTopicInput('') }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel·lar
              </button>
              <button
                type="button"
                onClick={handleGenerateWithTopic}
                disabled={!topicInput.trim() || isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de resultats (títols, tags, excerpt) */}
      {showResults && (titleSuggestions.length > 0 || tagSuggestions.length > 0 || excerptResult) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {titleSuggestions.length > 0 && 'Títols suggerits'}
                {tagSuggestions.length > 0 && 'Tags suggerits'}
                {excerptResult && 'Resum generat'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowResults(false)
                  setTitleSuggestions([])
                  setTagSuggestions([])
                  setExcerptResult('')
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {titleSuggestions.length > 0 && (
              <div className="space-y-2 mb-4">
                {titleSuggestions.map((titleOption, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectTitle(titleOption)}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-purple-50 rounded-xl transition-colors text-sm text-gray-900"
                  >
                    {titleOption}
                  </button>
                ))}
              </div>
            )}

            {tagSuggestions.length > 0 && (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tagSuggestions.map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        navigator.clipboard.writeText(tag)
                        toast.success('Tag copiat')
                      }}
                      className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                {onTagsSelect && (
                  <button
                    type="button"
                    onClick={() => handleSelectTags(tagSuggestions)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors mb-2"
                  >
                    Aplicar tots els tags
                  </button>
                )}
              </>
            )}

            {excerptResult && (
              <>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-900">{excerptResult}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSelectExcerpt}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors mb-2"
                >
                  {onExcerptSelect ? 'Aplicar resum' : 'Copiar resum'}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                setShowResults(false)
                setTitleSuggestions([])
                setTagSuggestions([])
                setExcerptResult('')
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Tancar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Component botó d'acció
function ActionButton({
  action,
  config,
  onClick,
  isLoading,
  disabled
}: {
  action: AIAction
  config: ActionConfig
  onClick: () => void
  isLoading: boolean
  disabled: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <span className={`${isLoading ? 'animate-spin' : ''} text-gray-500`}>
        {isLoading ? <Loader2 className="w-4 h-4" /> : config.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{config.label}</p>
        <p className="text-xs text-gray-500 truncate">{config.description}</p>
      </div>
    </button>
  )
}
