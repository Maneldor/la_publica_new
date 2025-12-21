'use client'

import { useState } from 'react'
import { Shield, Lock, Eye, EyeOff, AlertTriangle, X, Check } from 'lucide-react'

interface SensitiveCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  forceHidePosition: boolean
  forceHideDepartment: boolean
  forceHideBio: boolean
  forceHideLocation: boolean
  forceHidePhone: boolean
  forceHideEmail: boolean
  forceHideGroups: boolean
}

interface SensitiveCategoryAlertProps {
  category: SensitiveCategory
  matchedOn: 'position' | 'department'
  matchedPattern: string
  onAccept: () => void
  onDecline: () => void
  isLoading?: boolean
}

export default function SensitiveCategoryAlert({
  category,
  matchedOn,
  matchedPattern,
  onAccept,
  onDecline,
  isLoading = false,
}: SensitiveCategoryAlertProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Obtenir les restriccions actives
  const restrictions: { field: string; label: string }[] = []
  if (category.forceHidePosition) restrictions.push({ field: 'position', label: 'Càrrec/Posició' })
  if (category.forceHideDepartment) restrictions.push({ field: 'department', label: 'Departament' })
  if (category.forceHideBio) restrictions.push({ field: 'bio', label: 'Biografia' })
  if (category.forceHideLocation) restrictions.push({ field: 'location', label: 'Ubicació' })
  if (category.forceHidePhone) restrictions.push({ field: 'phone', label: 'Telèfon' })
  if (category.forceHideEmail) restrictions.push({ field: 'email', label: 'Correu electrònic' })
  if (category.forceHideGroups) restrictions.push({ field: 'groups', label: 'Grups' })

  const matchLabel = matchedOn === 'position' ? 'càrrec' : 'departament'

  return (
    <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: category.color ? `${category.color}20` : '#fef3c7' }}
        >
          <Shield
            className="h-6 w-6"
            style={{ color: category.color || '#d97706' }}
          />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            Detectat: {category.name}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            El teu {matchLabel} <span className="font-medium text-amber-700">"{matchedPattern}"</span> coincideix
            amb una categoria professional protegida.
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-4 rounded-lg bg-white/60 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-gray-800">
              Per què és important?
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {category.description ||
                'Per protegir la teva seguretat i privacitat, algunes dades del teu perfil seran ocultades automàticament a altres usuaris.'}
            </p>
          </div>
        </div>
      </div>

      {/* Restrictions List */}
      {restrictions.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800"
          >
            {showDetails ? (
              <>
                <EyeOff className="h-4 w-4" />
                Amagar detalls
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Veure què s'ocultarà ({restrictions.length} camps)
              </>
            )}
          </button>

          {showDetails && (
            <div className="mt-3 space-y-2">
              {restrictions.map((restriction) => (
                <div
                  key={restriction.field}
                  className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm"
                >
                  <Lock className="h-4 w-4 text-red-500" />
                  <span className="text-gray-700">{restriction.label}</span>
                  <span className="ml-auto text-xs text-red-600">Ocult per defecte</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onDecline}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          No, no aplica al meu cas
        </button>

        <button
          type="button"
          onClick={onAccept}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            backgroundColor: category.color || '#d97706',
          }}
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Aplicant...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Sí, aplicar protecció
            </>
          )}
        </button>
      </div>

      {/* Disclaimer */}
      <p className="mt-4 text-center text-xs text-gray-500">
        Aquesta configuració es pot modificar després des de la secció de Privacitat del teu perfil.
      </p>
    </div>
  )
}
