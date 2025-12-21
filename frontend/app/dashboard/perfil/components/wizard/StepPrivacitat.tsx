'use client'

import { useState, useEffect } from 'react'
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  AlertTriangle,
  User,
  Briefcase,
  Building2,
  FileText,
  MapPin,
  Phone,
  Mail,
  Users,
  Link2,
  Calendar,
  Activity,
  Loader2
} from 'lucide-react'

interface PrivacySettings {
  showRealName: boolean
  showPosition: boolean
  showDepartment: boolean
  showBio: boolean
  showLocation: boolean
  showPhone: boolean
  showEmail: boolean
  showSocialLinks: boolean
  showJoinedDate: boolean
  showLastActive: boolean
  showConnections: boolean
  showGroups: boolean
}

interface SensitiveJobCategory {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  forceHidePosition: boolean
  forceHideDepartment: boolean
  forceHideBio: boolean
  forceHideLocation: boolean
  forceHidePhone: boolean
  forceHideEmail: boolean
  forceHideGroups: boolean
}

interface PrivacyData {
  id: string
  hasSystemRestrictions: boolean
  sensitiveJobCategory: SensitiveJobCategory | null
  privacySettings: PrivacySettings | null
  canChangePrivacy: boolean
}

interface StepPrivacitatProps {
  data?: {
    profile?: {
      position?: string
      department?: string
    }
  }
  updateProfile?: (updates: Record<string, unknown>) => Promise<boolean>
  isSaving?: boolean
}

const defaultSettings: PrivacySettings = {
  showRealName: true,
  showPosition: true,
  showDepartment: true,
  showBio: true,
  showLocation: true,
  showPhone: false,
  showEmail: false,
  showSocialLinks: true,
  showJoinedDate: true,
  showLastActive: true,
  showConnections: true,
  showGroups: true
}

const privacyFields: Array<{
  key: keyof PrivacySettings
  label: string
  description: string
  icon: React.ElementType
  forceHideKey?: keyof SensitiveJobCategory
}> = [
  {
    key: 'showRealName',
    label: 'Nom Real',
    description: 'Mostra el teu nom complet en lloc del nick',
    icon: User,
    forceHideKey: undefined
  },
  {
    key: 'showPosition',
    label: 'Càrrec',
    description: 'Mostra el teu càrrec professional',
    icon: Briefcase,
    forceHideKey: 'forceHidePosition'
  },
  {
    key: 'showDepartment',
    label: 'Departament',
    description: 'Mostra el departament on treballes',
    icon: Building2,
    forceHideKey: 'forceHideDepartment'
  },
  {
    key: 'showBio',
    label: 'Descripció Personal',
    description: "Mostra la teva biografia a la secció 'Sobre mi'",
    icon: FileText,
    forceHideKey: 'forceHideBio'
  },
  {
    key: 'showLocation',
    label: 'Ubicació',
    description: 'Mostra la teva ciutat i província',
    icon: MapPin,
    forceHideKey: 'forceHideLocation'
  },
  {
    key: 'showPhone',
    label: 'Telèfon',
    description: 'Mostra el teu número de telèfon',
    icon: Phone,
    forceHideKey: 'forceHidePhone'
  },
  {
    key: 'showEmail',
    label: 'Correu Electrònic',
    description: 'Mostra el teu correu electrònic de contacte',
    icon: Mail,
    forceHideKey: 'forceHideEmail'
  },
  {
    key: 'showSocialLinks',
    label: 'Xarxes Socials',
    description: 'Mostra els teus perfils de xarxes socials',
    icon: Link2,
    forceHideKey: undefined
  },
  {
    key: 'showJoinedDate',
    label: "Data d'Alta",
    description: 'Mostra quan et vas unir a la plataforma',
    icon: Calendar,
    forceHideKey: undefined
  },
  {
    key: 'showLastActive',
    label: 'Última Activitat',
    description: 'Mostra quan vas estar actiu per última vegada',
    icon: Activity,
    forceHideKey: undefined
  },
  {
    key: 'showConnections',
    label: 'Connexions',
    description: 'Mostra el nombre de connexions que tens',
    icon: Users,
    forceHideKey: undefined
  },
  {
    key: 'showGroups',
    label: 'Grups',
    description: 'Mostra els grups als quals pertanys',
    icon: Users,
    forceHideKey: 'forceHideGroups'
  }
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const StepPrivacitat = (_props: StepPrivacitatProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [privacyData, setPrivacyData] = useState<PrivacyData | null>(null)
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings)
  const [savingField, setSavingField] = useState<string | null>(null)

  // Carregar configuració de privacitat
  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/user/privacy')
        if (!response.ok) {
          throw new Error('Error carregant configuració de privacitat')
        }
        const data: PrivacyData = await response.json()
        setPrivacyData(data)
        if (data.privacySettings) {
          setSettings(data.privacySettings)
        }
      } catch (err) {
        console.error('Error fetching privacy:', err)
        setError(err instanceof Error ? err.message : 'Error desconegut')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrivacy()
  }, [])

  // Comprovar si un camp està bloquejat per categoria sensible
  const isFieldBlocked = (fieldKey: keyof PrivacySettings): boolean => {
    if (!privacyData?.sensitiveJobCategory) return false

    const field = privacyFields.find((f) => f.key === fieldKey)
    if (!field?.forceHideKey) return false

    return Boolean(
      privacyData.sensitiveJobCategory[
        field.forceHideKey as keyof SensitiveJobCategory
      ]
    )
  }

  // Actualitzar un camp de privacitat
  const handleToggle = async (fieldKey: keyof PrivacySettings) => {
    if (isFieldBlocked(fieldKey) || !privacyData?.canChangePrivacy) {
      return
    }

    const newValue = !settings[fieldKey]
    const previousSettings = { ...settings }

    // Actualització optimista
    setSettings((prev) => ({ ...prev, [fieldKey]: newValue }))
    setSavingField(fieldKey)

    try {
      const response = await fetch('/api/user/privacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [fieldKey]: newValue })
      })

      if (!response.ok) {
        throw new Error('Error guardant configuració')
      }

      const result = await response.json()

      // Si hi ha camps bloquejats, mostrar avís
      if (result.blockedFields?.length > 0) {
        console.warn('Camps bloquejats:', result.blockedFields)
      }
    } catch (err) {
      // Revertir en cas d'error
      setSettings(previousSettings)
      console.error('Error updating privacy:', err)
    } finally {
      setSavingField(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-600">
          Carregant configuració de privacitat...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 text-red-800">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <h3 className="font-medium">Error carregant configuració</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-600" />
          Configuració de Privacitat
        </h2>
        <p className="text-gray-600">
          Controla quina informació és visible per a altres usuaris de la
          plataforma
        </p>
      </div>

      {/* Avís de categoria sensible */}
      {privacyData?.sensitiveJobCategory && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800">
                Protecció Professional Activa
              </h4>
              <p className="text-sm text-amber-700 mt-1">
                El teu perfil pertany a la categoria &quot;
                {privacyData.sensitiveJobCategory.name}&quot;. Alguns camps de
                privacitat estan bloquejats per protegir la teva identitat
                professional.
              </p>
              {privacyData.sensitiveJobCategory.description && (
                <p className="text-xs text-amber-600 mt-2 italic">
                  {privacyData.sensitiveJobCategory.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Avís si no es pot canviar la privacitat */}
      {!privacyData?.canChangePrivacy && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-800">Configuració Global</h4>
              <p className="text-sm text-gray-600 mt-1">
                La configuració de privacitat està gestionada per
                l&apos;administrador de la plataforma. Contacta amb ells si
                necessites fer canvis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Llista de controls de privacitat */}
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {privacyFields.map((field) => {
          const Icon = field.icon
          const isBlocked = isFieldBlocked(field.key)
          const isEnabled = settings[field.key]
          const isSavingThis = savingField === field.key
          const canChange = privacyData?.canChangePrivacy && !isBlocked

          return (
            <div
              key={field.key}
              className={`flex items-center justify-between p-4 ${
                isBlocked ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div
                  className={`p-2 rounded-lg ${
                    isBlocked
                      ? 'bg-gray-200 text-gray-500'
                      : isEnabled
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${isBlocked ? 'text-gray-500' : 'text-gray-900'}`}
                    >
                      {field.label}
                    </span>
                    {isBlocked && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                        <Lock className="w-3 h-3" />
                        Bloquejat
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm ${isBlocked ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {field.description}
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <div className="flex items-center gap-2 ml-4">
                {isSavingThis && (
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                )}
                <button
                  type="button"
                  onClick={() => handleToggle(field.key)}
                  disabled={!canChange || isSavingThis}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                    ${
                      !canChange
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                    }
                    ${isEnabled ? 'bg-green-500' : 'bg-gray-300'}
                  `}
                  role="switch"
                  aria-checked={isEnabled}
                  aria-label={`${field.label} ${isEnabled ? 'visible' : 'ocult'}`}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                      transition duration-200 ease-in-out
                      ${isEnabled ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  >
                    {isEnabled ? (
                      <Eye className="w-3 h-3 text-green-600 m-1" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-gray-400 m-1" />
                    )}
                  </span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">
          ℹ️ Informació sobre la privacitat:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • Els canvis s&apos;apliquen immediatament i afecten com et veuen
            altres usuaris
          </li>
          <li>
            • Els administradors i moderadors poden veure informació addicional
            per raons de gestió
          </li>
          <li>
            • Si tens una categoria de treball sensible, alguns camps resten
            sempre ocults per protegir-te
          </li>
          <li>
            • Pots canviar aquesta configuració en qualsevol moment des del teu
            perfil
          </li>
        </ul>
      </div>
    </div>
  )
}

export default StepPrivacitat
