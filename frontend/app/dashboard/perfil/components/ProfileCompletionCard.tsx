'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProfileCompletionProps {
  user: {
    firstName?: string
    lastName?: string
    nick?: string
    image?: string
    coverImage?: string
    profile?: {
      bio?: string
      headline?: string
      position?: string
      department?: string
      city?: string
      phone?: string
      website?: string
    }
    experiences?: any[]
    education?: any[]
    skills?: any[]
    languages?: any[]
    socialLinks?: any[]
  } | null
}

interface CompletionCategory {
  id: string
  label: string
  completed: number
  total: number
}

export function ProfileCompletionCard({ user }: ProfileCompletionProps) {
  const router = useRouter()

  // Calcular progrés per categories
  const categories = useMemo<CompletionCategory[]>(() => {
    if (!user) return []

    const profile = user.profile || {}

    // Informació general: nom, cognom, nick, bio, posició, departament
    const generalFields = [
      user.firstName,
      user.lastName,
      user.nick,
      profile.bio,
      profile.position,
      profile.department,
    ]
    const generalCompleted = generalFields.filter(Boolean).length

    // Experiència laboral: mínim 1, objectiu 3
    const experienceCount = Math.min(user.experiences?.length || 0, 3)

    // Foto de perfil
    const hasProfilePhoto = user.image ? 1 : 0

    // Foto de portada
    const hasCoverPhoto = user.coverImage ? 1 : 0

    // Xarxes socials: mínim 1
    const hasSocialLinks = (user.socialLinks?.length || 0) > 0 ? 1 : 0

    return [
      { id: 'general', label: 'Informació general', completed: generalCompleted, total: 6 },
      { id: 'experience', label: 'Experiència laboral', completed: experienceCount, total: 3 },
      { id: 'photo', label: 'Foto de perfil', completed: hasProfilePhoto, total: 1 },
      { id: 'cover', label: 'Foto de portada', completed: hasCoverPhoto, total: 1 },
      { id: 'social', label: 'Xarxes socials', completed: hasSocialLinks, total: 1 },
    ]
  }, [user])

  // Calcular percentatge total
  const { percentage } = useMemo(() => {
    if (categories.length === 0) return { totalCompleted: 0, totalRequired: 0, percentage: 0 }
    const completed = categories.reduce((sum, cat) => sum + cat.completed, 0)
    const required = categories.reduce((sum, cat) => sum + cat.total, 0)
    const pct = Math.round((completed / required) * 100)
    return { totalCompleted: completed, totalRequired: required, percentage: pct }
  }, [categories])

  const isComplete = percentage === 100

  // Calcular el dasharray per al cercle SVG
  const circumference = 2 * Math.PI * 45 // radi = 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Color del cercle segons el progrés
  const getProgressColor = () => {
    if (percentage >= 80) return '#10B981' // emerald-500
    if (percentage >= 50) return '#F59E0B' // amber-500
    return '#EF4444' // red-500
  }

  if (!user) return null

  return (
    <Card>
      <CardContent className="p-6">
        {/* Títol dinàmic */}
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-6">
          {isComplete ? 'Perfil completat' : 'Completa el teu Perfil'}
        </h3>

        {/* Cercle de progrés */}
        <div className="flex justify-center mb-4">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
              {/* Cercle de fons */}
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="#E5E7EB"
                strokeWidth="10"
                fill="none"
              />
              {/* Cercle de progrés */}
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke={getProgressColor()}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            {/* Percentatge al centre */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{percentage}%</span>
            </div>
          </div>
        </div>

        {/* Text "Completat" */}
        <p className="text-sm text-gray-500 text-center mb-6">Completat</p>

        {/* Llista de categories */}
        <div className="space-y-3 mb-6">
          {categories.map((category) => {
            const isCompleted = category.completed === category.total
            return (
              <div key={category.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Indicador */}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'border-2 border-gray-300'
                  }`}>
                    {isCompleted && <Check className="w-3 h-3" />}
                  </div>
                  {/* Label */}
                  <span className={`text-sm ${
                    isCompleted ? 'text-emerald-600 line-through' : 'text-gray-700'
                  }`}>
                    {category.label}
                  </span>
                </div>
                {/* Comptador */}
                <span className={`text-sm font-medium ${
                  isCompleted ? 'text-emerald-600' : 'text-gray-500'
                }`}>
                  {category.completed}/{category.total}
                </span>
              </div>
            )
          })}
        </div>

        {/* Botó */}
        {!isComplete && (
          <button
            onClick={() => router.push('/dashboard/perfil/editar')}
            className="w-full py-2.5 px-4 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Completar Perfil
          </button>
        )}

        {/* Missatge si està complet */}
        {isComplete && (
          <div className="text-center py-2">
            <span className="text-sm text-emerald-600 font-medium">
              Enhorabona! El teu perfil està complet.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
