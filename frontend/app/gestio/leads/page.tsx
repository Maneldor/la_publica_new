// app/gestio/leads/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Target, Plus } from 'lucide-react'

import { PageHeader } from '@/components/gestio-empreses/shared/PageHeader'
import { StatCard } from '@/components/gestio-empreses/ui/StatCard'
import { LeadFiltersCompact } from '@/components/gestio-empreses/leads/LeadFiltersCompact'
import { LeadTableSelectable } from '@/components/gestio-empreses/leads/LeadTableSelectable'
import { BulkActionsBar } from '@/components/gestio-empreses/leads/BulkActionsBar'

// Dades mock per mostrar el disseny (fallback)
const mockLeads = [
  {
    id: '1',
    company: 'Tech Solutions SL',
    contact: 'Maria García',
    email: 'maria@techsolutions.com',
    phone: '+34 666 123 456',
    status: 'NEW',
    priority: 'HIGH',
    source: 'WEB',
    sector: 'TECHNOLOGY',
    value: 15000,
    assignedTo: 'gestor1',
    gestorName: 'Joan Pujol',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-15')
  },
  {
    id: '2',
    company: 'Retail Plus SA',
    contact: 'Carlos Ruiz',
    email: 'carlos@retailplus.com',
    phone: '+34 677 987 654',
    status: 'CONTACTED',
    priority: 'MEDIUM',
    source: 'LINKEDIN',
    sector: 'RETAIL',
    value: 8500,
    assignedTo: 'gestor2',
    gestorName: 'Anna Molins',
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-11-10')
  },
  {
    id: '3',
    company: 'Constructora BCN',
    contact: 'Laura Vidal',
    email: 'laura@constructorabcn.com',
    phone: null,
    status: 'QUALIFIED',
    priority: 'LOW',
    source: 'REFERRAL',
    sector: 'CONSTRUCTION',
    value: 25000,
    assignedTo: null,
    gestorName: null,
    createdAt: new Date('2024-09-20'),
    updatedAt: new Date('2024-11-05')
  }
]

const mockGestors = [
  { id: 'gestor1', name: 'Joan Pujol', email: 'joan@lapublica.cat' },
  { id: 'gestor2', name: 'Anna Molins', email: 'anna@lapublica.cat' },
  { id: 'gestor3', name: 'Pere Català', email: 'pere@lapublica.cat' }
]

export default function LeadsPage() {
  const { data: session, status } = useSession()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    source: '',
    assignedTo: '',
  })

  useEffect(() => {
    if (session?.user) {
      fetchLeads()
    }
  }, [session, filters])

  const fetchLeads = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      if (filters.priority) params.set('priority', filters.priority)
      if (filters.source) params.set('source', filters.source)
      if (filters.assignedTo) params.set('assignedTo', filters.assignedTo)

      const response = await fetch(`/api/leads?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads || [])
      } else {
        // Si hi ha error, utilitzar dades mock
        console.log('Error en resposta, utilitzant dades mock')
        setLeads(mockLeads)
      }
    } catch (error) {
      console.error('Error carregant leads:', error)
      // Utilitzar dades mock si hi ha error
      setLeads(mockLeads)
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar autenticació
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session?.user) {
    redirect('/login')
    return null
  }

  // Calcular estadístiques dels leads reals o mock
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'NEW').length,
    contacted: leads.filter(l => l.status === 'CONTACTED').length,
    qualified: leads.filter(l => l.status === 'QUALIFIED').length,
    won: leads.filter(l => l.status === 'WON').length
  }

  const handleBulkAction = async () => {
    // Simular acció
    console.log('Bulk action performed')
    setSelectedIds([])
    // Recarregar leads després de l'acció
    await fetchLeads()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Els teus leads assignats"
        icon={Target}
        actions={
          <div className="flex gap-2">
            <Link
              href="/gestio/leads/ia"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
            >
              <Target className="h-4 w-4" strokeWidth={1.5} />
              IA Leads
            </Link>
            <Link
              href="/gestio/leads/nou"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Nou lead
            </Link>
          </div>
        }
      />

      {/* Estadístiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total leads" value={stats.total} icon={Target} />
        <StatCard title="Nous" value={stats.new} />
        <StatCard title="Contactats" value={stats.contacted} />
        <StatCard title="Qualificats" value={stats.qualified} />
        <StatCard title="Guanyats" value={stats.won} />
      </div>

      {/* Filtres compactes */}
      <LeadFiltersCompact
        gestors={mockGestors.map(g => ({ value: g.id, label: g.name || g.email }))}
        onFilterChange={setFilters}
      />

      {/* Taula amb selecció múltiple */}
      <LeadTableSelectable
        leads={leads}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        gestors={mockGestors}
      />

      {/* Barra d'accions en bloc */}
      <BulkActionsBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
        onSuccess={handleBulkAction}
        gestors={mockGestors}
      />
    </div>
  )
}