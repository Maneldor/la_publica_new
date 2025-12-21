'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Check, Heart, Users, Briefcase, DollarSign, TrendingUp, Smile } from 'lucide-react'
import { TriangleIcon } from '@/components/icons'

interface LifeArea {
  id: string
  date: string
  health: number
  relationships: number
  career: number
  finances: number
  growth: number
  fun: number
  notes?: string
}

interface TrianglesModuleProps {
  onClose?: () => void
}

const AREAS = [
  { key: 'health', label: 'Salut', icon: Heart, color: 'text-red-500', bg: 'bg-red-500' },
  { key: 'relationships', label: 'Relacions', icon: Users, color: 'text-pink-500', bg: 'bg-pink-500' },
  { key: 'career', label: 'Carrera', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500' },
  { key: 'finances', label: 'Finances', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500' },
  { key: 'growth', label: 'Creixement', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500' },
  { key: 'fun', label: 'Diversió', icon: Smile, color: 'text-amber-500', bg: 'bg-amber-500' }
] as const

export function TrianglesModule({ onClose }: TrianglesModuleProps) {
  const [lifeArea, setLifeArea] = useState<LifeArea | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [values, setValues] = useState<Record<string, number>>({
    health: 5,
    relationships: 5,
    career: 5,
    finances: 5,
    growth: 5,
    fun: 5
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadLifeArea()
  }, [])

  const loadLifeArea = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const res = await fetch(`/api/agenda/life-areas?date=${today}`)
      if (res.ok) {
        const data = await res.json()
        setLifeArea(data)
        setValues({
          health: data.health,
          relationships: data.relationships,
          career: data.career,
          finances: data.finances,
          growth: data.growth,
          fun: data.fun
        })
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Error carregant àrees:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveLifeArea = async () => {
    setIsSaving(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      await fetch('/api/agenda/life-areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          ...values
        })
      })
      setHasChanges(false)
    } catch (error) {
      console.error('Error guardant àrees:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleValueChange = (key: string, value: number) => {
    setValues(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const getAverage = () => {
    const sum = Object.values(values).reduce((a, b) => a + b, 0)
    return (sum / 6).toFixed(1)
  }

  // Calcular puntos del hexágono para el gráfico
  const getHexagonPoints = () => {
    const centerX = 100
    const centerY = 100
    const maxRadius = 80

    return AREAS.map((area, index) => {
      const angle = (Math.PI / 3) * index - Math.PI / 2
      const radius = (values[area.key] / 10) * maxRadius
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      }
    })
  }

  const hexPoints = getHexagonPoints()
  const hexPath = hexPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  // Puntos del hexágono máximo (referencia)
  const maxHexPoints = AREAS.map((_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 2
    return {
      x: 100 + 80 * Math.cos(angle),
      y: 100 + 80 * Math.sin(angle)
    }
  })
  const maxHexPath = maxHexPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <TriangleIcon size="md" />
          <div>
            <h3 className="font-semibold text-gray-900">6 Triangles de la vida</h3>
            <p className="text-xs text-gray-500">Mitjana: {getAverage()}/10</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Gráfico hexagonal */}
      <div className="flex justify-center mb-4">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Líneas de referencia */}
          {[2, 4, 6, 8, 10].map((level) => {
            const levelPoints = AREAS.map((_, index) => {
              const angle = (Math.PI / 3) * index - Math.PI / 2
              const radius = (level / 10) * 80
              return {
                x: 100 + radius * Math.cos(angle),
                y: 100 + radius * Math.sin(angle)
              }
            })
            const path = levelPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
            return (
              <path
                key={level}
                d={path}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            )
          })}

          {/* Líneas radiales */}
          {maxHexPoints.map((point, i) => (
            <line
              key={i}
              x1="100"
              y1="100"
              x2={point.x}
              y2={point.y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Área del usuario */}
          <motion.path
            d={hexPath}
            fill="rgba(239, 68, 68, 0.2)"
            stroke="#ef4444"
            strokeWidth="2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Puntos */}
          {hexPoints.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="4"
              className={AREAS[i].bg}
              fill="currentColor"
            />
          ))}

          {/* Etiquetas */}
          {AREAS.map((area, index) => {
            const angle = (Math.PI / 3) * index - Math.PI / 2
            const labelRadius = 95
            const x = 100 + labelRadius * Math.cos(angle)
            const y = 100 + labelRadius * Math.sin(angle)
            return (
              <g key={area.key}>
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[10px] fill-gray-500"
                >
                  {area.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        {AREAS.map((area) => {
          const IconComponent = area.icon
          return (
            <div key={area.key} className="flex items-center gap-3">
              <IconComponent className={`w-4 h-4 ${area.color} flex-shrink-0`} />
              <div className="flex-1">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={values[area.key]}
                  onChange={(e) => handleValueChange(area.key, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
              <span className="text-sm font-medium text-gray-700 w-6 text-right">
                {values[area.key]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Guardar */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex justify-end"
        >
          <button
            onClick={saveLifeArea}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              'Guardant...'
            ) : (
              <>
                <Check className="w-4 h-4" />
                Guardar
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  )
}
