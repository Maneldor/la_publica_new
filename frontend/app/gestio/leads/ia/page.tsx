// app/gestio/leads/ia/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Sparkles, CheckCircle, AlertCircle } from 'lucide-react'

import { PageHeader } from '@/components/gestio-empreses/shared/PageHeader'
import { IALeadStats } from '@/components/gestio-empreses/ia-leads/IALeadStats'
import { IALeadGenerator } from '@/components/gestio-empreses/ia-leads/IALeadGenerator'
import { IALeadHistory } from '@/components/gestio-empreses/ia-leads/IALeadHistory'
import { IALeadPreview } from '@/components/gestio-empreses/ia-leads/IALeadPreview'
import { IALeadChart } from '@/components/gestio-empreses/ia-leads/IALeadChart'
import { getIALeadStats, GeneratedLead } from '@/lib/gestio-empreses/ia-lead-actions'

export default function AILeadsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [generatedLeads, setGeneratedLeads] = useState<GeneratedLead[]>([])
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null)

  const userId = session?.user?.id

  const loadStats = async () => {
    if (!userId) {
      setStatsLoading(false)
      return
    }

    try {
      const data = await getIALeadStats(userId)
      setStats(data)
    } catch (error) {
      console.error('Error carregant estadístiques:', error)
      // Establir estadístiques per defecte en cas d'error
      setStats({
        totalGenerated: 0,
        totalQualified: 0,
        qualificationRate: 0,
        highPriority: 0,
        avgScore: 0,
        creditsRemaining: 50,
        creditsUsed: 0,
        monthlyLimit: 50,
      })
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && userId) {
      loadStats()
    } else if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [userId, status, router])

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

    loadStats()
  }

  const handleSaved = () => {
    setCurrentGenerationId(null)
    setGeneratedLeads([])
    loadStats()

    // Mostrar missatge d'èxit temporal
    setSaveMessage({
      type: 'success',
      text: 'Leads guardats correctament! Pots veure\'ls a la secció de Leads.'
    })

    // Eliminar missatge després de 5 segons
    setTimeout(() => {
      setSaveMessage(null)
    }, 5000)
  }

  // Verificar autenticació
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregant...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Sessió no vàlida</h2>
        <p className="text-gray-600 mb-4">Cal iniciar sessió per accedir a aquesta pàgina</p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Iniciar sessió
        </button>
      </div>
    )
  }

  // Verificar rol d'accés
  const userRole = session.user.role
  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_COMERCIAL', 'CRM_CONTINGUT', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'GESTOR_ESTANDARD']

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Accés denegat</h2>
        <p className="text-gray-600 mb-4">No tens permisos per accedir a aquesta funcionalitat</p>
        <button
          onClick={() => router.push('/gestio')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Tornar al Dashboard
        </button>
      </div>
    )
  }

  // Verificar que tenim userId abans de renderitzar components
  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error d'identificació</h2>
        <p className="text-gray-600 mb-4">No s'ha pogut obtenir la informació de l'usuari</p>
        <button
          onClick={() => {
            router.push('/login')
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Tornar a iniciar sessió
        </button>
      </div>
    )
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
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          saveMessage.type === 'success'
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
      {!statsLoading && stats && (
        <IALeadStats stats={stats} />
      )}

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
        />
      )}

      {/* Gràfic de rendiment - amplada completa */}
      <IALeadChart userId={userId} />

      {/* Historial de generacions - amplada completa */}
      <IALeadHistory
        userId={userId}
        onGenerated={handleGenerated}
      />
    </div>
  )
}