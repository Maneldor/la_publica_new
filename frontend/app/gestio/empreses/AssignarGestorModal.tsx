'use client'

import { useState, useEffect } from 'react'
import { X, User, Users, Search, Check, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getGestorsDisponibles,
  assignarGestor
} from '@/lib/gestio-empreses/actions/empreses-llista-actions'
import { toast } from 'sonner'

interface Gestor {
  id: string
  name: string | null
  email: string
  empresesAssignades: number
}

interface AssignarGestorModalProps {
  isOpen: boolean
  onClose: () => void
  empresa: {
    id: string
    name: string
    accountManagerId: string | null
    accountManager?: { id: string; name: string | null } | null
  }
  onAssigned: () => void
}

export function AssignarGestorModal({
  isOpen,
  onClose,
  empresa,
  onAssigned
}: AssignarGestorModalProps) {
  const [gestors, setGestors] = useState<Gestor[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [selectedGestorId, setSelectedGestorId] = useState<string | null>(
    empresa.accountManagerId
  )
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadGestors()
      setSelectedGestorId(empresa.accountManagerId)
    }
  }, [isOpen, empresa.accountManagerId])

  const loadGestors = async () => {
    setLoading(true)
    const result = await getGestorsDisponibles()
    if (result.success && result.data) {
      setGestors(result.data)
    }
    setLoading(false)
  }

  const handleAssign = async () => {
    if (!selectedGestorId) {
      toast.error('Selecciona un gestor')
      return
    }

    setAssigning(true)
    const result = await assignarGestor(empresa.id, selectedGestorId)

    if (result.success) {
      const gestor = gestors.find(g => g.id === selectedGestorId)
      toast.success(`Empresa assignada a ${gestor?.name || gestor?.email}`)
      onAssigned()
      onClose()
    } else {
      toast.error(result.error || 'Error assignant gestor')
    }

    setAssigning(false)
  }

  const filteredGestors = gestors.filter(g => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      g.name?.toLowerCase().includes(search) ||
      g.email.toLowerCase().includes(search)
    )
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Assignar Gestor
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {empresa.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cerca */}
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cercar gestor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Llista de gestors */}
        <div className="max-h-72 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : filteredGestors.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                {searchTerm ? 'No s\'han trobat gestors' : 'No hi ha gestors disponibles'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredGestors.map((gestor) => (
                <div
                  key={gestor.id}
                  onClick={() => setSelectedGestorId(gestor.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                    selectedGestorId === gestor.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'hover:bg-slate-50 border-2 border-transparent'
                  )}
                >
                  {/* Avatar */}
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    selectedGestorId === gestor.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-slate-100 text-slate-600'
                  )}>
                    <User className="h-5 w-5" strokeWidth={1.5} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-medium truncate',
                      selectedGestorId === gestor.id ? 'text-blue-900' : 'text-slate-900'
                    )}>
                      {gestor.name || 'Sense nom'}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {gestor.email}
                    </p>
                  </div>

                  {/* Comptador empreses */}
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Building2 className="h-3.5 w-3.5" />
                    {gestor.empresesAssignades}
                  </div>

                  {/* Check */}
                  {selectedGestorId === gestor.id && (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel·lar
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedGestorId || assigning}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {assigning ? 'Assignant...' : 'Assignar'}
          </button>
        </div>
      </div>
    </div>
  )
}