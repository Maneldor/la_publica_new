'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Mail, Calendar, Lock, Unlock, Trash2 } from 'lucide-react'
import { TimeCapsuleIcon } from '@/components/icons'

interface TimeCapsule {
  id: string
  message: string
  openDate: string
  isOpened: boolean
  openedAt?: string
  createdAt: string
}

interface CapsulaModuleProps {
  onClose?: () => void
}

export function CapsulaModule({ onClose }: CapsulaModuleProps) {
  const [capsules, setCapsules] = useState<TimeCapsule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [newOpenDate, setNewOpenDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsule | null>(null)
  const [readyToOpen, setReadyToOpen] = useState<TimeCapsule[]>([])

  useEffect(() => {
    loadCapsules()
    checkReadyToOpen()
  }, [])

  const loadCapsules = async () => {
    try {
      const res = await fetch('/api/agenda/time-capsules')
      if (res.ok) {
        const data = await res.json()
        setCapsules(data)
      }
    } catch (error) {
      console.error('Error carregant càpsules:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkReadyToOpen = async () => {
    try {
      const res = await fetch('/api/agenda/time-capsules?ready=true')
      if (res.ok) {
        const data = await res.json()
        setReadyToOpen(data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const createCapsule = async () => {
    if (!newMessage.trim() || !newOpenDate) return
    setSaving(true)

    try {
      const res = await fetch('/api/agenda/time-capsules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          openDate: newOpenDate
        })
      })

      if (res.ok) {
        setNewMessage('')
        setNewOpenDate('')
        setShowNewForm(false)
        loadCapsules()
      }
    } catch (error) {
      console.error('Error creant càpsula:', error)
    } finally {
      setSaving(false)
    }
  }

  const openCapsule = async (capsuleId: string) => {
    try {
      const res = await fetch(`/api/agenda/time-capsules/${capsuleId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedCapsule(data)
        loadCapsules()
        checkReadyToOpen()
      }
    } catch (error) {
      console.error('Error obrint càpsula:', error)
    }
  }

  const deleteCapsule = async (capsuleId: string) => {
    try {
      await fetch(`/api/agenda/time-capsules/${capsuleId}`, { method: 'DELETE' })
      loadCapsules()
      checkReadyToOpen()
    } catch (error) {
      console.error('Error eliminant càpsula:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const unopenedCapsules = capsules.filter(c => !c.isOpened)
  const openedCapsules = capsules.filter(c => c.isOpened)

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
          <TimeCapsuleIcon size="md" />
          <h3 className="font-semibold text-gray-900">Càpsula del temps</h3>
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

      {/* Notificación de cápsulas listas */}
      {readyToOpen.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-violet-50 border border-violet-200 rounded-lg"
        >
          <p className="text-sm text-violet-700 mb-2">
            Tens {readyToOpen.length} càpsula{readyToOpen.length > 1 ? 'es' : ''} llesta{readyToOpen.length > 1 ? 'es' : ''} per obrir!
          </p>
          <div className="flex gap-2">
            {readyToOpen.map((capsule) => (
              <button
                key={capsule.id}
                onClick={() => openCapsule(capsule.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500 text-white text-sm rounded-lg hover:bg-violet-600"
              >
                <Unlock className="w-4 h-4" />
                Obrir
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Modal de cápsula abierta */}
      <AnimatePresence>
        {selectedCapsule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedCapsule(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-8 h-8 text-violet-500" />
                </div>
                <h3 className="font-semibold text-gray-900">Missatge del passat</h3>
                <p className="text-xs text-gray-500">
                  Escrit el {formatDate(selectedCapsule.createdAt)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedCapsule.message}</p>
              </div>
              <button
                onClick={() => setSelectedCapsule(null)}
                className="w-full py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
              >
                Tancar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulario nueva cápsula */}
      <AnimatePresence>
        {showNewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 space-y-3"
          >
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escriu un missatge al teu jo futur..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
              rows={4}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={newOpenDate}
                onChange={(e) => setNewOpenDate(e.target.value)}
                min={getMinDate()}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewForm(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel·lar
              </button>
              <button
                onClick={createCapsule}
                disabled={saving || !newMessage.trim() || !newOpenDate}
                className="px-3 py-1.5 text-sm bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50"
              >
                {saving ? 'Guardant...' : 'Crear càpsula'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de cápsulas */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {unopenedCapsules.length === 0 && openedCapsules.length === 0 ? (
          <div className="text-center py-6">
            <Mail className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Escriu un missatge al teu jo futur
            </p>
          </div>
        ) : (
          <>
            {unopenedCapsules.map((capsule) => (
              <div
                key={capsule.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-violet-50 border border-violet-100"
              >
                <div className="p-1.5 bg-violet-100 rounded">
                  <Lock className="w-4 h-4 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-violet-700">Càpsula tancada</p>
                  <p className="text-xs text-violet-500">S&apos;obre el {formatDate(capsule.openDate)}</p>
                </div>
                <button
                  onClick={() => deleteCapsule(capsule.id)}
                  className="p-1 hover:bg-violet-100 rounded text-violet-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {openedCapsules.length > 0 && (
              <div className="pt-2 mt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Obertes</p>
                {openedCapsules.slice(0, 3).map((capsule) => (
                  <button
                    key={capsule.id}
                    onClick={() => setSelectedCapsule(capsule)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div className="p-1.5 bg-gray-100 rounded">
                      <Unlock className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 truncate">{capsule.message.slice(0, 30)}...</p>
                      <p className="text-xs text-gray-400">Oberta el {formatDate(capsule.openedAt || capsule.openDate)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
