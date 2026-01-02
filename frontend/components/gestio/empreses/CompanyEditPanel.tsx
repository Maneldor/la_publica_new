// components/gestio/empreses/CompanyEditPanel.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Building2, FileText, Phone, Mail, Globe, MapPin,
  User, Image as ImageIcon, Palette, Save, Loader2,
  ChevronDown, ChevronUp, Check, AlertCircle, X,
  Upload, Plus, Trash2, Briefcase, Clock, MessageSquare,
  Linkedin, Facebook, Twitter, Instagram, Eye
} from 'lucide-react'
import { toast } from 'sonner'
import { SidePanel } from '@/components/ui/SidePanel'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { CompanyPreviewModal } from './CompanyPreviewModal'
import {
  getCompanyProfile,
  updateCompanyProfile,
  sendToCrmVerification,
  type CompanyProfileData,
  type UpdateCompanyProfileInput
} from '@/lib/gestio-empreses/actions/company-profile-actions'
import { approveAndPublishCompany } from '@/lib/gestio-empreses/verification-actions'
import { getMissingRequiredFields } from '@/lib/gestio-empreses/company-profile-utils'

// Constants
const SECTORS = [
  { value: 'TECHNOLOGY', label: 'Tecnologia' },
  { value: 'SERVICES', label: 'Serveis' },
  { value: 'RETAIL', label: 'Comerç' },
  { value: 'MANUFACTURING', label: 'Indústria' },
  { value: 'CONSTRUCTION', label: 'Construcció' },
  { value: 'HOSPITALITY', label: 'Hostaleria' },
  { value: 'HEALTH', label: 'Salut' },
  { value: 'EDUCATION', label: 'Educació' },
  { value: 'FINANCE', label: 'Finances' },
  { value: 'CONSULTING', label: 'Consultoria' },
  { value: 'OTHER', label: 'Altres' }
]

const COMPANY_SIZES = [
  { value: 'micro', label: 'Micro (1-9)' },
  { value: 'small', label: 'Petita (10-49)' },
  { value: 'medium', label: 'Mitjana (50-249)' },
  { value: 'large', label: 'Gran (250+)' }
]

const COLLABORATION_TYPES = [
  { value: 'one-time', label: 'Projecte puntual' },
  { value: 'recurring', label: 'Col·laboració recurrent' },
  { value: 'framework', label: 'Acord marc' },
  { value: 'partnership', label: 'Partenariat' }
]

const BUDGET_RANGES = [
  { value: 'micro', label: '< 5.000€' },
  { value: 'small', label: '5.000€ - 20.000€' },
  { value: 'medium', label: '20.000€ - 100.000€' },
  { value: 'large', label: '100.000€ - 500.000€' },
  { value: 'enterprise', label: '> 500.000€' }
]

const SUGGESTED_SERVICES = [
  'Consultoria', 'Formació', 'Desenvolupament', 'Manteniment',
  'Disseny', 'Màrqueting', 'Assessoria', 'Auditoria',
  'Integració', 'Suport tècnic', 'Hosting', 'Seguretat'
]

interface CompanyEditPanelProps {
  companyId: string | null
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

export function CompanyEditPanel({ companyId, isOpen, onClose, onSaved }: CompanyEditPanelProps) {
  const [company, setCompany] = useState<CompanyProfileData | null>(null)
  const [formData, setFormData] = useState<UpdateCompanyProfileInput>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    basics: true,
    required: true,
    adminContact: true,
    publicContact: false,
    extended: false,
    branding: false,
    social: false
  })

  // Carregar dades de l'empresa
  useEffect(() => {
    if (companyId && isOpen) {
      loadCompany()
    }
  }, [companyId, isOpen])

  const loadCompany = async () => {
    if (!companyId) return
    setIsLoading(true)
    try {
      const result = await getCompanyProfile(companyId)
      if (result.success && result.data) {
        setCompany(result.data)
        // Inicialitzar formData amb dades existents
        setFormData({
          slogan: result.data.slogan || '',
          logo: result.data.logo || '',
          coverImage: result.data.coverImage || '',
          adminContactPerson: result.data.adminContactPerson || '',
          adminPhone: result.data.adminPhone || '',
          adminEmail: result.data.adminEmail || '',
          description: result.data.description || '',
          contactEmail: result.data.contactEmail || '',
          contactPhone: result.data.contactPhone || '',
          contactPerson: result.data.contactPerson || '',
          whatsappNumber: result.data.whatsappNumber || '',
          workingHours: result.data.workingHours || '',
          size: result.data.size || '',
          foundingYear: result.data.foundingYear || undefined,
          services: result.data.services || [],
          specializations: result.data.specializations || [],
          collaborationType: result.data.collaborationType || '',
          averageBudget: result.data.averageBudget || '',
          gallery: result.data.gallery || [],
          brandColors: result.data.brandColors || { primary: '', secondary: '' },
          socialMedia: result.data.socialMedia || {},
          certifications: result.data.certifications || []
        })
      } else {
        toast.error(result.error || 'Error carregant empresa')
        onClose()
      }
    } catch (error) {
      toast.error('Error carregant empresa')
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = useCallback((field: keyof UpdateCompanyProfileInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Desar canvis
  const handleSave = async () => {
    if (!companyId) return
    setIsSaving(true)
    try {
      const result = await updateCompanyProfile(companyId, formData)
      if (result.success) {
        toast.success('Canvis guardats correctament')
        if (result.completeness !== undefined && company) {
          setCompany({ ...company, profileCompleteness: result.completeness })
        }
        onSaved()
      } else {
        toast.error(result.error || 'Error guardant')
      }
    } catch (error) {
      toast.error('Error guardant canvis')
    } finally {
      setIsSaving(false)
    }
  }

  // Enviar a CRM per verificació
  const handleSendToCrm = async () => {
    if (!companyId || !company) return

    // Verificar camps obligatoris localment primer
    const missingFields = getMissingRequiredFields({
      ...company,
      ...formData
    } as any)

    if (missingFields.length > 0) {
      toast.error(`Falten camps obligatoris: ${missingFields.join(', ')}`)
      return
    }

    if (!confirm('Enviar a CRM per verificació? El CRM revisarà i publicarà l\'empresa.')) {
      return
    }

    setIsSending(true)
    try {
      // Primer guardem els canvis
      await updateCompanyProfile(companyId, formData)

      // Després enviem a CRM
      const result = await sendToCrmVerification(companyId)
      if (result.success) {
        toast.success('Empresa enviada a CRM per verificació!')
        onSaved()
        onClose()
      } else {
        toast.error(result.error || 'Error enviant a CRM')
      }
    } catch (error) {
      toast.error('Error enviant a CRM')
    } finally {
      setIsSending(false)
    }
  }

  // Publicar directament (per CRM)
  const handlePublish = async () => {
    if (!companyId || !company) return

    // Verificar camps obligatoris
    const missingFields = getMissingRequiredFields({
      ...company,
      ...formData
    } as any)

    if (missingFields.length > 0) {
      toast.error(`Falten camps obligatoris: ${missingFields.join(', ')}`)
      return
    }

    setIsPublishing(true)
    try {
      // Primer guardem els canvis
      await updateCompanyProfile(companyId, formData)

      // Després publiquem (userId s'obté de la sessió al servidor)
      const result = await approveAndPublishCompany(companyId)
      if (result) {
        toast.success('Empresa publicada correctament!')
        setShowPreview(false)
        onSaved()
        onClose()
      }
    } catch (error) {
      toast.error('Error publicant empresa')
    } finally {
      setIsPublishing(false)
    }
  }

  // Gestió de tags (services, specializations)
  const addTag = (field: 'services' | 'specializations', tag: string) => {
    const current = formData[field] || []
    if (!current.includes(tag)) {
      updateField(field, [...current, tag])
    }
  }

  const removeTag = (field: 'services' | 'specializations', tag: string) => {
    const current = formData[field] || []
    updateField(field, current.filter(t => t !== tag))
  }

  // Calcular completitud local
  const localCompleteness = company ? Math.min(100, Math.round(
    (formData.slogan ? 10 : 0) +
    (formData.logo ? 10 : 0) +
    (formData.coverImage ? 10 : 0) +
    (formData.adminContactPerson ? 10 : 0) +
    (formData.adminPhone ? 10 : 0) +
    (formData.adminEmail ? 10 : 0) +
    (formData.description ? 5 : 0) +
    ((formData.services?.length || 0) > 0 ? 5 : 0) +
    ((formData.gallery?.length || 0) > 0 ? 5 : 0) +
    (formData.contactEmail ? 3 : 0) +
    (formData.contactPhone ? 3 : 0) +
    (formData.whatsappNumber ? 3 : 0) +
    (formData.workingHours ? 3 : 0) +
    (formData.size ? 3 : 0)
  )) : 0

  const canSendToCrm = localCompleteness >= 60

  // Render secció col·lapsable
  const renderSection = (
    id: keyof typeof expandedSections,
    title: string,
    icon: React.ReactNode,
    badge: { text: string; color: string } | undefined,
    children: React.ReactNode
  ) => (
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-indigo-100 rounded-lg">
            {icon}
          </div>
          <span className="font-medium text-gray-900">{title}</span>
          {badge && (
            <span className={`px-2 py-0.5 text-xs rounded-full ${badge.color}`}>
              {badge.text}
            </span>
          )}
        </div>
        {expandedSections[id] ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {expandedSections[id] && (
        <div className="px-4 pb-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  )

  // Input helper
  const renderInput = (
    field: keyof UpdateCompanyProfileInput,
    label: string,
    options?: {
      type?: string
      placeholder?: string
      icon?: React.ReactNode
      required?: boolean
      readonly?: boolean
      rows?: number
    }
  ) => {
    const value = (formData as any)[field] || ''
    const isTextarea = options?.rows && options.rows > 1

    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {label}
          {options?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          {options?.icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {options.icon}
            </div>
          )}
          {isTextarea ? (
            <textarea
              value={value}
              onChange={(e) => updateField(field, e.target.value)}
              rows={options?.rows}
              disabled={options?.readonly}
              className={`w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none placeholder:text-gray-400 ${
                options?.readonly ? 'bg-gray-50 text-gray-500' : 'bg-white'
              }`}
              placeholder={options?.placeholder}
            />
          ) : (
            <input
              type={options?.type || 'text'}
              value={value}
              onChange={(e) => updateField(field, options?.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
              disabled={options?.readonly}
              className={`w-full h-10 ${options?.icon ? 'pl-10' : 'px-3'} pr-3 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder:text-gray-400 ${
                options?.readonly ? 'bg-gray-50 text-gray-500' : 'bg-white'
              }`}
              placeholder={options?.placeholder}
            />
          )}
        </div>
      </div>
    )
  }

  if (!company && !isLoading) return null

  // Preparar dades per al preview
  const previewData = company ? {
    id: company.id,
    name: company.name,
    logo: formData.logo || company.logo,
    coverImage: formData.coverImage || company.coverImage,
    sector: company.sector,
    slogan: formData.slogan || company.slogan,
    description: formData.description || company.description,
    address: company.address,
    email: company.email,
    phone: company.phone,
    contactPhone: formData.contactPhone || company.contactPhone,
    contactEmail: formData.contactEmail || company.contactEmail,
    website: company.website,
    whatsappNumber: formData.whatsappNumber || company.whatsappNumber,
    workingHours: formData.workingHours || company.workingHours,
    services: formData.services || company.services,
    specializations: formData.specializations || company.specializations,
    certifications: formData.certifications || company.certifications,
    gallery: formData.gallery || company.gallery,
    socialMedia: formData.socialMedia || company.socialMedia,
    foundingYear: formData.foundingYear || company.foundingYear,
    employeeCount: company.employeeCount,
    size: formData.size || company.size,
    isVerified: false, // Per defecte no verificada fins que CRM ho faci
    currentPlan: company.currentPlan ? {
      nombre: company.currentPlan.name,
      nombreCorto: company.currentPlan.nombreCorto
    } : null
  } : null

  const footerContent = (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
      >
        Cancel·lar
      </button>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving || isSending || isPublishing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-colors"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Desar
        </button>
        <button
          onClick={() => setShowPreview(true)}
          disabled={isSaving || isSending || isPublishing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Vista Prèvia
        </button>
        <button
          onClick={handlePublish}
          disabled={!canSendToCrm || isSaving || isSending || isPublishing}
          title={!canSendToCrm ? 'Cal completar els camps obligatoris (60%)' : ''}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPublishing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Publicar
        </button>
      </div>
    </div>
  )

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={company?.name || 'Carregant...'}
      subtitle={company ? `${company.cif || 'Sense CIF'} · ${company.currentPlan?.nombreCorto || 'Sense pla'}` : ''}
      width="xl"
      footer={footerContent}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : company ? (
        <div>
          {/* Barra de completitud */}
          <div className="px-4 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Completitud del perfil</span>
              <span className={`text-sm font-bold ${localCompleteness >= 60 ? 'text-green-600' : 'text-amber-600'}`}>
                {localCompleteness}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  localCompleteness >= 60 ? 'bg-green-500' : 'bg-amber-500'
                }`}
                style={{ width: `${localCompleteness}%` }}
              />
            </div>
            {localCompleteness < 60 && (
              <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Cal completar els camps obligatoris per poder publicar (mínim 60%)
              </p>
            )}
          </div>

          {/* Dades Bàsiques (readonly) */}
          {renderSection(
            'basics',
            'Dades Bàsiques',
            <Building2 className="w-4 h-4 text-indigo-600" />,
            { text: 'Del Lead', color: 'bg-blue-100 text-blue-700' },
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nom</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">{company.name}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">CIF</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">{company.cif || '-'}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700 truncate">{company.email}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Telèfon</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  {company.phone ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-gray-300" />}
                  <span className="text-sm text-gray-700">{company.phone || '-'}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Sector</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  {company.sector ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-gray-300" />}
                  <span className="text-sm text-gray-700">
                    {SECTORS.find(s => s.value === company.sector)?.label || company.sector || '-'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Web</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  {company.website ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-gray-300" />}
                  <span className="text-sm text-gray-700 truncate">{company.website || '-'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Camps Obligatoris */}
          {renderSection(
            'required',
            'Camps Obligatoris',
            <FileText className="w-4 h-4 text-indigo-600" />,
            { text: 'Requerit', color: 'bg-red-100 text-red-700' },
            <div className="space-y-4">
              {renderInput('slogan', 'Eslògan', {
                placeholder: 'Ex: Transformació digital per al sector públic',
                required: true
              })}

              {renderInput('description', 'Descripció', {
                placeholder: 'Descriu els serveis i activitats de l\'empresa...',
                rows: 4
              })}

              {/* Logo */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Logo <span className="text-red-500">*</span>
                </label>
                <ImageUploader
                  value={formData.logo || ''}
                  onChange={(url) => updateField('logo', url)}
                  folder="empreses/logos"
                  aspectRatio="square"
                  recommendedSize="150x150px"
                  showUrlInput
                />
              </div>

              {/* Portada */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Imatge de portada <span className="text-red-500">*</span>
                </label>
                <ImageUploader
                  value={formData.coverImage || ''}
                  onChange={(url) => updateField('coverImage', url)}
                  folder="empreses/covers"
                  aspectRatio="cover"
                  recommendedSize="1200x400px"
                  showUrlInput
                />
              </div>
            </div>
          )}

          {/* Contacte Admin */}
          {renderSection(
            'adminContact',
            'Contacte Administració',
            <Phone className="w-4 h-4 text-indigo-600" />,
            { text: 'Requerit', color: 'bg-red-100 text-red-700' },
            <div className="grid grid-cols-1 gap-3">
              {renderInput('adminContactPerson', 'Persona de contacte', {
                icon: <User className="w-4 h-4" />,
                placeholder: 'Nom i cognoms',
                required: true
              })}
              <div className="grid grid-cols-2 gap-3">
                {renderInput('adminPhone', 'Telèfon', {
                  icon: <Phone className="w-4 h-4" />,
                  placeholder: '+34 600 000 000',
                  required: true
                })}
                {renderInput('adminEmail', 'Email', {
                  type: 'email',
                  icon: <Mail className="w-4 h-4" />,
                  placeholder: 'admin@empresa.cat',
                  required: true
                })}
              </div>
            </div>
          )}

          {/* Contacte Públic */}
          {renderSection(
            'publicContact',
            'Contacte Públic',
            <Globe className="w-4 h-4 text-indigo-600" />,
            { text: 'Opcional', color: 'bg-gray-100 text-gray-600' },
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {renderInput('contactEmail', 'Email públic', {
                  type: 'email',
                  icon: <Mail className="w-4 h-4" />,
                  placeholder: 'info@empresa.cat'
                })}
                {renderInput('contactPhone', 'Telèfon públic', {
                  icon: <Phone className="w-4 h-4" />,
                  placeholder: '+34 93 000 0000'
                })}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {renderInput('whatsappNumber', 'WhatsApp', {
                  icon: <MessageSquare className="w-4 h-4" />,
                  placeholder: '+34 600 000 000'
                })}
                {renderInput('workingHours', 'Horari atenció', {
                  icon: <Clock className="w-4 h-4" />,
                  placeholder: 'Dl-Dv 9:00-18:00'
                })}
              </div>
              {renderInput('contactPerson', 'Persona contacte públic', {
                icon: <User className="w-4 h-4" />,
                placeholder: 'Nom visible al directori'
              })}
            </div>
          )}

          {/* Informació Ampliada */}
          {renderSection(
            'extended',
            'Informació Ampliada',
            <Briefcase className="w-4 h-4 text-indigo-600" />,
            { text: 'Opcional', color: 'bg-gray-100 text-gray-600' },
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mida empresa</label>
                  <select
                    value={formData.size || ''}
                    onChange={(e) => updateField('size', e.target.value)}
                    className="w-full h-10 px-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Selecciona...</option>
                    {COMPANY_SIZES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                {renderInput('foundingYear', 'Any fundació', {
                  type: 'number',
                  placeholder: '2010'
                })}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipus col·laboració</label>
                  <select
                    value={formData.collaborationType || ''}
                    onChange={(e) => updateField('collaborationType', e.target.value)}
                    className="w-full h-10 px-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Selecciona...</option>
                    {COLLABORATION_TYPES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Pressupost mitjà</label>
                  <select
                    value={formData.averageBudget || ''}
                    onChange={(e) => updateField('averageBudget', e.target.value)}
                    className="w-full h-10 px-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Selecciona...</option>
                    {BUDGET_RANGES.map(b => (
                      <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Serveis */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Serveis</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(formData.services || []).map(service => (
                    <span
                      key={service}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                    >
                      {service}
                      <button onClick={() => removeTag('services', service)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_SERVICES.filter(s => !(formData.services || []).includes(s)).map(service => (
                    <button
                      key={service}
                      onClick={() => addTag('services', service)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                    >
                      + {service}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Branding */}
          {renderSection(
            'branding',
            'Branding i Galeria',
            <Palette className="w-4 h-4 text-indigo-600" />,
            { text: 'Opcional', color: 'bg-gray-100 text-gray-600' },
            <div className="space-y-4">
              {/* Colors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Color primari</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.brandColors?.primary || '#3b82f6'}
                      onChange={(e) => updateField('brandColors', { ...formData.brandColors, primary: e.target.value })}
                      className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.brandColors?.primary || ''}
                      onChange={(e) => updateField('brandColors', { ...formData.brandColors, primary: e.target.value })}
                      className="flex-1 h-10 px-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg placeholder:text-gray-400"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Color secundari</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.brandColors?.secondary || '#10b981'}
                      onChange={(e) => updateField('brandColors', { ...formData.brandColors, secondary: e.target.value })}
                      className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.brandColors?.secondary || ''}
                      onChange={(e) => updateField('brandColors', { ...formData.brandColors, secondary: e.target.value })}
                      className="flex-1 h-10 px-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg placeholder:text-gray-400"
                      placeholder="#10b981"
                    />
                  </div>
                </div>
              </div>

              {/* Galeria */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Galeria d'imatges</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {(formData.gallery || []).map((url, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button
                        onClick={() => updateField('gallery', (formData.gallery || []).filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {/* Afegir nova imatge */}
                  <ImageUploader
                    value=""
                    onChange={(url) => {
                      if (url) {
                        updateField('gallery', [...(formData.gallery || []), url])
                      }
                    }}
                    folder="empreses/gallery"
                    aspectRatio="square"
                    placeholder="+ Afegir"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Xarxes Socials */}
          {renderSection(
            'social',
            'Xarxes Socials',
            <Linkedin className="w-4 h-4 text-indigo-600" />,
            company.socialMedia ? { text: 'Del Lead', color: 'bg-blue-100 text-blue-700' } : undefined,
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.socialMedia?.linkedin || ''}
                      onChange={(e) => updateField('socialMedia', { ...formData.socialMedia, linkedin: e.target.value })}
                      className="w-full h-10 pl-10 pr-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg placeholder:text-gray-400"
                      placeholder="linkedin.com/company/..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Facebook</label>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.socialMedia?.facebook || ''}
                      onChange={(e) => updateField('socialMedia', { ...formData.socialMedia, facebook: e.target.value })}
                      className="w-full h-10 pl-10 pr-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg placeholder:text-gray-400"
                      placeholder="facebook.com/..."
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Twitter/X</label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.socialMedia?.twitter || ''}
                      onChange={(e) => updateField('socialMedia', { ...formData.socialMedia, twitter: e.target.value })}
                      className="w-full h-10 pl-10 pr-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg placeholder:text-gray-400"
                      placeholder="twitter.com/..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Instagram</label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.socialMedia?.instagram || ''}
                      onChange={(e) => updateField('socialMedia', { ...formData.socialMedia, instagram: e.target.value })}
                      className="w-full h-10 pl-10 pr-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg placeholder:text-gray-400"
                      placeholder="instagram.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Modal de Vista Prèvia */}
      {previewData && (
        <CompanyPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          company={previewData}
          onPublish={handlePublish}
          isPublishing={isPublishing}
        />
      )}
    </SidePanel>
  )
}
