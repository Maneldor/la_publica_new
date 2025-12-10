'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import {
  getChecksForPhase,
  getRequiredChecksForPhase,
  canUserCompleteCheck,
  PHASE_CHECKS
} from '../checklist-config'

// ============================================
// TIPUS
// ============================================

export interface LeadCheckStatus {
  checkId: string
  title: string
  description: string
  isRequired: boolean
  isCompleted: boolean
  completedAt?: Date
  completedBy?: { id: string; name: string }
  activityData?: Record<string, any>
  resourceType?: string | null
  resourceSlug?: string
  externalUrl?: string
  externalLabel?: string
}

export interface PhaseChecklistStatus {
  phase: string
  totalChecks: number
  completedChecks: number
  requiredChecks: number
  completedRequiredChecks: number
  canAdvance: boolean
  checks: LeadCheckStatus[]
}

// ============================================
// OBTENIR ESTAT CHECKLIST D'UN LEAD
// ============================================

export async function getLeadChecklist(
  leadId: string
): Promise<{ success: boolean; data?: PhaseChecklistStatus; error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { success: false, error: 'No autenticat' }
  }

  try {
    // Obtenir el lead amb el seu estat actual
    const lead = await prismaClient.companyLead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        status: true,
        stage: true,
        phaseChecks: {
          include: {
            completedBy: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    if (!lead) {
      return { success: false, error: 'Lead no trobat' }
    }

    const currentPhase = lead.stage || lead.status || 'NEW'
    const phaseChecks = getChecksForPhase(currentPhase)
    const requiredChecks = getRequiredChecksForPhase(currentPhase)

    // Mapejar checks amb estat REAL de la BD
    const checksStatus: LeadCheckStatus[] = phaseChecks.map(checkConfig => {
      const completedCheck = lead.phaseChecks.find(
        pc => pc.checkDefinitionId === checkConfig.id
      )

      return {
        checkId: checkConfig.id,
        title: checkConfig.title,
        description: checkConfig.description,
        isRequired: checkConfig.isRequired,
        isCompleted: completedCheck?.isCompleted || false,
        completedAt: completedCheck?.completedAt || undefined,
        completedBy: completedCheck?.completedBy || undefined,
        activityData: completedCheck?.notes ? JSON.parse(completedCheck.notes) : undefined,
        resourceType: checkConfig.resourceType,
        resourceSlug: checkConfig.resourceSlug,
        externalUrl: checkConfig.externalUrl,
        externalLabel: checkConfig.externalLabel
      }
    })

    const completedCount = checksStatus.filter(c => c.isCompleted).length
    const completedRequiredCount = checksStatus.filter(
      c => c.isRequired && c.isCompleted
    ).length

    return {
      success: true,
      data: {
        phase: currentPhase,
        totalChecks: checksStatus.length,
        completedChecks: completedCount,
        requiredChecks: requiredChecks.length,
        completedRequiredChecks: completedRequiredCount,
        canAdvance: completedRequiredCount === requiredChecks.length,
        checks: checksStatus
      }
    }
  } catch (error) {
    console.error('Error obtenint checklist:', error)
    return { success: false, error: 'Error obtenint checklist' }
  }
}

// ============================================
// COMPLETAR UN CHECK
// ============================================

export async function completeCheck(
  leadId: string,
  checkId: string,
  activityData: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { success: false, error: 'No autenticat' }
  }

  const userRole = session.user.role as string

  try {
    // Obtenir configuració del check
    const checkConfig = PHASE_CHECKS.find(c => c.id === checkId)
    if (!checkConfig) {
      return { success: false, error: 'Check no trobat' }
    }

    // Verificar permisos
    if (!canUserCompleteCheck(userRole, checkConfig)) {
      return { success: false, error: 'No tens permisos per completar aquest check' }
    }

    // Validar camps obligatoris
    const requiredFields = checkConfig.activityField.requiredFields
    for (const field of requiredFields) {
      if (!activityData[field] || activityData[field].trim() === '') {
        const label = checkConfig.activityField.labels[field] || field
        return { success: false, error: `Camp obligatori: ${label}` }
      }
    }

    // Afegir timestamp automàtic
    activityData._completedAt = new Date().toISOString()
    activityData._completedBy = session.user.name || session.user.email

    // Crear o actualitzar el check
    await prismaClient.leadPhaseCheck.upsert({
      where: {
        leadId_checkDefinitionId: {
          leadId,
          checkDefinitionId: checkId
        }
      },
      create: {
        leadId,
        checkDefinitionId: checkId,
        isCompleted: true,
        completedAt: new Date(),
        completedById: session.user.id,
        notes: JSON.stringify(activityData)
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
        completedById: session.user.id,
        notes: JSON.stringify(activityData)
      }
    })

    revalidatePath('/gestio/leads/pipeline')
    revalidatePath(`/gestio/leads/${leadId}`)

    return { success: true }
  } catch (error) {
    console.error('Error completant check:', error)
    return { success: false, error: 'Error completant check' }
  }
}

// ============================================
// DESMARCAR UN CHECK
// ============================================

export async function uncheckCheck(
  leadId: string,
  checkId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { success: false, error: 'No autenticat' }
  }

  const userRole = session.user.role as string

  // Només admins poden desmarcar
  if (!['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(userRole)) {
    return { success: false, error: 'Només els administradors poden desmarcar checks' }
  }

  try {
    await prismaClient.leadPhaseCheck.update({
      where: {
        leadId_checkDefinitionId: {
          leadId,
          checkDefinitionId: checkId
        }
      },
      data: {
        isCompleted: false,
        completedAt: null,
        completedById: null
      }
    })

    revalidatePath('/gestio/leads/pipeline')
    return { success: true }
  } catch (error) {
    console.error('Error desmarcant check:', error)
    return { success: false, error: 'Error desmarcant check' }
  }
}

// ============================================
// VERIFICAR SI POT AVANÇAR DE FASE
// ============================================

export async function canAdvancePhase(
  leadId: string
): Promise<{ canAdvance: boolean; pendingChecks: string[]; error?: string }> {
  const result = await getLeadChecklist(leadId)

  if (!result.success || !result.data) {
    return { canAdvance: false, pendingChecks: [], error: result.error }
  }

  const pendingChecks = result.data.checks
    .filter(c => c.isRequired && !c.isCompleted)
    .map(c => c.title)

  return {
    canAdvance: result.data.canAdvance,
    pendingChecks
  }
}