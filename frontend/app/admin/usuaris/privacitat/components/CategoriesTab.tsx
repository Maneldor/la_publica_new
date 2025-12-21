'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { StatsGrid } from '@/components/ui/StatsGrid'
import { TYPOGRAPHY, BUTTONS } from '@/lib/design-system'
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  Shield,
  ShieldOff,
  ShieldCheck,
  Search,
  Lock
} from 'lucide-react'
import { CategoryModal } from './CategoryModal'

interface SensitiveCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  isActive: boolean
  departmentPatterns: string[]
  positionPatterns: string[]
  forceHidePosition: boolean
  forceHideDepartment: boolean
  forceHideBio: boolean
  forceHideLocation: boolean
  forceHidePhone: boolean
  forceHideEmail: boolean
  forceHideGroups: boolean
  _count?: {
    users: number
  }
  createdAt: string
}

export function CategoriesTab() {
  const [categories, setCategories] = useState<SensitiveCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<SensitiveCategory | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/privacy/categories')
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${res.status}`)
      }
      const data = await res.json()
      setCategories(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "No s'han pogut carregar les categories"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  const handleEdit = (category: SensitiveCategory) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Estàs segur que vols eliminar aquesta categoria? Els usuaris assignats perdran les restriccions.')) {
      return
    }

    try {
      setDeletingId(id)
      const res = await fetch(`/api/admin/privacy/categories/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Error eliminant categoria')

      setCategories(prev => prev.filter(c => c.id !== id))
    } catch {
      alert('Hi ha hagut un error eliminant la categoria')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive = async (category: SensitiveCategory) => {
    try {
      const res = await fetch(`/api/admin/privacy/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !category.isActive })
      })

      if (!res.ok) throw new Error('Error actualitzant categoria')

      const updated = await res.json()
      setCategories(prev => prev.map(c => c.id === category.id ? updated : c))
    } catch {
      alert('Hi ha hagut un error actualitzant la categoria')
    }
  }

  const handleSaveCategory = async (data: Partial<SensitiveCategory>) => {
    const url = editingCategory
      ? `/api/admin/privacy/categories/${editingCategory.id}`
      : '/api/admin/privacy/categories'

    const res = await fetch(url, {
      method: editingCategory ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new Error('Error guardant categoria')

    const saved = await res.json()

    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === saved.id ? saved : c))
    } else {
      setCategories(prev => [...prev, saved])
    }

    setIsModalOpen(false)
    setEditingCategory(null)
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRestrictionsSummary = (cat: SensitiveCategory): string[] => {
    const restrictions: string[] = []
    if (cat.forceHidePosition) restrictions.push('Posició')
    if (cat.forceHideDepartment) restrictions.push('Departament')
    if (cat.forceHideBio) restrictions.push('Bio')
    if (cat.forceHideLocation) restrictions.push('Ubicació')
    if (cat.forceHidePhone) restrictions.push('Telèfon')
    if (cat.forceHideEmail) restrictions.push('Email')
    if (cat.forceHideGroups) restrictions.push('Grups')
    return restrictions
  }

  // Stats per StatsGrid
  const stats = [
    {
      label: 'Categories totals',
      value: categories.length,
      icon: <Shield className="w-5 h-5" />,
      color: 'indigo' as const,
    },
    {
      label: 'Categories actives',
      value: categories.filter(c => c.isActive).length,
      icon: <ShieldCheck className="w-5 h-5" />,
      color: 'green' as const,
    },
    {
      label: 'Usuaris amb restriccions',
      value: categories.reduce((acc, c) => acc + (c._count?.users || 0), 0),
      icon: <Users className="w-5 h-5" />,
      color: 'amber' as const,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <StatsGrid stats={stats} columns={3} />

      {/* Header amb cerca i botó crear */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleCreate}
              className={`${BUTTONS.primary} inline-flex items-center gap-2`}
            >
              <Plus className="w-4 h-4" />
              Nova Categoria
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Llista de categories */}
      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center text-red-600">
            {error}
          </CardContent>
        </Card>
      ) : filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className={`${TYPOGRAPHY.sectionTitle} mb-2`}>
              {searchQuery ? 'Cap categoria trobada' : 'Encara no hi ha categories'}
            </h3>
            <p className={`${TYPOGRAPHY.body} mb-4`}>
              {searchQuery
                ? 'Prova amb altres termes de cerca'
                : 'Crea la primera categoria sensible per protegir col·lectius específics'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreate}
                className={`${BUTTONS.primary} inline-flex items-center gap-2`}
              >
                <Plus className="w-4 h-4" />
                Crear Categoria
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCategories.map((category) => {
            const restrictions = getRestrictionsSummary(category)

            return (
              <Card
                key={category.id}
                className={`transition-all ${
                  !category.isActive ? 'opacity-60 bg-gray-50' : 'hover:shadow-md'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Info principal */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-xl ${
                        category.isActive ? 'bg-indigo-100' : 'bg-gray-200'
                      }`}>
                        <Shield className={`w-6 h-6 ${
                          category.isActive ? 'text-indigo-600' : 'text-gray-400'
                        }`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={TYPOGRAPHY.sectionTitle}>{category.name}</h3>
                          {!category.isActive && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                              Desactivada
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                            {category._count?.users || 0} usuaris
                          </span>
                        </div>

                        {category.description && (
                          <p className={`${TYPOGRAPHY.body} mt-1`}>{category.description}</p>
                        )}

                        {/* Restriccions */}
                        <div className="mt-3">
                          <p className={`${TYPOGRAPHY.small} mb-1.5`}>Camps restringits:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {restrictions.length > 0 ? (
                              restrictions.map((r, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full"
                                >
                                  <Lock className="w-3 h-3" />
                                  {r}
                                </span>
                              ))
                            ) : (
                              <span className={TYPOGRAPHY.small}>Cap restricció forçada</span>
                            )}
                          </div>
                        </div>

                        {/* Patrons de detecció */}
                        {(category.departmentPatterns.length > 0 || category.positionPatterns.length > 0) && (
                          <div className={`mt-3 ${TYPOGRAPHY.small}`}>
                            <span className="font-medium">Auto-detecció: </span>
                            {category.departmentPatterns.length > 0 && (
                              <span>Dept: {category.departmentPatterns.join(', ')}</span>
                            )}
                            {category.departmentPatterns.length > 0 && category.positionPatterns.length > 0 && ' | '}
                            {category.positionPatterns.length > 0 && (
                              <span>Posició: {category.positionPatterns.join(', ')}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Accions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleActive(category)}
                        className={`${BUTTONS.icon} ${
                          category.isActive
                            ? 'hover:bg-amber-100 text-amber-600'
                            : 'hover:bg-green-100 text-green-600'
                        }`}
                        title={category.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {category.isActive ? (
                          <ShieldOff className="w-5 h-5" />
                        ) : (
                          <Shield className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(category)}
                        className={`${BUTTONS.icon} text-gray-600`}
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        disabled={deletingId === category.id}
                        className={`${BUTTONS.icon} text-red-600 hover:bg-red-100 disabled:opacity-50`}
                        title="Eliminar"
                      >
                        {deletingId === category.id ? (
                          <span className="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin block" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal crear/editar */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCategory(null)
        }}
        onSave={handleSaveCategory}
        category={editingCategory}
      />
    </div>
  )
}
