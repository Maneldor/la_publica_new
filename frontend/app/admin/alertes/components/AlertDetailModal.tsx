'use client'

import { useState } from 'react'
import { TYPOGRAPHY, INPUTS, BUTTONS } from '@/lib/design-system'
import {
  X,
  AlertTriangle,
  User,
  Clock,
  Check,
  XCircle,
  ArrowRight
} from 'lucide-react'

interface AlertDetailModalProps {
  isOpen: boolean
  onClose: () => void
  alert: {
    id: string
    type: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED'
    title: string
    message: string
    metadata: Record<string, unknown>
    createdAt: string
    resolvedAt?: string
    resolution?: string
    user: {
      id: string
      name: string | null
      nick: string | null
      email: string
      image?: string | null
    }
    resolvedBy?: {
      id: string
      name: string | null
    }
  }
  onResolve: (alertId: string, resolution: string, action?: string) => void
}

export function AlertDetailModal({ isOpen, onClose, alert, onResolve }: AlertDetailModalProps) {
  const [resolution, setResolution] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !alert) return null

  const metadata = alert.metadata || {}

  const handleApprove = async () => {
    setIsSubmitting(true)
    await onResolve(alert.id, resolution || 'Sol-licitud aprovada', 'APPROVE_GROUP_CHANGE')
    setIsSubmitting(false)
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    await onResolve(alert.id, resolution || 'Sol-licitud rebutjada')
    setIsSubmitting(false)
  }

  const handleDismiss = async () => {
    setIsSubmitting(true)
    await onResolve(alert.id, resolution || 'Alerta descartada')
    setIsSubmitting(false)
  }

  const handleResolve = async () => {
    setIsSubmitting(true)
    await onResolve(alert.id, resolution || 'Resolt')
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              alert.severity === 'CRITICAL' ? 'bg-red-100' :
              alert.severity === 'HIGH' ? 'bg-orange-100' :
              alert.severity === 'MEDIUM' ? 'bg-amber-100' : 'bg-blue-100'
            }`}>
              <AlertTriangle className={`w-5 h-5 ${
                alert.severity === 'CRITICAL' ? 'text-red-600' :
                alert.severity === 'HIGH' ? 'text-orange-600' :
                alert.severity === 'MEDIUM' ? 'text-amber-600' : 'text-blue-600'
              }`} />
            </div>
            <h2 className={TYPOGRAPHY.sectionTitle}>Detall de l&apos;Alerta</h2>
          </div>
          <button onClick={onClose} className={BUTTONS.icon}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Titol i missatge */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{alert.title}</h3>
            <p className={TYPOGRAPHY.body}>{alert.message}</p>
          </div>

          {/* Info usuari */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{alert.user.name || 'Usuari'}</p>
                <p className={TYPOGRAPHY.small}>@{alert.user.nick || 'sense-nick'} - {alert.user.email}</p>
              </div>
            </div>
          </div>

          {/* Metadades especifiques per canvi de grup */}
          {(alert.type === 'MULTIPLE_PROFESSIONAL_GROUP_ATTEMPT' ||
            alert.type === 'PROFESSIONAL_GROUP_CHANGE_REQUEST') && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-medium text-amber-800 mb-2">Detalls del grup:</p>
              <div className="flex items-center gap-2 text-sm text-amber-700">
                {metadata.currentGroupName && (
                  <>
                    <span className="px-2 py-1 bg-amber-100 rounded">{String(metadata.currentGroupName)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
                <span className="px-2 py-1 bg-amber-200 rounded font-medium">{String(metadata.requestedGroupName)}</span>
              </div>
              {metadata.reason && (
                <p className="mt-2 text-sm text-amber-600">
                  <span className="font-medium">Motiu:</span> {String(metadata.reason)}
                </p>
              )}
            </div>
          )}

          {/* Data */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Creat: {new Date(alert.createdAt).toLocaleString('ca-ES')}</span>
          </div>

          {/* Camp de resolucio */}
          {alert.status === 'PENDING' && (
            <div>
              <label className={`block ${TYPOGRAPHY.label} mb-1`}>
                Comentari de resolucio (opcional)
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={2}
                className={INPUTS.textarea}
                placeholder="Afegeix un comentari..."
              />
            </div>
          )}

          {/* Resolucio anterior */}
          {alert.status !== 'PENDING' && alert.resolution && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">Resolucio:</p>
              <p className="text-sm text-green-700 mt-1">{alert.resolution}</p>
              {alert.resolvedBy && (
                <p className="text-xs text-green-600 mt-2">
                  Per: {alert.resolvedBy.name} - {alert.resolvedAt && new Date(alert.resolvedAt).toLocaleString('ca-ES')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer amb accions */}
        {alert.status === 'PENDING' && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleDismiss}
              disabled={isSubmitting}
              className={`${BUTTONS.ghost} disabled:opacity-50`}
            >
              Descartar
            </button>

            {alert.type === 'PROFESSIONAL_GROUP_CHANGE_REQUEST' && (
              <>
                <button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Rebutjar
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Aprovar canvi
                </button>
              </>
            )}

            {alert.type !== 'PROFESSIONAL_GROUP_CHANGE_REQUEST' && (
              <button
                onClick={handleResolve}
                disabled={isSubmitting}
                className={`${BUTTONS.primary} flex items-center gap-2 disabled:opacity-50`}
              >
                <Check className="w-4 h-4" />
                Marcar com resolt
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
