'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Calendar, Target, Zap, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TYPOGRAPHY, LAYOUTS } from '@/lib/design-system'

interface ProgressData {
  streak: number
  habitsCompleted: number
  habitsTotal: number
  habitPercentage: number
  weekReflections: number
}

export function ProgressStats({ userId }: { userId: string }) {
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/dashboard/avui')
        if (res.ok) {
          const data = await res.json()
          setProgress(data.progress)
        }
      } catch (error) {
        console.error('Error fetching progress:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProgress()
  }, [userId])

  // Detectar si todas las estadísticas son 0
  const allZero = (progress?.streak || 0) === 0 &&
                  (progress?.habitsCompleted || 0) === 0 &&
                  (progress?.weekReflections || 0) === 0

  if (loading) {
    return (
      <div className={LAYOUTS.fourColumns}>
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent>
              <div className="h-20 bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      label: 'Ratxa de dies',
      value: progress?.streak || 0,
      unit: progress?.streak === 1 ? 'dia' : 'dies',
      icon: Zap,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      description: 'Dies consecutius completant hàbits'
    },
    {
      label: 'Hàbits d\'avui',
      value: progress?.habitsCompleted || 0,
      unit: `de ${progress?.habitsTotal || 0}`,
      icon: Target,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      description: `${progress?.habitPercentage || 0}% completat`
    },
    {
      label: 'Reflexions setmanals',
      value: progress?.weekReflections || 0,
      unit: 'aquesta setmana',
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      description: 'Moments de reflexió'
    },
    {
      label: 'Tendència',
      value: progress?.habitPercentage || 0,
      unit: '%',
      icon: TrendingUp,
      color: progress && progress.habitPercentage >= 75 ? 'text-green-500' :
             progress && progress.habitPercentage >= 50 ? 'text-yellow-500' : 'text-red-500',
      bgColor: progress && progress.habitPercentage >= 75 ? 'bg-green-50' :
               progress && progress.habitPercentage >= 50 ? 'bg-yellow-50' : 'bg-red-50',
      description: progress && progress.habitPercentage >= 75 ? 'Excel·lent!' :
                   progress && progress.habitPercentage >= 50 ? 'Bé' : 'Necessita millora'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle icon={<TrendingUp className="w-5 h-5 text-indigo-500" />}>
          El teu progrés
        </CardTitle>
      </CardHeader>

      <CardContent>
        {allZero && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            <div>
              <p className="font-medium text-gray-900">Comença avui el teu camí!</p>
              <p className={TYPOGRAPHY.body}>Defineix hàbits i objectius per veure el teu progrés aquí.</p>
            </div>
          </div>
        )}

        <div className={LAYOUTS.fourColumns}>
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  <span className={TYPOGRAPHY.body}>{stat.unit}</span>
                </div>
                <p className={TYPOGRAPHY.label}>{stat.label}</p>
                <p className={TYPOGRAPHY.small}>{stat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}