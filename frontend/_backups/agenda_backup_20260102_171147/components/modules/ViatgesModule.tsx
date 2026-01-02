'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Plane, MapPin, Star, MoreHorizontal, Trash2, Check, Calendar } from 'lucide-react'
import { TravelIcon } from '@/components/icons'

interface Travel {
  id: string
  destination: string
  country?: string
  status: 'dream' | 'planning' | 'completed'
  startDate?: string
  endDate?: string
  notes?: string
  rating?: number
}

interface ViatgesModuleProps {
  onClose?: () => void
}

const STATUS_CONFIG = {
  dream: { label: 'Somiat', icon: Plane, color: 'text-sky-500', bg: 'bg-sky-100' },
  planning: { label: 'Planificant', icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-100' },
  completed: { label: 'Visitat', icon: Check, color: 'text-green-500', bg: 'bg-green-100' }
}

export function ViatgesModule({ onClose }: ViatgesModuleProps) {
  const [travels, setTravels] = useState<Travel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newDestination, setNewDestination] = useState('')
  const [newCountry, setNewCountry] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'dream' | 'planning' | 'completed'>('dream')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    loadTravels()
  }, [])

  const loadTravels = async () => {
    try {
      const res = await fetch('/api/agenda/travels')
      if (res.ok) {
        const data = await res.json()
        setTravels(data)
      }
    } catch (error) {
      console.error('Error carregant viatges:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addTravel = async () => {
    if (!newDestination.trim()) return
    setSaving(true)

    try {
      const res = await fetch('/api/agenda/travels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: newDestination,
          country: newCountry || null,
          status: 'dream'
        })
      })

      if (res.ok) {
        setNewDestination('')
        setNewCountry('')
        setShowNewForm(false)
        loadTravels()
      }
    } catch (error) {
      console.error('Error afegint viatge:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateTravelStatus = async (travelId: string, status: string) => {
    try {
      await fetch(`/api/agenda/travels/${travelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      loadTravels()
    } catch (error) {
      console.error('Error actualitzant viatge:', error)
    }
    setMenuOpen(null)
  }

  const deleteTravel = async (travelId: string) => {
    try {
      await fetch(`/api/agenda/travels/${travelId}`, { method: 'DELETE' })
      loadTravels()
    } catch (error) {
      console.error('Error eliminant viatge:', error)
    }
    setMenuOpen(null)
  }

  const filteredTravels = travels.filter(t => t.status === activeTab)

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
          <TravelIcon size="md" />
          <h3 className="font-semibold text-gray-900">Els meus viatges</h3>
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

      {/* Formulario nuevo viaje */}
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
              value={newDestination}
              onChange={(e) => setNewDestination(e.target.value)}
              placeholder="Destinació (ciutat, lloc...)"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              autoFocus
            />
            <input
              type="text"
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              placeholder="País (opcional)"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewForm(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel·lar
              </button>
              <button
                onClick={addTravel}
                disabled={saving || !newDestination.trim()}
                className="px-3 py-1.5 text-sm bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50"
              >
                {saving ? 'Afegint...' : 'Afegir'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
        {(['dream', 'planning', 'completed'] as const).map((tab) => {
          const config = STATUS_CONFIG[tab]
          const count = travels.filter(t => t.status === tab).length
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

      {/* Lista de viajes */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredTravels.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            {activeTab === 'dream' && 'Afegeix destinacions que somies visitar'}
            {activeTab === 'planning' && 'No tens viatges en planificació'}
            {activeTab === 'completed' && 'No has registrat viatges completats'}
          </p>
        ) : (
          filteredTravels.map((travel) => (
            <motion.div
              key={travel.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group"
            >
              <div className={`p-1.5 rounded ${STATUS_CONFIG[travel.status].bg}`}>
                <MapPin className={`w-4 h-4 ${STATUS_CONFIG[travel.status].color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{travel.destination}</p>
                {travel.country && (
                  <p className="text-xs text-gray-500 truncate">{travel.country}</p>
                )}
              </div>
              {travel.rating && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: travel.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              )}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === travel.id ? null : travel.id)}
                  className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
                <AnimatePresence>
                  {menuOpen === travel.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]"
                    >
                      {travel.status !== 'planning' && (
                        <button
                          onClick={() => updateTravelStatus(travel.id, 'planning')}
                          className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Calendar className="w-4 h-4 text-amber-500" />
                          Planificant
                        </button>
                      )}
                      {travel.status !== 'completed' && (
                        <button
                          onClick={() => updateTravelStatus(travel.id, 'completed')}
                          className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Check className="w-4 h-4 text-green-500" />
                          Visitat
                        </button>
                      )}
                      <button
                        onClick={() => deleteTravel(travel.id)}
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
        <span>{travels.filter(t => t.status === 'completed').length} visitats</span>
        <span>{travels.filter(t => t.status === 'dream').length} per descobrir</span>
      </div>
    </div>
  )
}
