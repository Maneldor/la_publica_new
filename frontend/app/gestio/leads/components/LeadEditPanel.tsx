'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Building2, User, Mail, Phone, Globe, MapPin,
  Target, MessageSquare, Save, Loader2,
  ChevronDown, ChevronUp, Euro,
  Linkedin, Facebook, Twitter, XCircle,
  CheckCircle, Send, Users, Star, Trash2, Plus,
  FileCheck, Sparkles, Key
} from 'lucide-react'
import { toast } from 'sonner'
import { SidePanel } from '@/components/ui/SidePanel'

// Serveis extra disponibles
const SERVEIS_EXTRA = [
  { id: 'assessorament', nom: 'Assessorament premium', preu: 200 },
  { id: 'suport', nom: 'Suport prioritari', preu: 150 },
  { id: 'formacio', nom: 'Formació inicial', preu: 300 }
]

interface Lead {
  id: string
  companyName: string
  cif?: string
  sector?: string
  industry?: string
  website?: string
  description?: string
  companySize?: string
  employeeCount?: number
  employees?: number
  address?: string
  city?: string
  zipCode?: string
  state?: string
  country?: string
  contactName?: string
  contactRole?: string
  email?: string
  phone?: string
  linkedinProfile?: string
  facebookProfile?: string
  twitterProfile?: string
  source: string
  priority: string
  estimatedRevenue?: number
  score?: number
  tags?: string[]
  notes?: string
  internalNotes?: string
  nextFollowUpDate?: string
  status: string
  // Datos CRM
  crmVerification?: {
    empresaVerificada?: boolean
    contacteVerificat?: boolean
    cifValidat?: boolean
    contacteRealitzat?: boolean
  }
  precontract?: {
    planId?: string
    extres?: string[]
    notes?: string
    preuTotal?: number
  }
}

interface LeadEditPanelProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

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
  { value: 'LOGISTICS', label: 'Logística' },
  { value: 'MARKETING', label: 'Màrqueting' },
  { value: 'CONSULTING', label: 'Consultoria' },
  { value: 'OTHER', label: 'Altres' }
]

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Baixa', color: 'bg-green-100 text-green-700' },
  { value: 'MEDIUM', label: 'Mitjana', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'HIGH', label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-700' }
]

const SUGGESTED_TAGS = ['Pime', 'Gran empresa', 'Startup', 'Sector públic', 'Multinacional', 'Familiar']

export function LeadEditPanel({ lead, isOpen, onClose, onSaved }: LeadEditPanelProps) {
  const { data: session } = useSession()
  const [formData, setFormData] = useState<Partial<Lead>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    empresa: true,
    ubicacio: false,
    contacte: false,
    xarxes: false,
    comercial: false,
    seguiment: false,
    crm: false,
    admin: false
  })

  // Estado CRM
  const [crmData, setCrmData] = useState({
    empresaVerificada: false,
    contacteVerificat: false,
    cifValidat: false,
    contacteRealitzat: false,
    planId: '',
    extres: [] as string[],
    notesPrecontracte: ''
  })
  const [plans, setPlans] = useState<any[]>([])

  // Estado para contactos múltiples
  interface Contact {
    id: string
    firstName: string
    lastName?: string
    email?: string
    phone?: string
    position?: string
    isPrimary: boolean
  }
  const [contacts, setContacts] = useState<Contact[]>([])
  const [showAddContact, setShowAddContact] = useState(false)
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: ''
  })

  // Verificar si es CRM
  const isCRM = ['CRM_COMERCIAL', 'ADMIN', 'ADMIN_GESTIO', 'SUPER_ADMIN'].includes(session?.user?.role as string || '')

  // Verificar si es Admin Gestió
  const isAdmin = ['ADMIN_GESTIO', 'ADMIN', 'SUPER_ADMIN'].includes(session?.user?.role as string || '')

  // Estado para sección Admin
  const [adminData, setAdminData] = useState({
    dataIniciContracte: new Date().toISOString().split('T')[0],
    notesContracte: '',
    pressupostEnviat: false,
    dataEnvioPressupost: null as string | null
  })
  const [isConverting, setIsConverting] = useState(false)
  const [conversionPreview, setConversionPreview] = useState<{
    company: any
    users: any[]
  } | null>(null)

  // Calcular si puede pasar a Admin
  const totVerificat = crmData.empresaVerificada &&
                       crmData.contacteVerificat &&
                       crmData.cifValidat &&
                       crmData.planId !== ''

  // Obtener precio del plan seleccionado
  const planSeleccionat = plans.find(p => p.id === crmData.planId)
  const preuBase = planSeleccionat?.basePrice || 0
  const preuExtres = SERVEIS_EXTRA
    .filter(s => crmData.extres.includes(s.id))
    .reduce((sum, s) => sum + s.preu, 0)
  const preuTotal = preuBase + preuExtres

  // Calcular límite de contactos según plan
  const maxContacts = planSeleccionat?.maxTeamMembers || 1
  const canAddMore = contacts.length < maxContacts

  // Validaciones para conversión a empresa
  const missingFields: string[] = []
  if (!formData.companyName) missingFields.push('nom empresa')
  if (!formData.cif) missingFields.push('CIF')
  if (!formData.email) missingFields.push('email')
  if (contacts.length === 0) missingFields.push('contactes')
  if (!crmData.planId) missingFields.push('pla seleccionat')
  if (!crmData.empresaVerificada) missingFields.push('verificació empresa')
  if (!crmData.contacteVerificat) missingFields.push('verificació contacte')
  if (!crmData.cifValidat) missingFields.push('verificació CIF')

  const leadReadyToConvert = missingFields.length === 0

  // Si hay extras, requiere presupuesto aprobado
  const hasExtras = crmData.extres && crmData.extres.length > 0
  const needsBudgetApproval = hasExtras && !adminData.pressupostEnviat

  useEffect(() => {
    if (lead) {
      setFormData({
        ...lead,
        employeeCount: lead.employeeCount || lead.employees
      })

      // Cargar datos de verificación CRM si existen
      if (lead.crmVerification) {
        const verification = typeof lead.crmVerification === 'string'
          ? JSON.parse(lead.crmVerification)
          : lead.crmVerification

        setCrmData(prev => ({
          ...prev,
          empresaVerificada: verification.empresaVerificada || false,
          contacteVerificat: verification.contacteVerificat || false,
          cifValidat: verification.cifValidat || false,
          contacteRealitzat: verification.contacteRealitzat || false
        }))
      }

      // Cargar precontracte si existe
      if (lead.precontract) {
        const precontract = typeof lead.precontract === 'string'
          ? JSON.parse(lead.precontract)
          : lead.precontract

        setCrmData(prev => ({
          ...prev,
          planId: precontract.planId || '',
          extres: precontract.extres || [],
          notesPrecontracte: precontract.notes || ''
        }))
      }
    }
  }, [lead])

  // Cargar contactos del lead
  useEffect(() => {
    if (lead?.id && isOpen) {
      fetchContacts()
    }
  }, [lead?.id, isOpen])

  const fetchContacts = async () => {
    if (!lead?.id) return
    try {
      const res = await fetch(`/api/gestio/leads/${lead.id}/contacts`)
      if (res.ok) {
        const data = await res.json()
        const loadedContacts = data.contacts || []

        // Si no hay contactos pero el lead tiene datos de contacto, crear uno automáticamente
        if (loadedContacts.length === 0 && lead.contactName && lead.email) {
          const nameParts = lead.contactName.split(' ')
          const firstName = nameParts[0] || ''
          const lastName = nameParts.slice(1).join(' ') || ''

          const createRes = await fetch(`/api/gestio/leads/${lead.id}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName,
              lastName,
              email: lead.email,
              phone: lead.phone || '',
              position: lead.contactRole || '',
              isPrimary: true
            })
          })

          if (createRes.ok) {
            const newContact = await createRes.json()
            setContacts([newContact.contact])
            return
          }
        }

        setContacts(loadedContacts)
      }
    } catch (error) {
      console.error('Error carregant contactes:', error)
    }
  }

  // Cargar planes si es CRM
  useEffect(() => {
    if (isCRM && isOpen) {
      const fetchPlans = async () => {
        try {
          const res = await fetch('/api/plans')
          if (res.ok) {
            const data = await res.json()
            setPlans(data.data || data || [])
          }
        } catch (error) {
          console.error('Error carregant plans:', error)
        }
      }
      fetchPlans()
    }
  }, [isCRM, isOpen])

  // Toggle extra
  const toggleExtra = (extraId: string) => {
    setCrmData(prev => ({
      ...prev,
      extres: prev.extres.includes(extraId)
        ? prev.extres.filter(e => e !== extraId)
        : [...prev.extres, extraId]
    }))
  }

  // Añadir contacto
  const handleAddContact = async () => {
    if (!lead?.id || !newContact.firstName || !newContact.email) {
      toast.error('Nom i email són obligatoris')
      return
    }

    try {
      const res = await fetch(`/api/gestio/leads/${lead.id}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newContact,
          isPrimary: contacts.length === 0
        })
      })

      if (res.ok) {
        toast.success('Contacte afegit')
        fetchContacts()
        setShowAddContact(false)
        setNewContact({ firstName: '', lastName: '', email: '', phone: '', position: '' })
      } else {
        throw new Error('Error')
      }
    } catch (error) {
      toast.error('Error afegint contacte')
    }
  }

  // Eliminar contacto
  const handleDeleteContact = async (contactId: string) => {
    if (!lead?.id || !confirm('Eliminar aquest contacte?')) return

    try {
      const res = await fetch(`/api/gestio/leads/${lead.id}/contacts/${contactId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Contacte eliminat')
        fetchContacts()
      } else {
        throw new Error('Error')
      }
    } catch (error) {
      toast.error('Error eliminant contacte')
    }
  }

  // Marcar como principal
  const handleSetPrimary = async (contactId: string) => {
    if (!lead?.id) return

    try {
      const res = await fetch(`/api/gestio/leads/${lead.id}/contacts/${contactId}/primary`, {
        method: 'PUT'
      })

      if (res.ok) {
        toast.success('Contacte principal actualitzat')
        fetchContacts()
      } else {
        throw new Error('Error')
      }
    } catch (error) {
      toast.error('Error actualitzant contacte')
    }
  }

  // Generar password
  const generatePassword = (companyName: string) => {
    const prefix = (companyName || 'XXX').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X')
    const date = new Date()
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString().slice(-2)
    const random = Math.random().toString(36).substring(2, 4).toUpperCase()
    return `${prefix}${day}${month}${year}${random}`
  }

  // Enviar presupuesto
  const handleEnviarPressupost = async () => {
    if (!lead?.id) return

    try {
      const res = await fetch(`/api/gestio/leads/${lead.id}/enviar-pressupost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: crmData.planId,
          extres: crmData.extres,
          preuTotal,
          emailDestinari: formData.email,
          notesPrecontracte: crmData.notesPrecontracte
        })
      })

      if (res.ok) {
        setAdminData(prev => ({
          ...prev,
          pressupostEnviat: true,
          dataEnvioPressupost: new Date().toISOString()
        }))
        toast.success('Pressupost enviat correctament')
      } else {
        throw new Error('Error')
      }
    } catch (error) {
      toast.error('Error enviant pressupost')
    }
  }

  // Previsualizar conversión
  const handlePreviewConversion = () => {
    setConversionPreview({
      company: {
        name: formData.companyName,
        cif: formData.cif,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        sector: formData.sector,
        address: formData.address,
        city: formData.city,
        plan: plans.find(p => p.id === crmData.planId)?.name || 'N/A',
        preuAnual: preuTotal
      },
      users: contacts.map((contact) => ({
        name: `${contact.firstName} ${contact.lastName || ''}`.trim(),
        email: contact.email,
        role: contact.isPrimary ? 'COMPANY_ADMIN' : 'COMPANY_USER',
        position: contact.position,
        password: contact.isPrimary ? generatePassword(formData.companyName || '') : null
      }))
    })
  }

  // Convertir a empresa
  const handleConvertirAEmpresa = async () => {
    if (!lead?.id) return

    if (!leadReadyToConvert) {
      toast.error("Falten dades obligatòries per crear l'empresa")
      return
    }

    if (needsBudgetApproval) {
      toast.error("Has d'enviar el pressupost abans de convertir")
      return
    }

    if (!confirm("Estàs segur de convertir aquest lead en empresa? Es crearan els usuaris i s'enviaran les credencials.")) {
      return
    }

    setIsConverting(true)

    try {
      const res = await fetch(`/api/gestio/leads/${lead.id}/convertir-empresa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: {
            name: formData.companyName,
            cif: formData.cif,
            email: formData.email,
            phone: formData.phone,
            website: formData.website,
            description: formData.description,
            sector: formData.sector,
            employeeCount: formData.employeeCount,
            address: formData.address,
            city: formData.city,
            postalCode: formData.zipCode,
            state: formData.state,
            socialMediaLinkedIn: formData.linkedinProfile,
            socialMediaFacebook: formData.facebookProfile,
            socialMediaTwitter: formData.twitterProfile
          },
          contacts: contacts.map(c => ({
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            phone: c.phone,
            position: c.position,
            isPrimary: c.isPrimary
          })),
          contract: {
            planId: crmData.planId,
            extres: crmData.extres,
            preuTotal,
            dataInici: adminData.dataIniciContracte,
            notes: adminData.notesContracte
          },
          sendCredentials: true,
          notifyCRM: true
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Error convertint')
      }

      const result = await res.json()

      toast.success(`Empresa "${formData.companyName}" creada correctament!`)
      toast.success(`${result.usersCreated} usuaris creats. Credencials enviades.`)

      onSaved()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Error convertint el lead')
    } finally {
      setIsConverting(false)
    }
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const updateField = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!lead?.id) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/gestio/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Error guardant')

      toast.success('Lead actualitzat correctament')
      onSaved()
      onClose()
    } catch (error) {
      console.error('Error saving lead:', error)
      toast.error('Error guardant el lead')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsLost = async () => {
    if (!lead?.id) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/gestio/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'LOST',
          stage: 'PERDUT'
        })
      })

      if (!res.ok) throw new Error('Error guardant')

      toast.success('Lead marcat com a perdut')
      onSaved()
      onClose()
    } catch (error) {
      console.error('Error marking lead as lost:', error)
      toast.error('Error marcant el lead com a perdut')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePassarAAdmin = async () => {
    if (!lead?.id || !totVerificat) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/gestio/leads/${lead.id}/passar-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crmData: {
            empresaVerificada: crmData.empresaVerificada,
            contacteVerificat: crmData.contacteVerificat,
            cifValidat: crmData.cifValidat,
            contacteRealitzat: crmData.contacteRealitzat,
            planId: crmData.planId,
            extres: crmData.extres,
            notesPrecontracte: crmData.notesPrecontracte,
            preuTotal
          }
        })
      })

      if (!res.ok) throw new Error('Error passant a Admin')

      toast.success('Lead passat a Admin correctament')
      onSaved()
      onClose()
    } catch (error) {
      console.error('Error passing to admin:', error)
      toast.error('Error passant el lead a Admin')
    } finally {
      setIsLoading(false)
    }
  }

  const renderSection = (
    id: keyof typeof expandedSections,
    title: string,
    icon: React.ReactNode,
    children: React.ReactNode
  ) => (
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 bg-indigo-100 rounded">
            {icon}
          </div>
          <span className="font-medium text-sm text-gray-900">{title}</span>
        </div>
        {expandedSections[id] ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>

      {expandedSections[id] && (
        <div className="px-3 pb-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  )

  const renderInput = (field: string, label: string, options?: {
    type?: string
    placeholder?: string
    icon?: React.ReactNode
  }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-0.5">{label}</label>
      <div className="relative">
        {options?.icon && (
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
            {options.icon}
          </div>
        )}
        <input
          type={options?.type || 'text'}
          value={(formData as Record<string, unknown>)[field] as string || ''}
          onChange={(e) => updateField(field, options?.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
          className={`w-full ${options?.icon ? 'pl-8' : 'px-2.5'} pr-2.5 py-1.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder:text-gray-400`}
          placeholder={options?.placeholder}
        />
      </div>
    </div>
  )

  if (!lead) return null

  const footerContent = (
    <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50">
      <button
        onClick={handleMarkAsLost}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 text-sm rounded-lg transition-colors disabled:opacity-50"
      >
        <XCircle className="w-4 h-4" />
        Perdut
      </button>
      <div className="flex items-center gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel·lar
        </button>
        {isCRM && lead?.status !== 'PENDING_ADMIN' && lead?.status !== 'WON' && (
          <button
            onClick={handlePassarAAdmin}
            disabled={isLoading || !totVerificat}
            title={!totVerificat ? 'Cal verificar empresa, contacte, CIF i seleccionar un pla' : ''}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Passar a Admin
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Guardar
        </button>
      </div>
    </div>
  )

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={lead.companyName}
      subtitle={`${lead.contactName || 'Sense contacte'} · ${lead.status}`}
      width="half"
      footer={footerContent}
    >
      <div>
          {/* Empresa */}
          {renderSection('empresa', 'Informació Empresa', <Building2 className="w-4 h-4 text-indigo-600" />,
            <div className="grid grid-cols-2 gap-2">
              {renderInput('companyName', 'Nom empresa', { icon: <Building2 className="w-3.5 h-3.5" /> })}
              {renderInput('cif', 'CIF', { placeholder: 'B12345678' })}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Sector</label>
                <select
                  value={formData.sector || ''}
                  onChange={(e) => updateField('sector', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="" className="text-gray-400">Selecciona...</option>
                  {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              {renderInput('employeeCount', 'Empleats', { type: 'number' })}
              {renderInput('website', 'Web', { icon: <Globe className="w-3.5 h-3.5" />, placeholder: 'https://' })}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Descripció</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none placeholder:text-gray-400"
                  placeholder="Descripció de l'empresa..."
                />
              </div>
            </div>
          )}

          {/* Ubicació */}
          {renderSection('ubicacio', 'Ubicació', <MapPin className="w-4 h-4 text-indigo-600" />,
            <div className="grid grid-cols-2 gap-2">
              {renderInput('address', 'Adreça', { icon: <MapPin className="w-3.5 h-3.5" /> })}
              {renderInput('city', 'Ciutat')}
              {renderInput('zipCode', 'CP')}
              {renderInput('state', 'Província')}
            </div>
          )}

          {/* Contactes */}
          {renderSection('contacte', "Contactes de l'Empresa", <Users className="w-4 h-4 text-indigo-600" />,
            <div className="space-y-3">
              {/* Info del límit */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {contacts.length} de {maxContacts} contactes
                  {crmData.planId && (
                    <span className="ml-1 text-indigo-600">(segons pla)</span>
                  )}
                </p>
                {!crmData.planId && isCRM && (
                  <p className="text-xs text-amber-600">
                    Selecciona un pla per veure el límit
                  </p>
                )}
              </div>

              {/* Llista de contactes */}
              {contacts.length > 0 ? (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-3 rounded-lg border ${
                        contact.isPrimary
                          ? 'border-indigo-300 bg-indigo-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </span>
                            {contact.isPrimary && (
                              <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                                Admin Principal
                              </span>
                            )}
                          </div>
                          {contact.position && (
                            <p className="text-xs text-gray-500">{contact.position}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                            {contact.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {contact.email}
                              </span>
                            )}
                            {contact.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {contact.phone}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {!contact.isPrimary && (
                            <button
                              onClick={() => handleSetPrimary(contact.id)}
                              className="p-1 text-gray-400 hover:text-indigo-600"
                              title="Fer principal"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hi ha contactes. Afegeix el primer contacte (Admin).
                </p>
              )}

              {/* Formulari afegir contacte */}
              {canAddMore ? (
                showAddContact ? (
                  <div className="border border-gray-200 rounded-lg p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
                        <input
                          type="text"
                          value={newContact.firstName}
                          onChange={(e) => setNewContact(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-gray-400"
                          placeholder="Nom"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Cognoms</label>
                        <input
                          type="text"
                          value={newContact.lastName}
                          onChange={(e) => setNewContact(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-gray-400"
                          placeholder="Cognoms"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                        <input
                          type="email"
                          value={newContact.email}
                          onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-gray-400"
                          placeholder="email@empresa.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Telèfon</label>
                        <input
                          type="tel"
                          value={newContact.phone}
                          onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-gray-400"
                          placeholder="+34 600 000 000"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Càrrec</label>
                        <input
                          type="text"
                          value={newContact.position}
                          onChange={(e) => setNewContact(prev => ({ ...prev, position: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-gray-400"
                          placeholder="Director, Responsable..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setShowAddContact(false)
                          setNewContact({ firstName: '', lastName: '', email: '', phone: '', position: '' })
                        }}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        Cancel·lar
                      </button>
                      <button
                        onClick={handleAddContact}
                        className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Afegir
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddContact(true)}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Afegir contacte ({contacts.length}/{maxContacts})
                  </button>
                )
              ) : (
                <p className="text-xs text-center text-amber-600 py-2">
                  Has arribat al límit de contactes per aquest pla
                </p>
              )}
            </div>
          )}

          {/* Xarxes */}
          {renderSection('xarxes', 'Xarxes Socials', <Linkedin className="w-4 h-4 text-indigo-600" />,
            <div className="space-y-2">
              {renderInput('linkedinProfile', 'LinkedIn', { icon: <Linkedin className="w-3.5 h-3.5" /> })}
              {renderInput('facebookProfile', 'Facebook', { icon: <Facebook className="w-3.5 h-3.5" /> })}
              {renderInput('twitterProfile', 'Twitter', { icon: <Twitter className="w-3.5 h-3.5" /> })}
            </div>
          )}

          {/* Comercial */}
          {renderSection('comercial', 'Informació Comercial', <Target className="w-4 h-4 text-indigo-600" />,
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Prioritat</label>
                <div className="flex gap-1.5">
                  {PRIORITY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField('priority', opt.value)}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        formData.priority === opt.value
                          ? opt.color + ' ring-2 ring-offset-1 ring-indigo-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {renderInput('estimatedRevenue', 'Valor estimat (€)', { type: 'number', icon: <Euro className="w-3.5 h-3.5" /> })}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-0.5">Puntuació</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.score || 0}
                      onChange={(e) => updateField('score', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-sm font-semibold text-indigo-600 w-8">{formData.score || 0}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Etiquetes</label>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const currentTags = formData.tags || []
                        updateField('tags',
                          currentTags.includes(tag)
                            ? currentTags.filter(t => t !== tag)
                            : [...currentTags, tag]
                        )
                      }}
                      className={`px-2 py-1 rounded-full text-xs transition-all ${
                        (formData.tags || []).includes(tag)
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Seguiment */}
          {renderSection('seguiment', 'Notes i Seguiment', <MessageSquare className="w-4 h-4 text-indigo-600" />,
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y placeholder:text-gray-400"
                  placeholder="Notes sobre el lead..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes internes</label>
                <textarea
                  value={formData.internalNotes || ''}
                  onChange={(e) => updateField('internalNotes', e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y placeholder:text-gray-400"
                  placeholder="Notes internes (no visibles pel client)..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data pròxim seguiment</label>
                <input
                  type="date"
                  value={formData.nextFollowUpDate ? formData.nextFollowUpDate.split('T')[0] : ''}
                  onChange={(e) => updateField('nextFollowUpDate', e.target.value)}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* CRM Section - Solo visible para CRM */}
          {isCRM && renderSection('crm', 'Verificació i Precontracte', <CheckCircle className="w-4 h-4 text-indigo-600" />,
            <div className="space-y-3">
              {/* Checkboxes de verificació */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Verificació</label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={crmData.empresaVerificada}
                    onChange={(e) => setCrmData(prev => ({ ...prev, empresaVerificada: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Empresa verificada</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={crmData.contacteVerificat}
                    onChange={(e) => setCrmData(prev => ({ ...prev, contacteVerificat: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Contacte verificat</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={crmData.cifValidat}
                    onChange={(e) => setCrmData(prev => ({ ...prev, cifValidat: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">CIF validat</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={crmData.contacteRealitzat}
                    onChange={(e) => setCrmData(prev => ({ ...prev, contacteRealitzat: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Contacte realitzat</span>
                </label>
              </div>

              {/* Selecció de pla */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Pla seleccionat *</label>
                <select
                  value={crmData.planId}
                  onChange={(e) => setCrmData(prev => ({ ...prev, planId: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">Selecciona un pla...</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.basePrice}€/mes
                    </option>
                  ))}
                </select>
              </div>

              {/* Serveis extra */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Serveis extra</label>
                <div className="space-y-1.5">
                  {SERVEIS_EXTRA.map(extra => (
                    <label key={extra.id} className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={crmData.extres.includes(extra.id)}
                          onChange={() => toggleExtra(extra.id)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{extra.nom}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">+{extra.preu}€</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes precontracte */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Notes precontracte</label>
                <textarea
                  value={crmData.notesPrecontracte}
                  onChange={(e) => setCrmData(prev => ({ ...prev, notesPrecontracte: e.target.value }))}
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none placeholder:text-gray-400"
                  placeholder="Notes per al contracte..."
                />
              </div>

              {/* Total */}
              <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total mensual:</span>
                  <span className="text-lg font-bold text-indigo-600">{preuTotal}€/mes</span>
                </div>
                {preuExtres > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Base: {preuBase}€ + Extres: {preuExtres}€
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Secció Admin Gestió - Contracte i Creació */}
          {isAdmin && lead?.status === 'PENDING_ADMIN' && renderSection(
            'admin',
            'Contracte i Creació Empresa',
            <FileCheck className="w-4 h-4 text-purple-600" />,
            <div className="space-y-4">
              {/* Resum del precontracte */}
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs font-semibold text-purple-800 mb-2">Resum Precontracte</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pla:</span>
                    <span className="font-medium">{plans.find(p => p.id === crmData.planId)?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preu base:</span>
                    <span>{plans.find(p => p.id === crmData.planId)?.basePrice || 0}€/any</span>
                  </div>
                  {crmData.extres?.length > 0 && (
                    <>
                      <div className="border-t border-purple-200 my-2"></div>
                      <p className="text-xs text-purple-700">Serveis extra:</p>
                      {crmData.extres.map((extra: string) => {
                        const servei = SERVEIS_EXTRA.find(s => s.id === extra)
                        return servei && (
                          <div key={extra} className="flex justify-between text-xs">
                            <span className="text-gray-500">+ {servei.nom}</span>
                            <span>{servei.preu}€</span>
                          </div>
                        )
                      })}
                    </>
                  )}
                  <div className="border-t border-purple-200 mt-2 pt-2">
                    <div className="flex justify-between font-semibold text-purple-800">
                      <span>TOTAL:</span>
                      <span>{preuTotal}€/any</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enviar presupuesto si hay extras */}
              {hasExtras && (
                <div className={`p-3 rounded-lg ${adminData.pressupostEnviat ? 'bg-green-50' : 'bg-amber-50'}`}>
                  {adminData.pressupostEnviat ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Pressupost enviat el {adminData.dataEnvioPressupost ? new Date(adminData.dataEnvioPressupost).toLocaleDateString('ca-ES') : ''}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-amber-800">
                        Hi ha serveis extra. Cal enviar pressupost per aprovació.
                      </p>
                      <button
                        onClick={handleEnviarPressupost}
                        className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700"
                      >
                        <Send className="w-4 h-4" />
                        Enviar Pressupost
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Dades contracte */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Data inici contracte
                  </label>
                  <input
                    type="date"
                    value={adminData.dataIniciContracte}
                    onChange={(e) => setAdminData(prev => ({ ...prev, dataIniciContracte: e.target.value }))}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Notes del contracte
                  </label>
                  <textarea
                    value={adminData.notesContracte}
                    onChange={(e) => setAdminData(prev => ({ ...prev, notesContracte: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none placeholder:text-gray-400"
                    placeholder="Condicions especials, acords..."
                  />
                </div>
              </div>

              {/* Preview de la conversió */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={handlePreviewConversion}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">
                    Previsualitzar conversió
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {conversionPreview && (
                  <div className="p-3 space-y-3 border-t border-gray-200">
                    {/* Empresa */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">EMPRESA A CREAR:</p>
                      <div className="p-2 bg-blue-50 rounded text-sm">
                        <p className="font-medium text-blue-900">{conversionPreview.company.name}</p>
                        <p className="text-xs text-blue-700">CIF: {conversionPreview.company.cif}</p>
                        <p className="text-xs text-blue-700">Pla: {conversionPreview.company.plan} - {conversionPreview.company.preuAnual}€/any</p>
                      </div>
                    </div>

                    {/* Usuaris */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">USUARIS A CREAR ({conversionPreview.users.length}):</p>
                      <div className="space-y-2">
                        {conversionPreview.users.map((user, index) => (
                          <div key={index} className="p-2 bg-green-50 rounded text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-green-900">{user.name}</span>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                user.role === 'COMPANY_ADMIN'
                                  ? 'bg-green-200 text-green-800'
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {user.role === 'COMPANY_ADMIN' ? 'Admin' : 'Usuari'}
                              </span>
                            </div>
                            <p className="text-xs text-green-700">{user.email}</p>
                            {user.password && (
                              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                <Key className="w-3 h-3" />
                                Password: <code className="bg-green-100 px-1 rounded">{user.password}</code>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notificacions */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>S&apos;enviarà email amb credencials a l&apos;Admin</p>
                      <p>Es notificarà a CRM Comercial</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botó convertir */}
              <button
                onClick={handleConvertirAEmpresa}
                disabled={isConverting || !leadReadyToConvert || needsBudgetApproval}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creant empresa...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    CONVERTIR A EMPRESA
                  </>
                )}
              </button>

              {/* Missatges d'error si no pot convertir */}
              {!leadReadyToConvert && (
                <p className="text-xs text-red-600 text-center">
                  Falten dades obligatòries: {missingFields.join(', ')}
                </p>
              )}
              {needsBudgetApproval && (
                <p className="text-xs text-amber-600 text-center">
                  Cal enviar el pressupost amb extres
                </p>
              )}
            </div>
          )}
      </div>
    </SidePanel>
  )
}
