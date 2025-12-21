'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Check, X, Loader2, Copy, Info } from 'lucide-react'
import { generateUserPassword, calculatePasswordStrength, validatePassword } from '@/lib/utils/generate-password'
import { generateAvatarUrl, getRandomAvatarColor } from '@/lib/utils/generate-avatar'
import {
  UserDisplayPreference,
  getDisplayPreferenceOptions,
  type UserDisplayInfo
} from '@/lib/types/user-display'

// Tipus de mode del formulari
export type FormMode = 'register' | 'admin' | 'edit' | 'readonly'

// Tipus d'administració
export type AdministrationType = 'LOCAL' | 'AUTONOMICA' | 'CENTRAL'

// Dades del formulari
export interface UserBasicInfoFormData {
  nick: string
  firstName: string
  lastName: string
  secondLastName: string
  email: string
  password: string
  confirmPassword: string
  administration: AdministrationType | ''
  displayPreference: UserDisplayPreference
  acceptTerms: boolean
  acceptPrivacy: boolean
}

// Props del component
export interface UserBasicInfoFormProps {
  mode: FormMode
  initialData?: Partial<UserBasicInfoFormData>
  onSubmit?: (data: UserBasicInfoFormData & { avatarUrl?: string; avatarColor?: string }) => Promise<void>
  onChange?: (data: UserBasicInfoFormData, isValid: boolean) => void
  onCancel?: () => void
  submitLabel?: string
  showTerms?: boolean
  showButtons?: boolean
  className?: string
}

// Estat de validació d'un camp
interface FieldValidation {
  valid: boolean
  checking: boolean
  error: string
}

export function UserBasicInfoForm({
  mode,
  initialData,
  onSubmit,
  onChange,
  onCancel,
  submitLabel,
  showTerms = true,
  showButtons = true,
  className = ''
}: UserBasicInfoFormProps) {
  const isReadOnly = mode === 'readonly'
  const isAdminMode = mode === 'admin'
  const isRegisterMode = mode === 'register'
  const isEditMode = mode === 'edit'

  // Form data state
  const [formData, setFormData] = useState<UserBasicInfoFormData>({
    nick: initialData?.nick || '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    secondLastName: initialData?.secondLastName || '',
    email: initialData?.email || '',
    password: initialData?.password || '',
    confirmPassword: '',
    administration: initialData?.administration || '',
    displayPreference: initialData?.displayPreference || 'NICK',
    acceptTerms: false,
    acceptPrivacy: false
  })

  // UI state
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [copiedPassword, setCopiedPassword] = useState(false)
  const [generalError, setGeneralError] = useState('')

  // Validation state
  const [validations, setValidations] = useState<Record<string, FieldValidation>>({
    nick: { valid: false, checking: false, error: '' },
    email: { valid: false, checking: false, error: '' },
    firstName: { valid: false, checking: false, error: '' },
    lastName: { valid: false, checking: false, error: '' },
    password: { valid: false, checking: false, error: '' },
    confirmPassword: { valid: false, checking: false, error: '' }
  })

  // Debounce timers
  const [nickTimer, setNickTimer] = useState<NodeJS.Timeout | null>(null)
  const [emailTimer, setEmailTimer] = useState<NodeJS.Timeout | null>(null)

  // Auto-generated password per mode admin
  const generatedPassword = isAdminMode && formData.nick && formData.firstName
    ? generateUserPassword(formData.nick, formData.firstName)
    : ''

  // Validació de nick
  const validateNick = useCallback((nick: string): string => {
    const nickRegex = /^[a-zA-Z0-9_-]{3,20}$/
    if (!nick) return 'El nick és obligatori'
    if (!nickRegex.test(nick)) {
      return 'Només lletres, números, guions i guió baix (3-20 caràcters)'
    }
    return ''
  }, [])

  // Validació d'email
  const validateEmail = useCallback((email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return "L'email és obligatori"
    if (!emailRegex.test(email)) return 'Format email no vàlid'
    return ''
  }, [])

  // Check nick únic amb debounce
  // En modo edit, el nick no se puede cambiar, así que no validamos unicidad
  useEffect(() => {
    const nick = formData.nick
    const localError = validateNick(nick)

    if (localError) {
      setValidations(prev => ({
        ...prev,
        nick: { valid: false, checking: false, error: localError }
      }))
      return
    }

    // En modo edit, el nick es el mismo del usuario, no necesita validación de unicidad
    if (isEditMode) {
      setValidations(prev => ({
        ...prev,
        nick: { valid: true, checking: false, error: '' }
      }))
      return
    }

    if (nickTimer) clearTimeout(nickTimer)

    const newTimer = setTimeout(async () => {
      setValidations(prev => ({
        ...prev,
        nick: { ...prev.nick, checking: true }
      }))

      try {
        const response = await fetch(`/api/auth/check-nick/${nick}`)
        const data = await response.json()
        setValidations(prev => ({
          ...prev,
          nick: {
            valid: data.available,
            checking: false,
            error: data.available ? '' : 'Aquest nick ja està en ús'
          }
        }))
      } catch {
        setValidations(prev => ({
          ...prev,
          nick: { valid: true, checking: false, error: '' }
        }))
      }
    }, 500)

    setNickTimer(newTimer)

    return () => {
      if (nickTimer) clearTimeout(nickTimer)
    }
  }, [formData.nick, validateNick, isEditMode])

  // Check email únic amb debounce
  // En modo edit, el email no se puede cambiar, así que no validamos unicidad
  useEffect(() => {
    const email = formData.email
    const localError = validateEmail(email)

    if (localError) {
      setValidations(prev => ({
        ...prev,
        email: { valid: false, checking: false, error: localError }
      }))
      return
    }

    // En modo edit, el email es el mismo del usuario, no necesita validación de unicidad
    if (isEditMode) {
      setValidations(prev => ({
        ...prev,
        email: { valid: true, checking: false, error: '' }
      }))
      return
    }

    if (emailTimer) clearTimeout(emailTimer)

    const newTimer = setTimeout(async () => {
      setValidations(prev => ({
        ...prev,
        email: { ...prev.email, checking: true }
      }))

      try {
        const response = await fetch(`/api/auth/check-email/${encodeURIComponent(email)}`)
        const data = await response.json()
        setValidations(prev => ({
          ...prev,
          email: {
            valid: data.available,
            checking: false,
            error: data.available ? '' : 'Aquest email ja està registrat'
          }
        }))
      } catch {
        setValidations(prev => ({
          ...prev,
          email: { valid: true, checking: false, error: '' }
        }))
      }
    }, 500)

    setEmailTimer(newTimer)

    return () => {
      if (emailTimer) clearTimeout(emailTimer)
    }
  }, [formData.email, validateEmail, isEditMode])

  // Actualitzar força de contrasenya
  useEffect(() => {
    if (isRegisterMode) {
      setPasswordStrength(calculatePasswordStrength(formData.password))

      const { valid, errors } = validatePassword(formData.password)
      setValidations(prev => ({
        ...prev,
        password: {
          valid: valid,
          checking: false,
          error: errors[0] || ''
        }
      }))
    }
  }, [formData.password, isRegisterMode])

  // Validar confirmació de contrasenya
  useEffect(() => {
    if (isRegisterMode && formData.confirmPassword) {
      const match = formData.password === formData.confirmPassword
      setValidations(prev => ({
        ...prev,
        confirmPassword: {
          valid: match,
          checking: false,
          error: match ? '' : 'Les contrasenyes no coincideixen'
        }
      }))
    }
  }, [formData.password, formData.confirmPassword, isRegisterMode])

  // Validació de nom i cognom
  useEffect(() => {
    setValidations(prev => ({
      ...prev,
      firstName: {
        valid: formData.firstName.length >= 2,
        checking: false,
        error: formData.firstName && formData.firstName.length < 2 ? 'Mínim 2 caràcters' : ''
      },
      lastName: {
        valid: formData.lastName.length >= 2,
        checking: false,
        error: formData.lastName && formData.lastName.length < 2 ? 'Mínim 2 caràcters' : ''
      }
    }))
  }, [formData.firstName, formData.lastName])


  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    setGeneralError('')
  }

  // Copiar contrasenya generada
  const handleCopyPassword = async () => {
    if (generatedPassword) {
      await navigator.clipboard.writeText(generatedPassword)
      setCopiedPassword(true)
      setTimeout(() => setCopiedPassword(false), 2000)
    }
  }

  // Verificar si el formulari és vàlid
  const isFormValid = (): boolean => {
    const baseValid =
      validations.nick?.valid &&
      validations.email?.valid &&
      validations.firstName?.valid &&
      validations.lastName?.valid &&
      formData.administration !== ''

    if (isRegisterMode) {
      return baseValid &&
        validations.password?.valid &&
        validations.confirmPassword?.valid &&
        formData.acceptTerms &&
        formData.acceptPrivacy
    }

    if (isAdminMode) {
      return baseValid && !!generatedPassword
    }

    return baseValid
  }

  // Notificar canvis al pare
  useEffect(() => {
    if (onChange) {
      const valid = isFormValid()
      onChange(formData, valid)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, validations])

  // Submit del formulari
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid() || !onSubmit) return

    setLoading(true)
    setGeneralError('')

    try {
      const avatarColor = getRandomAvatarColor()
      const avatarUrl = generateAvatarUrl(formData.firstName, formData.lastName, avatarColor)

      const submitData = {
        ...formData,
        // En mode admin, usar contrasenya generada
        password: isAdminMode ? generatedPassword : formData.password,
        avatarUrl,
        avatarColor
      }

      await onSubmit(submitData)
    } catch (err: unknown) {
      // Manejar tanto errores de axios como errores nativos de fetch
      const error = err as { response?: { data?: { error?: string } }; message?: string }
      setGeneralError(error.response?.data?.error || error.message || 'Error en processar el formulari')
    } finally {
      setLoading(false)
    }
  }

  // Display preference options
  const displayPreferenceOptions = getDisplayPreferenceOptions({
    nick: formData.nick || 'nick',
    firstName: formData.firstName || 'Nom',
    lastName: formData.lastName || 'Cognom'
  } as UserDisplayInfo)

  // Password strength UI
  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Dèbil'
    if (passwordStrength <= 3) return 'Mitjana'
    return 'Forta'
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'text-red-500'
    if (passwordStrength <= 3) return 'text-yellow-500'
    return 'text-green-500'
  }

  // Render validation icon
  const renderValidationIcon = (field: string) => {
    const validation = validations[field]
    if (!validation) return null

    if (validation.checking) {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    }
    if (validation.valid) {
      return <Check className="h-5 w-5 text-green-500" />
    }
    if (validation.error) {
      return <X className="h-5 w-5 text-red-500" />
    }
    return null
  }

  // Get input border class
  const getInputBorderClass = (field: string): string => {
    const validation = validations[field]
    if (!validation) return 'border-gray-300'
    if (validation.error) return 'border-red-500'
    if (validation.valid) return 'border-green-500'
    return 'border-gray-300'
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {generalError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {generalError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nick */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nick d'usuari *
          </label>
          <div className="relative">
            <input
              type="text"
              name="nick"
              value={formData.nick}
              onChange={handleChange}
              disabled={isReadOnly || isEditMode}
              readOnly={isEditMode}
              className={`w-full border rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed ${isEditMode ? 'bg-gray-50 cursor-not-allowed' : ''} ${getInputBorderClass('nick')}`}
              placeholder="joanmarti"
              title={isEditMode ? "El nick no es pot modificar" : undefined}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {renderValidationIcon('nick')}
            </div>
          </div>
          {isEditMode && (
            <p className="mt-1 text-xs text-gray-500">El nick no es pot modificar</p>
          )}
          {!validations.nick?.error && formData.nick && (
            <p className="text-xs text-gray-500 mt-1">Aquest serà el teu @{formData.nick} a la comunitat</p>
          )}
          {validations.nick?.error && (
            <p className="text-xs text-red-500 mt-1">{validations.nick.error}</p>
          )}
        </div>

        {/* Nom */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            disabled={isReadOnly}
            className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed ${getInputBorderClass('firstName')}`}
            placeholder="Joan"
          />
          {validations.firstName?.error && (
            <p className="text-xs text-red-500 mt-1">{validations.firstName.error}</p>
          )}
        </div>

        {/* Primer Cognom */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Primer cognom *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            disabled={isReadOnly}
            className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed ${getInputBorderClass('lastName')}`}
            placeholder="Martí"
          />
          {validations.lastName?.error && (
            <p className="text-xs text-red-500 mt-1">{validations.lastName.error}</p>
          )}
        </div>

        {/* Segon Cognom */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Segon cognom
            <span className="text-gray-400 font-normal ml-1">(opcional)</span>
          </label>
          <input
            type="text"
            name="secondLastName"
            value={formData.secondLastName}
            onChange={handleChange}
            disabled={isReadOnly}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Garcia"
          />
        </div>

        {/* Email */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isReadOnly || isEditMode}
              readOnly={isEditMode}
              className={`w-full border rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed ${isEditMode ? 'bg-gray-50 cursor-not-allowed' : ''} ${getInputBorderClass('email')}`}
              placeholder="joan.marti@exemple.cat"
              title={isEditMode ? "L'email no es pot modificar" : undefined}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {renderValidationIcon('email')}
            </div>
          </div>
          {isEditMode && (
            <p className="mt-1 text-xs text-gray-500">L&apos;email no es pot modificar</p>
          )}
          {validations.email?.error && (
            <p className="text-xs text-red-500 mt-1">{validations.email.error}</p>
          )}
        </div>

        {/* Password - Solo en mode register */}
        {isRegisterMode && (
          <>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contrasenya *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 ${getInputBorderClass('password')}`}
                  placeholder="Contrasenya"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs">
                    <span>Força:</span>
                    <span className={getPasswordStrengthColor()}>{getPasswordStrengthText()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        passwordStrength <= 2 ? 'bg-red-500' :
                        passwordStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              {validations.password?.error && (
                <p className="text-xs text-red-500 mt-1">{validations.password.error}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Mínim 8 caràcters, 1 majúscula, 1 minúscula, 1 número
              </p>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contrasenya *</label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 ${getInputBorderClass('confirmPassword')}`}
                  placeholder="Confirmar contrasenya"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {formData.confirmPassword && renderValidationIcon('confirmPassword')}
                </div>
              </div>
              {validations.confirmPassword?.error && (
                <p className="text-xs text-red-500 mt-1">{validations.confirmPassword.error}</p>
              )}
            </div>
          </>
        )}

        {/* Password auto-generated - Solo en mode admin */}
        {isAdminMode && generatedPassword && (
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Contrasenya generada automàticament
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 font-mono text-sm">
                {generatedPassword}
              </div>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors"
                title="Copiar contrasenya"
              >
                {copiedPassword ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Patró: 3 primeres lletres del nick + data (ddmmaaaa) + última lletra del nom
            </p>
          </div>
        )}

        {/* Administració */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipus d'administració *</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { value: 'LOCAL' as AdministrationType, title: 'Local', subtitle: 'Ajuntaments, Diputacions', color: 'green' },
              { value: 'AUTONOMICA' as AdministrationType, title: 'Autonòmica', subtitle: 'Generalitat de Catalunya', color: 'blue' },
              { value: 'CENTRAL' as AdministrationType, title: 'Central', subtitle: "Administració General de l'Estat", color: 'violet' }
            ].map(option => {
              const isSelected = formData.administration === option.value
              const colorClasses = {
                green: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', check: 'bg-green-500' },
                blue: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', check: 'bg-blue-500' },
                violet: { bg: 'bg-violet-50', border: 'border-violet-500', text: 'text-violet-700', check: 'bg-violet-500' }
              }
              const colors = colorClasses[option.color as keyof typeof colorClasses]

              return (
                <label
                  key={option.value}
                  className={`relative flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? `${colors.border} ${colors.bg} shadow-md`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${isReadOnly ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <input
                    type="radio"
                    name="administration"
                    value={option.value}
                    checked={isSelected}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className={`font-semibold text-sm ${isSelected ? colors.text : 'text-gray-900'}`}>
                      {option.title}
                    </div>
                    <div className={`text-xs mt-1 ${isSelected ? colors.text : 'text-gray-500'}`}>
                      {option.subtitle}
                    </div>
                  </div>
                  {isSelected && (
                    <div className={`absolute -top-2 -right-2 ${colors.check} text-white rounded-full w-6 h-6 flex items-center justify-center`}>
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </label>
              )
            })}
          </div>
        </div>

        {/* Display Preference */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Com vols que et mostrem a la comunitat?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {displayPreferenceOptions.map(option => {
              const isSelected = formData.displayPreference === option.value
              return (
                <label
                  key={option.value}
                  className={`relative flex flex-col p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${isReadOnly ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <input
                    type="radio"
                    name="displayPreference"
                    value={option.value}
                    checked={isSelected}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="sr-only"
                  />
                  <div className={`font-semibold text-sm ${isSelected ? 'text-indigo-700' : 'text-gray-900'}`}>
                    {option.label}
                  </div>
                  <div className={`text-xs mt-1 ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {option.description}
                  </div>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </label>
              )
            })}
          </div>
        </div>

        {/* Terms & Privacy - Solo en mode register */}
        {isRegisterMode && showTerms && (
          <div className="col-span-1 md:col-span-2 space-y-3">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="mt-0.5 mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Accepto els{' '}
                <Link href="/termes" className="text-blue-600 hover:underline font-medium">
                  Termes i Condicions
                </Link>
              </span>
            </label>

            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                name="acceptPrivacy"
                checked={formData.acceptPrivacy}
                onChange={handleChange}
                className="mt-0.5 mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Accepto la{' '}
                <Link href="/privacitat" className="text-blue-600 hover:underline font-medium">
                  Política de Privacitat
                </Link>
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Buttons */}
      {!isReadOnly && showButtons && (
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel·lar
            </button>
          )}
          <button
            type="submit"
            disabled={!isFormValid() || loading}
            className={`flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors ${!onCancel ? 'w-full' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Processant...
              </span>
            ) : (
              submitLabel || (isRegisterMode ? 'Crear compte' : isAdminMode ? 'Crear usuari' : 'Guardar')
            )}
          </button>
        </div>
      )}
    </form>
  )
}

export default UserBasicInfoForm
