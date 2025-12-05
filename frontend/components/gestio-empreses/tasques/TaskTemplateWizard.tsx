'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  X,
  FileText,
  Phone,
  Mail,
  Calendar,
  Users,
  FileCheck,
  Clock,
  Target,
  Building2,
  Send,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Search,
  MessageCircle,
  User,
  Loader2,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { addDays, addHours, format } from 'date-fns'
import { ca } from 'date-fns/locale'
import { searchLeadsAndCompanies, type SearchResult, type ContactInfo } from '@/lib/gestio-empreses/template-actions'
import { createTask, type TaskPriority } from '@/lib/gestio-empreses/task-actions'

// ============ TIPUS ============

type ContactType = 'PHONE' | 'EMAIL' | 'WHATSAPP' | 'MEETING' | 'OTHER'

interface TaskTemplate {
  id: string
  title: string
  titleWithCompany: string
  description: string
  priority: TaskPriority
  daysUntilDue: number
  hoursUntilDue?: number
  category: 'seguiment' | 'comunicacio' | 'documentacio' | 'reunions'
  icon: any
  contactType: ContactType
  requiresContact: boolean
}

type WizardStep = 'template' | 'entity' | 'confirm'

// ============ PLANTILLES ============

const templates: TaskTemplate[] = [
  // Seguiment
  {
    id: 'trucada-seguiment',
    title: 'Trucada de seguiment',
    titleWithCompany: 'Trucada de seguiment - {company}',
    description: 'Contactar amb el client per fer seguiment de la proposta enviada',
    priority: 'HIGH',
    daysUntilDue: 1,
    hoursUntilDue: 4,
    category: 'seguiment',
    icon: Phone,
    contactType: 'PHONE',
    requiresContact: true
  },
  {
    id: 'email-seguiment',
    title: 'Email de seguiment',
    titleWithCompany: 'Email seguiment - {company}',
    description: 'Enviar email de seguiment per confirmar interès del client',
    priority: 'MEDIUM',
    daysUntilDue: 0,
    hoursUntilDue: 2,
    category: 'seguiment',
    icon: Mail,
    contactType: 'EMAIL',
    requiresContact: true
  },
  {
    id: 'revisar-estat',
    title: 'Revisar estat del client',
    titleWithCompany: 'Revisar estat - {company}',
    description: 'Verificar estat actual del client i possibles necessitats',
    priority: 'MEDIUM',
    daysUntilDue: 2,
    category: 'seguiment',
    icon: FileCheck,
    contactType: 'OTHER',
    requiresContact: true
  },
  // Comunicació
  {
    id: 'primer-contacte',
    title: 'Primer contacte',
    titleWithCompany: 'Primer contacte - {company}',
    description: 'Contactar amb nou lead per primera vegada',
    priority: 'HIGH',
    daysUntilDue: 1,
    category: 'comunicacio',
    icon: Phone,
    contactType: 'PHONE',
    requiresContact: true
  },
  {
    id: 'preparar-presentacio',
    title: 'Preparar presentació',
    titleWithCompany: 'Preparar presentació - {company}',
    description: 'Preparar materials de presentació per al client',
    priority: 'MEDIUM',
    daysUntilDue: 3,
    category: 'comunicacio',
    icon: FileText,
    contactType: 'OTHER',
    requiresContact: true
  },
  {
    id: 'enviar-proposta',
    title: 'Enviar proposta',
    titleWithCompany: 'Enviar proposta - {company}',
    description: 'Preparar i enviar proposta comercial personalitzada',
    priority: 'HIGH',
    daysUntilDue: 2,
    category: 'comunicacio',
    icon: Send,
    contactType: 'EMAIL',
    requiresContact: true
  },
  {
    id: 'whatsapp-seguiment',
    title: 'WhatsApp de seguiment',
    titleWithCompany: 'WhatsApp - {company}',
    description: 'Enviar missatge de WhatsApp per seguiment ràpid',
    priority: 'MEDIUM',
    daysUntilDue: 0,
    hoursUntilDue: 1,
    category: 'comunicacio',
    icon: MessageCircle,
    contactType: 'WHATSAPP',
    requiresContact: true
  },
  // Documentació
  {
    id: 'revisar-contracte',
    title: 'Revisar contracte',
    titleWithCompany: 'Revisar contracte - {company}',
    description: 'Revisar i validar condicions del contracte',
    priority: 'HIGH',
    daysUntilDue: 2,
    category: 'documentacio',
    icon: FileCheck,
    contactType: 'OTHER',
    requiresContact: true
  },
  {
    id: 'actualitzar-fitxa',
    title: 'Actualitzar documentació',
    titleWithCompany: 'Actualitzar fitxa - {company}',
    description: 'Actualitzar fitxa del client amb nova informació',
    priority: 'LOW',
    daysUntilDue: 3,
    category: 'documentacio',
    icon: FileText,
    contactType: 'OTHER',
    requiresContact: true
  },
  {
    id: 'verificar-compliment',
    title: 'Verificació de compliment',
    titleWithCompany: 'Verificar compliment - {company}',
    description: 'Revisar compliment de requisits acordats',
    priority: 'URGENT',
    daysUntilDue: 1,
    category: 'documentacio',
    icon: CheckCircle,
    contactType: 'OTHER',
    requiresContact: true
  },
  // Reunions
  {
    id: 'programar-reunio',
    title: 'Programar reunió',
    titleWithCompany: 'Programar reunió - {company}',
    description: 'Coordinar i programar reunió amb el client',
    priority: 'MEDIUM',
    daysUntilDue: 2,
    category: 'reunions',
    icon: Calendar,
    contactType: 'MEETING',
    requiresContact: true
  },
  {
    id: 'preparar-demo',
    title: 'Preparar demostració',
    titleWithCompany: 'Preparar demo - {company}',
    description: 'Preparar materials i entorn per a la demostració',
    priority: 'HIGH',
    daysUntilDue: 1,
    category: 'reunions',
    icon: Users,
    contactType: 'MEETING',
    requiresContact: true
  },
  {
    id: 'reunio-tancament',
    title: 'Reunió de tancament',
    titleWithCompany: 'Reunió tancament - {company}',
    description: 'Reunió per tancar acord i signar contracte',
    priority: 'URGENT',
    daysUntilDue: 1,
    category: 'reunions',
    icon: CheckCircle,
    contactType: 'MEETING',
    requiresContact: true
  },
]

const categories = [
  { id: 'all', label: 'Totes', icon: FileText },
  { id: 'seguiment', label: 'Seguiment', icon: Target },
  { id: 'comunicacio', label: 'Comunicació', icon: Phone },
  { id: 'documentacio', label: 'Documentació', icon: FileText },
  { id: 'reunions', label: 'Reunions', icon: Calendar },
]

const contactTypeLabels: Record<ContactType, { label: string; icon: any }> = {
  PHONE: { label: 'Telèfon', icon: Phone },
  EMAIL: { label: 'Email', icon: Mail },
  WHATSAPP: { label: 'WhatsApp', icon: MessageCircle },
  MEETING: { label: 'Reunió', icon: Users },
  OTHER: { label: 'Altre', icon: FileText },
}

const priorityConfig: Record<TaskPriority, { label: string; color: string; icon: any }> = {
  URGENT: { label: 'Urgent', color: 'text-red-600 bg-red-50 border-red-200', icon: ArrowUp },
  HIGH: { label: 'Alta', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: ArrowUp },
  MEDIUM: { label: 'Mitjana', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Minus },
  LOW: { label: 'Baixa', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: ArrowDown },
}

// ============ COMPONENT ============

interface TaskTemplateWizardProps {
  onClose: () => void
  onTaskCreated: () => void
}

export function TaskTemplateWizard({ onClose, onTaskCreated }: TaskTemplateWizardProps) {
  const { data: session } = useSession()
  const [isPending, startTransition] = useTransition()

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Entity selection state
  const [searchQuery, setSearchQuery] = useState('')
  const [entityFilter, setEntityFilter] = useState<'all' | 'leads' | 'companies'>('all')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<SearchResult | null>(null)
  const [selectedContact, setSelectedContact] = useState<ContactInfo | null>(null)

  // Task customization
  const [customTitle, setCustomTitle] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [contactType, setContactType] = useState<ContactType>('PHONE')
  const [dueDate, setDueDate] = useState('')

  const currentUserId = session?.user?.id || ''

  // Filtrar plantilles per categoria
  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory)

  // Buscar leads/empreses
  useEffect(() => {
    const searchEntities = async () => {
      if (!currentUserId) return

      setIsSearching(true)
      try {
        const results = await searchLeadsAndCompanies(searchQuery, entityFilter, currentUserId)
        setSearchResults(results)
      } catch (error) {
        console.error('Error cercant:', error)
      }
      setIsSearching(false)
    }

    const debounce = setTimeout(searchEntities, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, entityFilter, currentUserId])

  // Quan es selecciona una plantilla
  const handleSelectTemplate = (template: TaskTemplate) => {
    setSelectedTemplate(template)
    setContactType(template.contactType)

    // Calcular data límit
    let due = new Date()
    if (template.hoursUntilDue) {
      due = addHours(due, template.hoursUntilDue)
    } else {
      due = addDays(due, template.daysUntilDue)
    }
    setDueDate(format(due, "yyyy-MM-dd'T'HH:mm"))

    if (template.requiresContact) {
      setCurrentStep('entity')
    } else {
      setCurrentStep('confirm')
    }
  }

  // Quan es selecciona una entitat
  const handleSelectEntity = (entity: SearchResult) => {
    setSelectedEntity(entity)
    // Seleccionar contacte principal per defecte
    const primaryContact = entity.contacts.find(c => c.isPrimary) || entity.contacts[0]
    if (primaryContact) {
      setSelectedContact(primaryContact)
    }

    // Generar títol amb nom de l'empresa
    if (selectedTemplate) {
      setCustomTitle(selectedTemplate.titleWithCompany.replace('{company}', entity.name))
      setCustomDescription(selectedTemplate.description)
    }

    setCurrentStep('confirm')
  }

  // Crear la tasca
  const handleCreateTask = () => {
    if (!selectedTemplate || !currentUserId) return

    startTransition(async () => {
      try {
        await createTask({
          title: customTitle || selectedTemplate.title,
          description: customDescription || selectedTemplate.description,
          priority: selectedTemplate.priority,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          leadId: selectedEntity?.type === 'lead' ? selectedEntity.id : undefined,
          companyId: selectedEntity?.type === 'company' ? selectedEntity.id : undefined,
        }, currentUserId)

        onTaskCreated()
        onClose()
      } catch (error) {
        console.error('Error creant tasca:', error)
      }
    })
  }

  // Tornar al pas anterior
  const handleBack = () => {
    if (currentStep === 'entity') {
      setCurrentStep('template')
      setSelectedTemplate(null)
    } else if (currentStep === 'confirm') {
      if (selectedTemplate?.requiresContact) {
        setCurrentStep('entity')
        setSelectedEntity(null)
        setSelectedContact(null)
      } else {
        setCurrentStep('template')
        setSelectedTemplate(null)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            {currentStep !== 'template' && (
              <button
                onClick={handleBack}
                className="p-2 rounded-md hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
              </button>
            )}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
                {currentStep === 'template' && 'Selecciona una plantilla'}
                {currentStep === 'entity' && 'Selecciona lead o empresa'}
                {currentStep === 'confirm' && 'Confirmar tasca'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {currentStep === 'template' && 'Tria el tipus de tasca que vols crear'}
                {currentStep === 'entity' && 'Cerca i selecciona el client per aquesta tasca'}
                {currentStep === 'confirm' && 'Revisa i confirma les dades de la tasca'}
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              currentStep === 'template' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
            )}>
              1
            </div>
            <div className="w-8 h-0.5 bg-slate-200" />
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              currentStep === 'entity' ? 'bg-blue-600 text-white' :
              currentStep === 'confirm' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'
            )}>
              2
            </div>
            <div className="w-8 h-0.5 bg-slate-200" />
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              currentStep === 'confirm' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
            )}>
              3
            </div>

            <button
              onClick={onClose}
              className="ml-4 p-2 rounded-md hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* STEP 1: Seleccionar plantilla */}
          {currentStep === 'template' && (
            <div className="p-6">
              {/* Categories */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {categories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                        selectedCategory === cat.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                      {cat.label}
                    </button>
                  )
                })}
              </div>

              {/* Plantilles grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => {
                  const Icon = template.icon
                  const priority = priorityConfig[template.priority]
                  const contactTypeInfo = contactTypeLabels[template.contactType]

                  return (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="border border-slate-200 rounded-lg p-4 text-left hover:shadow-md hover:border-blue-300 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                          <Icon className="h-5 w-5 text-slate-600 group-hover:text-blue-600" strokeWidth={1.5} />
                        </div>
                        <span className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded border',
                          priority.color
                        )}>
                          {priority.label}
                        </span>
                      </div>

                      <h3 className="font-medium text-slate-900 mb-1">{template.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                        {template.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <contactTypeInfo.icon className="h-3 w-3" strokeWidth={1.5} />
                          {contactTypeInfo.label}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" strokeWidth={1.5} />
                          {template.hoursUntilDue
                            ? `${template.hoursUntilDue}h`
                            : `${template.daysUntilDue}d`
                          }
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Seleccionar lead/empresa */}
          {currentStep === 'entity' && (
            <div className="p-6">
              {/* Plantilla seleccionada */}
              {selectedTemplate && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                  <selectedTemplate.icon className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
                  <div>
                    <p className="font-medium text-blue-900">{selectedTemplate.title}</p>
                    <p className="text-sm text-blue-700">Prioritat: {priorityConfig[selectedTemplate.priority].label}</p>
                  </div>
                </div>
              )}

              {/* Buscador */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cercar per nom d'empresa o contacte..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filtres */}
              <div className="flex gap-2 mb-4">
                {[
                  { id: 'all', label: 'Tots' },
                  { id: 'leads', label: 'Leads' },
                  { id: 'companies', label: 'Empreses' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setEntityFilter(filter.id as 'all' | 'leads' | 'companies')}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      entityFilter === filter.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Resultats */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" strokeWidth={1.5} />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-slate-500">No s'han trobat resultats</p>
                  </div>
                ) : (
                  searchResults.map((entity) => (
                    <button
                      key={entity.id}
                      onClick={() => handleSelectEntity(entity)}
                      className={cn(
                        'w-full border rounded-lg p-4 text-left hover:shadow-md transition-all',
                        selectedEntity?.id === entity.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'p-2 rounded-lg',
                            entity.type === 'lead' ? 'bg-amber-100' : 'bg-green-100'
                          )}>
                            {entity.type === 'lead' ? (
                              <Target className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
                            ) : (
                              <Building2 className="h-5 w-5 text-green-600" strokeWidth={1.5} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900">{entity.name}</h3>
                            {entity.sector && (
                              <p className="text-sm text-slate-500">{entity.sector}</p>
                            )}
                          </div>
                        </div>
                        <span className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded',
                          entity.type === 'lead' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        )}>
                          {entity.type === 'lead' ? 'Lead' : 'Empresa'}
                        </span>
                      </div>

                      {/* Contactes */}
                      {entity.contacts.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs font-medium text-slate-500 mb-2">Contactes:</p>
                          <div className="space-y-2">
                            {entity.contacts.slice(0, 2).map((contact) => (
                              <div key={contact.id} className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 text-slate-700">
                                  <User className="h-3 w-3" strokeWidth={1.5} />
                                  <span>{contact.name}</span>
                                  {contact.position && (
                                    <span className="text-slate-400">· {contact.position}</span>
                                  )}
                                  {contact.isPrimary && (
                                    <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">Principal</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-slate-500">
                                  {contact.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" strokeWidth={1.5} />
                                      {contact.phone}
                                    </span>
                                  )}
                                  {contact.email && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" strokeWidth={1.5} />
                                      {contact.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                            {entity.contacts.length > 2 && (
                              <p className="text-xs text-slate-400">
                                +{entity.contacts.length - 2} contactes més
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Confirmar tasca */}
          {currentStep === 'confirm' && selectedTemplate && (
            <div className="p-6 space-y-6">
              {/* Entitat seleccionada */}
              {selectedEntity && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    {selectedEntity.type === 'lead' ? (
                      <Target className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
                    ) : (
                      <Building2 className="h-5 w-5 text-green-600" strokeWidth={1.5} />
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{selectedEntity.name}</p>
                      {selectedContact && (
                        <p className="text-sm text-slate-500">
                          {selectedContact.name}
                          {selectedContact.position && ` · ${selectedContact.position}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Títol */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Títol de la tasca
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Prioritat i Data */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Prioritat
                  </label>
                  <div className={cn(
                    'px-4 py-2 border rounded-lg flex items-center gap-2',
                    priorityConfig[selectedTemplate.priority].color
                  )}>
                    {(() => {
                      const PriorityIcon = priorityConfig[selectedTemplate.priority].icon
                      return <PriorityIcon className="h-4 w-4" strokeWidth={1.5} />
                    })()}
                    {priorityConfig[selectedTemplate.priority].label}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Data límit
                  </label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Tipus de contacte */}
              {selectedContact && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipus de contacte
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(contactTypeLabels).map(([type, info]) => {
                      const Icon = info.icon
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setContactType(type as ContactType)}
                          className={cn(
                            'p-3 rounded-lg border text-center transition-all',
                            contactType === type
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          )}
                        >
                          <Icon className="h-5 w-5 mx-auto mb-1" strokeWidth={1.5} />
                          <span className="text-xs font-medium">{info.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Info contacte */}
              {selectedContact && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 mb-2">Dades de contacte</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedContact.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="h-4 w-4" strokeWidth={1.5} />
                        {selectedContact.phone}
                      </div>
                    )}
                    {selectedContact.email && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="h-4 w-4" strokeWidth={1.5} />
                        {selectedContact.email}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Descripció */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripció
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-500">
            {currentStep === 'template' && `${filteredTemplates.length} plantilles`}
            {currentStep === 'entity' && `${searchResults.length} resultats`}
            {currentStep === 'confirm' && 'Revisa les dades abans de crear'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancel·lar
            </button>
            {currentStep === 'confirm' && (
              <button
                onClick={handleCreateTask}
                disabled={isPending || !customTitle}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                    Creant...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                    Crear tasca
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}