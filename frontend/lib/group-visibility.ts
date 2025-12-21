import { prismaClient } from '@/lib/prisma'

/**
 * Comprova si un usuari ja pertany a un grup professional
 */
export async function userHasProfessionalGroup(userId: string): Promise<boolean> {
  const membership = await prismaClient.groupMember.findFirst({
    where: {
      userId,
      group: { type: 'PROFESSIONAL' }
    }
  })
  return !!membership
}

/**
 * Obté el grup professional de l'usuari (si en té)
 */
export async function getUserProfessionalGroup(userId: string) {
  return prismaClient.groupMember.findFirst({
    where: {
      userId,
      group: { type: 'PROFESSIONAL' }
    },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
        }
      }
    }
  })
}

/**
 * Tipus de grup
 */
type GroupType = 'PUBLIC' | 'PRIVATE' | 'PROFESSIONAL' | 'SECRET'

/**
 * Construeix el filtre WHERE per obtenir grups visibles per un usuari
 */
export async function getVisibleGroupsFilter(userId?: string | null) {
  // Usuari no autenticat: només PUBLIC i PRIVATE
  if (!userId) {
    return {
      isActive: true,
      type: { in: ['PUBLIC', 'PRIVATE'] as GroupType[] }
    }
  }

  // Comprovar si l'usuari té grup professional
  const professionalMembership = await prismaClient.groupMember.findFirst({
    where: {
      userId,
      group: { type: 'PROFESSIONAL' }
    },
    select: { groupId: true }
  })

  const hasProfessionalGroup = !!professionalMembership
  const userProfessionalGroupId = professionalMembership?.groupId

  // Construir filtre amb OR
  const orConditions: Array<Record<string, unknown>> = [
    // PUBLIC - sempre visible
    { type: 'PUBLIC' as GroupType },

    // PRIVATE - sempre visible
    { type: 'PRIVATE' as GroupType },

    // SECRET - només si és membre
    {
      type: 'SECRET' as GroupType,
      members: { some: { userId } }
    },
  ]

  // PROFESSIONAL - condicional
  if (hasProfessionalGroup && userProfessionalGroupId) {
    // Només mostrar el SEU grup professional
    orConditions.push({
      type: 'PROFESSIONAL' as GroupType,
      id: userProfessionalGroupId
    })
  } else {
    // Mostrar TOTS els professionals (encara no en té cap)
    orConditions.push({
      type: 'PROFESSIONAL' as GroupType
    })
  }

  return {
    isActive: true,
    OR: orConditions
  }
}

/**
 * Resultat de la comprovació de visibilitat
 */
interface VisibilityResult {
  canSee: boolean
  reason?: string
  isMember?: boolean
}

/**
 * Comprova si un usuari pot veure un grup específic
 */
export async function canUserSeeGroup(
  userId: string | null,
  group: { id: string; type: string }
): Promise<VisibilityResult> {

  // PUBLIC i PRIVATE sempre visibles
  if (group.type === 'PUBLIC' || group.type === 'PRIVATE') {
    return { canSee: true }
  }

  // Sense usuari, no pot veure PROFESSIONAL ni SECRET
  if (!userId) {
    if (group.type === 'SECRET') {
      return {
        canSee: false,
        reason: 'not_found' // Simular que no existeix
      }
    }
    return {
      canSee: false,
      reason: 'Cal iniciar sessió per veure aquest grup'
    }
  }

  // Comprovar si és membre
  const membership = await prismaClient.groupMember.findFirst({
    where: { userId, groupId: group.id }
  })

  if (membership) {
    return { canSee: true, isMember: true }
  }

  // SECRET - només membres
  if (group.type === 'SECRET') {
    return {
      canSee: false,
      reason: 'not_found' // Simular que no existeix
    }
  }

  // PROFESSIONAL - comprovar si ja té un altre
  if (group.type === 'PROFESSIONAL') {
    const existingProfessional = await prismaClient.groupMember.findFirst({
      where: {
        userId,
        group: { type: 'PROFESSIONAL' }
      },
      include: {
        group: {
          select: { name: true }
        }
      }
    })

    if (existingProfessional) {
      return {
        canSee: false,
        reason: `Ja pertanys al grup professional "${existingProfessional.group.name}". Només es permet pertànyer a un grup professional.`
      }
    }
  }

  return { canSee: true }
}

/**
 * Obté informació de visibilitat per mostrar a la UI
 */
export function getGroupVisibilityInfo(type: string) {
  switch (type) {
    case 'PUBLIC':
      return {
        label: 'Públic',
        description: 'Qualsevol pot veure i unir-se',
        joinLabel: "Unir-se",
        requiresApproval: false,
      }
    case 'PRIVATE':
      return {
        label: 'Privat',
        description: 'Visible per tots, accés amb sol·licitud',
        joinLabel: "Sol·licitar accés",
        requiresApproval: true,
      }
    case 'PROFESSIONAL':
      return {
        label: 'Professional',
        description: 'Només un grup professional per usuari',
        joinLabel: "Sol·licitar accés",
        requiresApproval: true,
      }
    case 'SECRET':
      return {
        label: 'Secret',
        description: 'Només visible per membres',
        joinLabel: "Només per invitació",
        requiresApproval: true,
      }
    default:
      return {
        label: type,
        description: '',
        joinLabel: "Unir-se",
        requiresApproval: false,
      }
  }
}
