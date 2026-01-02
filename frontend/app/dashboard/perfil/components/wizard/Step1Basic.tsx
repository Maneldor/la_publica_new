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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: 'var(--Step1Basic-title-color, #111827)',
          marginBottom: '4px'
        }}>
          Dades Bàsiques
        </h2>
        <p style={{
          color: 'var(--Step1Basic-description-color, #4b5563)',
          fontSize: '14px'
        }}>
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
      <div style={{
        borderTop: '1px solid var(--Step1Basic-divider-color, #e5e7eb)',
        paddingTop: '24px',
        marginTop: '24px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: 'var(--Step1Basic-title-color, #111827)',
          marginBottom: '16px'
        }}>
          Imatges
        </h3>

        {/* Imagen de Portada */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--Step1Basic-label-color, #374151)',
            marginBottom: '8px'
          }}>
            Imatge de Portada
          </label>
          <p style={{
            fontSize: '12px',
            color: 'var(--Step1Basic-hint-color, #6b7280)',
            marginBottom: '12px'
          }}>
            Imatge gran que apareixerà a la part superior del teu perfil (recomanat: 1200x300px)
          </p>

          <div
            style={{
              position: 'relative',
              border: `2px dashed ${dragActive && dragTarget === 'cover'
                ? 'var(--Step1Basic-drag-active-border, #6366f1)'
                : 'var(--Step1Basic-border-color, #d1d5db)'}`,
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              transition: 'all 0.2s',
              backgroundColor: dragActive && dragTarget === 'cover'
                ? 'var(--Step1Basic-drag-active-bg, #eef2ff)'
                : 'transparent'
            }}
            onDragEnter={(e) => handleDrag(e, 'cover')}
            onDragLeave={(e) => handleDrag(e, 'cover')}
            onDragOver={(e) => handleDrag(e, 'cover')}
            onDrop={(e) => handleDrop(e, 'cover')}
          >
            {coverImageUrl ? (
              <div style={{ position: 'relative' }}>
                <img
                  src={coverImageUrl}
                  alt="Vista prèvia portada"
                  style={{
                    width: '100%',
                    height: '160px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage('cover')}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '6px',
                    backgroundColor: 'var(--Step1Basic-danger-bg, #ef4444)',
                    color: 'var(--Step1Basic-danger-color, #ffffff)',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Upload style={{
                  width: '32px',
                  height: '32px',
                  color: 'var(--Step1Basic-icon-color, #9ca3af)',
                  marginBottom: '8px'
                }} />
                <p style={{
                  fontSize: '14px',
                  color: 'var(--Step1Basic-text-color, #4b5563)',
                  marginBottom: '4px'
                }}>
                  Arrossega la imatge aquí o fes clic per seleccionar
                </p>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--Step1Basic-hint-color, #9ca3af)',
                  marginBottom: '12px'
                }}>
                  PNG, JPG, GIF fins a 10MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFiles(e.target.files[0], 'cover')}
                  style={{ display: 'none' }}
                  id="cover-upload"
                />
                <label
                  htmlFor="cover-upload"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--Step1Basic-primary-bg, #4f46e5)',
                    color: 'var(--Step1Basic-primary-color, #ffffff)',
                    fontSize: '14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Seleccionar Arxiu
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Foto de Perfil */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--Step1Basic-label-color, #374151)',
            marginBottom: '8px'
          }}>
            Foto de Perfil
          </label>
          <p style={{
            fontSize: '12px',
            color: 'var(--Step1Basic-hint-color, #6b7280)',
            marginBottom: '12px'
          }}>
            Imatge que apareixerà al teu avatar (recomanat: 400x400px, format quadrat)
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Avatar actual o preview */}
            <div
              style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: dragActive && dragTarget === 'profile'
                  ? '0 0 0 4px var(--Step1Basic-primary-bg, #6366f1)'
                  : 'none'
              }}
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
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage('profile')}
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      padding: '4px',
                      backgroundColor: 'var(--Step1Basic-danger-bg, #ef4444)',
                      color: 'var(--Step1Basic-danger-color, #ffffff)',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X style={{ width: '12px', height: '12px' }} />
                  </button>
                </>
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'var(--Step1Basic-avatar-bg, #e0e7ff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--Step1Basic-avatar-color, #4f46e5)',
                  fontWeight: '700',
                  fontSize: '20px'
                }}>
                  {getInitials()}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFiles(e.target.files[0], 'profile')}
                style={{ display: 'none' }}
                id="profile-upload"
              />
              <label
                htmlFor="profile-upload"
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--Step1Basic-primary-bg, #4f46e5)',
                  color: 'var(--Step1Basic-primary-color, #ffffff)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'background-color 0.2s'
                }}
              >
                Canviar foto
              </label>
              {profileImageUrl && (
                <button
                  type="button"
                  onClick={() => removeImage('profile')}
                  style={{
                    padding: '8px 16px',
                    color: 'var(--Step1Basic-danger-text, #dc2626)',
                    fontSize: '14px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--Step1Basic-danger-hover-bg, #fef2f2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: 'var(--Step1Basic-saving-color, #4f46e5)'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid var(--Step1Basic-saving-color, #4f46e5)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Guardant canvis...
        </div>
      )}
    </div>
  )
}

export default Step1Basic
