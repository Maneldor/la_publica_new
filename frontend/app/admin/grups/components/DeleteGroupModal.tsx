'use client'

import { useState } from 'react'
import { TYPOGRAPHY, BUTTONS } from '@/lib/design-system'
import { X, AlertTriangle, Trash2 } from 'lucide-react'

interface Group {
  id: string
  name: string
  slug: string
  description: string | null
  type: 'PRIVATE' | 'SECRET' | 'PROFESSIONAL'
  membersCount: number
  isActive: boolean
  createdAt: string
  _count?: {
    members: number
  }
}

interface DeleteGroupModalProps {
  isOpen: boolean
  onClose: () => void
  group: Group | null
  onConfirm: () => Promise<void>
}

export function DeleteGroupModal({ isOpen, onClose, group, onConfirm }: DeleteGroupModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen || !group) return null

  const membersCount = group._count?.members || group.membersCount || 0
  const canDelete = membersCount === 0

  const handleDelete = async () => {
    if (!canDelete) return

    setIsDeleting(true)
    try {
      await onConfirm()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className={TYPOGRAPHY.sectionTitle}>Eliminar Grup</h2>
          </div>
          <button onClick={onClose} className={BUTTONS.icon}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className={TYPOGRAPHY.body}>
            Estas segur que vols eliminar el grup <strong>&quot;{group.name}&quot;</strong>?
          </p>

          {!canDelete && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                <strong>No es pot eliminar:</strong> Aquest grup te {membersCount} membres.
                Has d&apos;eliminar tots els membres abans de poder eliminar el grup.
              </p>
            </div>
          )}

          {canDelete && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                <strong>Aquesta accio es irreversible.</strong> El grup i totes les seves
                dades seran eliminats permanentment.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className={BUTTONS.ghost}
          >
            Cancel·lar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || !canDelete}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Eliminant...' : 'Eliminar grup'}
          </button>
        </div>
      </div>
    </div>
  )
}
