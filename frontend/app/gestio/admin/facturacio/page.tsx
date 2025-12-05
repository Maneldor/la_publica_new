'use client'

import { useState, useEffect } from 'react'
import { Plus, Grid, List, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InvoiceStats } from '@/components/gestio-empreses/facturacio/InvoiceStats'
import { InvoiceFilters } from '@/components/gestio-empreses/facturacio/InvoiceFilters'
import { InvoiceCard } from '@/components/gestio-empreses/facturacio/InvoiceCard'
import { InvoiceTable } from '@/components/gestio-empreses/facturacio/InvoiceTable'
import { InvoicePreviewPanel } from '@/components/gestio-empreses/facturacio/InvoicePreviewPanel'
import { PaymentModal } from '@/components/gestio-empreses/facturacio/PaymentModal'
import toast from 'react-hot-toast'

type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
type PaymentMethod = 'TRANSFER' | 'CARD' | 'CASH' | 'CHECK' | 'OTHER'
type ViewMode = 'grid' | 'table'
type SortField = 'number' | 'clientName' | 'amount' | 'issueDate' | 'dueDate' | 'status'
type SortDirection = 'asc' | 'desc'

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Payment {
  id: string
  amount: number
  date: Date
  method: PaymentMethod
  reference?: string
}

interface Invoice {
  id: string
  number: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  clientAddress?: string
  amount: number
  paidAmount: number
  issueDate: Date
  dueDate: Date
  status: InvoiceStatus
  description?: string
  items: InvoiceItem[]
  payments: Payment[]
  notes?: string
}

interface InvoiceFiltersData {
  search: string
  status: InvoiceStatus | 'ALL'
  onlyOverdue: boolean
}

interface PaymentData {
  amount: number
  method: PaymentMethod
  date: Date
  reference?: string
  notes?: string
}

interface InvoiceStatsData {
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  monthlyTotal: number
  monthlyGrowth: number
}

export default function FacturacioPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [statsData, setStatsData] = useState<InvoiceStatsData>({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    monthlyTotal: 0,
    monthlyGrowth: 0
  })
  const [filters, setFilters] = useState<InvoiceFiltersData>({
    search: '',
    status: 'ALL',
    onlyOverdue: false
  })
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortField, setSortField] = useState<SortField>('issueDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [isLoading, setIsLoading] = useState(true)

  // Load invoices data
  useEffect(() => {
    fetchInvoices()
  }, [])

  // Apply filters
  useEffect(() => {
    applyFilters()
  }, [invoices, filters, sortField, sortDirection])

  const fetchInvoices = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
        setStatsData(data.stats || statsData)
      } else {
        throw new Error('Error fetching invoices')
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast.error('Error carregant les factures')
      // Mock data for development
      generateMockData()
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockData = () => {
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        number: 'FAC-2024-001',
        clientName: 'Empresa XYZ S.L.',
        clientEmail: 'facturacio@empresaxyz.com',
        clientPhone: '+34 600 123 456',
        clientAddress: 'Carrer Principal, 123 - 08001 Barcelona',
        amount: 1200.00,
        paidAmount: 1200.00,
        issueDate: new Date('2024-11-01'),
        dueDate: new Date('2024-11-30'),
        status: 'PAID',
        description: 'Desenvolupament web corporatiu',
        items: [
          { description: 'Desenvolupament web', quantity: 1, unitPrice: 1000, total: 1000 },
          { description: 'Configuració hosting', quantity: 1, unitPrice: 200, total: 200 }
        ],
        payments: [
          { id: 'p1', amount: 1200, date: new Date('2024-11-15'), method: 'TRANSFER', reference: 'TR-20241115-001' }
        ],
        notes: 'Projecte completat satisfactòriament'
      },
      {
        id: '2',
        number: 'FAC-2024-002',
        clientName: 'StartUp ABC',
        clientEmail: 'admin@startupabc.com',
        amount: 800.00,
        paidAmount: 400.00,
        issueDate: new Date('2024-11-15'),
        dueDate: new Date('2024-12-15'),
        status: 'SENT',
        description: 'Consultoria SEO i marketing digital',
        items: [
          { description: 'Auditoria SEO', quantity: 1, unitPrice: 400, total: 400 },
          { description: 'Estratègia marketing', quantity: 1, unitPrice: 400, total: 400 }
        ],
        payments: [
          { id: 'p2', amount: 400, date: new Date('2024-11-20'), method: 'CARD', reference: 'CARD-20241120-001' }
        ]
      },
      {
        id: '3',
        number: 'FAC-2024-003',
        clientName: 'Botiga Online DEF',
        clientEmail: 'contacte@botiga-def.com',
        amount: 1500.00,
        paidAmount: 0,
        issueDate: new Date('2024-10-01'),
        dueDate: new Date('2024-10-30'),
        status: 'OVERDUE',
        description: 'Desenvolupament e-commerce',
        items: [
          { description: 'Desenvolupament e-commerce', quantity: 1, unitPrice: 1200, total: 1200 },
          { description: 'Integració pagaments', quantity: 1, unitPrice: 300, total: 300 }
        ],
        payments: []
      }
    ]

    setInvoices(mockInvoices)
    setStatsData({
      totalInvoices: 3,
      paidInvoices: 1,
      pendingInvoices: 1,
      overdueInvoices: 1,
      monthlyTotal: 3500,
      monthlyGrowth: 15.5
    })
  }

  const applyFilters = () => {
    let filtered = [...invoices]

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(invoice =>
        invoice.number.toLowerCase().includes(searchTerm) ||
        invoice.clientName.toLowerCase().includes(searchTerm) ||
        invoice.clientEmail.toLowerCase().includes(searchTerm) ||
        invoice.description?.toLowerCase().includes(searchTerm)
      )
    }

    // Status filter
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(invoice => invoice.status === filters.status)
    }

    // Overdue filter
    if (filters.onlyOverdue) {
      filtered = filtered.filter(invoice => invoice.status === 'OVERDUE')
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'issueDate' || sortField === 'dueDate') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredInvoices(filtered)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setPreviewInvoice(invoice)
    setIsPreviewOpen(true)
  }

  const handleSelectInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    if (viewMode === 'grid') {
      handleViewInvoice(invoice)
    }
  }

  const handleRegisterPayment = (invoice: Invoice) => {
    setPaymentInvoice({
      ...invoice,
      remainingAmount: invoice.amount - invoice.paidAmount
    })
    setIsPaymentModalOpen(true)
  }

  const handleSubmitPayment = async (paymentData: PaymentData) => {
    if (!paymentInvoice) return

    try {
      const response = await fetch(`/api/admin/invoices/${paymentInvoice.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      })

      if (response.ok) {
        await fetchInvoices() // Refresh data
        setIsPaymentModalOpen(false)
        setPaymentInvoice(null)
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Error registrant el pagament')
      }
    } catch (error) {
      console.error('Error registering payment:', error)
      throw error
    }
  }

  const handleDownload = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/admin/invoices/${invoice.id}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${invoice.number}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('Factura descarregada')
      } else {
        throw new Error('Error downloading invoice')
      }
    } catch (error) {
      console.error('Error downloading invoice:', error)
      toast.error('Error descarregant la factura')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Facturació</h1>
          <p className="text-slate-500 mt-1">
            Gestiona les factures i els pagaments dels clients
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInvoices}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} strokeWidth={1.5} />
            Actualitzar
          </button>

          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Grid className="h-4 w-4" strokeWidth={1.5} />
              Targetes
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'table'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <List className="h-4 w-4" strokeWidth={1.5} />
              Taula
            </button>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Nova Factura
          </button>
        </div>
      </div>

      {/* Stats */}
      <InvoiceStats data={statsData} isLoading={isLoading} />

      {/* Filters */}
      <InvoiceFilters
        filters={filters}
        onChange={setFilters}
        resultsCount={filteredInvoices.length}
      />

      {/* Content */}
      <div className="flex gap-6">
        {/* Main content */}
        <div className={cn('flex-1', isPreviewOpen && viewMode === 'grid' && 'lg:mr-96')}>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="animate-pulse space-y-3">
                      <div className="flex justify-between">
                        <div className="h-4 bg-slate-200 rounded w-24"></div>
                        <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                      </div>
                      <div className="h-3 bg-slate-200 rounded w-32"></div>
                      <div className="h-8 bg-slate-200 rounded w-20"></div>
                    </div>
                  </div>
                ))
              ) : (
                filteredInvoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    onView={handleViewInvoice}
                    onDownload={handleDownload}
                    onRegisterPayment={handleRegisterPayment}
                    isSelected={selectedInvoice?.id === invoice.id}
                  />
                ))
              )}
            </div>
          ) : (
            <InvoiceTable
              invoices={filteredInvoices}
              selectedInvoiceId={selectedInvoice?.id}
              onSelectInvoice={handleSelectInvoice}
              onViewInvoice={handleViewInvoice}
              onDownloadInvoice={handleDownload}
              onRegisterPayment={handleRegisterPayment}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Preview Panel */}
        {viewMode === 'grid' && (
          <InvoicePreviewPanel
            invoice={previewInvoice}
            isOpen={isPreviewOpen}
            onClose={() => {
              setIsPreviewOpen(false)
              setPreviewInvoice(null)
            }}
            onDownload={handleDownload}
            onRegisterPayment={handleRegisterPayment}
          />
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        invoice={paymentInvoice}
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false)
          setPaymentInvoice(null)
        }}
        onSubmit={handleSubmitPayment}
      />
    </div>
  )
}