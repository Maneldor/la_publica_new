'use client'

import { useState, useEffect } from 'react'
import { Search, Users, Shield, User, Building2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Recipient } from '@/lib/gestio-empreses/message-actions'
import { searchRecipients } from '@/lib/gestio-empreses/message-actions'

interface RecipientSelectorProps {
  userId: string
  selectedRecipient: Recipient | null
  onRecipientSelect: (recipient: Recipient | null) => void
  className?: string
}

const recipientTypes = [
  { value: 'all', label: 'Tots', icon: Users },
  { value: 'admin', label: 'Administradors', icon: Shield },
  { value: 'manager', label: 'Gestors', icon: User },
  { value: 'lead', label: 'Leads', icon: User },
  { value: 'company', label: 'Empreses', icon: Building2 }
] as const

export function RecipientSelector({
  userId,
  selectedRecipient,
  onRecipientSelect,
  className
}: RecipientSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'admin' | 'manager' | 'lead' | 'company'>('all')
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Carregar destinataris quan canviin els filtres
  useEffect(() => {
    const loadRecipients = async () => {
      // Per a Administradors i Gestors, carregar sempre (sense necessitat de cerca)
      if (selectedType === 'admin' || selectedType === 'manager') {
        setIsLoading(true)
        try {
          // Carregar tots els usuaris d'aquest tipus directament
          const results = await searchRecipients('', selectedType, userId)
          setRecipients(results)
        } catch (error) {
          console.error('Error carregant destinataris:', error)
          setRecipients([])
        }
        setIsLoading(false)
        return
      }

      // Per a Leads, Empreses i Tots - només carregar si hi ha text de cerca
      if (searchQuery.trim() || selectedType === 'all') {
        setIsLoading(true)
        try {
          const results = await searchRecipients(searchQuery, selectedType, userId)
          setRecipients(results)
        } catch (error) {
          console.error('Error carregant destinataris:', error)
          setRecipients([])
        }
        setIsLoading(false)
      } else {
        // Netejar resultats si no hi ha cerca per Leads/Empreses
        setRecipients([])
      }
    }

    loadRecipients()
  }, [searchQuery, selectedType, userId])

  // Gestionar el canvi de filtre
  const handleFilterChange = (newType: 'all' | 'admin' | 'manager' | 'lead' | 'company') => {
    setSelectedType(newType)

    // Netejar cerca quan es canvia de filtre
    if (newType !== selectedType) {
      setSearchQuery('')
    }
  }

  const getRecipientTypeLabel = (type: string) => {
    switch (type) {
      case 'admin': return 'Admin'
      case 'manager': return 'Gestor'
      case 'lead': return 'Lead'
      case 'company': return 'Empresa'
      default: return ''
    }
  }

  const getRecipientIcon = (type: string) => {
    switch (type) {
      case 'admin': return Shield
      case 'manager': return User
      case 'lead': return User
      case 'company': return Building2
      default: return User
    }
  }

  return (
    <div className={cn('relative', className)}>
      {/* Selector principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors bg-white"
      >
        <div className="flex items-center gap-3">
          {selectedRecipient ? (
            <>
              <div className="flex-shrink-0">
                {selectedRecipient.avatar ? (
                  <img
                    src={selectedRecipient.avatar}
                    alt={selectedRecipient.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    {React.createElement(getRecipientIcon(selectedRecipient.type), {
                      className: "w-4 h-4 text-slate-600",
                      strokeWidth: 1.5
                    })}
                  </div>
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-slate-900">{selectedRecipient.name}</p>
                <p className="text-sm text-slate-500">
                  {getRecipientTypeLabel(selectedRecipient.type)} • {selectedRecipient.email}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-slate-500">Selecciona un destinatari</p>
              </div>
            </>
          )}
        </div>
        <ChevronDown className={cn(
          'w-5 h-5 text-slate-400 transition-transform',
          isOpen && 'rotate-180'
        )} strokeWidth={1.5} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Filtres de tipus */}
          <div className="p-3 border-b border-slate-100">
            <div className="flex gap-1">
              {recipientTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    onClick={() => handleFilterChange(type.value)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                      selectedType === type.value
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-slate-100 text-slate-600'
                    )}
                  >
                    <Icon className="w-3 h-3" strokeWidth={1.5} />
                    {type.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Buscador - només per Leads, Empreses i Tots */}
          {(selectedType === 'lead' || selectedType === 'company' || selectedType === 'all') && (
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    selectedType === 'lead' ? 'Buscar leads...' :
                    selectedType === 'company' ? 'Buscar empreses...' :
                    'Buscar destinataris...'
                  }
                  className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Llista de destinataris */}
          <div className="max-h-64 overflow-auto">
            {isLoading ? (
              <div className="p-4 text-center text-slate-500">
                Carregant...
              </div>
            ) : recipients.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                {(selectedType === 'admin' || selectedType === 'manager') ? (
                  // Missatge específic si no hi ha usuaris d'aquest tipus
                  <div className="space-y-2">
                    <Users className="h-8 w-8 text-slate-300 mx-auto" strokeWidth={1.5} />
                    <p className="text-sm">
                      No hi ha {selectedType === 'admin' ? 'administradors' : 'gestors'} disponibles
                    </p>
                  </div>
                ) : (
                  // Missatge per leads/empreses quan no s'ha cercat
                  <div className="space-y-2">
                    <Search className="h-8 w-8 text-slate-300 mx-auto" strokeWidth={1.5} />
                    <p className="text-sm">
                      Escriu per cercar {
                        selectedType === 'lead' ? 'leads' :
                        selectedType === 'company' ? 'empreses' :
                        'destinataris'
                      }
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-1">
                {recipients.map((recipient) => {
                  const Icon = getRecipientIcon(recipient.type)
                  return (
                    <button
                      key={recipient.id}
                      onClick={() => {
                        onRecipientSelect(recipient)
                        setIsOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {recipient.avatar ? (
                          <img
                            src={recipient.avatar}
                            alt={recipient.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-slate-900">{recipient.name}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                            recipient.type === 'admin' ? 'bg-red-100 text-red-700' :
                            recipient.type === 'manager' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                          )}>
                            <Icon className="w-3 h-3" strokeWidth={1.5} />
                            {getRecipientTypeLabel(recipient.type)}
                          </span>
                          <span>{recipient.email}</span>
                        </div>
                        {recipient.position && (
                          <p className="text-xs text-slate-400">{recipient.position}</p>
                        )}
                        {recipient.companyName && recipient.type === 'lead' && (
                          <p className="text-xs text-slate-400">{recipient.companyName}</p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay per tancar el dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}