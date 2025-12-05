// components/gestio-empreses/leads/ai/LeadGeneratorForm.tsx
'use client'

import { useState } from 'react'
import {
  Sparkles,
  Search,
  Building2,
  MapPin,
  Users,
  Tag,
  Loader2,
  CheckCircle,
  Save
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SECTORS, EMPLOYEE_RANGES } from '@/components/gestio-empreses/leads/constants'
import { generateLeadsWithAI, saveGeneratedLeads } from '@/lib/gestio-empreses/ai-actions'
import { AIScoreBadge } from './AIScoreBadge'

interface GeneratedLead {
  companyName: string
  sector: string
  website?: string
  location?: string
  employeeCount?: string
  contactName?: string
  contactEmail?: string
  contactPosition?: string
  aiScore: number
  aiInsights: string
  selected?: boolean
}

export function LeadGeneratorForm() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedLeads, setGeneratedLeads] = useState<GeneratedLead[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [sector, setSector] = useState('')
  const [location, setLocation] = useState('')
  const [employeeRange, setEmployeeRange] = useState('')
  const [keywords, setKeywords] = useState('')
  const [count, setCount] = useState(5)

  const handleGenerate = async () => {
    if (!sector) {
      setError('Selecciona un sector')
      return
    }

    setIsGenerating(true)
    setError('')
    setSuccess('')
    setGeneratedLeads([])

    const result = await generateLeadsWithAI({
      sector,
      location: location || undefined,
      employeeRange: employeeRange || undefined,
      keywords: keywords || undefined,
      count,
    })

    if (result.success && result.leads) {
      setGeneratedLeads(result.leads.map(l => ({ ...l, selected: true })))
    } else {
      setError(result.error || 'Error generant leads')
    }

    setIsGenerating(false)
  }

  const toggleLeadSelection = (index: number) => {
    setGeneratedLeads(prev =>
      prev.map((lead, i) =>
        i === index ? { ...lead, selected: !lead.selected } : lead
      )
    )
  }

  const handleSave = async () => {
    const selectedLeads = generatedLeads.filter(l => l.selected)
    if (selectedLeads.length === 0) {
      setError('Selecciona almenys un lead per guardar')
      return
    }

    setIsSaving(true)
    setError('')

    const result = await saveGeneratedLeads(selectedLeads)

    if (result.success) {
      setSuccess(`${result.savedCount} leads guardats correctament`)
      setGeneratedLeads([])
    } else {
      setError(result.error || 'Error guardant leads')
    }

    setIsSaving(false)
  }

  const selectedCount = generatedLeads.filter(l => l.selected).length

  return (
    <div className="space-y-6">
      {/* Formulari de cerca */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-violet-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-violet-600" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-base font-medium text-slate-800">Generador de Leads amb IA</h2>
            <p className="text-sm text-slate-500">Defineix els criteris per trobar empreses potencials</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                Sector *
              </span>
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              {SECTORS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                Ubicació
              </span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Ex: Barcelona, Catalunya"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                Mida empresa
              </span>
            </label>
            <select
              value={employeeRange}
              onChange={(e) => setEmployeeRange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              {EMPLOYEE_RANGES.map(e => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                Paraules clau
              </span>
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Ex: innovació, sostenibilitat, digital"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quantitat
            </label>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value={5}>5 leads</option>
              <option value={10}>10 leads</option>
              <option value={15}>15 leads</option>
              <option value={20}>20 leads</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !sector}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                Generant...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" strokeWidth={1.5} />
                Generar leads
              </>
            )}
          </button>
        </div>
      </div>

      {/* Missatges */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" strokeWidth={1.5} />
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Resultats */}
      {generatedLeads.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-800">Leads generats</h3>
              <p className="text-sm text-slate-500">{selectedCount} de {generatedLeads.length} seleccionats</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving || selectedCount === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                  Guardant...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" strokeWidth={1.5} />
                  Guardar seleccionats
                </>
              )}
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {generatedLeads.map((lead, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 flex items-start gap-4 transition-colors cursor-pointer",
                  lead.selected ? "bg-violet-50/50" : "hover:bg-slate-50"
                )}
                onClick={() => toggleLeadSelection(index)}
              >
                {/* Checkbox */}
                <div className={cn(
                  "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                  lead.selected
                    ? "bg-violet-600 border-violet-600"
                    : "border-slate-300"
                )}>
                  {lead.selected && (
                    <CheckCircle className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-slate-800">{lead.companyName}</span>
                    <AIScoreBadge score={lead.aiScore} size="sm" />
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-2">
                    {lead.sector && <span>{lead.sector}</span>}
                    {lead.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" strokeWidth={1.5} />
                        {lead.location}
                      </span>
                    )}
                    {lead.employeeCount && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" strokeWidth={1.5} />
                        {lead.employeeCount}
                      </span>
                    )}
                  </div>
                  {lead.contactName && (
                    <p className="text-sm text-slate-600">
                      Contacte: {lead.contactName} {lead.contactPosition && `(${lead.contactPosition})`}
                    </p>
                  )}
                  <p className="text-sm text-slate-500 mt-2 italic">{lead.aiInsights}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}