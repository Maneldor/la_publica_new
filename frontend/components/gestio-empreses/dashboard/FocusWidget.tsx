// components/gestio-empreses/dashboard/FocusWidget.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Zap,
  AlertTriangle,
  Clock,
  Calendar,
  Target,
  Building2,
  ChevronRight,
  Bell,
  CheckSquare,
  TrendingDown,
  ArrowRight
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { getDayFocusData } from '@/lib/gestio-empreses/dashboard-actions'

interface FocusWidgetProps {
  userId: string
}

interface Task {
  id: string
  title: string
  priority: string
  dueDate: Date | null
  lead?: { id: string; companyName: string } | null
  company?: { id: string; name: string } | null
}

interface Lead {
  id: string
  companyName: string
  status: string
  updatedAt: Date
  contactName: string | null
}

interface Event {
  id: string
  title: string
  startTime: Date
  type: string
  lead?: { id: string; companyName: string } | null
  company?: { id: string; name: string } | null
}

const priorityColors: Record<string, string> = {
  URGENT: 'text-red-600 bg-red-50 border-red-200',
  HIGH: 'text-amber-600 bg-amber-50 border-amber-200',
  MEDIUM: 'text-blue-600 bg-blue-50 border-blue-200',
  LOW: 'text-slate-600 bg-slate-50 border-slate-200',
}

export function FocusWidget({ userId }: FocusWidgetProps) {
  const [data, setData] = useState<{
    urgentTasks: Task[]
    inactiveLeads: Lead[]
    upcomingEvents: Event[]
    overdueCount: number
    nextEventIn: string | null
    summary: { hasUrgent: boolean; totalAttentionNeeded: number }
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'urgent' | 'inactive' | 'events'>('urgent')

  useEffect(() => {
    loadData()
    // Actualitzar cada 5 minuts
    const interval = setInterval(loadData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [userId])

  const loadData = async () => {
    try {
      const focusData = await getDayFocusData(userId)
      setData(focusData)
      // Seleccionar la pestanya amb més elements
      if (focusData.urgentTasks.length > 0 || focusData.overdueCount > 0) {
        setActiveTab('urgent')
      } else if (focusData.upcomingEvents.length > 0) {
        setActiveTab('events')
      } else if (focusData.inactiveLeads.length > 0) {
        setActiveTab('inactive')
      }
    } catch (error) {
      console.error('Error carregant focus:', error)
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-slate-200 rounded"></div>
      </div>
    )
  }

  if (!data) return null

  const { urgentTasks, inactiveLeads, upcomingEvents, overdueCount, nextEventIn, summary } = data

  // Si no hi ha res a mostrar
  if (summary.totalAttentionNeeded === 0 && upcomingEvents.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-green-100">
            <CheckSquare className="h-5 w-5 text-green-600" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-semibold text-green-900">Tot al dia!</h3>
            <p className="text-sm text-green-700">No tens elements urgents pendents</p>
          </div>
        </div>
        <p className="text-sm text-green-600">
          Continua així. Pots revisar els teus leads o crear noves tasques.
        </p>
      </div>
    )
  }

  const tabs = [
    {
      id: 'urgent' as const,
      label: 'Urgent',
      count: urgentTasks.length + overdueCount,
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      id: 'events' as const,
      label: 'Pròxim',
      count: upcomingEvents.length,
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      id: 'inactive' as const,
      label: 'Inactius',
      count: inactiveLeads.length,
      icon: TrendingDown,
      color: 'text-amber-600'
    },
  ]

  return (
    <div className={cn(
      'rounded-xl border p-6',
      summary.hasUrgent
        ? 'bg-gradient-to-br from-red-50 via-amber-50 to-orange-50 border-red-200'
        : 'bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            summary.hasUrgent ? 'bg-red-100' : 'bg-blue-100'
          )}>
            <Zap className={cn(
              'h-5 w-5',
              summary.hasUrgent ? 'text-red-600' : 'text-blue-600'
            )} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Focus del dia</h3>
            <p className="text-sm text-slate-500">
              {summary.totalAttentionNeeded} elements requereixen atenció
            </p>
          </div>
        </div>
        {nextEventIn && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-full border border-slate-200">
            <Clock className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
            <span className="text-sm font-medium text-slate-700">
              Pròxim en {nextEventIn}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-white shadow-sm border border-slate-200'
                : 'hover:bg-white/50'
            )}
          >
            <tab.icon className={cn('h-4 w-4', tab.color)} strokeWidth={1.5} />
            <span className="text-slate-700">{tab.label}</span>
            {tab.count > 0 && (
              <span className={cn(
                'px-1.5 py-0.5 text-xs font-medium rounded-full',
                tab.id === 'urgent' && tab.count > 0
                  ? 'bg-red-100 text-red-700'
                  : 'bg-slate-100 text-slate-600'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-2">
        {/* Urgent Tasks */}
        {activeTab === 'urgent' && (
          <>
            {overdueCount > 0 && (
              <Link
                href="/gestio/tasques?status=overdue"
                className="flex items-center justify-between p-3 bg-red-100/80 rounded-lg hover:bg-red-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" strokeWidth={1.5} />
                  <div>
                    <p className="font-medium text-red-900">
                      {overdueCount} tasques endarrerides
                    </p>
                    <p className="text-sm text-red-700">
                      Data límit superada
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-red-400 group-hover:text-red-600 transition-colors" strokeWidth={1.5} />
              </Link>
            )}
            {urgentTasks.map((task) => (
              <Link
                key={task.id}
                href={`/gestio/tasques`}
                className="flex items-center justify-between p-3 bg-white/80 rounded-lg hover:bg-white transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'px-2 py-1 rounded text-xs font-medium border',
                    priorityColors[task.priority]
                  )}>
                    {task.priority}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{task.title}</p>
                    <p className="text-sm text-slate-500">
                      {task.lead?.companyName || task.company?.name || 'Tasca general'}
                      {task.dueDate && (
                        <span className="ml-2">
                          · {format(new Date(task.dueDate), 'HH:mm', { locale: ca })}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-500 transition-colors" strokeWidth={1.5} />
              </Link>
            ))}
            {urgentTasks.length === 0 && overdueCount === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                Cap tasca urgent
              </p>
            )}
          </>
        )}

        {/* Upcoming Events */}
        {activeTab === 'events' && (
          <>
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href="/gestio/agenda"
                className="flex items-center justify-between p-3 bg-white/80 rounded-lg hover:bg-white transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Calendar className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{event.title}</p>
                    <p className="text-sm text-slate-500">
                      {event.lead?.companyName || event.company?.name || 'Esdeveniment'}
                      <span className="ml-2">
                        · {format(new Date(event.startTime), 'HH:mm', { locale: ca })}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-600 font-medium">
                    {formatDistanceToNow(new Date(event.startTime), { locale: ca, addSuffix: false })}
                  </span>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-500 transition-colors" strokeWidth={1.5} />
                </div>
              </Link>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                Cap esdeveniment en les pròximes 2 hores
              </p>
            )}
          </>
        )}

        {/* Inactive Leads */}
        {activeTab === 'inactive' && (
          <>
            {inactiveLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/gestio/leads/${lead.id}`}
                className="flex items-center justify-between p-3 bg-white/80 rounded-lg hover:bg-white transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Target className="h-4 w-4 text-amber-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{lead.companyName}</p>
                    <p className="text-sm text-slate-500">
                      {lead.contactName || 'Sense contacte'}
                      <span className="ml-2 text-amber-600">
                        · Sense activitat {formatDistanceToNow(new Date(lead.updatedAt), { locale: ca, addSuffix: true })}
                      </span>
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-500 transition-colors" strokeWidth={1.5} />
              </Link>
            ))}
            {inactiveLeads.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                Tots els leads tenen activitat recent
              </p>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-200/50">
        <Link
          href={activeTab === 'urgent' ? '/gestio/tasques' : activeTab === 'events' ? '/gestio/agenda' : '/gestio/leads'}
          className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Veure tot
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  )
}