// components/gestio-empreses/empreses/CompanyTimeline.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Plus,
  Loader2,
  Send
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { addCompanyNote } from '@/lib/gestio-empreses/company-actions'

interface Activity {
  id: string
  type: string
  description: string
  createdAt: Date
  createdBy: {
    name: string | null
    email: string
  } | null
}

const activityIcons: Record<string, any> = {
  NOTE: MessageSquare,
  CALL: Phone,
  EMAIL: Mail,
  DOCUMENT: FileText,
  CREATED: FileText,
  CONVERSION: FileText,
  OFFER_CREATED: FileText,
  MEMBER_ADDED: MessageSquare,
}

const activityColors: Record<string, string> = {
  NOTE: 'bg-blue-100 text-blue-600',
  CALL: 'bg-green-100 text-green-600',
  EMAIL: 'bg-purple-100 text-purple-600',
  DOCUMENT: 'bg-amber-100 text-amber-600',
  CREATED: 'bg-slate-100 text-slate-600',
  CONVERSION: 'bg-emerald-100 text-emerald-600',
  OFFER_CREATED: 'bg-indigo-100 text-indigo-600',
  MEMBER_ADDED: 'bg-cyan-100 text-cyan-600',
}

interface CompanyTimelineProps {
  companyId: string
  activities: Activity[]
}

export function CompanyTimeline({ companyId, activities }: CompanyTimelineProps) {
  const [showAddNote, setShowAddNote] = useState(false)
  const [note, setNote] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleAddNote = () => {
    if (!note.trim()) return

    startTransition(async () => {
      try {
        await addCompanyNote(companyId, note)
        setNote('')
        setShowAddNote(false)
        // TODO: refresh activities
      } catch (error) {
        console.error('Error afegint nota:', error)
      }
    })
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-medium text-slate-900">Activitat recent</h2>
        <button
          onClick={() => setShowAddNote(!showAddNote)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Afegir nota
        </button>
      </div>

      {/* Add note form */}
      {showAddNote && (
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Escriu una nota..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              onClick={() => setShowAddNote(false)}
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900"
            >
              Cancel·lar
            </button>
            <button
              onClick={handleAddNote}
              disabled={isPending || !note.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <Send className="h-4 w-4" strokeWidth={1.5} />
              )}
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="divide-y divide-slate-100">
        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-slate-500">Encara no hi ha activitat</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = activityIcons[activity.type] || MessageSquare
            const colorClass = activityColors[activity.type] || activityColors.NOTE

            return (
              <div key={activity.id} className="p-4 flex gap-3">
                <div className={cn('p-2 rounded-lg h-fit', colorClass)}>
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{activity.description}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {activity.createdBy?.name || activity.createdBy?.email || 'Sistema'} · {' '}
                    {formatDistanceToNow(new Date(activity.createdAt), { locale: ca, addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}