'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getModuleById } from '@/lib/constants/modules'
import {
  Heart,
  Flame,
  FileText,
  BookOpen,
  Plane,
  Triangle,
  Clock,
  Eye,
  Lock,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// Importar els mòduls reals
import { AgraïmentsModule } from '@/app/dashboard/agenda/components/modules/AgraïmentsModule'
import { DesafiamentModule } from '@/app/dashboard/agenda/components/modules/DesafiamentModule'
import { ConclusionsModule } from '@/app/dashboard/agenda/components/modules/ConclusionsModule'
import { LecturesModule } from '@/app/dashboard/agenda/components/modules/LecturesModule'
import { ViatgesModule } from '@/app/dashboard/agenda/components/modules/ViatgesModule'
import { TrianglesModule } from '@/app/dashboard/agenda/components/modules/TrianglesModule'
import { CapsulaModule } from '@/app/dashboard/agenda/components/modules/CapsulaModule'
import { VisualitzacionsModule } from '@/app/dashboard/agenda/components/modules/VisualitzacionsModule'
import { DiariPrivatModule } from '@/app/dashboard/agenda/components/modules/DiariPrivatModule'
import { ContactsModule } from '@/app/dashboard/agenda/components/modules/ContactsModule'

// Mapa d'icones
const ICON_MAP: Record<string, React.ElementType> = {
  Heart,
  Flame,
  FileText,
  BookOpen,
  Plane,
  Triangle,
  Clock,
  Eye,
  Lock,
  Users,
}

// Colors per mòdul
const COLOR_MAP: Record<string, { icon: string; bg: string }> = {
  gratitude: { icon: 'text-pink-500', bg: 'bg-pink-50' },
  challenge: { icon: 'text-orange-500', bg: 'bg-orange-50' },
  conclusions: { icon: 'text-indigo-500', bg: 'bg-indigo-50' },
  readings: { icon: 'text-teal-500', bg: 'bg-teal-50' },
  travels: { icon: 'text-cyan-500', bg: 'bg-cyan-50' },
  triangles: { icon: 'text-purple-500', bg: 'bg-purple-50' },
  capsule: { icon: 'text-amber-500', bg: 'bg-amber-50' },
  visualizations: { icon: 'text-rose-500', bg: 'bg-rose-50' },
  diary: { icon: 'text-gray-500', bg: 'bg-gray-50' },
  contacts: { icon: 'text-emerald-500', bg: 'bg-emerald-50' },
}

interface ModuleCardProps {
  moduleId: string
}

export function ModuleCard({ moduleId }: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const module = getModuleById(moduleId)

  if (!module) return null

  const Icon = ICON_MAP[module.icon] || Heart
  const colors = COLOR_MAP[moduleId] || { icon: 'text-gray-500', bg: 'bg-gray-50' }

  // Renderitzar el contingut del mòdul segons l'ID
  const renderModuleContent = () => {
    switch (moduleId) {
      case 'gratitude':
        return <AgraïmentsModule />
      case 'challenge':
        return <DesafiamentModule />
      case 'conclusions':
        return <ConclusionsModule />
      case 'readings':
        return <LecturesModule />
      case 'travels':
        return <ViatgesModule />
      case 'triangles':
        return <TrianglesModule />
      case 'capsule':
        return <CapsulaModule />
      case 'visualizations':
        return <VisualitzacionsModule />
      case 'diary':
        return <DiariPrivatModule />
      case 'contacts':
        return <ContactsModule />
      default:
        return (
          <div className="text-center py-4 text-gray-500">
            Mòdul no disponible
          </div>
        )
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle
          icon={<Icon className={`w-5 h-5 ${colors.icon}`} />}
          action={
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
          }
        >
          {module.name}
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="module-content">
            {renderModuleContent()}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
