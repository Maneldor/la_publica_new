'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Building2, Mail, Phone, Calendar, User,
  RefreshCw, Search, ArrowLeft, CheckCircle,
  Clock, XCircle, Eye, ExternalLink, CreditCard
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getEmpresasCollaboradores,
  EmpresaCollaboradora,
  EmpresaCollaboradoraStats
} from '@/lib/admin/actions/empreses-pendents-actions'
import { toast } from 'sonner'
import Link from 'next/link'

// Configuració d'estats
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  PUBLISHED: { label: 'Activa', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  APPROVED: { label: 'Aprovada', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  PENDING: { label: 'Pendent', color: 'bg-amber-100 text-amber-700', icon: Clock },
  INACTIVE: { label: 'Inactiva', color: 'bg-slate-100 text-slate-700', icon: XCircle },
  SUSPENDED: { label: 'Suspesa', color: 'bg-red-100 text-red-700', icon: XCircle },
  REJECTED: { label: 'Rebutjada', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function EmpresaCollaboradoresPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [empreses, setEmpreses] = useState<EmpresaCollaboradora[]>([])
  const [stats, setStats] = useState<EmpresaCollaboradoraStats>({ total: 0, actives: 0, pendents: 0, inactives: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Verificar permisos
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    const role = session.user?.role as string
    if (!['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(role)) {
      router.push('/gestio')
      toast.error('No tens permisos per accedir a aquesta pàgina')
    }
  }, [session, status, router])

  // Carregar dades
  const loadData = async () => {
    setLoading(true)
    try {
      const result = await getEmpresasCollaboradores()
      if (result.success) {
        setEmpreses(result.data || [])
        if (result.stats) setStats(result.stats)
      }
    } catch (error) {
      console.error('Error carregant dades:', error)
      toast.error('Error carregant dades')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) loadData()
  }, [session])

  // Filtrar per cerca i estat
  const filteredEmpreses = empreses.filter(empresa => {
    const matchesSearch = !searchTerm ||
      empresa.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empresa.cif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empresa.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empresa.leadContactName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || empresa.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/gestio" className="flex items-center gap-1 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Tornar al Dashboard
        </Link>
        <span>/</span>
        <span className="text-slate-700">Empreses Col·laboradores</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Empreses Col·laboradores</h1>
          <p className="text-sm text-slate-500 mt-1">
            Empreses registrades a partir de leads convertits
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
          Actualitzar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Actives</p>
              <p className="text-2xl font-semibold text-green-600 mt-1">{stats.actives}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" strokeWidth={1.5} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pendents</p>
              <p className="text-2xl font-semibold text-amber-600 mt-1">{stats.pendents}</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Inactives</p>
              <p className="text-2xl font-semibold text-slate-600 mt-1">{stats.inactives}</p>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg">
              <XCircle className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cercar per empresa, CIF, email, contacte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
        >
          <option value="all">Tots els estats</option>
          <option value="PUBLISHED">Actives</option>
          <option value="PENDING">Pendents</option>
          <option value="INACTIVE">Inactives</option>
          <option value="SUSPENDED">Suspeses</option>
        </select>
      </div>

      {/* Taula d'empreses */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Propietari</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pla</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Estat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Gestor Origen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data Registre</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Accions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEmpreses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p>{searchTerm ? 'No s\'han trobat empreses' : 'No hi ha empreses col·laboradores registrades'}</p>
                  </td>
                </tr>
              ) : (
                filteredEmpreses.map(empresa => {
                  const statusConfig = STATUS_CONFIG[empresa.status] || STATUS_CONFIG.PENDING
                  const StatusIcon = statusConfig.icon

                  return (
                    <tr key={empresa.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900">{empresa.companyName}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            {empresa.cif && <span>CIF: {empresa.cif}</span>}
                            {empresa.sector && <span>· {empresa.sector}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {empresa.owner ? (
                          <div className="text-sm">
                            <p className="text-slate-900">{empresa.owner.name || '-'}</p>
                            <a href={`mailto:${empresa.owner.email}`} className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {empresa.owner.email}
                            </a>
                            <div className="flex items-center gap-1 mt-1">
                              {empresa.owner.isActive ? (
                                <span className="text-xs text-green-600 flex items-center gap-0.5">
                                  <CheckCircle className="h-3 w-3" /> Actiu
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500 flex items-center gap-0.5">
                                  <XCircle className="h-3 w-3" /> Inactiu
                                </span>
                              )}
                              {!empresa.owner.isEmailVerified && (
                                <span className="text-xs text-amber-600 ml-2">· No verificat</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Sense propietari</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {empresa.planName ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                            <CreditCard className="h-3 w-3" />
                            {empresa.planName}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", statusConfig.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {empresa.leadAssignedTo ? (
                          <span className="text-sm text-slate-700">{empresa.leadAssignedTo.name || empresa.leadAssignedTo.email}</span>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(empresa.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/usuaris/${empresa.owner?.id || empresa.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            Veure
                          </Link>
                          <Link
                            href={`/empresa/${empresa.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resum */}
      {filteredEmpreses.length > 0 && (
        <p className="text-sm text-slate-500 text-center">
          Mostrant {filteredEmpreses.length} empreses col·laboradores
        </p>
      )}
    </div>
  )
}
