'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Lock, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react'
import { PrivateIcon } from '@/components/icons'

interface DiaryEntry {
  id: string
  date: string
  title?: string
  content: string
  mood?: string
  tags: string[]
  createdAt: string
}

interface DiariPrivatModuleProps {
  onClose?: () => void
}

const MOODS = ['😊', '😐', '😔', '🤩', '😤', '😴', '🤔', '❤️']

export function DiariPrivatModule({ onClose }: DiariPrivatModuleProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [mood, setMood] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      const res = await fetch('/api/agenda/diary?limit=30')
      if (res.ok) {
        const data = await res.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Error carregant entrades:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveEntry = async () => {
    if (!content.trim()) return
    setSaving(true)

    try {
      const url = editingEntry
        ? `/api/agenda/diary/${editingEntry.id}`
        : '/api/agenda/diary'

      const method = editingEntry ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title: title || null,
          mood: mood || null,
          date: new Date().toISOString()
        })
      })

      if (res.ok) {
        resetEditor()
        loadEntries()
      }
    } catch (error) {
      console.error('Error guardant entrada:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteEntry = async (id: string) => {
    try {
      await fetch(`/api/agenda/diary/${id}`, { method: 'DELETE' })
      loadEntries()
      setSelectedEntry(null)
    } catch (error) {
      console.error('Error eliminant entrada:', error)
    }
  }

  const resetEditor = () => {
    setShowEditor(false)
    setEditingEntry(null)
    setContent('')
    setTitle('')
    setMood('')
  }

  const openEditor = (entry?: DiaryEntry) => {
    if (entry) {
      setEditingEntry(entry)
      setContent(entry.content)
      setTitle(entry.title || '')
      setMood(entry.mood || '')
    }
    setShowEditor(true)
    setSelectedEntry(null)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ca-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ca-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <PrivateIcon size="md" />
          <div>
            <h3 className="font-semibold text-gray-900">Diari Privat</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Només tu pots veure-ho
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditor()}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-500" />
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 space-y-3"
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Títol (opcional)"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escriu els teus pensaments..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
              rows={4}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(mood === m ? '' : m)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      mood === m
                        ? 'bg-gray-200 scale-110'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={resetEditor}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel·lar
              </button>
              <button
                onClick={saveEntry}
                disabled={saving || !content.trim()}
                className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? 'Guardant...' : editingEntry ? 'Actualitzar' : 'Guardar'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de entrada seleccionada */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  {selectedEntry.title && (
                    <h3 className="font-semibold text-gray-900">{selectedEntry.title}</h3>
                  )}
                  <p className="text-xs text-gray-500 capitalize">
                    {formatFullDate(selectedEntry.date)}
                    {selectedEntry.mood && ` · ${selectedEntry.mood}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditor(selectedEntry)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => deleteEntry(selectedEntry.id)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedEntry.content}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de entradas */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="text-center py-6">
            <Lock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              El teu espai privat
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Escriu sense filtres, només tu ho veuràs
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <motion.button
              key={entry.id}
              layout
              onClick={() => setSelectedEntry(entry)}
              className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 text-left group"
            >
              <div className="flex-shrink-0 mt-0.5">
                {entry.mood ? (
                  <span className="text-lg">{entry.mood}</span>
                ) : (
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Lock className="w-3 h-3 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {entry.title ? (
                    <p className="text-sm font-medium text-gray-900 truncate">{entry.title}</p>
                  ) : (
                    <p className="text-sm text-gray-600 truncate">{entry.content.slice(0, 50)}...</p>
                  )}
                </div>
                <p className="text-xs text-gray-400 capitalize">{formatDate(entry.date)}</p>
              </div>
            </motion.button>
          ))
        )}
      </div>

      {/* Contador */}
      {entries.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            {entries.length} entrada{entries.length !== 1 ? 'es' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
