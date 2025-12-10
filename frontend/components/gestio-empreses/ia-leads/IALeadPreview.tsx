// components/gestio-empreses/ia-leads/IALeadPreview.tsx
'use client'

import { useState } from 'react'
import {
  Building2,
  Users,
  MapPin,
  Phone,
  Mail,
  Globe,
  Linkedin,
  Star,
  StarHalf,
  CheckCircle,
  XCircle,
  Download,
  Save,
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
  Target,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GeneratedLead } from '@/lib/gestio-empreses/ia-lead-actions'
import { saveGeneratedLeads } from '@/lib/gestio-empreses/ia-lead-actions'

interface IALeadPreviewProps {
  generationId: string
  leads: GeneratedLead[]
  userId: string
  onSaved?: () => void
}

export function IALeadPreview({ generationId, leads, userId, onSaved }: IALeadPreviewProps) {
  const [selectedLeads, setSelectedLeads] = useState<string[]>(
    leads.filter(lead => lead.score >= 70).map(lead => lead.id)
  )
  const [saving, setSaving] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const toggleLead = (leadId: string) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  const toggleAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(leads.map(lead => lead.id))
    }
  }

  const handleSave = async () => {
    if (selectedLeads.length === 0) return

    setSaving(true)
    try {
      const leadsToSave = leads.filter(lead => selectedLeads.includes(lead.id))
      await saveGeneratedLeads(generationId, leadsToSave, userId)
      if (onSaved) onSaved()
    } catch (error) {
      console.error('Error guardant leads:', error)
    } finally {
      setSaving(false)
    }
  }

  const getScoreStars = (score: number) => {
    const stars = []
    const fullStars = Math.floor(score / 20)
    const hasHalfStar = score % 20 >= 10

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" strokeWidth={1.5} />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-amber-400 text-amber-400" strokeWidth={1.5} />)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-slate-300" strokeWidth={1.5} />)
    }

    return stars
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200'
      case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'LOW': return 'text-slate-600 bg-slate-50 border-slate-200'
      default: return 'text-slate-600 bg-slate-50 border-slate-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH': return AlertTriangle
      case 'MEDIUM': return Target
      case 'LOW': return Zap
      default: return Target
    }
  }

  const filteredLeads = showAll ? leads : leads.filter(lead => lead.score >= 70)

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">Previsualització de leads</h3>
            <p className="text-sm text-slate-500">
              {leads.length} leads generats • {selectedLeads.length} seleccionats
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAll(!showAll)}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
                showAll
                  ? 'bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              {showAll ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
              {showAll ? 'Amagar qualitat baixa' : 'Mostrar tots'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedLeads.length === leads.length}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-slate-700">Seleccionar tots</span>
          </label>

          <button
            onClick={handleSave}
            disabled={selectedLeads.length === 0 || saving}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
              'bg-purple-600 text-white hover:bg-purple-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {saving ? (
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
      </div>

      <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
        {filteredLeads.map((lead) => {
          const PriorityIcon = getPriorityIcon(lead.priority)
          const isSelected = selectedLeads.includes(lead.id)

          return (
            <div
              key={lead.id}
              className={cn(
                'p-6 transition-colors',
                isSelected ? 'bg-purple-50 border-l-4 border-l-purple-500' : 'hover:bg-slate-50'
              )}
            >
              <div className="flex items-start gap-4">
                <label className="flex items-center pt-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleLead(lead.id)}
                    className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                </label>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">{lead.companyName}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {getScoreStars(lead.score)}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{lead.score}%</span>
                        <div className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
                          getPriorityColor(lead.priority)
                        )}>
                          <PriorityIcon className="h-3 w-3" strokeWidth={1.5} />
                          {lead.priority}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Building2 className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                        <span>{lead.sector}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                        <span>{lead.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                        <span>{lead.employees} empleats</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                        <span className="font-medium text-slate-900">{lead.contactName}</span>
                        <span>•</span>
                        <a href={`mailto:${lead.contactEmail}`} className="text-purple-600 hover:text-purple-700">
                          {lead.contactEmail}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                        <a href={`tel:${lead.contactPhone}`} className="text-purple-600 hover:text-purple-700">
                          {lead.contactPhone}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        {lead.website && (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                          >
                            <Globe className="h-4 w-4" strokeWidth={1.5} />
                            Web
                          </a>
                        )}
                        {lead.linkedin && (
                          <a
                            href={lead.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                          >
                            <Linkedin className="h-4 w-4" strokeWidth={1.5} />
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">Raonament IA:</span> {lead.reasoning}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredLeads.length === 0 && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Target className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
          </div>
          <h4 className="font-medium text-slate-900 mb-1">No hi ha leads amb puntuació alta</h4>
          <p className="text-sm text-slate-500 mb-3">
            Prova a mostrar tots els leads o ajustar els criteris de generació.
          </p>
          <button
            onClick={() => setShowAll(true)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Mostrar tots els leads
          </button>
        </div>
      )}
    </div>
  )
}