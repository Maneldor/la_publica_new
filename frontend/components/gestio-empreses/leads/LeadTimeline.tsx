// components/gestio-empreses/leads/LeadTimeline.tsx
'use client'

import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import {
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  FileText,
  UserPlus,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Activity {
  id: string
  type: string
  description: string
  createdAt: Date
  user?: {
    name: string | null
  } | null
}

interface LeadTimelineProps {
  activities: Activity[]
}

const activityIcons: Record<string, React.ComponentType<{ className?: string, strokeWidth?: number }>> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  NOTE: MessageSquare,
  DOCUMENT: FileText,
  CREATED: UserPlus,
  STATUS_CHANGE: ArrowRight,
  CRM_APPROVED: CheckCircle,
  CRM_REJECTED: XCircle,
  DEFAULT: Clock,
}

const activityColors: Record<string, string> = {
  CALL: 'bg-green-100 text-green-600',
  EMAIL: 'bg-blue-100 text-blue-600',
  MEETING: 'bg-purple-100 text-purple-600',
  NOTE: 'bg-yellow-100 text-yellow-600',
  DOCUMENT: 'bg-slate-100 text-slate-600',
  CREATED: 'bg-emerald-100 text-emerald-600',
  STATUS_CHANGE: 'bg-indigo-100 text-indigo-600',
  CRM_APPROVED: 'bg-green-100 text-green-600',
  CRM_REJECTED: 'bg-red-100 text-red-600',
  DEFAULT: 'bg-slate-100 text-slate-500',
}

export function LeadTimeline({ activities }: LeadTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-sm text-slate-500">No hi ha activitat registrada</p>
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, idx) => {
          const Icon = activityIcons[activity.type] || activityIcons.DEFAULT
          const colorClass = activityColors[activity.type] || activityColors.DEFAULT
          const isLast = idx === activities.length - 1

          return (
            <li key={activity.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-8 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className={cn("p-2 rounded-full", colorClass)}>
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800">{activity.description}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span>
                        {format(new Date(activity.createdAt), "d MMM yyyy, HH:mm", { locale: ca })}
                      </span>
                      {activity.user?.name && (
                        <>
                          <span>·</span>
                          <span>{activity.user.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}