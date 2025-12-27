'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Save,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Linkedin,
  Facebook,
  Twitter,
  Tag,
  Briefcase,
  Target,
  AlertCircle,
  Euro,
  Calendar,
  MessageSquare,
  Hash
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { createLead } from '@/lib/gestio-empreses/actions'

// Constants
const SECTORS = [
  'Tecnologia',
  'Serveis',
  'Comerç',
  'Indústria',
  'Construcció',
  'Hostaleria',
  'Salut',
  'Educació',
  'Finances',
  'Immobiliari',
  'Transport',
  'Agricultura',
  'Energia',
  'Altres'
]

const SOURCE_OPTIONS = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'WEB_FORM', label: 'Formulari web' },
  { value: 'REFERRAL', label: 'Referència' },
  { value: 'EMPLOYEE_SUGGESTION', label: 'Suggeriment empleat' },
  { value: 'INBOUND', label: 'Entrada' },
  { value: 'COLD_OUTREACH', label: 'Contacte fred' },
  { value: 'AI_PROSPECTING', label: 'IA Prospecting' }
]

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Baixa', color: 'bg-green-100 text-green-700' },
  { value: 'MEDIUM', label: 'Mitjana', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'HIGH', label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-700' }
]

const EMPLOYEE_RANGES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+'
]

const SUGGESTED_TAGS = [
  'Pime',
  'Gran empresa',
  'Startup',
  'Sector públic',
  'Multinacional',
  'Familiar',
  'Cooperativa',
  'Autònom'
]

interface FormData {
  // Empresa
  companyName: string
  cif: string
  sector: string
  industry: string
  website: string
  description: string
  companySize: string
  employeeCount: number | null

  // Ubicació
  address: string
  city: string
  zipCode: string
  state: string
  country: string

  // Contacte principal
  contactName: string
  contactRole: string
  email: string
  phone: string

  // Xarxes socials
  linkedinProfile: string
  facebookProfile: string
  twitterProfile: string

  // Comercial
  source: string
  priority: string
  estimatedRevenue: number | null
  score: number
  tags: string[]

  // Seguiment
  notes: string
  internalNotes: string
  nextFollowUpDate: string
}

export default function NouLeadPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [expandedSections, setExpandedSections] = useState({
    empresa: true,
    ubicacio: false,
    contacte: true,
    xarxes: false,
    comercial: true,
    seguiment: false
  })

  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    cif: '',
    sector: '',
    industry: '',
    website: '',
    description: '',
    companySize: '',
    employeeCount: null,
    address: '',
    city: '',
    zipCode: '',
    state: '',
    country: 'Espanya',
    contactName: '',
    contactRole: '',
    email: '',
    phone: '',
    linkedinProfile: '',
    facebookProfile: '',
    twitterProfile: '',
    source: 'MANUAL',
    priority: 'MEDIUM',
    estimatedRevenue: null,
    score: 50,
    tags: [],
    notes: '',
    internalNotes: '',
    nextFollowUpDate: ''
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'El nom de l\'empresa és obligatori'
    }
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'El nom del contacte és obligatori'
    }
    if (!formData.source) {
      newErrors.source = 'La font del lead és obligatòria'
    }
    if (!formData.priority) {
      newErrors.priority = 'La prioritat és obligatòria'
    }

    // Validar email si s'ha introduït
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invàlid'
    }

    // Validar CIF si s'ha introduït (format espanyol)
    if (formData.cif && !/^[A-Za-z][0-9]{7}[A-Za-z0-9]$/.test(formData.cif)) {
      newErrors.cif = 'Format de CIF invàlid (Ex: B12345678)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Revisa els camps obligatoris')
      return
    }

    setIsLoading(true)

    try {
      const result = await createLead({
        companyName: formData.companyName,
        contactName: formData.contactName,
        email: formData.email || '',
        phone: formData.phone || undefined,
        sector: formData.sector || undefined,
        source: formData.source,
        priority: formData.priority,
        notes: formData.notes || undefined,
        cif: formData.cif || undefined,
        website: formData.website || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        zipCode: formData.zipCode || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        contactRole: formData.contactRole || undefined,
        linkedinProfile: formData.linkedinProfile || undefined,
        facebookProfile: formData.facebookProfile || undefined,
        twitterProfile: formData.twitterProfile || undefined,
        industry: formData.industry || undefined,
        description: formData.description || undefined,
        companySize: formData.companySize || undefined,
        employeeCount: formData.employeeCount || undefined,
        estimatedRevenue: formData.estimatedRevenue || undefined,
        score: formData.score || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        internalNotes: formData.internalNotes || undefined,
        nextFollowUpDate: formData.nextFollowUpDate ? new Date(formData.nextFollowUpDate) : undefined
      })

      if (result.id) {
        toast.success('Lead creat correctament')
        router.push(`/gestio/leads/${result.id}`)
      } else {
        toast.error('Error creant el lead')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error inesperat')
    } finally {
      setIsLoading(false)
    }
  }

  const renderSection = (
    id: keyof typeof expandedSections,
    title: string,
    icon: React.ReactNode,
    children: React.ReactNode,
    badge?: { text: string; color: string }
  ) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-100 rounded-lg">
            {icon}
          </div>
          <span className="font-semibold text-gray-900">{title}</span>
          {badge && (
            <span className={`px-2 py-0.5 text-xs rounded-full ${badge.color}`}>
              {badge.text}
            </span>
          )}
        </div>
        {expandedSections[id] ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expandedSections[id] && (
        <div className="p-4 pt-0 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  )

  const renderInput = (
    field: keyof FormData,
    label: string,
    options?: {
      type?: string
      placeholder?: string
      required?: boolean
      icon?: React.ReactNode
      maxLength?: number
      colSpan?: number
    }
  ) => {
    const { type = 'text', placeholder, required, icon, maxLength, colSpan = 1 } = options || {}
    const hasError = !!errors[field]

    return (
      <div className={colSpan === 2 ? 'md:col-span-2' : ''}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            value={formData[field] as string || ''}
            onChange={(e) => updateField(field, e.target.value)}
            className={`w-full ${icon ? 'pl-10' : 'px-4'} pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 ${
              hasError ? 'border-red-500 bg-red-50' : 'border-gray-200'
            }`}
            placeholder={placeholder}
            maxLength={maxLength}
          />
        </div>
        {hasError && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors[field]}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/gestio/leads"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nou Lead</h1>
            <p className="text-gray-500">Omple les dades del nou lead potencial</p>
          </div>
        </div>
      </div>

      {/* Indicador de camps obligatoris */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Camps obligatoris</p>
            <p className="text-sm text-amber-700">
              Nom empresa, Nom contacte, Font i Prioritat són obligatoris. La resta de camps ajuden a qualificar millor el lead.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* SECCIÓ 1: Informació de l'Empresa */}
        {renderSection(
          'empresa',
          'Informació de l\'Empresa',
          <Building2 className="w-5 h-5 text-cyan-600" />,
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {renderInput('companyName', 'Nom de l\'empresa', {
              required: true,
              placeholder: 'Ex: TechSolutions BCN',
              icon: <Building2 className="w-4 h-4" />
            })}
            {renderInput('cif', 'CIF', {
              placeholder: 'B12345678',
              maxLength: 9,
              icon: <Hash className="w-4 h-4" />
            })}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
              <select
                value={formData.sector}
                onChange={(e) => updateField('sector', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">Selecciona sector...</option>
                {SECTORS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'empleats</label>
              <select
                value={formData.companySize}
                onChange={(e) => updateField('companySize', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">Selecciona...</option>
                {EMPLOYEE_RANGES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {renderInput('website', 'Pàgina web', {
              type: 'url',
              placeholder: 'https://www.empresa.com',
              icon: <Globe className="w-4 h-4" />
            })}

            {renderInput('industry', 'Indústria específica', {
              placeholder: 'Ex: SaaS, E-commerce...'
            })}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripció</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
                placeholder="Breu descripció de l'empresa i la seva activitat..."
              />
            </div>
          </div>,
          { text: 'Obligatori', color: 'bg-amber-100 text-amber-700' }
        )}

        {/* SECCIÓ 2: Ubicació */}
        {renderSection(
          'ubicacio',
          'Ubicació',
          <MapPin className="w-5 h-5 text-cyan-600" />,
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {renderInput('address', 'Adreça', {
              placeholder: 'Carrer, número...',
              icon: <MapPin className="w-4 h-4" />,
              colSpan: 2
            })}
            {renderInput('city', 'Ciutat', {
              placeholder: 'Barcelona'
            })}
            {renderInput('zipCode', 'Codi Postal', {
              placeholder: '08001',
              maxLength: 5
            })}
            {renderInput('state', 'Província', {
              placeholder: 'Barcelona'
            })}
            {renderInput('country', 'País', {
              placeholder: 'Espanya'
            })}
          </div>
        )}

        {/* SECCIÓ 3: Contacte Principal */}
        {renderSection(
          'contacte',
          'Contacte Principal',
          <User className="w-5 h-5 text-cyan-600" />,
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {renderInput('contactName', 'Nom i cognoms', {
              required: true,
              placeholder: 'Joan García López',
              icon: <User className="w-4 h-4" />
            })}
            {renderInput('contactRole', 'Càrrec', {
              placeholder: 'Director Comercial',
              icon: <Briefcase className="w-4 h-4" />
            })}
            {renderInput('email', 'Email', {
              type: 'email',
              placeholder: 'contacte@empresa.com',
              icon: <Mail className="w-4 h-4" />
            })}
            {renderInput('phone', 'Telèfon', {
              type: 'tel',
              placeholder: '+34 612 345 678',
              icon: <Phone className="w-4 h-4" />
            })}
          </div>,
          { text: 'Obligatori', color: 'bg-amber-100 text-amber-700' }
        )}

        {/* SECCIÓ 4: Xarxes Socials */}
        {renderSection(
          'xarxes',
          'Xarxes Socials',
          <Linkedin className="w-5 h-5 text-cyan-600" />,
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {renderInput('linkedinProfile', 'LinkedIn', {
              type: 'url',
              placeholder: 'https://linkedin.com/company/...',
              icon: <Linkedin className="w-4 h-4" />
            })}
            {renderInput('facebookProfile', 'Facebook', {
              type: 'url',
              placeholder: 'https://facebook.com/...',
              icon: <Facebook className="w-4 h-4" />
            })}
            {renderInput('twitterProfile', 'Twitter/X', {
              type: 'url',
              placeholder: 'https://twitter.com/...',
              icon: <Twitter className="w-4 h-4" />
            })}
          </div>
        )}

        {/* SECCIÓ 5: Informació Comercial */}
        {renderSection(
          'comercial',
          'Informació Comercial',
          <Target className="w-5 h-5 text-cyan-600" />,
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Font */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font del lead <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => updateField('source', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white ${
                    errors.source ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  {SOURCE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.source && <p className="mt-1 text-xs text-red-600">{errors.source}</p>}
              </div>

              {/* Prioritat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioritat <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {PRIORITY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField('priority', opt.value)}
                      className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.priority === opt.value
                          ? opt.color + ' ring-2 ring-offset-1 ring-cyan-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor estimat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor estimat (€/any)
                </label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.estimatedRevenue || ''}
                    onChange={(e) => updateField('estimatedRevenue', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    placeholder="5000"
                  />
                </div>
              </div>

              {/* Puntuació manual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Puntuació (0-100)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.score}
                    onChange={(e) => updateField('score', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                  />
                  <span className={`w-12 text-center font-semibold rounded-lg py-1 ${
                    formData.score >= 70 ? 'bg-green-100 text-green-700' :
                    formData.score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {formData.score}
                  </span>
                </div>
              </div>
            </div>

            {/* Etiquetes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiquetes
              </label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      formData.tags.includes(tag)
                        ? 'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Tag className="w-3 h-3 inline mr-1" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          { text: 'Obligatori', color: 'bg-amber-100 text-amber-700' }
        )}

        {/* SECCIÓ 6: Notes i Seguiment */}
        {renderSection(
          'seguiment',
          'Notes i Seguiment',
          <MessageSquare className="w-5 h-5 text-cyan-600" />,
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (visibles per tothom)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
                placeholder="Notes sobre el lead, converses, acords..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes internes (només CRM/Admin)
              </label>
              <textarea
                value={formData.internalNotes}
                onChange={(e) => updateField('internalNotes', e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400 bg-amber-50"
                placeholder="Notes confidencials, estratègia comercial..."
              />
            </div>

            <div className="md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data pròxim seguiment
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.nextFollowUpDate}
                  onChange={(e) => updateField('nextFollowUpDate', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botons d'acció */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <Link
          href="/gestio/leads"
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          Cancel·lar
        </Link>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creant...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Crear Lead
            </>
          )}
        </button>
      </div>
    </div>
  )
}
