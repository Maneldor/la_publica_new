// components/gestio-empreses/ia-leads/AdvancedCriteria.tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Euro, Calendar, Code, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdvancedCriteriaProps {
  values: {
    minRevenue?: number
    maxRevenue?: number
    foundedAfter?: number
    technologies?: string[]
    excludeExisting?: boolean
  }
  onChange: (values: AdvancedCriteriaProps['values']) => void
}

const technologyOptions = [
  'Cloud', 'AI/ML', 'SaaS', 'E-commerce', 'Mobile',
  'IoT', 'Blockchain', 'Cybersecurity', 'Big Data', 'DevOps'
]

export function AdvancedCriteria({ values, onChange }: AdvancedCriteriaProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleTechnology = (tech: string) => {
    const current = values.technologies || []
    const updated = current.includes(tech)
      ? current.filter((t) => t !== tech)
      : [...current, tech]
    onChange({ ...values, technologies: updated })
  }

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
          <span className="text-sm font-medium text-slate-700">Criteris avançats</span>
          {(values.minRevenue || values.maxRevenue || values.foundedAfter || values.technologies?.length) && (
            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
              Actius
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 bg-white">
          {/* Facturació */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Euro className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
              Facturació estimada
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="Mínim €"
                  value={values.minRevenue || ''}
                  onChange={(e) => onChange({ ...values, minRevenue: Number(e.target.value) || undefined })}
                  className="w-full px-3 py-2 text-sm text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Màxim €"
                  value={values.maxRevenue || ''}
                  onChange={(e) => onChange({ ...values, maxRevenue: Number(e.target.value) || undefined })}
                  className="w-full px-3 py-2 text-sm text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Any de fundació */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Calendar className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
              Fundada després de
            </label>
            <input
              type="number"
              placeholder="Ex: 2015"
              min={1900}
              max={new Date().getFullYear()}
              value={values.foundedAfter || ''}
              onChange={(e) => onChange({ ...values, foundedAfter: Number(e.target.value) || undefined })}
              className="w-full px-3 py-2 text-sm text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Tecnologies */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Code className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
              Tecnologies
            </label>
            <div className="flex flex-wrap gap-2">
              {technologyOptions.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleTechnology(tech)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-full border transition-colors',
                    values.technologies?.includes(tech)
                      ? 'bg-purple-100 border-purple-300 text-purple-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          {/* Excloure existents */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={values.excludeExisting || false}
              onChange={(e) => onChange({ ...values, excludeExisting: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-slate-700">Excloure empreses ja existents al CRM</span>
          </label>
        </div>
      )}
    </div>
  )
}