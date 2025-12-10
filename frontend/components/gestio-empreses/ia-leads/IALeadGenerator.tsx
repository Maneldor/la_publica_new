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
  Cpu
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdvancedCriteria } from './AdvancedCriteria'
import { generateLeadsWithAI, AIModel, GenerationCriteria, GeneratedLead } from '@/lib/gestio-empreses/ia-lead-actions'

interface IALeadGeneratorProps {
  onGenerated: (generationId: string, leads: GeneratedLead[], warning?: string) => void
  userId: string
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

const modelOptions: { value: AIModel; label: string; description: string; icon: string; badge?: string; cost?: string }[] = [
  {
    value: 'deepseek-chat',
    label: 'DeepSeek Chat',
    description: 'General - Ultra econòmic',
    icon: '🟡',
    badge: 'Per defecte',
    cost: '~$0.001/lead'
  },
  {
    value: 'deepseek-reasoner',
    label: 'DeepSeek Pro',
    description: 'Raonament complex',
    icon: '🟠',
    badge: 'Avançat',
    cost: '~$0.002/lead'
  },
  {
    value: 'gemini',
    label: 'Gemini',
    description: 'Backup - Multimodal',
    icon: '🔵',
    cost: '~$0.005/lead'
  },
]

export function IALeadGenerator({ onGenerated, userId }: IALeadGeneratorProps) {
  const [isPending, startTransition] = useTransition()
  const [model, setModel] = useState<AIModel>('deepseek-chat')
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
        const result = await generateLeadsWithAI(criteria, model, userId)
        onGenerated(result.generationId, result.leads, result.warning)
      } catch (error) {
        console.error('Error generant leads:', error)
      }
    })
  }

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
        {/* Selecció de model */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <Cpu className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
            Model IA
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {modelOptions.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setModel(m.value)}
                className={cn(
                  'p-3 rounded-lg border text-left transition-all relative',
                  model === m.value
                    ? 'border-purple-300 bg-purple-50 ring-2 ring-purple-200'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                {m.badge && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-medium bg-green-500 text-white rounded-full">
                    {m.badge}
                  </span>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <span>{m.icon}</span>
                  <span className="font-medium text-slate-900">{m.label}</span>
                </div>
                <p className="text-xs text-slate-500 mb-1">{m.description}</p>
                {m.cost && (
                  <p className="text-xs text-green-600 font-medium">{m.cost}</p>
                )}
              </button>
            ))}
          </div>

          {/* Informació de cost per model seleccionat */}
          {model === 'deepseek' && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <span className="font-medium">DeepSeek:</span> Fins a 20x més econòmic que OpenAI/Anthropic.
                Cost estimat: ~$0.003 per 10 leads vs $0.05 amb altres models.
              </p>
            </div>
          )}

          {model !== 'deepseek' && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Consell:</span> DeepSeek ofereix qualitat similar amb cost molt menor.
                <button
                  type="button"
                  onClick={() => setModel('deepseek')}
                  className="ml-2 text-amber-700 underline hover:text-amber-900"
                >
                  Provar DeepSeek
                </button>
              </p>
            </div>
          )}
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
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="">Selecciona un sector...</option>
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
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="">Qualsevol mida</option>
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
            className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
              className="px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
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