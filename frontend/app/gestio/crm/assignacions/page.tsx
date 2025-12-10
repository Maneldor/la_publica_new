// app/gestio/crm/assignacions/page.tsx
'use client'

import { useState, useEffect, useTransition } from 'react'
import { useSession } from 'next-auth/react'
import { Users, RefreshCw, Wand2, Download } from 'lucide-react'
import { AssignmentStats } from '@/components/gestio-empreses/assignacions/AssignmentStats'
import { UnassignedLeads } from '@/components/gestio-empreses/assignacions/UnassignedLeads'
import { GestorCard } from '@/components/gestio-empreses/assignacions/GestorCard'
import { GestorLeadsList } from '@/components/gestio-empreses/assignacions/GestorLeadsList'
import {
  getAssignmentStats,
  getUnassignedLeads,
  getGestorsWithStats,
  assignLeadsToGestor,
  autoAssignLeads
} from '@/lib/gestio-empreses/assignment-actions'

export default function AssignacionsPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<any>(null)
  const [unassigned, setUnassigned] = useState<any[]>([])
  const [gestors, setGestors] = useState<any[]>([])
  const [selectedGestorId, setSelectedGestorId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  // Obtener userId real de la sesión
  const currentUserId = session?.user?.id || ''

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [statsData, unassignedData, gestorsData] = await Promise.all([
        getAssignmentStats(),
        getUnassignedLeads(),
        getGestorsWithStats(),
      ])
      setStats(statsData)
      setUnassigned(unassignedData)
      setGestors(gestorsData)

      // Seleccionar primer gestor si no n'hi ha cap seleccionat
      if (!selectedGestorId && gestorsData.length > 0) {
        setSelectedGestorId(gestorsData[0].id)
      }
    } catch (error) {
      console.error('Error carregant dades:', error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (session?.user) {
      loadData()
    }
  }, [session])

  // Verificar autenticació i càrrega
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  // Verificar permisos - solo admin, admin_gestio y roles superiores pueden acceder
  if (!['ADMIN', 'ADMIN_GESTIO', 'SUPER_ADMIN', 'CRM_COMERCIAL'].includes(session.user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Accés denegat</h2>
          <p className="text-slate-500">
            No tens permisos per accedir a aquesta pàgina d'assignacions.
          </p>
        </div>
      </div>
    )
  }

  const handleAssign = (leadIds: string[], gestorId: string) => {
    console.log('🔍 handleAssign called:', { leadIds, gestorId, currentUserId })
    startTransition(async () => {
      try {
        console.log('🔍 Before assignLeadsToGestor')
        await assignLeadsToGestor(leadIds, gestorId, currentUserId)
        console.log('🔍 After assignLeadsToGestor - success')
        loadData()
      } catch (error) {
        console.error('❌ Error in handleAssign:', error)
        alert(`Error assignant leads: ${error.message || error}`)
      }
    })
  }

  const handleAutoAssign = () => {
    startTransition(async () => {
      const result = await autoAssignLeads(currentUserId)
      alert(result.message)
      loadData()
    })
  }

  const selectedGestor = gestors.find((g) => g.id === selectedGestorId)

  const defaultStats = {
    totalLeads: 0,
    unassignedLeads: 0,
    teamLoad: 0,
    avgPerGestor: 0,
    reassignedToday: 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-slate-600" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Assignacions</h1>
            <p className="text-sm text-slate-500">
              Gestiona l'assignació de leads i empreses als gestors comercials
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {unassigned.length > 0 && (
            <button
              onClick={handleAutoAssign}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100"
            >
              <Wand2 className="h-4 w-4" strokeWidth={1.5} />
              Auto-assignar
            </button>
          )}
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            Actualitzar
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
            <Download className="h-4 w-4" strokeWidth={1.5} />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats */}
      <AssignmentStats stats={stats || defaultStats} />

      {/* Unassigned leads */}
      <UnassignedLeads
        leads={unassigned}
        gestors={gestors.map((g) => ({
          id: g.id,
          name: g.name,
          email: g.email,
          load: g.load,
        }))}
        onAssign={handleAssign}
      />

      {/* Gestors and leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gestors list */}
        <div className="space-y-3">
          <h2 className="font-semibold text-slate-900">Gestors Comercials</h2>
          {gestors.map((gestor) => (
            <GestorCard
              key={gestor.id}
              gestor={gestor}
              isSelected={selectedGestorId === gestor.id}
              onClick={() => setSelectedGestorId(gestor.id)}
            />
          ))}
        </div>

        {/* Selected gestor leads */}
        <div className="lg:col-span-2">
          {selectedGestor && (
            <GestorLeadsList
              gestorName={selectedGestor.name || selectedGestor.email}
              leads={selectedGestor.leads}
              gestors={gestors.map((g) => ({
                id: g.id,
                name: g.name,
                email: g.email,
                load: g.load,
              }))}
              currentGestorId={selectedGestorId!}
              onSuccess={loadData}
              userId={currentUserId}
            />
          )}
        </div>
      </div>
    </div>
  )
}