// components/gestio-empreses/leads/BulkActionsBar.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  X,
  UserPlus,
  ArrowRightLeft,
  Trash2,
  CheckCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Gestor {
  id: string
  name: string | null
  email: string
}

interface BulkActionsBarProps {
  selectedIds: string[]
  onClear: () => void
  onSuccess: () => void
  gestors: Gestor[]
}

const statusOptions = [
  { value: 'NEW', label: 'Nou' },
  { value: 'CONTACTED', label: 'Contactat' },
  { value: 'QUALIFIED', label: 'Qualificat' },
  { value: 'NEGOTIATION', label: 'Negociant' },
  { value: 'PROPOSAL_SENT', label: 'Proposta enviada' },
  { value: 'PENDING_CRM', label: 'Pendent CRM' },
  { value: 'WON', label: 'Guanyat' },
  { value: 'LOST', label: 'Perdut' },
]

export function BulkActionsBar({ selectedIds, onClear, onSuccess, gestors }: BulkActionsBarProps) {
  const [isPending, startTransition] = useTransition()
  const [activeAction, setActiveAction] = useState<'assign' | 'status' | 'delete' | null>(null)
  const [selectedGestor, setSelectedGestor] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleAssign = () => {
    if (!selectedGestor) return

    startTransition(async () => {
      try {
        console.log('Assigning leads:', selectedIds, 'to:', selectedGestor)
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        onSuccess()
        onClear()
        setActiveAction(null)
        setSelectedGestor('')
      } catch (error) {
        console.error('Error assignant leads:', error)
      }
    })
  }

  const handleStatusChange = () => {
    if (!selectedStatus) return

    startTransition(async () => {
      try {
        console.log('Changing status of leads:', selectedIds, 'to:', selectedStatus)
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        onSuccess()
        onClear()
        setActiveAction(null)
        setSelectedStatus('')
      } catch (error) {
        console.error('Error canviant estat:', error)
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      try {
        console.log('Deleting leads:', selectedIds)
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        onSuccess()
        onClear()
        setActiveAction(null)
        setShowDeleteConfirm(false)
      } catch (error) {
        console.error('Error eliminant leads:', error)
      }
    })
  }

  if (selectedIds.length === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl px-4 py-3 flex items-center gap-4">
        {/* Comptador */}
        <div className="flex items-center gap-2 pr-4 border-r border-slate-700">
          <CheckCircle className="h-5 w-5 text-blue-400" strokeWidth={1.5} />
          <span className="font-medium">{selectedIds.length} seleccionats</span>
        </div>

        {/* Accions */}
        {activeAction === null && (
          <>
            <button
              onClick={() => setActiveAction('assign')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <UserPlus className="h-4 w-4" strokeWidth={1.5} />
              <span className="text-sm">Assignar</span>
            </button>

            <button
              onClick={() => setActiveAction('status')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <ArrowRightLeft className="h-4 w-4" strokeWidth={1.5} />
              <span className="text-sm">Canviar estat</span>
            </button>

            <button
              onClick={() => setActiveAction('delete')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-900/50 text-red-400 transition-colors"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              <span className="text-sm">Eliminar</span>
            </button>
          </>
        )}

        {/* Selector de gestor */}
        {activeAction === 'assign' && (
          <div className="flex items-center gap-2">
            <select
              value={selectedGestor}
              onChange={(e) => setSelectedGestor(e.target.value)}
              className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar gestor...</option>
              {gestors.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name || g.email}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              disabled={!selectedGestor || isPending}
              className="px-3 py-1.5 text-sm bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
              Assignar
            </button>
            <button
              onClick={() => { setActiveAction(null); setSelectedGestor('') }}
              className="p-1.5 hover:bg-slate-800 rounded-lg"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* Selector d'estat */}
        {activeAction === 'status' && (
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar estat...</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleStatusChange}
              disabled={!selectedStatus || isPending}
              className="px-3 py-1.5 text-sm bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
              Aplicar
            </button>
            <button
              onClick={() => { setActiveAction(null); setSelectedStatus('') }}
              className="p-1.5 hover:bg-slate-800 rounded-lg"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* Confirmació eliminar */}
        {activeAction === 'delete' && !showDeleteConfirm && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-400">Eliminar {selectedIds.length} leads?</span>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1.5 text-sm bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              Confirmar
            </button>
            <button
              onClick={() => setActiveAction(null)}
              className="p-1.5 hover:bg-slate-800 rounded-lg"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        )}

        {activeAction === 'delete' && showDeleteConfirm && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" strokeWidth={1.5} />
            <span className="text-sm">Acció irreversible!</span>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="px-3 py-1.5 text-sm bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
              Sí, eliminar
            </button>
            <button
              onClick={() => { setActiveAction(null); setShowDeleteConfirm(false) }}
              className="px-3 py-1.5 text-sm bg-slate-700 rounded-lg hover:bg-slate-600"
            >
              Cancel·lar
            </button>
          </div>
        )}

        {/* Botó tancar */}
        {activeAction === null && (
          <button
            onClick={onClear}
            className="p-1.5 hover:bg-slate-800 rounded-lg ml-2"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  )
}