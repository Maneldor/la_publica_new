'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Bell,
  Clock,
  Target,
  Calendar,
  Shield,
  ArrowRight,
  Loader2,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAlerts, type Alert } from '@/lib/gestio-empreses/dashboard-actions'

interface AlertsWidgetProps {
  userId: string
}

const alertTypeIcons: Record<string, any> = {
  'lead_inactive': Target,
  'task_overdue': Clock,
  'event_today': Calendar,
  'pending_verification': Shield
}

const severityColors: Record<string, string> = {
  'high': 'border-l-red-500 bg-red-50',
  'medium': 'border-l-amber-500 bg-amber-50',
  'low': 'border-l-blue-500 bg-blue-50'
}

const severityIconColors: Record<string, string> = {
  'high': 'text-red-600',
  'medium': 'text-amber-600',
  'low': 'text-blue-600'
}

export function AlertsWidget({ userId }: AlertsWidgetProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const result = await getAlerts(userId)
        setAlerts(result)
      } catch (error) {
        console.error('Error carregant alertes:', error)
      }
      setIsLoading(false)
    }

    loadAlerts()
  }, [userId])

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]))
  }

  const visibleAlerts = alerts.filter(a => !dismissedAlerts.has(a.id))
  const highPriorityCount = visibleAlerts.filter(a => a.severity === 'high').length

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
          <h3 className="font-semibold text-slate-900">Alertes</h3>
          {highPriorityCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-600 text-white rounded-full">
              {highPriorityCount} urgents
            </span>
          )}
        </div>
        {visibleAlerts.length > 0 && (
          <span className="text-xs text-slate-500">
            {visibleAlerts.length} {visibleAlerts.length === 1 ? 'alerta' : 'alertes'}
          </span>
        )}
      </div>

      {/* Alerts list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" strokeWidth={1.5} />
        </div>
      ) : visibleAlerts.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Bell className="h-6 w-6 text-green-600" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-slate-500">Tot al dia! No tens alertes pendents.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {visibleAlerts.map((alert) => {
            const Icon = alertTypeIcons[alert.type] || AlertTriangle

            return (
              <div
                key={alert.id}
                className={cn(
                  'relative p-3 rounded-r-lg border-l-4 transition-colors',
                  severityColors[alert.severity]
                )}
              >
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="absolute top-2 right-2 p-1 hover:bg-white/50 rounded"
                >
                  <X className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
                </button>

                <div className="flex items-start gap-3 pr-6">
                  <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', severityIconColors[alert.severity])} strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{alert.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{alert.description}</p>
                    <Link
                      href={alert.link}
                      className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      Veure detalls
                      <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}