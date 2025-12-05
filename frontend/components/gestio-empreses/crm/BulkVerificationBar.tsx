// components/gestio-empreses/crm/BulkVerificationBar.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  X,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { bulkApproveLeads, bulkRejectLeads } from '@/lib/gestio-empreses/verification-actions'

interface BulkVerificationBarProps {
  selectedIds: string[]
  onClear: () => void
  onSuccess: () => void
  userId: string
}

export function BulkVerificationBar({
  selectedIds,
  onClear,
  onSuccess,
  userId
}: BulkVerificationBarProps) {
  const [isPending, startTransition] = useTransition()
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [notes, setNotes] = useState('')

  if (selectedIds.length === 0) return null

  const handleApprove = () => {
    startTransition(async () => {
      await bulkApproveLeads(selectedIds, userId, notes || undefined)
      setNotes('')
      setAction(null)
      onSuccess()
      onClear()
    })
  }

  const handleReject = () => {
    if (!notes.trim()) return

    startTransition(async () => {
      await bulkRejectLeads(selectedIds, userId, notes)
      setNotes('')
      setAction(null)
      onSuccess()
      onClear()
    })
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl px-5 py-4 min-w-[400px]">
        {action === null ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-400" strokeWidth={1.5} />
              <span className="font-medium">{selectedIds.length} seleccionats</span>
            </div>

            <div className="h-6 w-px bg-slate-700" />

            <button
              onClick={() => setAction('approve')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
              <span className="text-sm font-medium">Aprovar tots</span>
            </button>

            <button
              onClick={() => setAction('reject')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
            >
              <XCircle className="h-4 w-4" strokeWidth={1.5} />
              <span className="text-sm font-medium">Rebutjar tots</span>
            </button>

            <button
              onClick={onClear}
              className="p-1.5 rounded-lg hover:bg-slate-800 ml-2"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className={cn(
                'h-5 w-5',
                action === 'approve' ? 'text-green-400' : 'text-red-400'
              )} strokeWidth={1.5} />
              <span>
                {action === 'approve'
                  ? `Aprovar ${selectedIds.length} leads?`
                  : `Rebutjar ${selectedIds.length} leads?`}
              </span>
            </div>

            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={action === 'approve' ? 'Notes (opcional)...' : 'Motiu del rebuig (obligatori)...'}
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAction(null)
                  setNotes('')
                }}
                className="flex-1 px-3 py-2 text-sm font-medium bg-slate-700 rounded-lg hover:bg-slate-600"
              >
                Cancel·lar
              </button>
              <button
                onClick={action === 'approve' ? handleApprove : handleReject}
                disabled={isPending || (action === 'reject' && !notes.trim())}
                className={cn(
                  'flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg disabled:opacity-50',
                  action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                )}
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
                Confirmar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}