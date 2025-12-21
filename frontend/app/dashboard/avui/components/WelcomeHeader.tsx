'use client'

import { Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/design-system'

const frasesDelDia = [
  { text: "La constància és la clau de l'èxit.", author: "Anònim" },
  { text: "El secret d'avançar és començar.", author: "Mark Twain" },
  { text: "No comptis els dies, fes que els dies comptin.", author: "Muhammad Ali" },
  { text: "L'èxit és la suma de petits esforços repetits dia rere dia.", author: "Robert Collier" },
  { text: "La millor manera de predir el futur és crear-lo.", author: "Peter Drucker" },
  { text: "Cada dia és una nova oportunitat per canviar la teva vida.", author: "Anònim" },
  { text: "Sigues el canvi que vols veure al món.", author: "Mahatma Gandhi" },
  { text: "El secret de progressar és començar. El secret de començar és dividir les teves tasques complexes i aclaparadores en petites tasques manejables, i després començar per la primera.", author: "Mark Twain" },
]

interface WelcomeHeaderProps {
  userName: string
}

export function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  const fraseDelDia = frasesDelDia[dayOfYear % frasesDelDia.length]

  const formatDate = () => {
    return today.toLocaleDateString('ca-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getGreeting = () => {
    const hour = today.getHours()
    if (hour < 12) return 'Bon dia'
    if (hour < 18) return 'Bona tarda'
    return 'Bona nit'
  }

  return (
    <div className="space-y-4">
      {/* Saludo y fecha */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className={TYPOGRAPHY.pageTitleLg}>
            {getGreeting()}, {userName}!
          </h1>
          <p className={`${TYPOGRAPHY.pageSubtitle} capitalize`}>{formatDate()}</p>
        </div>
      </div>

      {/* Frase del día */}
      <Card className="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border-amber-100">
        <CardContent padding="default">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm font-medium text-amber-700 mb-2">Frase del dia</p>
              <p className="text-amber-900 italic leading-relaxed">
                "{fraseDelDia.text}"
              </p>
              <p className="text-orange-600 text-sm mt-2 font-medium">
                — {fraseDelDia.author}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}