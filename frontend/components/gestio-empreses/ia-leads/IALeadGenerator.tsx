// components/gestio-empreses/ia-leads/IALeadGenerator.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  Sparkles,
  Building2,
  MapPin,
  Users,
  Tag,
  Hash,
  Loader2,
  Bot
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdvancedCriteria } from './AdvancedCriteria'
import { generateLeadsWithAI, GenerationCriteria, GeneratedLead } from '@/lib/gestio-empreses/ia-lead-actions'
import { LeadsAIConfig } from '@/lib/gestio-empreses/actions/ai-config-actions'

interface IALeadGeneratorProps {
  onGenerated: (generationId: string, leads: GeneratedLead[], warning?: string) => void
  userId: string
  leadsConfig: LeadsAIConfig
}

const sectorOptions = [
  { value: 'TECHNOLOGY', label: 'Tecnologia' },
  { value: 'FINANCE', label: 'Finances' },
  { value: 'RETAIL', label: 'Comerç al detall' },
  { value: 'MARKETING', label: 'Màrqueting' },
  { value: 'CONSTRUCTION', label: 'Construcció' },
  { value: 'LOGISTICS', label: 'Logística' },
  { value: 'HEALTH', label: 'Salut' },
  { value: 'EDUCATION', label: 'Educació' },
  { value: 'HOSPITALITY', label: 'Hospitalitat' },
  { value: 'CONSULTING', label: 'Consultoria' },
]

const sizeOptions = [
  { value: '1-10', label: '1-10 empleats' },
  { value: '11-50', label: '11-50 empleats' },
  { value: '51-200', label: '51-200 empleats' },
  { value: '201-500', label: '201-500 empleats' },
  { value: '500+', label: '500+ empleats' },
]

const quantityOptions = [
  { value: 3, label: '3 leads' },
  { value: 5, label: '5 leads' },
  { value: 10, label: '10 leads' },
  { value: 15, label: '15 leads' },
  { value: 20, label: '20 leads' },
]

const providerIcons: Record<string, string> = {
  'ANTHROPIC': '🟣',
  'OPENAI': '🟢',
  'GEMINI': '🔵',
  'DEEPSEEK': '🟡'
}

export function IALeadGenerator({ onGenerated, userId, leadsConfig }: IALeadGeneratorProps) {
  const [isPending, startTransition] = useTransition()
  const [sector, setSector] = useState('')
  const [location, setLocation] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [quantity, setQuantity] = useState(5)
  const [keywords, setKeywords] = useState('')
  const [advancedCriteria, setAdvancedCriteria] = useState<{
    minRevenue?: number
    maxRevenue?: number
    foundedAfter?: number
    technologies?: string[]
    excludeExisting?: boolean
  }>({})

  const handleGenerate = () => {
    if (!sector) return

    const criteria: GenerationCriteria = {
      sector,
      location: location || undefined,
      companySize: companySize || undefined,
      quantity,
      keywords: keywords || undefined,
      ...advancedCriteria,
    }

    startTransition(async () => {
      try {
        // Usar el model configurat per l'admin
        const result = await generateLeadsWithAI(criteria, leadsConfig.modelId, userId)
        onGenerated(result.generationId, result.leads, result.warning)
      } catch (error) {
        console.error('Error generant leads:', error)
      }
    })
  }

  const providerIcon = providerIcons[leadsConfig.providerType] || '🤖'

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-xl border border-purple-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-100">
          <Sparkles className="h-5 w-5 text-purple-600" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Generador de Leads amb IA</h2>
          <p className="text-sm text-slate-500">Defineix els criteris per trobar empreses potencials</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Indicador del model configurat */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <Bot className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
          <span className="text-sm text-slate-700">
            Model: <span className="font-medium">{providerIcon} {leadsConfig.modelDisplayName}</span>
            <span className="text-slate-400 mx-2">|</span>
            <span className="text-slate-500">{leadsConfig.providerName}</span>
          </span>
          <span className="text-xs text-slate-400 ml-auto">
            Configurat per l'administrador
          </span>
        </div>

        {/* Camps principals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sector */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Building2 className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
              Sector *
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="" className="text-slate-500">Selecciona un sector...</option>
              {sectorOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Ubicació */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <MapPin className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
              Ubicació
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Barcelona, Catalunya"
              className="w-full px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Mida empresa */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Users className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
              Mida empresa
            </label>
            <select
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className="w-full px-3 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="" className="text-slate-500">Qualsevol mida</option>
              {sizeOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Paraules clau */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <Tag className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
            Paraules clau
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Ex: innovació, sostenibilitat, digital, cloud"
            className="w-full px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Criteris avançats */}
        <AdvancedCriteria
          values={advancedCriteria}
          onChange={setAdvancedCriteria}
        />

        {/* Quantitat i botó */}
        <div className="flex items-end justify-between pt-2">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Hash className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
              Quantitat
            </label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="px-3 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              {quantityOptions.map((q) => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!sector || isPending}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all',
              'bg-gradient-to-r from-purple-600 to-blue-600 text-white',
              'hover:from-purple-700 hover:to-blue-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'shadow-lg shadow-purple-200'
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                Generant...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                Generar leads
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
