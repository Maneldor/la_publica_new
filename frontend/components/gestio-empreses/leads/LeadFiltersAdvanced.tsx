'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ExpandableFilters from '@/components/ui/ExpandableFilters'

const statusOptions = [
  { value: 'NEW', label: 'Nou' },
  { value: 'CONTACTED', label: 'Contactat' },
  { value: 'NEGOTIATION', label: 'Negociant' },
  { value: 'QUALIFIED', label: 'Qualificat' },
  { value: 'PROPOSAL_SENT', label: 'Proposta enviada' },
  { value: 'PENDING_CRM', label: 'Pendent CRM' },
  { value: 'CRM_APPROVED', label: 'Aprovat CRM' },
  { value: 'CRM_REJECTED', label: 'Rebutjat CRM' },
  { value: 'PENDING_ADMIN', label: 'Pendent Admin' },
  { value: 'WON', label: 'Guanyat' },
  { value: 'LOST', label: 'Perdut' }
]

const priorityOptions = [
  { value: 'HIGH', label: 'Alta', color: '#dc2626' },
  { value: 'MEDIUM', label: 'Mitjana', color: '#d97706' },
  { value: 'LOW', label: 'Baixa', color: '#059669' }
]

const sourceOptions = [
  { value: 'WEBSITE', label: 'Web' },
  { value: 'REFERRAL', label: 'Referit' },
  { value: 'COLD_CALL', label: 'Trucada freda' },
  { value: 'EVENT', label: 'Esdeveniment' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'SOCIAL_MEDIA', label: 'Xarxes socials' },
  { value: 'EMAIL_CAMPAIGN', label: 'Campanya email' },
  { value: 'TRADE_SHOW', label: 'Fira comercial' },
  { value: 'PARTNERSHIP', label: 'Soci comercial' },
  { value: 'ADVERTISING', label: 'Publicitat' },
  { value: 'OTHER', label: 'Altres' }
]

const sectorOptions = [
  { value: 'TECHNOLOGY', label: 'Tecnologia' },
  { value: 'HEALTHCARE', label: 'Salut' },
  { value: 'FINANCE', label: 'Finances' },
  { value: 'EDUCATION', label: 'Educació' },
  { value: 'RETAIL', label: 'Comerç al detall' },
  { value: 'MANUFACTURING', label: 'Manufactures' },
  { value: 'CONSTRUCTION', label: 'Construcció' },
  { value: 'HOSPITALITY', label: 'Hospitalitat' },
  { value: 'LOGISTICS', label: 'Logística' },
  { value: 'CONSULTING', label: 'Consultoria' },
  { value: 'MARKETING', label: 'Màrqueting' },
  { value: 'REAL_ESTATE', label: 'Immobiliària' },
  { value: 'AUTOMOTIVE', label: 'Automoció' },
  { value: 'ENERGY', label: 'Energia' },
  { value: 'LEGAL', label: 'Legal' },
  { value: 'AGRICULTURE', label: 'Agricultura' },
  { value: 'ENTERTAINMENT', label: 'Entreteniment' },
  { value: 'NON_PROFIT', label: 'Sense ànim de lucre' },
  { value: 'GOVERNMENT', label: 'Govern' },
  { value: 'OTHER', label: 'Altres' }
]

interface LeadFiltersAdvancedProps {
  availableManagers?: Array<{
    id: string
    name: string
    email: string
  }>
}

export function LeadFiltersAdvanced({ availableManagers = [] }: LeadFiltersAdvancedProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')

  const selectedFilters = useMemo(() => {
    const filters: Record<string, string[]> = {}

    const status = searchParams.get('status')
    if (status) filters.status = [status]

    const priority = searchParams.get('priority')
    if (priority) filters.priority = [priority]

    const source = searchParams.get('source')
    if (source) filters.source = [source]

    const sector = searchParams.get('sector')
    if (sector) filters.sector = [sector]

    const assignedTo = searchParams.get('assignedTo')
    if (assignedTo) filters.assignedTo = [assignedTo]

    return filters
  }, [searchParams])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    Object.values(selectedFilters).forEach(values => {
      count += values.length
    })
    if (searchValue) count++
    return count
  }, [selectedFilters, searchValue])

  const handleFilterChange = (filterKey: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString())

    if (checked) {
      params.set(filterKey, value)
    } else {
      params.delete(filterKey)
    }

    // Mantenir la cerca
    if (searchValue) {
      params.set('search', searchValue)
    }

    router.push(`/gestio/leads?${params.toString()}`)
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value)

    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }

    router.push(`/gestio/leads?${params.toString()}`)
  }

  const handleClearAll = () => {
    setSearchValue('')
    router.push('/gestio/leads')
  }

  const filters = useMemo(() => {
    const baseFilters = [
      {
        title: 'Estat',
        key: 'status',
        type: 'radio' as const,
        options: statusOptions,
        collapsible: true,
        maxVisibleOptions: 6,
        layout: 'single' as const
      },
      {
        title: 'Prioritat',
        key: 'priority',
        type: 'radio' as const,
        options: priorityOptions,
        collapsible: false,
        layout: 'single' as const
      },
      {
        title: 'Font',
        key: 'source',
        type: 'radio' as const,
        options: sourceOptions,
        collapsible: true,
        maxVisibleOptions: 5,
        layout: 'single' as const
      },
      {
        title: 'Sector',
        key: 'sector',
        type: 'radio' as const,
        options: sectorOptions,
        collapsible: true,
        maxVisibleOptions: 8,
        layout: 'double' as const
      }
    ]

    // Afegir gestors només si hi ha gestors disponibles
    if (availableManagers.length > 0) {
      baseFilters.push({
        title: 'Gestor',
        key: 'assignedTo',
        type: 'radio' as const,
        options: availableManagers.map(manager => ({
          value: manager.id,
          label: manager.name
        })),
        collapsible: true,
        maxVisibleOptions: 5,
        layout: 'single' as const
      })
    }

    return baseFilters
  }, [availableManagers])

  return (
    <ExpandableFilters
      title="Filtres de Leads"
      subtitle="Filtra i cerca leads per estat, prioritat, font i més"
      searchValue={searchValue}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Cercar per empresa, contacte, email, telèfon..."
      filters={filters}
      selectedFilters={selectedFilters}
      onFilterChange={handleFilterChange}
      onClearAll={handleClearAll}
      activeFiltersCount={activeFiltersCount}
    />
  )
}