'use client'

import { useState, useEffect } from 'react'
import { Search, FileText, Users, Calendar, CreditCard, Building2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MessageTemplate } from '@/lib/gestio-empreses/message-actions'
import { getMessageTemplates, applyTemplate } from '@/lib/gestio-empreses/message-actions'

interface MessageTemplatesProps {
  selectedTemplate: MessageTemplate | null
  onTemplateSelect: (template: MessageTemplate | null) => void
  onApplyTemplate: (subject: string, content: string) => void
  variables?: Record<string, string>
  className?: string
}

const categoryConfig = {
  'Seguiment': {
    label: 'Seguiment de Leads',
    icon: Users,
    color: 'blue'
  },
  'Projectes': {
    label: 'Gestió de Projectes',
    icon: Building2,
    color: 'green'
  },
  'Reunions': {
    label: 'Reunions i Cites',
    icon: Calendar,
    color: 'purple'
  },
  'Facturació': {
    label: 'Facturació i Pagaments',
    icon: CreditCard,
    color: 'orange'
  },
  'Intern': {
    label: 'Comunicació Interna',
    icon: Users,
    color: 'slate'
  }
}

export function MessageTemplates({
  selectedTemplate,
  onTemplateSelect,
  onApplyTemplate,
  variables = {},
  className
}: MessageTemplatesProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Carregar plantilles
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true)
      try {
        const allTemplates = await getMessageTemplates()
        setTemplates(allTemplates)
      } catch (error) {
        console.error('Error carregant plantilles:', error)
        setTemplates([])
      }
      setIsLoading(false)
    }

    loadTemplates()
  }, [])

  // Filtrar plantilles
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = !selectedCategory || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Agrupar per categoria
  const templatesByCategory = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, MessageTemplate[]>)

  const categories = Object.keys(templatesByCategory)

  const handleApplyTemplate = async (template: MessageTemplate) => {
    const { subject, content } = await applyTemplate(template, variables)
    onApplyTemplate(subject, content)
    onTemplateSelect(template)
  }

  const getVariablePreview = (template: MessageTemplate) => {
    if (template.variables.length === 0) return null

    const missingVars = template.variables.filter(variable => !variables[variable])

    return (
      <div className="mt-2 text-xs">
        <p className="text-slate-500 font-medium">Variables necessàries:</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {template.variables.map(variable => (
            <span
              key={variable}
              className={cn(
                'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                variables[variable]
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              )}
            >
              {variable}
            </span>
          ))}
        </div>
        {missingVars.length > 0 && (
          <p className="text-red-600 mt-1">
            Falten variables: {missingVars.join(', ')}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={cn('bg-white border border-slate-200 rounded-lg', className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
          <h3 className="font-medium text-slate-900">Plantilles de Missatges</h3>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar plantilles..."
            className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtres per categoria */}
        <div className="flex flex-wrap gap-1 mt-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-full transition-colors',
              !selectedCategory
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            Totes
          </button>
          {Object.entries(categoryConfig).map(([category, config]) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              className={cn(
                'flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full transition-colors',
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {React.createElement(config.icon, {
                className: "w-3 h-3",
                strokeWidth: 1.5
              })}
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contingut */}
      <div className="max-h-96 overflow-auto">
        {isLoading ? (
          <div className="p-6 text-center text-slate-500">
            Carregant plantilles...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No s'han trobat plantilles
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {categories.map(category => {
              const config = categoryConfig[category as keyof typeof categoryConfig]
              const categoryTemplates = templatesByCategory[category]

              return (
                <div key={category}>
                  {/* Capçalera de categoria */}
                  <div className="flex items-center gap-2 mb-2">
                    {config && React.createElement(config.icon, {
                      className: "w-4 h-4 text-slate-600",
                      strokeWidth: 1.5
                    })}
                    <h4 className="font-medium text-slate-900">
                      {config?.label || category}
                    </h4>
                    <span className="text-xs text-slate-500">
                      ({categoryTemplates.length})
                    </span>
                  </div>

                  {/* Plantilles de la categoria */}
                  <div className="space-y-2">
                    {categoryTemplates.map(template => (
                      <div
                        key={template.id}
                        className={cn(
                          'border border-slate-200 rounded-lg p-3 transition-all cursor-pointer',
                          selectedTemplate?.id === template.id
                            ? 'border-blue-300 bg-blue-50'
                            : 'hover:border-slate-300 hover:bg-slate-50'
                        )}
                        onClick={() => onTemplateSelect(template)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-slate-900 mb-1">
                              {template.name}
                            </h5>
                            <p className="text-sm text-slate-600 mb-2">
                              <span className="font-medium">Assumpte:</span> {template.subject}
                            </p>
                            <p className="text-sm text-slate-500 line-clamp-2">
                              {template.content.substring(0, 120)}
                              {template.content.length > 120 && '...'}
                            </p>

                            {/* Variables */}
                            {getVariablePreview(template)}
                          </div>

                          {/* Botó d'aplicar */}
                          <div className="flex gap-2 ml-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleApplyTemplate(template)
                              }}
                              disabled={template.variables.some(v => !variables[v])}
                              className={cn(
                                'flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                                template.variables.some(v => !variables[v])
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              )}
                            >
                              Aplicar
                              <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}