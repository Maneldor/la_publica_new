'use server'

import { prismaClient } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// ============================================
// TIPUS
// ============================================

export type LeadPhase = 'GESTOR' | 'CRM' | 'ADMIN'

export interface LeadPipeline {
  id: string
  companyName: string
  cif: string | null
  sector: string | null
  contactName: string | null
  contactRole: string | null
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  city: string | null
  estimatedValue: number | null
  priority: string
  stage: string | null
  status: string
  notes: string | null
  internalNotes: string | null
  createdAt: Date
  updatedAt: Date
  assignedAt: Date | null
  assignedTo: {
    id: string
    name: string | null
    email: string
  } | null
  phase: LeadPhase
  daysInPipeline: number
  crmVerification?: any
  precontract?: any
}

export interface PipelineStats {
  total: number
  gestor: number
  crm: number
  admin: number
}

// ============================================
// FUNCIONS AUXILIARS
// ============================================

function getLeadPhase(stage: string | null): LeadPhase {
  if (['PRE_CONTRACTE', 'EN_REVISIO'].includes(stage || '')) return 'ADMIN'
  if (['PER_VERIFICAR', 'VERIFICAT'].includes(stage || '')) return 'CRM'
  return 'GESTOR'
}

function calculateDaysInPipeline(assignedAt: Date | null, createdAt: Date): number {
  const startDate = assignedAt || createdAt
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// ============================================
// VERIFICACIÓ ACCÉS
// ============================================

async function checkAdminAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { error: 'No autenticat', authorized: false }
  }

  const role = session.user.role as string
  if (!['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(role)) {
    return { error: 'No tens permisos d\'administrador', authorized: false }
  }

  return { authorized: true, userId: session.user.id, role }
}

// ============================================
// OBTENIR LEADS DEL PIPELINE (ACTIUS)
// ============================================

export async function getLeadsPipeline(phaseFilter?: LeadPhase): Promise<{
  success: boolean
  data?: LeadPipeline[]
  stats?: PipelineStats
  error?: string
}> {
  const access = await checkAdminAccess()
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    // Només stages actius (exclou NOU sense assignar, CONTRACTAT i PERDUT)
    const activeStages = ['ASSIGNAT', 'TREBALLANT', 'PER_VERIFICAR', 'VERIFICAT', 'PRE_CONTRACTE', 'EN_REVISIO']

    let stageFilter: string[] = activeStages
    if (phaseFilter === 'GESTOR') {
      stageFilter = ['ASSIGNAT', 'TREBALLANT']
    } else if (phaseFilter === 'CRM') {
      stageFilter = ['PER_VERIFICAR', 'VERIFICAT']
    } else if (phaseFilter === 'ADMIN') {
      stageFilter = ['PRE_CONTRACTE', 'EN_REVISIO']
    }

    const leads = await prismaClient.companyLead.findMany({
      where: {
        stage: { in: stageFilter },
        convertedToCompanyId: null, // No convertit encara
        status: { notIn: ['WON', 'LOST'] } // Exclou finalitzats
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { assignedAt: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    // Comptar per fase (tots els actius)
    const allLeads = await prismaClient.companyLead.findMany({
      where: {
        stage: { in: activeStages },
        convertedToCompanyId: null,
        status: { notIn: ['WON', 'LOST'] }
      },
      select: { stage: true }
    })

    const stats: PipelineStats = {
      total: allLeads.length,
      gestor: allLeads.filter(l => ['ASSIGNAT', 'TREBALLANT'].includes(l.stage || '')).length,
      crm: allLeads.filter(l => ['PER_VERIFICAR', 'VERIFICAT'].includes(l.stage || '')).length,
      admin: allLeads.filter(l => ['PRE_CONTRACTE', 'EN_REVISIO'].includes(l.stage || '')).length
    }

    const formattedLeads: LeadPipeline[] = leads.map(lead => ({
      id: lead.id,
      companyName: lead.companyName,
      cif: lead.cif,
      sector: lead.sector,
      contactName: lead.contactName,
      contactRole: lead.contactRole,
      email: lead.email,
      phone: lead.phone,
      website: lead.website,
      address: lead.address,
      city: lead.city,
      estimatedValue: lead.estimatedValue ? Number(lead.estimatedValue) : null,
      priority: lead.priority,
      stage: lead.stage,
      status: lead.status,
      notes: lead.notes,
      internalNotes: lead.internalNotes,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      assignedAt: lead.assignedAt,
      assignedTo: lead.assignedTo,
      phase: getLeadPhase(lead.stage),
      daysInPipeline: calculateDaysInPipeline(lead.assignedAt, lead.createdAt),
      crmVerification: (lead as any).crmVerification,
      precontract: (lead as any).precontract
    }))

    return { success: true, data: formattedLeads, stats }
  } catch (error) {
    console.error('Error obtenint leads pipeline:', error)
    return { success: false, error: 'Error obtenint leads del pipeline' }
  }
}

// ============================================
// ACTUALITZAR NOTES
// ============================================

export async function updateLeadAdminNotes(
  leadId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  const access = await checkAdminAccess()
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    await prismaClient.companyLead.update({
      where: { id: leadId },
      data: { internalNotes: notes, updatedAt: new Date() }
    })
    revalidatePath('/gestio/admin/empreses-pendents')
    return { success: true }
  } catch (error) {
    console.error('Error actualitzant notes:', error)
    return { success: false, error: 'Error actualitzant notes' }
  }
}

// Compatibilitat amb codi antic
export type LeadPendentRegistre = LeadPipeline
export type LeadsPendentsStats = PipelineStats
export async function getLeadsPendentsRegistre() { return getLeadsPipeline('ADMIN') }
export async function getLeadsPendentsStats() {
  const result = await getLeadsPipeline()
  return result.success ? { success: true, data: { total: result.stats?.admin || 0, perContactar: 0, contactats: 0, pagamentPendent: 0 } } : result
}

// ============================================
// OBTENIR LEAD PER ID
// ============================================

export async function getLeadById(leadId: string): Promise<{
  success: boolean
  data?: LeadPipeline
  error?: string
}> {
  const access = await checkAdminAccess()
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    const lead = await prismaClient.companyLead.findUnique({
      where: { id: leadId },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!lead) {
      return { success: false, error: 'Lead no trobat' }
    }

    const formattedLead: LeadPipeline = {
      id: lead.id,
      companyName: lead.companyName,
      cif: lead.cif,
      sector: lead.sector,
      contactName: lead.contactName,
      contactRole: lead.contactRole,
      email: lead.email,
      phone: lead.phone,
      website: lead.website,
      address: lead.address,
      city: lead.city,
      estimatedValue: lead.estimatedValue ? Number(lead.estimatedValue) : null,
      priority: lead.priority,
      stage: lead.stage,
      status: lead.status,
      notes: lead.notes,
      internalNotes: lead.internalNotes,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      assignedAt: lead.assignedAt,
      assignedTo: lead.assignedTo,
      phase: getLeadPhase(lead.stage),
      daysInPipeline: calculateDaysInPipeline(lead.assignedAt, lead.createdAt)
    }

    return { success: true, data: formattedLead }
  } catch (error) {
    console.error('Error obtenint lead:', error)
    return { success: false, error: 'Error obtenint lead' }
  }
}

// ============================================
// MARCAR LEAD COM GUANYAT
// ============================================

export async function marcarLeadGuanyat(
  leadId: string,
  companyId: string
): Promise<{ success: boolean; error?: string }> {
  const access = await checkAdminAccess()
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    await prismaClient.companyLead.update({
      where: { id: leadId },
      data: {
        status: 'WON',
        stage: 'CONTRACTAT',
        convertedToCompanyId: companyId,
        updatedAt: new Date()
      }
    })
    revalidatePath('/gestio/admin/empreses-pendents')
    revalidatePath('/gestio/admin/empreses-collaboradores')
    revalidatePath('/gestio/leads')
    return { success: true }
  } catch (error) {
    console.error('Error marcant lead com guanyat:', error)
    return { success: false, error: 'Error marcant lead com guanyat' }
  }
}

// ============================================
// EMPRESES COL·LABORADORES (LEADS CONVERTITS)
// ============================================

export interface EmpresaCollaboradora {
  id: string
  companyName: string
  cif: string | null
  sector: string | null
  status: string
  createdAt: Date
  // Dades del lead original
  leadId: string | null
  leadCompanyName: string | null
  leadContactName: string | null
  leadEmail: string | null
  leadPhone: string | null
  leadAssignedTo: {
    id: string
    name: string | null
    email: string
  } | null
  leadConvertedAt: Date | null
  // Dades de l'usuari empresa
  owner: {
    id: string
    name: string | null
    email: string
    isActive: boolean
    isEmailVerified: boolean
    lastLogin: Date | null
  } | null
  // Pla subscrit
  planName: string | null
  planTier: string | null
}

export interface EmpresaCollaboradoraStats {
  total: number
  actives: number
  pendents: number
  inactives: number
}

export async function getEmpresasCollaboradores(): Promise<{
  success: boolean
  data?: EmpresaCollaboradora[]
  stats?: EmpresaCollaboradoraStats
  error?: string
}> {
  const access = await checkAdminAccess()
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    // Obtenir TOTES les empreses del sistema de gestió
    const companies = await prismaClient.company.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            isEmailVerified: true,
            lastLogin: true
          }
        },
        currentPlan: {
          select: { name: true, tier: true }
        },
        accountManager: {
          select: { id: true, name: true, email: true }
        },
        originalLead: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
            convertedAt: true,
            assignedTo: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Formatejar les dades
    const empreses: EmpresaCollaboradora[] = companies.map(company => {
      const lead = company.originalLead
      return {
        id: company.id,
        companyName: company.name,
        cif: company.cif,
        sector: company.sector,
        status: company.status,
        createdAt: company.createdAt,
        leadId: lead?.id || null,
        leadCompanyName: lead?.companyName || null,
        leadContactName: lead?.contactName || null,
        leadEmail: lead?.email || null,
        leadPhone: lead?.phone || null,
        leadAssignedTo: lead?.assignedTo || company.accountManager || null,
        leadConvertedAt: lead?.convertedAt || null,
        owner: company.owner || null,
        planName: company.currentPlan?.name || null,
        planTier: company.currentPlan?.tier || null
      }
    })

    // Stats
    const stats: EmpresaCollaboradoraStats = {
      total: empreses.length,
      actives: empreses.filter(e => e.status === 'PUBLISHED' || e.status === 'APPROVED').length,
      pendents: empreses.filter(e => e.status === 'PENDING').length,
      inactives: empreses.filter(e => e.status === 'INACTIVE' || e.status === 'SUSPENDED').length
    }

    return { success: true, data: empreses, stats }
  } catch (error) {
    console.error('Error obtenint empreses col·laboradores:', error)
    return { success: false, error: 'Error obtenint empreses col·laboradores' }
  }
}
