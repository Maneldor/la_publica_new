// utils/placeholder-utils.ts - Utilidades para manejo de placeholders en recursos

import {
  PlaceholderType,
  Placeholder,
  LeadData,
  PlaceholderConfig,
  ContentPreview,
  DEFAULT_PLACEHOLDERS
} from '../types/resources'

// Función para extraer placeholders de un texto
export function extractPlaceholdersFromContent(content: string): string[] {
  const placeholderRegex = /\{\{([^}]+)\}\}/g
  const matches = content.match(placeholderRegex)

  if (!matches) return []

  return matches.map(match => match.replace(/\{\{|\}\}/g, '').trim())
}

// Función para validar placeholders requeridos
export function validateRequiredPlaceholders(
  content: string,
  placeholders: Placeholder[]
): { valid: boolean; missing: string[] } {
  const usedPlaceholders = extractPlaceholdersFromContent(content)
  const requiredPlaceholders = placeholders
    .filter(p => p.required)
    .map(p => p.key)

  const missing = requiredPlaceholders.filter(
    required => !usedPlaceholders.includes(required)
  )

  return {
    valid: missing.length === 0,
    missing
  }
}

// Función para generar valores del sistema
export function getSystemPlaceholderValues(userId?: string, userName?: string): Record<string, any> {
  const now = new Date()

  return {
    'system.date': now.toLocaleDateString('ca-ES'),
    'system.datetime': now.toLocaleString('ca-ES'),
    'system.year': now.getFullYear(),
    'system.month': now.toLocaleString('ca-ES', { month: 'long' }),
    'system.day': now.getDate(),
    'system.user.name': userName || 'Gestor',
    'system.user.id': userId || '',
    'system.company.name': 'La Pública Solucions',
    'system.company.phone': '+34 XXX XXX XXX',
    'system.company.email': 'info@lapublica.cat',
    'system.company.website': 'www.lapublica.cat',
    'system.time': now.toLocaleTimeString('ca-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// Función para generar valores de empresa desde lead
export function getCompanyPlaceholderValues(lead: LeadData): Record<string, any> {
  return {
    'company.name': lead.companyName || '',
    'company.industry': lead.industry || 'No especificat',
    'company.revenue': lead.estimatedRevenue
      ? new Intl.NumberFormat('ca-ES', {
          style: 'currency',
          currency: 'EUR'
        }).format(lead.estimatedRevenue)
      : 'No especificat',
    'company.priority': lead.priority || 'MEDIUM',
    'company.status': lead.status || 'NEW',
    'company.created': lead.createdAt.toLocaleDateString('ca-ES'),
    'company.updated': lead.updatedAt.toLocaleDateString('ca-ES')
  }
}

// Función para generar valores de contacto desde lead
export function getContactPlaceholderValues(lead: LeadData): Record<string, any> {
  return {
    'contact.name': lead.contactName || '',
    'contact.email': lead.email || '',
    'contact.phone': lead.phone || 'No disponible',
    'contact.first_name': lead.contactName
      ? lead.contactName.split(' ')[0]
      : '',
    'contact.last_name': lead.contactName
      ? lead.contactName.split(' ').slice(1).join(' ')
      : ''
  }
}

// Función principal para generar configuración de placeholders
export function generatePlaceholderConfig(
  lead: LeadData,
  userId?: string,
  userName?: string,
  customValues?: Record<string, any>
): PlaceholderConfig {
  return {
    leadId: lead.id,
    systemValues: getSystemPlaceholderValues(userId, userName),
    companyValues: getCompanyPlaceholderValues(lead),
    contactValues: getContactPlaceholderValues(lead),
    customValues: customValues || {}
  }
}

// Función para procesar contenido con placeholders
export function processContentWithPlaceholders(
  content: string,
  config: PlaceholderConfig
): ContentPreview {
  let processedContent = content
  const placeholdersUsed: string[] = []
  const missingPlaceholders: string[] = []
  const warnings: string[] = []

  // Obtener todos los placeholders del contenido
  const contentPlaceholders = extractPlaceholdersFromContent(content)

  // Combinar todos los valores disponibles
  const allValues = {
    ...config.systemValues,
    ...config.companyValues,
    ...config.contactValues,
    ...config.customValues
  }

  // Procesar cada placeholder
  contentPlaceholders.forEach(placeholder => {
    const value = allValues[placeholder]

    if (value !== undefined && value !== null && value !== '') {
      // Reemplazar el placeholder con el valor
      const regex = new RegExp(`\\{\\{\\s*${placeholder}\\s*\\}\\}`, 'g')
      processedContent = processedContent.replace(regex, String(value))
      placeholdersUsed.push(placeholder)
    } else {
      // Placeholder sin valor
      missingPlaceholders.push(placeholder)

      // Mantener el placeholder visible pero marcado como faltante
      const regex = new RegExp(`\\{\\{\\s*${placeholder}\\s*\\}\\}`, 'g')
      processedContent = processedContent.replace(
        regex,
        `[${placeholder.toUpperCase()}]`
      )

      warnings.push(`Placeholder '${placeholder}' no tiene valor asignado`)
    }
  })

  return {
    originalContent: content,
    processedContent,
    placeholdersUsed,
    missingPlaceholders,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

// Función para obtener placeholders disponibles según el tipo
export function getAvailablePlaceholders(types?: PlaceholderType[]): Placeholder[] {
  if (!types) {
    // Retornar todos los placeholders por defecto
    return Object.values(DEFAULT_PLACEHOLDERS).flat()
  }

  return types.reduce((acc, type) => {
    return [...acc, ...DEFAULT_PLACEHOLDERS[type]]
  }, [] as Placeholder[])
}

// Función para validar valor de placeholder
export function validatePlaceholderValue(
  value: any,
  placeholder: Placeholder
): { valid: boolean; error?: string } {
  if (placeholder.required && (value === undefined || value === null || value === '')) {
    return { valid: false, error: 'Aquest camp és obligatori' }
  }

  if (value && placeholder.validation) {
    const { pattern, minLength, maxLength } = placeholder.validation
    const stringValue = String(value)

    if (pattern && !new RegExp(pattern).test(stringValue)) {
      return { valid: false, error: 'El format no és vàlid' }
    }

    if (minLength && stringValue.length < minLength) {
      return {
        valid: false,
        error: `Mínim ${minLength} caràcters requerits`
      }
    }

    if (maxLength && stringValue.length > maxLength) {
      return {
        valid: false,
        error: `Màxim ${maxLength} caràcters permesos`
      }
    }
  }

  return { valid: true }
}

// Función para crear placeholder personalizado
export function createCustomPlaceholder(
  key: string,
  label: string,
  description?: string,
  required = false
): Placeholder {
  return {
    key,
    label,
    type: PlaceholderType.CUSTOM,
    description,
    required
  }
}

// Función helper para formatear textos
export function formatPlaceholderText(text: string): string {
  if (!text) return ''

  // Capitalizar primera letra
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Función para obtener preview rápido sin procesar todo
export function getQuickPreview(content: string, maxLength = 100): string {
  // Extraer primeras líneas sin placeholders para preview rápido
  const lines = content.split('\n').filter(line => line.trim())
  let preview = lines[0] || ''

  // Limpiar placeholders básicos para preview
  preview = preview.replace(/\{\{[^}]+\}\}/g, '[...]')

  if (preview.length > maxLength) {
    preview = preview.substring(0, maxLength) + '...'
  }

  return preview
}

// Función para detectar tipo de contenido basado en patrones
export function detectContentType(content: string): {
  type: 'email' | 'document' | 'speech' | 'guide' | 'checklist' | 'unknown'
  confidence: number
} {
  const patterns = {
    email: [/assumpte:|subject:/i, /@/, /salutacions|saludos|cordialmente/i],
    document: [/document|informe|proposta/i, /secció|section/i],
    speech: [/bon dia|bona tarda/i, /presentar|explicar/i, /públic|audiència/i],
    guide: [/pas \d+|step \d+/i, /procediment|processo/i, /segueixin|sigan/i],
    checklist: [/\[\s*\]|\[ \]/, /verificar|comprovar/i, /completat|realizado/i]
  }

  let bestMatch = { type: 'unknown' as const, confidence: 0 }

  Object.entries(patterns).forEach(([type, typePatterns]) => {
    let matches = 0
    typePatterns.forEach(pattern => {
      if (pattern.test(content)) matches++
    })

    const confidence = matches / typePatterns.length
    if (confidence > bestMatch.confidence) {
      bestMatch = {
        type: type as 'email' | 'document' | 'speech' | 'guide' | 'checklist',
        confidence
      }
    }
  })

  return bestMatch
}

// Constantes útiles
export const PLACEHOLDER_REGEX = /\{\{([^}]+)\}\}/g
export const PLACEHOLDER_PREFIX = '{{'
export const PLACEHOLDER_SUFFIX = '}}'

// Función para escapar caracteres especiales en placeholders
export function escapePlaceholder(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}