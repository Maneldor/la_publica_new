'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { UserBasicInfoForm, type UserBasicInfoFormData, type AdministrationType } from '@/components/forms/UserBasicInfoForm'

interface Step1Props {
  data: {
    profile: {
      bio?: string
      headline?: string
      website?: string
      publicEmail?: string
    }
  }
  updateProfile: (updates: Record<string, unknown>) => Promise<boolean>
  isSaving: boolean
  userData?: {
    nick?: string
    firstName?: string
    lastName?: string
    secondLastName?: string
    email?: string
    administration?: 'LOCAL' | 'AUTONOMICA' | 'CENTRAL'
    displayPreference?: 'NICK' | 'NOM' | 'NOM_COGNOM'
    image?: string
    coverColor?: string
  }
}

export const Step1Basic = ({ data, updateProfile, isSaving, userData }: Step1Props) => {
  const [dragActive, setDragActive] = useState(false)
  const [dragTarget, setDragTarget] = useState<'cover' | 'profile' | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState(userData?.image || '')

  // Actualizar imagen de perfil si cambian los datos del usuario
  useEffect(() => {
    if (userData?.image) {
      setProfileImageUrl(userData.image)
    }
  }, [userData?.image])

  // Ref para el timeout de guardado automático
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Handle cambios del formulario básico - auto-guardado con debounce
  const handleFormChange = async (formData: UserBasicInfoFormData, isValid: boolean) => {
    if (!isValid) return

    // Detectar cambios respecto a los datos originales
    const changes: Record<string, any> = {}

    if (formData.firstName !== userData?.firstName) {
      changes.firstName = formData.firstName
    }
    if (formData.lastName !== userData?.lastName) {
      changes.lastName = formData.lastName
    }
    if (formData.secondLastName !== userData?.secondLastName) {
      changes.secondLastName = formData.secondLastName
    }
    if (formData.administration && formData.administration !== userData?.administration) {
      changes.administration = formData.administration
    }
    if (formData.displayPreference !== userData?.displayPreference) {
      changes.displayPreference = formData.displayPreference
    }

    // Si hay cambios, guardarlos con debounce
    if (Object.keys(changes).length > 0) {
      // Limpiar timeout anterior
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      // Guardar después de 1 segundo de inactividad
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await updateProfile(changes)
          console.log('Canvis guardats automàticament:', changes)
        } catch (error) {
          console.error('Error guardant canvis:', error)
        }
      }, 1000)
    }
  }

  // Handle drag events
  const handleDrag = (e: React.DragEvent, target: 'cover' | 'profile') => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
      setDragTarget(target)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
      setDragTarget(null)
    }
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent, target: 'cover' | 'profile') => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setDragTarget(null)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0], target)
    }
  }

  // Handle file upload
  const handleFiles = (file: File, target: 'cover' | 'profile') => {
    if (file && file.type.startsWith('image/')) {
      // Crear URL temporal para preview
      const url = URL.createObjectURL(file)
      if (target === 'cover') {
        setCoverImageUrl(url)
      } else {
        setProfileImageUrl(url)
      }
      // TODO: Implementar upload real cuando API esté lista
      console.log('Upload de imagen:', target, file.name)
    }
  }

  // Eliminar imagen
  const removeImage = (type: 'cover' | 'profile') => {
    if (type === 'cover') {
      setCoverImageUrl('')
    } else {
      setProfileImageUrl('')
    }
  }

  // Obtener iniciales para avatar placeholder
  const getInitials = () => {
    const first = userData?.firstName?.charAt(0) || ''
    const last = userData?.lastName?.charAt(0) || ''
    return `${first}${last}`.toUpperCase() || '??'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Dades Bàsiques</h2>
        <p className="text-gray-600 text-sm">
          Revisa i actualitza la teva informació bàsica
        </p>
      </div>

      {/* Formulario de datos básicos */}
      <UserBasicInfoForm
        mode="edit"
        initialData={{
          nick: userData?.nick || '',
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || '',
          secondLastName: userData?.secondLastName || '',
          email: userData?.email || '',
          administration: userData?.administration || '',
          displayPreference: userData?.displayPreference || 'NICK'
        }}
        onChange={handleFormChange}
        showButtons={false}
        showTerms={false}
      />

      {/* Sección de imágenes */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Imatges</h3>

        {/* Imagen de Portada */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imatge de Portada
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Imatge gran que apareixerà a la part superior del teu perfil (recomanat: 1200x300px)
          </p>

          <div
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center transition-all
              ${dragActive && dragTarget === 'cover'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
            onDragEnter={(e) => handleDrag(e, 'cover')}
            onDragLeave={(e) => handleDrag(e, 'cover')}
            onDragOver={(e) => handleDrag(e, 'cover')}
            onDrop={(e) => handleDrop(e, 'cover')}
          >
            {coverImageUrl ? (
              <div className="relative">
                <img
                  src={coverImageUrl}
                  alt="Vista prèvia portada"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage('cover')}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Arrossega la imatge aquí o fes clic per seleccionar
                </p>
                <p className="text-xs text-gray-400 mb-3">PNG, JPG, GIF fins a 10MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFiles(e.target.files[0], 'cover')}
                  className="hidden"
                  id="cover-upload"
                />
                <label
                  htmlFor="cover-upload"
                  className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                >
                  Seleccionar Arxiu
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Foto de Perfil */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foto de Perfil
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Imatge que apareixerà al teu avatar (recomanat: 400x400px, format quadrat)
          </p>

          <div className="flex items-center gap-4">
            {/* Avatar actual o preview */}
            <div
              className={`
                relative w-20 h-20 rounded-full overflow-hidden
                ${dragActive && dragTarget === 'profile' ? 'ring-4 ring-indigo-500' : ''}
              `}
              onDragEnter={(e) => handleDrag(e, 'profile')}
              onDragLeave={(e) => handleDrag(e, 'profile')}
              onDragOver={(e) => handleDrag(e, 'profile')}
              onDrop={(e) => handleDrop(e, 'profile')}
            >
              {profileImageUrl ? (
                <>
                  <img
                    src={profileImageUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage('profile')}
                    className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                  {getInitials()}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFiles(e.target.files[0], 'profile')}
                className="hidden"
                id="profile-upload"
              />
              <label
                htmlFor="profile-upload"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium cursor-pointer transition-colors text-center"
              >
                Canviar foto
              </label>
              {profileImageUrl && (
                <button
                  type="button"
                  onClick={() => removeImage('profile')}
                  className="px-4 py-2 text-red-600 text-sm hover:bg-red-50 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de guardado */}
      {isSaving && (
        <div className="flex items-center gap-2 text-sm text-indigo-600">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          Guardant canvis...
        </div>
      )}
    </div>
  )
}

export default Step1Basic
