'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  CheckCircle,
  Circle,
  ExternalLink,
  FileText,
  Phone,
  Mail,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react'
import {
  getLeadChecklist,
  completeCheck,
  LeadCheckStatus,
  PhaseChecklistStatus
} from '@/lib/gestio-empreses/actions/checklist-actions'
import { PHASE_CHECKS, getActivityFieldConfig } from '@/lib/gestio-empreses/checklist-config'
import { toast } from 'sonner'
import Link from 'next/link'

interface PhaseChecklistProps {
  leadId: string
  onChecklistChange?: (canAdvance: boolean) => void
}

export function PhaseChecklist({ leadId, onChecklistChange }: PhaseChecklistProps) {
  const { data: session } = useSession()
  const [checklist, setChecklist] = useState<PhaseChecklistStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Carregar checklist
  useEffect(() => {
    loadChecklist()
  }, [leadId])

  const loadChecklist = async () => {
    setLoading(true)
    console.log('🔍 Loading checklist for leadId:', leadId)
    const result = await getLeadChecklist(leadId)
    console.log('✅ Checklist result:', JSON.stringify(result, null, 2))
    if (result.success && result.data) {
      console.log('📋 Checklist data:', result.data)
      setChecklist(result.data)
      onChecklistChange?.(result.data.canAdvance)
    } else {
      console.log('❌ Full error object:', JSON.stringify(result, null, 2))
      console.log('❌ No checklist data or error:', result.error)
    }
    setLoading(false)
  }

  const handleExpandCheck = (checkId: string) => {
    if (expandedCheck === checkId) {
      setExpandedCheck(null)
      setFormData({})
    } else {
      setExpandedCheck(checkId)
      setFormData({})
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCompleteCheck = async (checkId: string) => {
    setSubmitting(true)
    const result = await completeCheck(leadId, checkId, formData)

    if (result.success) {
      toast.success('Check completat!')
      setExpandedCheck(null)
      setFormData({})
      loadChecklist()
    } else {
      toast.error(result.error || 'Error completant check')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-slate-100 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!checklist) {
    return <div className="text-slate-500">No hi ha checklist per aquesta fase</div>
  }

  return (
    <div className="space-y-4">
      {/* Header amb progrés */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">
          Tasques de fase ({checklist.completedChecks}/{checklist.totalChecks})
        </h3>
        <div className="flex items-center gap-2">
          {checklist.canAdvance ? (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Pot avançar
            </span>
          ) : (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {checklist.requiredChecks - checklist.completedRequiredChecks} pendents
            </span>
          )}
        </div>
      </div>

      {/* Barra de progrés */}
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(checklist.completedChecks / checklist.totalChecks) * 100}%` }}
        />
      </div>

      {/* Llista de checks */}
      <div className="space-y-2">
        {checklist.checks.map((check) => (
          <CheckItem
            key={check.checkId}
            check={check}
            isExpanded={expandedCheck === check.checkId}
            onExpand={() => handleExpandCheck(check.checkId)}
            formData={formData}
            onInputChange={handleInputChange}
            onComplete={() => handleCompleteCheck(check.checkId)}
            submitting={submitting}
            userRole={session?.user?.role as string}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================
// COMPONENT CHECK INDIVIDUAL
// ============================================

interface CheckItemProps {
  check: LeadCheckStatus
  isExpanded: boolean
  onExpand: () => void
  formData: Record<string, string>
  onInputChange: (field: string, value: string) => void
  onComplete: () => void
  submitting: boolean
  userRole: string
}

function CheckItem({
  check,
  isExpanded,
  onExpand,
  formData,
  onInputChange,
  onComplete,
  submitting,
  userRole
}: CheckItemProps) {
  const checkConfig = PHASE_CHECKS.find(c => c.id === check.checkId)
  const activityConfig = checkConfig?.activityField

  // Verificar si l'usuari pot completar aquest check
  const canComplete = checkConfig?.allowedRoles.includes(userRole) || false

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${check.isCompleted
        ? 'bg-green-50 border-green-200'
        : 'bg-white border-slate-200'
      }`}>
      {/* Header del check */}
      <div
        className="p-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50"
        onClick={() => !check.isCompleted && canComplete && onExpand()}
      >
        {/* Icona check */}
        {check.isCompleted ? (
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
        ) : (
          <Circle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${canComplete ? 'text-slate-400' : 'text-slate-300'
            }`} />
        )}

        {/* Contingut */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${check.isCompleted ? 'text-green-800' : 'text-slate-900'
              }`}>
              {check.title}
            </span>
            {check.isRequired && !check.isCompleted && (
              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                Obligatori
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600 mt-0.5">
            {check.description}
          </p>

          {/* Enllaços a recursos */}
          {(check.resourceSlug || check.externalUrl) && (
            <div className="mt-2 flex gap-2">
              {check.resourceSlug && (
                <Link
                  href={`/gestio/eines/${check.resourceSlug}`}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="w-3 h-3" />
                  Veure recurs
                </Link>
              )}
              {check.externalUrl && (
                <a
                  href={check.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                  {check.externalLabel || 'Obrir enllaç'}
                </a>
              )}
            </div>
          )}

          {/* Info de completat */}
          {check.isCompleted && check.completedAt && (
            <div className="mt-2 text-xs text-green-700">
              Completat per {check.completedBy?.name} el {' '}
              {new Date(check.completedAt).toLocaleDateString('ca-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}

          {/* Mostrar dades d'activitat si completat */}
          {check.isCompleted && check.activityData && (
            <div className="mt-2 p-2 bg-green-100 rounded text-xs text-green-800">
              <ActivityDataDisplay data={check.activityData} config={activityConfig} />
            </div>
          )}
        </div>

        {/* Botó expandir */}
        {!check.isCompleted && canComplete && (
          <button className="text-slate-400 hover:text-slate-600">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Formulari expandit */}
      {isExpanded && !check.isCompleted && activityConfig && (
        <div className="border-t p-4 bg-slate-50 space-y-4">
          <p className="text-sm font-medium text-slate-700">
            Registra l'activitat realitzada:
          </p>

          {/* Camps dinàmics segons tipus */}
          {activityConfig.requiredFields.map(field => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                {activityConfig.labels[field]} *
              </label>
              {field.includes('Note') || field.includes('Data') ? (
                <textarea
                  value={formData[field] || ''}
                  onChange={(e) => onInputChange(field, e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={activityConfig.labels[field]}
                />
              ) : field.includes('Date') ? (
                <input
                  type="date"
                  value={formData[field] || ''}
                  onChange={(e) => onInputChange(field, e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              ) : field.includes('Time') ? (
                <input
                  type="time"
                  value={formData[field] || ''}
                  onChange={(e) => onInputChange(field, e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <input
                  type="text"
                  value={formData[field] || ''}
                  onChange={(e) => onInputChange(field, e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder={activityConfig.labels[field]}
                />
              )}
            </div>
          ))}

          <button
            onClick={onComplete}
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              'Guardant...'
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Completar tasca
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// MOSTRAR DADES D'ACTIVITAT
// ============================================

function ActivityDataDisplay({
  data,
  config
}: {
  data: Record<string, any>
  config?: any
}) {
  // Filtrar camps interns
  const displayData = Object.entries(data).filter(
    ([key]) => !key.startsWith('_')
  )

  return (
    <div className="space-y-1">
      {displayData.map(([key, value]) => (
        <div key={key}>
          <span className="font-medium">{config?.labels?.[key] || key}:</span>{' '}
          <span>{value}</span>
        </div>
      ))}
    </div>
  )
}