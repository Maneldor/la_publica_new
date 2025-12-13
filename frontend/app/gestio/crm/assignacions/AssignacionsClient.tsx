'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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

interface AssignacionsClientProps {
    initialStats: any
    initialUnassigned: any[]
    initialGestors: any[]
    currentUserId: string
}

export function AssignacionsClient({
    initialStats,
    initialUnassigned,
    initialGestors,
    currentUserId
}: AssignacionsClientProps) {
    const router = useRouter()
    const [stats, setStats] = useState<any>(initialStats)
    const [unassigned, setUnassigned] = useState<any[]>(initialUnassigned)
    const [gestors, setGestors] = useState<any[]>(initialGestors)

    // Seleccionar primer gestor per defecte si n'hi ha
    const [selectedGestorId, setSelectedGestorId] = useState<string | null>(
        initialGestors.length > 0 ? initialGestors[0].id : null
    )

    const [isLoading, setIsLoading] = useState(false)
    const [isPending, startTransition] = useTransition()

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
            router.refresh()

            // Seleccionar primer gestor si no n'hi ha cap seleccionat i hem carregat dades
            if (!selectedGestorId && gestorsData.length > 0) {
                setSelectedGestorId(gestorsData[0].id)
            }
        } catch (error) {
            console.error('Error carregant dades:', error)
        }
        setIsLoading(false)
    }

    const handleAssign = (leadIds: string[], gestorId: string) => {
        console.log('🔍 handleAssign called:', { leadIds, gestorId, currentUserId })
        startTransition(async () => {
            try {
                console.log('🔍 Before assignLeadsToGestor')
                await assignLeadsToGestor(leadIds, gestorId, currentUserId)
                console.log('🔍 After assignLeadsToGestor - success')
                loadData()
            } catch (error: any) {
                console.error('❌ Error in handleAssign:', error)
                alert(`Error assignant leads: ${error.message || error}`)
            }
        })
    }

    const handleAutoAssign = () => {
        startTransition(async () => {
            const result = await autoAssignLeads()
            alert(`Assignats: ${result.assigned} de ${result.total}`)
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
                            leads={selectedGestor.leads || []}
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
