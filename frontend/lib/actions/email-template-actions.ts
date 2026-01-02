'use server'

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ============================================
// TYPES
// ============================================

export interface EmailTemplateData {
  id: string
  name: string
  displayName: string
  description: string | null
  subject: string
  preheader: string | null
  title: string
  subtitle: string | null
  body: string
  buttonText: string | null
  buttonUrl: string | null
  footer: string | null
  templateType: string
  isActive: boolean
  styles: Record<string, string> | null
  variables: string[] | null
  lastSentAt: Date | null
  sentCount: number
  createdAt: Date
  updatedAt: Date
}

export interface EmailTemplateUpdateData {
  displayName?: string
  description?: string | null
  subject?: string
  preheader?: string | null
  title?: string
  subtitle?: string | null
  body?: string
  buttonText?: string | null
  buttonUrl?: string | null
  footer?: string | null
  templateType?: string
  isActive?: boolean
  styles?: Record<string, string> | null
  variables?: string[] | null
}

// ============================================
// DEFAULT TEMPLATES
// ============================================

const defaultEmailTemplates = [
  {
    name: 'benvinguda',
    displayName: 'Benvinguda',
    description: 'Email de benvinguda per a nous usuaris',
    subject: 'Benvingut/da a La Pública, {{nom}}!',
    preheader: 'Gràcies per unir-te a la nostra comunitat de professionals públics',
    title: 'Benvingut a La Pública',
    subtitle: 'La teva comunitat de professionals públics',
    body: `Hola {{nom}},

Gràcies per registrar-te. Estem encantats de donar-te la benvinguda a la nostra comunitat.

La Pública és una plataforma exclusiva per a empleats públics on podràs:

• Descobrir ofertes especials pensades per a tu
• Connectar amb altres professionals del sector públic
• Accedir a recursos i formació exclusiva
• Participar en esdeveniments i networking

El primer pas és verificar el teu compte per accedir a totes les funcionalitats.`,
    buttonText: 'Verificar el meu compte',
    buttonUrl: '{{verificacioUrl}}',
    footer: `Si tens cap dubte, pots contactar-nos a suport@lapublica.cat

La Pública - Connectant professionals públics
Barcelona, Catalunya

Aquest email ha estat enviat a {{email}}`,
    templateType: 'transactional',
    variables: ['nom', 'email', 'verificacioUrl'],
  },
  {
    name: 'verificacio-email',
    displayName: 'Verificació d\'Email',
    description: 'Email per verificar l\'adreça de correu',
    subject: 'Verifica el teu email - La Pública',
    preheader: 'Fes clic al botó per verificar el teu compte',
    title: 'Verifica el teu email',
    subtitle: null,
    body: `Hola {{nom}},

Per completar el teu registre, necessitem que verifiquis la teva adreça de correu electrònic.

Fes clic al botó següent per verificar el teu compte:`,
    buttonText: 'Verificar email',
    buttonUrl: '{{verificacioUrl}}',
    footer: `Si no has sol·licitat aquest email, pots ignorar-lo.

Aquest enllaç caducarà en 24 hores.`,
    templateType: 'transactional',
    variables: ['nom', 'email', 'verificacioUrl'],
  },
  {
    name: 'restablir-contrasenya',
    displayName: 'Restablir Contrasenya',
    description: 'Email per restablir la contrasenya',
    subject: 'Restableix la teva contrasenya - La Pública',
    preheader: 'Has sol·licitat restablir la teva contrasenya',
    title: 'Restableix la teva contrasenya',
    subtitle: null,
    body: `Hola {{nom}},

Hem rebut una sol·licitud per restablir la contrasenya del teu compte a La Pública.

Si has fet aquesta sol·licitud, fes clic al botó següent per crear una nova contrasenya:`,
    buttonText: 'Restablir contrasenya',
    buttonUrl: '{{resetUrl}}',
    footer: `Si no has sol·licitat aquest canvi, ignora aquest email. La teva contrasenya no canviarà.

Aquest enllaç caducarà en 1 hora per seguretat.`,
    templateType: 'transactional',
    variables: ['nom', 'email', 'resetUrl'],
  },
  {
    name: 'notificacio',
    displayName: 'Notificació General',
    description: 'Template genèric per a notificacions',
    subject: '{{titol}} - La Pública',
    preheader: '{{previsualitzacio}}',
    title: '{{titol}}',
    subtitle: null,
    body: `Hola {{nom}},

{{missatge}}`,
    buttonText: '{{textBoto}}',
    buttonUrl: '{{url}}',
    footer: `Aquesta és una notificació automàtica de La Pública.

Pots configurar les teves preferències de notificació al teu perfil.`,
    templateType: 'notification',
    variables: ['nom', 'titol', 'previsualitzacio', 'missatge', 'textBoto', 'url'],
  },
  {
    name: 'nova-oferta',
    displayName: 'Nova Oferta',
    description: 'Alerta quan hi ha una nova oferta disponible',
    subject: 'Nova oferta de {{empresa}}! 🎉',
    preheader: '{{titolOferta}} - Descompte del {{descompte}}%',
    title: 'Nova oferta disponible',
    subtitle: 'Una oferta que pot interessar-te',
    body: `Hola {{nom}},

{{empresa}} ha publicat una nova oferta exclusiva per a membres de La Pública:

📦 {{titolOferta}}
💰 Descompte: {{descompte}}%
📅 Vàlid fins: {{dataFi}}

{{descripcioOferta}}`,
    buttonText: 'Veure oferta',
    buttonUrl: '{{ofertaUrl}}',
    footer: `No et perdis les millors ofertes per a empleats públics.

Pots desactivar les alertes d'ofertes al teu perfil.`,
    templateType: 'marketing',
    variables: ['nom', 'empresa', 'titolOferta', 'descripcioOferta', 'descompte', 'dataFi', 'ofertaUrl'],
  },
  {
    name: 'empresa-publicada',
    displayName: 'Empresa Publicada',
    description: 'Notificació quan una empresa és publicada',
    subject: 'La teva empresa ja és visible a La Pública! 🎉',
    preheader: '{{nomEmpresa}} ja forma part de la nostra comunitat',
    title: 'Enhorabona! La teva empresa ja és visible',
    subtitle: '{{nomEmpresa}}',
    body: `Hola {{nom}},

Ens complau informar-te que {{nomEmpresa}} ja està publicada i visible a La Pública.

Ara els professionals públics podran:
• Descobrir la teva empresa
• Veure les teves ofertes exclusives
• Contactar amb tu directament

Següents passos recomanats:
1. Completa el perfil de la teva empresa
2. Publica la teva primera oferta
3. Configura les notificacions`,
    buttonText: 'Veure la meva empresa',
    buttonUrl: '{{empresaUrl}}',
    footer: `Si tens cap dubte, el nostre equip de suport està a la teva disposició.

Gràcies per confiar en La Pública.`,
    templateType: 'transactional',
    variables: ['nom', 'nomEmpresa', 'empresaUrl'],
  },
]

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Get all email templates
 */
export async function getEmailTemplates(): Promise<{ success: boolean; data?: EmailTemplateData[]; error?: string }> {
  try {
    const templates = await prisma.emailTemplateContent.findMany({
      orderBy: { displayName: 'asc' },
    })

    return {
      success: true,
      data: templates.map(t => ({
        ...t,
        styles: t.styles as Record<string, string> | null,
        variables: t.variables as string[] | null,
      })),
    }
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return { success: false, error: 'Error al carregar els templates' }
  }
}

/**
 * Get a single email template by name
 */
export async function getEmailTemplate(name: string): Promise<{ success: boolean; data?: EmailTemplateData; error?: string }> {
  try {
    const template = await prisma.emailTemplateContent.findUnique({
      where: { name },
    })

    if (!template) {
      return { success: false, error: 'Template no trobat' }
    }

    return {
      success: true,
      data: {
        ...template,
        styles: template.styles as Record<string, string> | null,
        variables: template.variables as string[] | null,
      },
    }
  } catch (error) {
    console.error('Error fetching email template:', error)
    return { success: false, error: 'Error al carregar el template' }
  }
}

/**
 * Update an email template
 */
export async function updateEmailTemplate(
  name: string,
  data: EmailTemplateUpdateData
): Promise<{ success: boolean; data?: EmailTemplateData; error?: string }> {
  try {
    // Build update data, handling JSON fields specially
    const updateData: Prisma.EmailTemplateContentUpdateInput = {
      updatedAt: new Date(),
    }

    // Copy non-JSON fields
    if (data.displayName !== undefined) updateData.displayName = data.displayName
    if (data.description !== undefined) updateData.description = data.description
    if (data.subject !== undefined) updateData.subject = data.subject
    if (data.preheader !== undefined) updateData.preheader = data.preheader
    if (data.title !== undefined) updateData.title = data.title
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle
    if (data.body !== undefined) updateData.body = data.body
    if (data.buttonText !== undefined) updateData.buttonText = data.buttonText
    if (data.buttonUrl !== undefined) updateData.buttonUrl = data.buttonUrl
    if (data.footer !== undefined) updateData.footer = data.footer
    if (data.templateType !== undefined) updateData.templateType = data.templateType
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    // Handle JSON fields - use Prisma.JsonNull for null values
    if (data.styles !== undefined) {
      updateData.styles = data.styles === null ? Prisma.JsonNull : data.styles
    }
    if (data.variables !== undefined) {
      updateData.variables = data.variables === null ? Prisma.JsonNull : data.variables
    }

    const template = await prisma.emailTemplateContent.update({
      where: { name },
      data: updateData,
    })

    revalidatePath('/admin/componentes')

    return {
      success: true,
      data: {
        ...template,
        styles: template.styles as Record<string, string> | null,
        variables: template.variables as string[] | null,
      },
    }
  } catch (error) {
    console.error('Error updating email template:', error)
    return { success: false, error: 'Error al actualitzar el template' }
  }
}

/**
 * Initialize default email templates (run once)
 */
export async function initializeEmailTemplates(): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    let count = 0

    for (const template of defaultEmailTemplates) {
      await prisma.emailTemplateContent.upsert({
        where: { name: template.name },
        update: {}, // Don't overwrite existing templates
        create: {
          name: template.name,
          displayName: template.displayName,
          description: template.description,
          subject: template.subject,
          preheader: template.preheader,
          title: template.title,
          subtitle: template.subtitle,
          body: template.body,
          buttonText: template.buttonText,
          buttonUrl: template.buttonUrl,
          footer: template.footer,
          templateType: template.templateType,
          // Handle JSON field - only set if not null
          ...(template.variables ? { variables: template.variables } : {}),
          // styles is omitted to use database default (null)
        },
      })
      count++
    }

    revalidatePath('/admin/componentes')

    return { success: true, count }
  } catch (error) {
    console.error('Error initializing email templates:', error)
    return { success: false, error: 'Error al inicialitzar els templates' }
  }
}

/**
 * Reset a template to default values
 */
export async function resetEmailTemplate(name: string): Promise<{ success: boolean; data?: EmailTemplateData; error?: string }> {
  try {
    const defaultTemplate = defaultEmailTemplates.find(t => t.name === name)

    if (!defaultTemplate) {
      return { success: false, error: 'Template per defecte no trobat' }
    }

    const template = await prisma.emailTemplateContent.update({
      where: { name },
      data: {
        displayName: defaultTemplate.displayName,
        description: defaultTemplate.description,
        subject: defaultTemplate.subject,
        preheader: defaultTemplate.preheader,
        title: defaultTemplate.title,
        subtitle: defaultTemplate.subtitle,
        body: defaultTemplate.body,
        buttonText: defaultTemplate.buttonText,
        buttonUrl: defaultTemplate.buttonUrl,
        footer: defaultTemplate.footer,
        templateType: defaultTemplate.templateType,
        // Handle JSON field - use Prisma.JsonNull for null, or the array value
        variables: defaultTemplate.variables ? defaultTemplate.variables : Prisma.JsonNull,
        styles: Prisma.JsonNull, // Reset styles to null
        updatedAt: new Date(),
      },
    })

    revalidatePath('/admin/componentes')

    return {
      success: true,
      data: {
        ...template,
        styles: template.styles as Record<string, string> | null,
        variables: template.variables as string[] | null,
      },
    }
  } catch (error) {
    console.error('Error resetting email template:', error)
    return { success: false, error: 'Error al restaurar el template' }
  }
}

// Note: renderEmailPreview is defined in the EmailContentEditor component
// since it's a client-side only function and doesn't need server access

/**
 * Preview an email with sample data (helper - not a server action)
 * This function is re-exported but should be used client-side only
 */
export async function renderEmailPreviewAsync(template: EmailTemplateData, customData?: Record<string, string>): Promise<{
  subject: string
  body: string
  title: string
  subtitle: string | null
  buttonText: string | null
  footer: string | null
}> {
  const defaultPreviewData: Record<string, string> = {
    nom: 'Joan Garcia',
    email: 'joan.garcia@exemple.cat',
    empresa: 'Tech Solutions BCN',
    nomEmpresa: 'La Meva Empresa SL',
    verificacioUrl: 'https://lapublica.cat/verificar/abc123',
    resetUrl: 'https://lapublica.cat/reset/xyz789',
    url: 'https://lapublica.cat/detall',
    empresaUrl: 'https://lapublica.cat/empresa/la-meva-empresa',
    ofertaUrl: 'https://lapublica.cat/oferta/super-descompte',
    titol: 'Títol de la Notificació',
    previsualitzacio: 'Text de previsualització',
    missatge: 'Aquest és el contingut del missatge de notificació.',
    textBoto: 'Veure més',
    titolOferta: 'Descompte exclusiu en serveis',
    descripcioOferta: 'Aprofita aquest descompte exclusiu per a membres de La Pública.',
    descompte: '25',
    dataFi: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ca-ES'),
  }

  const data = { ...defaultPreviewData, ...customData }

  const replaceVariables = (text: string | null): string => {
    if (!text) return ''
    let result = text
    Object.entries(data).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    return result
  }

  return {
    subject: replaceVariables(template.subject),
    body: replaceVariables(template.body),
    title: replaceVariables(template.title),
    subtitle: replaceVariables(template.subtitle),
    buttonText: replaceVariables(template.buttonText),
    footer: replaceVariables(template.footer),
  }
}
