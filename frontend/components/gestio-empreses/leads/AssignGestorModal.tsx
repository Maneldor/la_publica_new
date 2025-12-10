'use client'

import { useState, useEffect } from 'react'
import { X, User, Users, Check } from 'lucide-react'
import { assignLeadToGestor, assignLeadsToGestor, getGestorsWithWorkload } from '@/lib/gestio-empreses/assignment-actions'
import { cn } from '@/lib/utils'

interface Gestor {
  id: string
  name: string
  email: string
  role: string
  activeLeads: number
  activeCompanies: number
}

interface AssignGestorModalProps {
  isOpen: boolean
  onClose: () => void
  leadIds: string[]
  leadNames: string[]
  onSuccess: () => void
  currentUserId: string
}

export function AssignGestorModal({
  isOpen,
  onClose,
  leadIds,
  leadNames,
  onSuccess,
  currentUserId
}: AssignGestorModalProps) {
  const [gestors, setGestors] = useState<Gestor[]>([])
  const [selectedGestorId, setSelectedGestorId] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadGestors()
    }
  }, [isOpen])

  const loadGestors = async () => {
    setLoading(true)
    try {
      const result = await getGestorsWithWorkload()
      setGestors(result)
    } catch (error) {
      console.error('Error cargando gestors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedGestorId) return

    setSubmitting(true)
    try {
      if (leadIds.length === 1) {
        await assignLeadToGestor(leadIds[0], selectedGestorId)
      } else {
        await assignLeadsToGestor(leadIds, selectedGestorId, currentUserId)
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error asignando leads:', error)
      alert('Error asignando leads. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const selectedGestor = gestors.find(g => g.id === selectedGestorId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {leadIds.length === 1 ? (
              <User className="w-6 h-6 text-blue-600" />
            ) : (
              <Users className="w-6 h-6 text-blue-600" />
            )}
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Assignar {leadIds.length === 1 ? 'lead' : `${leadIds.length} leads`} a gestor
              </h2>
              <p className="text-sm text-slate-500">
                Selecciona el gestor que gestionarà {leadIds.length === 1 ? 'aquest lead' : 'aquests leads'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lead(s) info */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-medium text-slate-700 mb-2">
            {leadIds.length === 1 ? 'Lead a assignar:' : 'Leads a assignar:'}
          </h3>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {leadNames.map((name, index) => (
              <div key={index} className="text-sm text-slate-600 bg-white px-2 py-1 rounded border">
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Gestor selection */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Selecciona un gestor:</h3>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-slate-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {gestors.map((gestor) => (
                <button
                  key={gestor.id}
                  onClick={() => setSelectedGestorId(gestor.id)}
                  className={cn(
                    "w-full p-4 text-left border rounded-lg transition-all hover:border-blue-300",
                    selectedGestorId === gestor.id
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{gestor.name}</div>
                        <div className="text-sm text-slate-500">{gestor.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-700">
                        {gestor.activeLeads} leads actius
                      </div>
                      <div className="text-xs text-slate-500">
                        {gestor.activeCompanies} empreses
                      </div>
                    </div>
                    {selectedGestorId === gestor.id && (
                      <Check className="w-5 h-5 text-blue-600 ml-3" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            {selectedGestor && (
              <span>
                Assignant a <strong>{selectedGestor.name}</strong>
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel·lar
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedGestorId || submitting}
              className={cn(
                "px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors",
                selectedGestorId && !submitting
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-slate-400 cursor-not-allowed"
              )}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Assignant...
                </div>
              ) : (
                `Assignar ${leadIds.length === 1 ? 'lead' : 'leads'}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}