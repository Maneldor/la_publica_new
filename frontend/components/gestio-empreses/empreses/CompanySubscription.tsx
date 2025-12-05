// components/gestio-empreses/empreses/CompanySubscription.tsx
import { CreditCard, Calendar, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Subscription {
  id: string
  status: string
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  plan: {
    name: string
    tier: string
    price: number
  } | null
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Activa', color: 'bg-green-100 text-green-700' },
  PAST_DUE: { label: 'Pagament pendent', color: 'bg-yellow-100 text-yellow-700' },
  CANCELLED: { label: 'Cancel·lada', color: 'bg-red-100 text-red-700' },
  TRIALING: { label: 'Prova', color: 'bg-blue-100 text-blue-700' },
}

export function CompanySubscription({ subscription }: { subscription: Subscription | null }) {
  if (!subscription) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-3 text-slate-500">
          <AlertCircle className="h-5 w-5" strokeWidth={1.5} />
          <p>Sense subscripció activa</p>
        </div>
      </div>
    )
  }

  const status = statusConfig[subscription.status] || statusConfig.ACTIVE

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-4 border-b border-slate-100">
        <h2 className="font-medium text-slate-900">Subscripció</h2>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <CreditCard className="h-5 w-5 text-purple-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {subscription.plan?.name || 'Pla desconegut'}
              </p>
              <p className="text-sm text-slate-500">
                {subscription.plan?.price
                  ? `${subscription.plan.price} €/mes`
                  : 'Preu no definit'
                }
              </p>
            </div>
          </div>
          <span className={cn('px-2.5 py-1 text-xs font-medium rounded', status.color)}>
            {status.label}
          </span>
        </div>

        {subscription.currentPeriodEnd && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-4 w-4" strokeWidth={1.5} />
            <span>
              Proper pagament: {format(new Date(subscription.currentPeriodEnd), "d MMMM yyyy", { locale: ca })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}