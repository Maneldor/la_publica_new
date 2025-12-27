'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Eye,
  Calendar,
  Users,
  Globe,
  Lock,
  Pin,
  Star,
  MessageCircle,
  Heart,
  Plus,
  X,
  Loader2,
  Image as ImageIcon,
  BarChart3
} from 'lucide-react'
import { BlogEditor } from '@/components/blog/BlogEditor'
import { extractExcerpt } from '@/lib/utils/blog'

interface Category {
  id: string
  name: string
  color: string | null
}

interface Group {
  id: string
  name: string
}

export default function CreateBlogPostPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [groups, setGroups] = useState<Group[]>([])

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'GROUPS' | 'PRIVATE'>('PUBLIC')
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'SCHEDULED'>('DRAFT')
  const [scheduledAt, setScheduledAt] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [allowComments, setAllowComments] = useState(true)
  const [allowReactions, setAllowReactions] = useState(true)

  // Poll state
  const [hasPoll, setHasPoll] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollType, setPollType] = useState<'SINGLE' | 'MULTIPLE'>('SINGLE')
  const [pollOptions, setPollOptions] = useState<string[]>(['', ''])
  const [pollShowResults, setPollShowResults] = useState<'ALWAYS' | 'AFTER_VOTE' | 'AFTER_END' | 'NEVER'>('AFTER_VOTE')
  const [pollEndsAt, setPollEndsAt] = useState('')

  useEffect(() => {
    loadCategories()
    loadGroups()
  }, [])

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/blog/categories')
      const data = await res.json()
      if (res.ok) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error carregant categories:', error)
    }
  }

  const loadGroups = async () => {
    try {
      const res = await fetch('/api/blog/groups')
      const data = await res.json()
      if (res.ok) {
        setGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Error carregant grups:', error)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const addPollOption = () => {
    setPollOptions([...pollOptions, ''])
  }

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index))
    }
  }

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions]
    newOptions[index] = value
    setPollOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert('El títol i el contingut són obligatoris')
      return
    }

    setIsLoading(true)

    try {
      const postData: any = {
        title,
        content,
        excerpt: excerpt || extractExcerpt(content),
        coverImage: coverImage || null,
        categoryId: categoryId || null,
        tags,
        visibility,
        targetGroupIds: visibility === 'GROUPS' ? selectedGroups : [],
        status,
        scheduledAt: status === 'SCHEDULED' && scheduledAt ? new Date(scheduledAt) : null,
        isPinned,
        isFeatured,
        allowComments,
        allowReactions
      }

      // Add poll if enabled
      if (hasPoll && pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2) {
        postData.poll = {
          question: pollQuestion,
          type: pollType,
          options: pollOptions.filter(o => o.trim()),
          showResults: pollShowResults,
          endsAt: pollEndsAt ? new Date(pollEndsAt) : null
        }
      }

      const res = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })

      if (res.ok) {
        router.push('/gestio/contingut/blog')
      } else {
        const error = await res.json()
        alert(error.error || 'Error creant article')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error de connexió')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/gestio/contingut/blog"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nou article</h1>
            <p className="text-gray-600">Crea un nou article per al blog</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Títol *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escriu el títol de l'article..."
              className="w-full px-4 py-3 text-lg text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400"
              required
            />
          </div>

          {/* Cover image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              Imatge de portada
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400"
            />
          </div>

          {/* Content editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contingut *
            </label>
            <BlogEditor
              content={content}
              onChange={setContent}
              placeholder="Comença a escriure el teu article..."
              showAIToolbar={true}
              title={title}
              category={categories.find(c => c.id === categoryId)?.name}
              onTitleSelect={(newTitle) => setTitle(newTitle)}
              onTagsSelect={(newTags) => setTags([...tags, ...newTags.filter(t => !tags.includes(t))])}
              onExcerptSelect={(newExcerpt) => setExcerpt(newExcerpt)}
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resum (excerpt)
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Un breu resum de l'article (es genera automàticament si el deixes buit)..."
              rows={3}
              maxLength={300}
              className="w-full px-4 py-2 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1">{excerpt.length}/300</p>
          </div>
        </div>

        {/* Categorization */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Categorització</h2>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Sense categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetes
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="Afegir etiqueta..."
                className="flex-1 px-4 py-2 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Afegir
              </button>
            </div>
          </div>
        </div>

        {/* Visibility & Scheduling */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Visibilitat i publicació</h2>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qui pot veure aquest article?
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setVisibility('PUBLIC')}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  visibility === 'PUBLIC'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Globe className="w-6 h-6 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Públic</p>
                <p className="text-xs text-gray-500">Tots els usuaris</p>
              </button>
              <button
                type="button"
                onClick={() => setVisibility('GROUPS')}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  visibility === 'GROUPS'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="w-6 h-6 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Grups</p>
                <p className="text-xs text-gray-500">Grups seleccionats</p>
              </button>
              <button
                type="button"
                onClick={() => setVisibility('PRIVATE')}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  visibility === 'PRIVATE'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Lock className="w-6 h-6 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Privat</p>
                <p className="text-xs text-gray-500">Només admins</p>
              </button>
            </div>
          </div>

          {/* Group selection */}
          {visibility === 'GROUPS' && groups.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona els grups
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {groups.map(group => (
                  <label key={group.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(group.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGroups([...selectedGroups, group.id])
                        } else {
                          setSelectedGroups(selectedGroups.filter(id => id !== group.id))
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-900">{group.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estat
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setStatus('DRAFT')}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  status === 'DRAFT'
                    ? 'border-gray-500 bg-gray-50 text-gray-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">Esborrany</p>
              </button>
              <button
                type="button"
                onClick={() => setStatus('PUBLISHED')}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  status === 'PUBLISHED'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">Publicar ara</p>
              </button>
              <button
                type="button"
                onClick={() => setStatus('SCHEDULED')}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  status === 'SCHEDULED'
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">Programar</p>
              </button>
            </div>
          </div>

          {/* Scheduled date */}
          {status === 'SCHEDULED' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data de publicació
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Pin className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-gray-900">Anclar</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Star className="w-4 h-4 text-indigo-600" />
              <span className="text-sm text-gray-900">Destacar</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={allowComments}
                onChange={(e) => setAllowComments(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-900">Comentaris</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={allowReactions}
                onChange={(e) => setAllowReactions(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Heart className="w-4 h-4 text-red-600" />
              <span className="text-sm text-gray-900">Reaccions</span>
            </label>
          </div>
        </div>

        {/* Poll */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Enquesta
            </h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPoll}
                onChange={(e) => setHasPoll(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-900">Afegir enquesta</span>
            </label>
          </div>

          {hasPoll && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pregunta
                </label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Quina és la teva opinió sobre...?"
                  className="w-full px-4 py-2 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipus de resposta
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPollType('SINGLE')}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      pollType === 'SINGLE'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-900'
                    }`}
                  >
                    Una sola resposta
                  </button>
                  <button
                    type="button"
                    onClick={() => setPollType('MULTIPLE')}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      pollType === 'MULTIPLE'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-900'
                    }`}
                  >
                    Múltiples respostes
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opcions
                </label>
                <div className="space-y-2">
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updatePollOption(index, e.target.value)}
                        placeholder={`Opció ${index + 1}`}
                        className="flex-1 px-4 py-2 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addPollOption}
                  className="mt-2 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  Afegir opció
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mostrar resultats
                  </label>
                  <select
                    value={pollShowResults}
                    onChange={(e) => setPollShowResults(e.target.value as any)}
                    className="w-full px-4 py-2 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ALWAYS">Sempre</option>
                    <option value="AFTER_VOTE">Després de votar</option>
                    <option value="AFTER_END">Quan acabi</option>
                    <option value="NEVER">Mai (només admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data límit (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={pollEndsAt}
                    onChange={(e) => setPollEndsAt(e.target.value)}
                    className="w-full px-4 py-2 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/gestio/contingut/blog"
            className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel·lar
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {status === 'PUBLISHED' ? 'Publicar' : status === 'SCHEDULED' ? 'Programar' : 'Guardar esborrany'}
          </button>
        </div>
      </form>
    </div>
  )
}
