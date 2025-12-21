'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Book, BookOpen, BookCheck, Star, MoreHorizontal, Trash2, Edit2 } from 'lucide-react'
import { ReadingIcon } from '@/components/icons'

interface BookItem {
  id: string
  title: string
  author?: string
  status: 'to_read' | 'reading' | 'completed'
  rating?: number
  currentPage?: number
  totalPages?: number
  notes?: string
}

interface LecturesModuleProps {
  onClose?: () => void
}

const STATUS_CONFIG = {
  to_read: { label: 'Per llegir', icon: Book, color: 'text-gray-500', bg: 'bg-gray-100' },
  reading: { label: 'Llegint', icon: BookOpen, color: 'text-cyan-500', bg: 'bg-cyan-100' },
  completed: { label: 'Completat', icon: BookCheck, color: 'text-green-500', bg: 'bg-green-100' }
}

export function LecturesModule({ onClose }: LecturesModuleProps) {
  const [books, setBooks] = useState<BookItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'reading' | 'to_read' | 'completed'>('reading')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    try {
      const res = await fetch('/api/agenda/books')
      if (res.ok) {
        const data = await res.json()
        setBooks(data)
      }
    } catch (error) {
      console.error('Error carregant llibres:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addBook = async () => {
    if (!newTitle.trim()) return
    setSaving(true)

    try {
      const res = await fetch('/api/agenda/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          author: newAuthor || null,
          status: 'to_read'
        })
      })

      if (res.ok) {
        setNewTitle('')
        setNewAuthor('')
        setShowNewForm(false)
        loadBooks()
      }
    } catch (error) {
      console.error('Error afegint llibre:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateBookStatus = async (bookId: string, status: string) => {
    try {
      await fetch(`/api/agenda/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      loadBooks()
    } catch (error) {
      console.error('Error actualitzant llibre:', error)
    }
    setMenuOpen(null)
  }

  const deleteBook = async (bookId: string) => {
    try {
      await fetch(`/api/agenda/books/${bookId}`, { method: 'DELETE' })
      loadBooks()
    } catch (error) {
      console.error('Error eliminant llibre:', error)
    }
    setMenuOpen(null)
  }

  const filteredBooks = books.filter(b => b.status === activeTab)

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
          <ReadingIcon size="md" />
          <h3 className="font-semibold text-gray-900">Les meves lectures</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewForm(!showNewForm)}
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

      {/* Formulario nuevo libro */}
      <AnimatePresence>
        {showNewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 space-y-2"
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Títol del llibre"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              autoFocus
            />
            <input
              type="text"
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              placeholder="Autor (opcional)"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewForm(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel·lar
              </button>
              <button
                onClick={addBook}
                disabled={saving || !newTitle.trim()}
                className="px-3 py-1.5 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50"
              >
                {saving ? 'Afegint...' : 'Afegir'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
        {(['reading', 'to_read', 'completed'] as const).map((tab) => {
          const config = STATUS_CONFIG[tab]
          const count = books.filter(b => b.status === tab).length
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <config.icon className="w-3.5 h-3.5" />
              {config.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 rounded-full ${
                  activeTab === tab ? config.bg : 'bg-gray-200'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Lista de libros */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredBooks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            {activeTab === 'reading' && 'No estàs llegint cap llibre'}
            {activeTab === 'to_read' && 'No tens llibres per llegir'}
            {activeTab === 'completed' && 'No has completat cap llibre'}
          </p>
        ) : (
          filteredBooks.map((book) => (
            <motion.div
              key={book.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group"
            >
              <div className={`p-1.5 rounded ${STATUS_CONFIG[book.status].bg}`}>
                <Book className={`w-4 h-4 ${STATUS_CONFIG[book.status].color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                {book.author && (
                  <p className="text-xs text-gray-500 truncate">{book.author}</p>
                )}
              </div>
              {book.rating && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: book.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              )}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === book.id ? null : book.id)}
                  className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
                <AnimatePresence>
                  {menuOpen === book.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]"
                    >
                      {book.status !== 'reading' && (
                        <button
                          onClick={() => updateBookStatus(book.id, 'reading')}
                          className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <BookOpen className="w-4 h-4 text-cyan-500" />
                          Llegint ara
                        </button>
                      )}
                      {book.status !== 'completed' && (
                        <button
                          onClick={() => updateBookStatus(book.id, 'completed')}
                          className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <BookCheck className="w-4 h-4 text-green-500" />
                          Completat
                        </button>
                      )}
                      <button
                        onClick={() => deleteBook(book.id)}
                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Resumen */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center gap-4 text-xs text-gray-500">
        <span>{books.filter(b => b.status === 'completed').length} llegits</span>
        <span>{books.filter(b => b.status === 'reading').length} en curs</span>
        <span>{books.filter(b => b.status === 'to_read').length} pendents</span>
      </div>
    </div>
  )
}
