'use client'

import { useState, useEffect } from 'react'
import { Link2, FolderOpen, Plus, Info } from 'lucide-react'

import { CreateLinkModal } from './components/CreateLinkModal'
import { CategoriesModal } from './components/CategoriesModal'

interface Category {
  id: string
  name: string
  slug: string
  color: string
  icon: string | null
  isActive: boolean
  _count: { links: number }
}

interface Stats {
  totalLinks: number
  totalCategories: number
  highlightedLinks: number
  totalVisits: number
}

export default function GestioEnllacosPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/gestio/enllacos')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats || null)
        setCategories(data.categories || [])
      }
    } catch {
      // Silent fail
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-100 rounded-xl">
            <Link2 className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enllaços d'Interès</h1>
            <p className="text-gray-500">Gestiona els enllaços útils per als empleats públics</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCategoriesModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <FolderOpen className="w-5 h-5" />
            Categories
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nou Enllaç
          </button>
        </div>
      </div>

      {/* Contingut informatiu */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-cyan-100 rounded-full flex items-center justify-center">
            <Info className="w-8 h-8 text-cyan-600" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Gestió d'Enllaços d'Interès
          </h2>

          <p className="text-gray-500 mb-6">
            Utilitza els botons superiors per crear nous enllaços d'interès i gestionar les categories.
            Els enllaços creats es mostraran als empleats públics a la seva secció d'Enllaços d'Interès.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear nou enllaç
            </button>
            <button
              onClick={() => setShowCategoriesModal(true)}
              className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <FolderOpen className="w-5 h-5" />
              Gestionar categories
            </button>
          </div>
        </div>
      </div>

      {/* Estadístiques ràpides */}
      {stats && (
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{stats.totalLinks}</span> enllaços ·
            <span className="font-semibold text-gray-900 ml-1">{stats.totalCategories}</span> categories ·
            <span className="font-semibold text-gray-900 ml-1">{stats.highlightedLinks}</span> destacats
          </p>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateLinkModal
          link={null}
          categories={categories}
          onClose={() => setShowCreateModal(false)}
          onSaved={() => { setShowCreateModal(false); fetchStats() }}
        />
      )}

      {showCategoriesModal && (
        <CategoriesModal
          onClose={() => setShowCategoriesModal(false)}
          onUpdated={fetchStats}
        />
      )}
    </div>
  )
}
