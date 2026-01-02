'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Settings,
  Loader2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AVAILABLE_MODULES } from '@/lib/constants/modules'

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

interface ModulesSelectorProps {
  enabledModules: string[]
}

export function ModulesSelector({ enabledModules: initialEnabled }: ModulesSelectorProps) {
  const router = useRouter()
  const [enabledModules, setEnabledModules] = useState<string[]>(initialEnabled)
  const [loadingModule, setLoadingModule] = useState<string | null>(null)

  const toggleModule = async (moduleId: string) => {
    const isCurrentlyEnabled = enabledModules.includes(moduleId)
    setLoadingModule(moduleId)

    try {
      const response = await fetch('/api/user/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId,
          enabled: !isCurrentlyEnabled,
        }),
      })

      if (response.ok) {
        if (isCurrentlyEnabled) {
          setEnabledModules(prev => prev.filter(id => id !== moduleId))
        } else {
          setEnabledModules(prev => [...prev, moduleId])
        }
        // Refrescar la pàgina per mostrar els canvis
        router.refresh()
      }
    } catch (error) {
      console.error('Error toggling module:', error)
    } finally {
      setLoadingModule(null)
    }
  }

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <CardTitle
          icon={<Settings className="w-5 h-5 text-gray-500" />}
        >
          Mòduls opcionals
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-1">
          {AVAILABLE_MODULES.map(module => {
            const Icon = ICON_MAP[module.icon] || Heart
            const isEnabled = enabledModules.includes(module.id)
            const isLoading = loadingModule === module.id

            return (
              <button
                key={module.id}
                onClick={() => toggleModule(module.id)}
                disabled={isLoading}
                className={`
                  w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all
                  ${isEnabled
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'hover:bg-gray-50 text-gray-600'
                  }
                  ${isLoading ? 'opacity-50 cursor-wait' : ''}
                `}
              >
                {/* Checkbox visual */}
                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                  ${isEnabled
                    ? 'bg-primary border-primary'
                    : 'border-gray-300'
                  }
                `}>
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 text-white animate-spin" />
                  ) : isEnabled ? (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                </div>

                {/* Icona del mòdul */}
                <Icon className={`w-4 h-4 flex-shrink-0 ${isEnabled ? 'text-primary' : 'text-gray-400'}`} />

                {/* Nom del mòdul */}
                <span className="text-sm font-medium truncate">
                  {module.name}
                </span>
              </button>
            )
          })}
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Activa els mòduls que vulguis veure
        </p>
      </CardContent>
    </Card>
  )
}
