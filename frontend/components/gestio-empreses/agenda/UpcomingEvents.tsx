// components/gestio-empreses/agenda/UpcomingEvents.tsx
import {
  Clock,
  Phone,
  Users,
  Target,
  Calendar,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  type: string
  startDate: Date
  lead?: { id: string; companyName: string } | null
  company?: { id: string; name: string } | null
}

const eventTypeIcons: Record<string, any> = {
  CALL: Phone,
  MEETING: Users,
  FOLLOW_UP: Clock,
  DEMO: Target,
  OTHER: Calendar,
}

export function UpcomingEvents({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
        <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
        <p className="text-slate-500 text-sm">Cap esdeveniment proper</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-medium text-slate-900">Propers esdeveniments</h3>
        <Link
          href="/gestio/agenda"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Veure tot
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </div>
      <div className="divide-y divide-slate-100">
        {events.map((event) => {
          const Icon = eventTypeIcons[event.type] || Calendar

          return (
            <div key={event.id} className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-100">
                <Icon className="h-4 w-4 text-slate-600" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{event.title}</p>
                {(event.lead || event.company) && (
                  <p className="text-sm text-slate-500 truncate">
                    {event.lead?.companyName || event.company?.name}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  {format(new Date(event.startDate), "EEEE d MMM 'a les' HH:mm", { locale: ca })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}