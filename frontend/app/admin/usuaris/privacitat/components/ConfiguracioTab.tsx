'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TYPOGRAPHY, BUTTONS, COLORS } from '@/lib/design-system'
import { Settings, Save, Info, RotateCcw } from 'lucide-react'

interface PrivacyConfig {
  id: string
  defaultShowRealName: boolean
  defaultShowPosition: boolean
  defaultShowDepartment: boolean
  defaultShowBio: boolean
  defaultShowLocation: boolean
  defaultShowPhone: boolean
  defaultShowEmail: boolean
  defaultShowSocialLinks: boolean
  defaultShowJoinedDate: boolean
  defaultShowLastActive: boolean
  defaultShowConnections: boolean
  defaultShowGroups: boolean
  allowUsersToChangePrivacy: boolean
}

export function ConfiguracioTab() {
  const [config, setConfig] = useState<PrivacyConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/admin/privacy/config')
      if (!res.ok) throw new Error('Error carregant configuració')
      const data = await res.json()
      setConfig(data)
    } catch {
      setError("No s'ha pogut carregar la configuració")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      const res = await fetch('/api/admin/privacy/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (!res.ok) throw new Error('Error guardant configuració')

      setSuccess('Configuració guardada correctament')
    } catch {
      setError('Hi ha hagut un error guardant la configuració')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = (field: keyof PrivacyConfig) => {
    if (!config) return
    setConfig(prev => prev ? { ...prev, [field]: !prev[field] } : null)
    setSuccess(null)
  }

  const handleReset = () => {
    if (!confirm('Estàs segur que vols restablir els valors per defecte?')) return

    setConfig(prev => prev ? {
      ...prev,
      defaultShowRealName: true,
      defaultShowPosition: true,
      defaultShowDepartment: true,
      defaultShowBio: true,
      defaultShowLocation: true,
      defaultShowPhone: false,
      defaultShowEmail: false,
      defaultShowSocialLinks: true,
      defaultShowJoinedDate: true,
      defaultShowLastActive: true,
      defaultShowConnections: true,
      defaultShowGroups: true,
      allowUsersToChangePrivacy: true,
    } : null)
    setSuccess(null)
  }

  const defaultFields = [
    { key: 'defaultShowRealName', label: 'Nom real', description: 'Mostrar el nom complet per defecte' },
    { key: 'defaultShowPosition', label: 'Càrrec / Posició', description: 'Mostrar el càrrec laboral per defecte' },
    { key: 'defaultShowDepartment', label: 'Departament', description: 'Mostrar el departament per defecte' },
    { key: 'defaultShowBio', label: 'Bio / Descripció', description: 'Mostrar la descripció per defecte' },
    { key: 'defaultShowLocation', label: 'Ubicació', description: 'Mostrar la ubicació per defecte' },
    { key: 'defaultShowPhone', label: 'Telèfon', description: 'Mostrar el telèfon per defecte' },
    { key: 'defaultShowEmail', label: 'Email', description: 'Mostrar el correu per defecte' },
    { key: 'defaultShowSocialLinks', label: 'Xarxes socials', description: 'Mostrar xarxes socials per defecte' },
    { key: 'defaultShowJoinedDate', label: 'Data de registre', description: 'Mostrar quan es va registrar' },
    { key: 'defaultShowLastActive', label: 'Última activitat', description: 'Mostrar última connexió' },
    { key: 'defaultShowConnections', label: 'Connexions', description: 'Mostrar nombre de connexions' },
    { key: 'defaultShowGroups', label: 'Grups', description: 'Mostrar grups públics' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!config) {
    return (
      <Card className={`${COLORS.error.border} ${COLORS.error.bg}`}>
        <CardContent className={`p-4 text-center ${COLORS.error.text}`}>
          {error || "No s'ha pogut carregar la configuració"}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Info */}
      <Card className={`${COLORS.info.border} ${COLORS.info.bg}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className={`w-5 h-5 ${COLORS.info.icon} mt-0.5`} />
            <div className={COLORS.info.text}>
              <p className="font-medium">Configuració global de privacitat</p>
              <p className={`${TYPOGRAPHY.body} mt-1`}>
                Aquests valors s&apos;aplicaran per defecte als nous usuaris.
                Els usuaris existents mantindran la seva configuració actual.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opció principal */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={TYPOGRAPHY.sectionTitle}>
                Permetre als usuaris canviar la seva privacitat
              </h3>
              <p className={`${TYPOGRAPHY.body} mt-1`}>
                Si es desactiva, només els administradors podran modificar la configuració de privacitat
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('allowUsersToChangePrivacy')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                config.allowUsersToChangePrivacy ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  config.allowUsersToChangePrivacy ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Valors per defecte */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className={`${TYPOGRAPHY.sectionTitle} flex items-center gap-2`}>
            <Settings className="w-5 h-5 text-gray-500" />
            Valors per defecte per nous usuaris
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {defaultFields.map((field) => (
              <div
                key={field.key}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <span className={TYPOGRAPHY.label}>{field.label}</span>
                  <p className={TYPOGRAPHY.small}>{field.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(field.key as keyof PrivacyConfig)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    config[field.key as keyof PrivacyConfig] ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      config[field.key as keyof PrivacyConfig] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Missatges */}
      {error && (
        <Card className={`${COLORS.error.border} ${COLORS.error.bg}`}>
          <CardContent className={`p-4 ${COLORS.error.text}`}>
            {error}
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className={`${COLORS.success.border} ${COLORS.success.bg}`}>
          <CardContent className={`p-4 ${COLORS.success.text}`}>
            {success}
          </CardContent>
        </Card>
      )}

      {/* Botons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleReset}
          className={`${BUTTONS.ghost} inline-flex items-center gap-2`}
        >
          <RotateCcw className="w-4 h-4" />
          Restablir per defecte
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`${BUTTONS.primary} inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Guardant...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar Configuració
            </>
          )}
        </button>
      </div>
    </div>
  )
}
