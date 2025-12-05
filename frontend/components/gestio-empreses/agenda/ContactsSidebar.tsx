'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  User,
  Phone,
  Mail,
  Building2,
  Target,
  ChevronDown,
  ChevronRight,
  Users,
  Calendar,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { searchContacts, type Contact } from '@/lib/gestio-empreses/contacts-actions'

interface ContactsSidebarProps {
  userId: string
  onSelectContact?: (contact: Contact) => void
  onCreateEvent?: (contact: Contact) => void
}

export function ContactsSidebar({ userId, onSelectContact, onCreateEvent }: ContactsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'leads' | 'companies'>('all')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set())

  // Carregar contactes
  useEffect(() => {
    const loadContacts = async () => {
      setIsLoading(true)
      try {
        const data = await searchContacts(searchQuery, userId, filter)
        setContacts(data)
      } catch (error) {
        console.error('Error carregant contactes:', error)
      }
      setIsLoading(false)
    }

    const debounce = setTimeout(loadContacts, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, filter, userId])

  // Agrupar contactes per entitat
  const groupedContacts = contacts.reduce((acc, contact) => {
    const key = `${contact.entityType}-${contact.entityId}`
    if (!acc[key]) {
      acc[key] = {
        entityType: contact.entityType,
        entityId: contact.entityId,
        entityName: contact.entityName,
        sector: contact.sector,
        contacts: []
      }
    }
    acc[key].contacts.push(contact)
    return acc
  }, {} as Record<string, {
    entityType: 'lead' | 'company'
    entityId: string
    entityName: string
    sector: string | null
    contacts: Contact[]
  }>)

  const toggleEntity = (key: string) => {
    const newExpanded = new Set(expandedEntities)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedEntities(newExpanded)
  }

  const entityCount = Object.keys(groupedContacts).length

  return (
    <div className="w-80 border-l border-slate-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-medium text-slate-900 flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
          Contactes
        </h3>

        {/* Buscador */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cercar contacte..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filtres */}
        <div className="flex gap-1">
          {[
            { id: 'all', label: 'Tots' },
            { id: 'leads', label: 'Leads' },
            { id: 'companies', label: 'Empreses' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as 'all' | 'leads' | 'companies')}
              className={cn(
                'flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors',
                filter === f.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Llista de contactes */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" strokeWidth={1.5} />
          </div>
        ) : entityCount === 0 ? (
          <div className="text-center py-12 px-4">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-slate-500">No s'han trobat contactes</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {Object.entries(groupedContacts).map(([key, group]) => {
              const isExpanded = expandedEntities.has(key)

              return (
                <div key={key}>
                  {/* Entity header */}
                  <button
                    onClick={() => toggleEntity(key)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className={cn(
                      'p-1.5 rounded-lg',
                      group.entityType === 'lead' ? 'bg-amber-100' : 'bg-green-100'
                    )}>
                      {group.entityType === 'lead' ? (
                        <Target className="h-4 w-4 text-amber-600" strokeWidth={1.5} />
                      ) : (
                        <Building2 className="h-4 w-4 text-green-600" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{group.entityName}</p>
                      <p className="text-xs text-slate-500">
                        {group.contacts.length} contacte{group.contacts.length !== 1 ? 's' : ''}
                        {group.sector && ` · ${group.sector}`}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                    )}
                  </button>

                  {/* Contacts list */}
                  {isExpanded && (
                    <div className="bg-slate-50 px-4 py-2">
                      {group.contacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="py-2 border-b border-slate-100 last:border-0"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 text-slate-400 mt-0.5" strokeWidth={1.5} />
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {contact.name}
                                  {contact.isPrimary && (
                                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">
                                      Principal
                                    </span>
                                  )}
                                </p>
                                {contact.position && (
                                  <p className="text-xs text-slate-500">{contact.position}</p>
                                )}
                                <div className="flex items-center gap-3 mt-1">
                                  {contact.phone && (
                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                      <Phone className="h-3 w-3" strokeWidth={1.5} />
                                      {contact.phone}
                                    </span>
                                  )}
                                  {contact.email && (
                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                      <Mail className="h-3 w-3" strokeWidth={1.5} />
                                      {contact.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => onCreateEvent?.(contact)}
                              className="p-1.5 rounded-md hover:bg-slate-200 transition-colors"
                              title="Crear esdeveniment"
                            >
                              <Calendar className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <p className="text-xs text-slate-500 text-center">
          {contacts.length} contactes de {entityCount} {entityCount === 1 ? 'entitat' : 'entitats'}
        </p>
      </div>
    </div>
  )
}