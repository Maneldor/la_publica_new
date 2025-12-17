'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, CheckCircle, AlertCircle } from 'lucide-react'

import { PageHeader } from '@/components/gestio-empreses/shared/PageHeader'
import { IALeadStats } from '@/components/gestio-empreses/ia-leads/IALeadStats'
import { IALeadGenerator } from '@/components/gestio-empreses/ia-leads/IALeadGenerator'
import { IALeadHistory } from '@/components/gestio-empreses/ia-leads/IALeadHistory'
import { IALeadPreview } from '@/components/gestio-empreses/ia-leads/IALeadPreview'
import { IALeadChart } from '@/components/gestio-empreses/ia-leads/IALeadChart'
import { GeneratedLead, getIALeadStats } from '@/lib/gestio-empreses/ia-lead-actions'
import { LeadsAIConfig } from '@/lib/gestio-empreses/actions/ai-config-actions'

interface AILeadsClientProps {
    userId: string
    initialStats: any
    initialHistory: any[]
    initialChartData: any[]
    leadsConfig: LeadsAIConfig
}

export function AILeadsClient({
    userId,
    initialStats,
    initialHistory,
    initialChartData,
    leadsConfig
}: AILeadsClientProps) {
    const router = useRouter()
    const [stats, setStats] = useState(initialStats)
    const [generatedLeads, setGeneratedLeads] = useState<GeneratedLead[]>([])
    const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null)
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null)

    // Recargar estadísticas (ligera duplicación de lógica pero necesaria para actualizar tras generar)
    const refreshStats = async () => {
        try {
            const newStats = await getIALeadStats(userId)
            setStats(newStats)
        } catch (error) {
            console.error('Error actualitzant estadístiques:', error)
        }
    }

    const handleGenerated = (generationId: string, leads: GeneratedLead[], warning?: string) => {
        setCurrentGenerationId(generationId)
        setGeneratedLeads(leads)

        // Mostrar warning si existe
        if (warning) {
            setSaveMessage({
                type: 'warning',
                text: warning
            })

            // Eliminar mensaje después de 10 seconds para warnings importantes
            setTimeout(() => {
                setSaveMessage(null)
            }, 10000)
        } else {
            setSaveMessage(null)
        }

        refreshStats()
        // No necesitamos recargar historial explícitamente porque IALeadHistory ya lo maneja internamente 
        // o podríamos forzar un refresh si fuera necesario, pero la generación actualiza el store local mockGenerations
        // y IALeadHistory tiene su propio estado si queremos actualización inmediata.
        // Sin embargo, como IALeadHistory tiene estado local `generations`, necesitamos una forma de decirle que actualice.
        // Una opción simple es usar una key en IALeadHistory para forzar remontado, o router.refresh() 
        // pero router.refresh() recargaría toooda la página server-side.
        // Aceptable para cambios importantes.
        router.refresh()
    }

    const handleSaved = () => {
        setCurrentGenerationId(null)
        setGeneratedLeads([])
        refreshStats()

        // Mostrar missatge d'èxit temporal
        setSaveMessage({
            type: 'success',
            text: 'Leads guardats correctament! Pots veure\'ls a la secció de Leads.'
        })

        // Eliminar missatge després de 5 segons
        setTimeout(() => {
            setSaveMessage(null)
        }, 5000)

        router.refresh()
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="IA Leads Enterprise"
                description="Generador avançat amb historial i previsualització"
                icon={Sparkles}
            />

            {/* Missatge de feedback */}
            {saveMessage && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${saveMessage.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : saveMessage.type === 'warning'
                            ? 'bg-amber-50 border border-amber-200 text-amber-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                    {saveMessage.type === 'success' ? (
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    )}
                    <p className="font-medium">{saveMessage.text}</p>
                    {saveMessage.type === 'success' && (
                        <button
                            onClick={() => router.push('/gestio/leads?source=AI_PROSPECTING')}
                            className="ml-auto px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                        >
                            Veure leads guardats
                        </button>
                    )}
                </div>
            )}

            {/* Estadístiques */}
            <IALeadStats stats={stats} />

            {/* Generador o Previsualització - amplada completa */}
            {currentGenerationId && generatedLeads.length > 0 ? (
                <IALeadPreview
                    generationId={currentGenerationId}
                    leads={generatedLeads}
                    userId={userId}
                    onSaved={handleSaved}
                />
            ) : (
                <IALeadGenerator
                    onGenerated={handleGenerated}
                    userId={userId}
                    leadsConfig={leadsConfig}
                />
            )}

            {/* Gràfic de rendiment - amplada completa */}
            <IALeadChart
                userId={userId}
                initialData={initialChartData}
            />

            {/* Historial de generacions - amplada completa */}
            <IALeadHistory
                userId={userId}
                initialGenerations={initialHistory}
                onGenerated={handleGenerated}
            />
        </div>
    )
}
