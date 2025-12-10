// ============================================
// CONFIGURACIÓ DE CHECKS PER FASE
// ============================================

export type CheckFieldType =
  | 'none'           // Només marcar check
  | 'phone_call'     // Trucada: telèfon + data + hora + resultat
  | 'email_sent'     // Correu: destinatari + data + hora
  | 'verification'   // Verificació: font + dades verificades
  | 'meeting'        // Reunió: data + hora + assistents + notes
  | 'document'       // Document: nom + data enviament
  | 'note'           // Nota lliure obligatòria

export interface CheckFieldConfig {
  type: CheckFieldType
  requiredFields: string[]
  labels: Record<string, string>
}

export interface PhaseCheckConfig {
  id: string
  phase: string
  order: number
  title: string
  description: string
  isRequired: boolean
  resourceType?: 'eines' | 'external' | null
  resourceSlug?: string      // Slug del recurs Eines
  externalUrl?: string       // URL externa
  externalLabel?: string     // Text del link
  allowedRoles: string[]

  // 🆕 REGISTRE D'ACTIVITAT
  activityField: CheckFieldConfig
}

// ============================================
// CONFIGURACIÓ DE CAMPS PER TIPUS
// ============================================

export const ACTIVITY_FIELD_CONFIGS: Record<CheckFieldType, CheckFieldConfig> = {
  none: {
    type: 'none',
    requiredFields: [],
    labels: {}
  },

  phone_call: {
    type: 'phone_call',
    requiredFields: ['phoneNumber', 'callDate', 'callTime', 'callResult'],
    labels: {
      phoneNumber: 'Telèfon trucat',
      callDate: 'Data',
      callTime: 'Hora',
      callResult: 'Resultat de la trucada'
    }
  },

  email_sent: {
    type: 'email_sent',
    requiredFields: ['emailTo', 'emailDate', 'emailTime', 'emailSubject'],
    labels: {
      emailTo: 'Destinatari (email)',
      emailDate: 'Data enviament',
      emailTime: 'Hora enviament',
      emailSubject: 'Assumpte del correu'
    }
  },

  verification: {
    type: 'verification',
    requiredFields: ['verificationSource', 'verifiedData'],
    labels: {
      verificationSource: 'Font de verificació',
      verifiedData: 'Dades verificades'
    }
  },

  meeting: {
    type: 'meeting',
    requiredFields: ['meetingDate', 'meetingTime', 'attendees', 'meetingNotes'],
    labels: {
      meetingDate: 'Data reunió',
      meetingTime: 'Hora',
      attendees: 'Assistents',
      meetingNotes: 'Notes de la reunió'
    }
  },

  document: {
    type: 'document',
    requiredFields: ['documentName', 'sentDate'],
    labels: {
      documentName: 'Nom del document',
      sentDate: 'Data enviament'
    }
  },

  note: {
    type: 'note',
    requiredFields: ['activityNote'],
    labels: {
      activityNote: 'Descripció de l\'activitat realitzada'
    }
  }
}

// ============================================
// CHECKS PER FASE
// ============================================

export const PHASE_CHECKS: PhaseCheckConfig[] = [
  // ========== FASE: NEW ==========
  {
    id: 'new-verify-data',
    phase: 'NEW',
    order: 1,
    title: 'Verificar dades empresa',
    description: 'Comprovar que el CIF, nom i adreça de l\'empresa són correctes consultant el registre oficial.',
    isRequired: true,
    resourceType: 'external',
    externalUrl: 'https://www.einforma.com/servlet/app/portal/ENTP/screen/SProducto/prod/BUSCAR_EMPRESAS',
    externalLabel: '🔍 Consultar eInforma',
    allowedRoles: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL', 'ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'],
    activityField: {
      type: 'verification',
      requiredFields: ['verificationSource', 'verifiedData'],
      labels: {
        verificationSource: 'Font de verificació (eInforma, Registre Mercantil, etc.)',
        verifiedData: 'Confirma les dades verificades (CIF, nom, adreça)'
      }
    }
  },
  {
    id: 'new-initial-call',
    phase: 'NEW',
    order: 2,
    title: 'Trucada inicial de presentació',
    description: 'Realitzar trucada per presentar La Pública i demanar permís per enviar informació per correu.',
    isRequired: true,
    resourceType: 'eines',
    resourceSlug: 'speech-trucada-inicial',
    allowedRoles: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL', 'ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'],
    activityField: {
      type: 'phone_call',
      requiredFields: ['phoneNumber', 'callDate', 'callTime', 'callResult'],
      labels: {
        phoneNumber: 'Telèfon trucat',
        callDate: 'Data de la trucada',
        callTime: 'Hora de la trucada',
        callResult: 'Resultat (contestat, no contesta, bústia, interessat, no interessat)'
      }
    }
  },
  {
    id: 'new-plan-assessment',
    phase: 'NEW',
    order: 3,
    title: 'Valoració inicial del pla',
    description: 'Identificar quin pla podria encaixar millor segons el tipus i mida de l\'empresa.',
    isRequired: true,
    resourceType: 'eines',
    resourceSlug: 'info-plans-comparativa',
    allowedRoles: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL', 'ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'],
    activityField: {
      type: 'note',
      requiredFields: ['activityNote'],
      labels: {
        activityNote: 'Pla recomanat i justificació (mida empresa, sector, necessitats)'
      }
    }
  },

  // ========== FASE: PROSPECTING ==========
  {
    id: 'prospecting-research',
    phase: 'PROSPECTING',
    order: 1,
    title: 'Investigació de l\'empresa',
    description: 'Recopilar informació sobre l\'empresa: web, xarxes socials, notícies recents, competidors.',
    isRequired: true,
    resourceType: 'external',
    externalUrl: 'https://www.linkedin.com/company/',
    externalLabel: '🔗 Cercar a LinkedIn',
    allowedRoles: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL', 'ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'],
    activityField: {
      type: 'note',
      requiredFields: ['activityNote'],
      labels: {
        activityNote: 'Resum de la investigació: web, LinkedIn, notícies, observacions'
      }
    }
  },
  {
    id: 'prospecting-decision-maker',
    phase: 'PROSPECTING',
    order: 2,
    title: 'Identificar persona decisora',
    description: 'Trobar el contacte amb capacitat de decisió (gerent, director RRHH, etc.).',
    isRequired: true,
    resourceType: null,
    allowedRoles: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL', 'ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'],
    activityField: {
      type: 'note',
      requiredFields: ['activityNote'],
      labels: {
        activityNote: 'Nom, càrrec i contacte de la persona decisora identificada'
      }
    }
  },

  // ========== FASE: CONTACTED ==========
  {
    id: 'contacted-call',
    phase: 'CONTACTED',
    order: 1,
    title: 'Trucada de contacte',
    description: 'Parlar amb la persona decisora per presentar La Pública i els avantatges.',
    isRequired: true,
    resourceType: 'eines',
    resourceSlug: 'speech-trucada-contacte',
    allowedRoles: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL', 'ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'],
    activityField: {
      type: 'phone_call',
      requiredFields: ['phoneNumber', 'callDate', 'callTime', 'callResult'],
      labels: {
        phoneNumber: 'Telèfon trucat',
        callDate: 'Data de la trucada',
        callTime: 'Hora de la trucada',
        callResult: 'Resum de la conversa i interès mostrat'
      }
    }
  },
  {
    id: 'contacted-email',
    phase: 'CONTACTED',
    order: 2,
    title: 'Correu de presentació enviat',
    description: 'Enviar correu personalitzat amb informació de La Pública i avantatges pel seu sector.',
    isRequired: true,
    resourceType: 'eines',
    resourceSlug: 'plantilla-correu-presentacio',
    allowedRoles: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL', 'ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'],
    activityField: {
      type: 'email_sent',
      requiredFields: ['emailTo', 'emailDate', 'emailTime', 'emailSubject'],
      labels: {
        emailTo: 'Adreça email destinatari',
        emailDate: 'Data enviament',
        emailTime: 'Hora enviament',
        emailSubject: 'Assumpte utilitzat'
      }
    }
  },
  {
    id: 'contacted-followup',
    phase: 'CONTACTED',
    order: 3,
    title: 'Programar seguiment',
    description: 'Crear tasca de seguiment per contactar en 3-5 dies.',
    isRequired: true,
    resourceType: null,
    allowedRoles: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL', 'ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'],
    activityField: {
      type: 'note',
      requiredFields: ['activityNote'],
      labels: {
        activityNote: 'Data i hora programada per al seguiment'
      }
    }
  },

  // ========== FASE: QUALIFIED ==========
  {
    id: 'qualified-needs',
    phase: 'QUALIFIED',
    order: 1,
    title: 'Necessitats identificades',
    description: 'Documentar les necessitats específiques de l\'empresa i com La Pública pot ajudar.',
    isRequired: true,
    resourceType: 'eines',
    resourceSlug: 'guia-qualificacio-leads',
    allowedRoles: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL', 'ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'],
    activityField: {
      type: 'note',
      requiredFields: ['activityNote'],
      labels: {
        activityNote: 'Necessitats detectades i solucions proposades'
      }
    }
  },
  {
    id: 'qualified-budget',
    phase: 'QUALIFIED',
    order: 2,
    title: 'Pressupost confirmat',
    description: 'Confirmar que l\'empresa té pressupost i interès real en contractar.',
    isRequired: true,
    resourceType: null,
    allowedRoles: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL', 'ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'],
    activityField: {
      type: 'note',
      requiredFields: ['activityNote'],
      labels: {
        activityNote: 'Rang de pressupost i timing de decisió'
      }
    }
  },
  {
    id: 'qualified-plan-selected',
    phase: 'QUALIFIED',
    order: 3,
    title: 'Pla seleccionat',
    description: 'Definir el pla més adequat segons les necessitats i pressupost.',
    isRequired: true,
    resourceType: 'eines',
    resourceSlug: 'info-plans-comparativa',
    allowedRoles: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL', 'ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'],
    activityField: {
      type: 'note',
      requiredFields: ['activityNote'],
      labels: {
        activityNote: 'Pla seleccionat i condicions acordades'
      }
    }
  },

  // ========== FASE: PROPOSAL_SENT ==========
  {
    id: 'proposal-sent',
    phase: 'PROPOSAL_SENT',
    order: 1,
    title: 'Proposta enviada',
    description: 'Enviar proposta comercial formal amb condicions i preus.',
    isRequired: true,
    resourceType: 'eines',
    resourceSlug: 'plantilla-proposta-comercial',
    allowedRoles: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL', 'ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'],
    activityField: {
      type: 'document',
      requiredFields: ['documentName', 'sentDate'],
      labels: {
        documentName: 'Nom del document enviat',
        sentDate: 'Data d\'enviament'
      }
    }
  },
  {
    id: 'proposal-followup-scheduled',
    phase: 'PROPOSAL_SENT',
    order: 2,
    title: 'Seguiment programat',
    description: 'Programar trucada de seguiment per revisar la proposta.',
    isRequired: true,
    resourceType: null,
    allowedRoles: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL', 'ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'],
    activityField: {
      type: 'note',
      requiredFields: ['activityNote'],
      labels: {
        activityNote: 'Data i hora del seguiment programat'
      }
    }
  },

  // ========== FASE: PENDING_CRM ==========
  {
    id: 'pending-crm-data-complete',
    phase: 'PENDING_CRM',
    order: 1,
    title: 'Dades completes',
    description: 'Verificar que totes les dades necessàries estan completes abans de la verificació CRM.',
    isRequired: true,
    resourceType: 'eines',
    resourceSlug: 'checklist-dades-lead',
    allowedRoles: ['CRM_COMERCIAL', 'CRM_CONTINGUT', 'ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'],
    activityField: {
      type: 'verification',
      requiredFields: ['verificationSource', 'verifiedData'],
      labels: {
        verificationSource: 'Mètode de verificació',
        verifiedData: 'Camps verificats: CIF, contacte, email, telèfon, adreça'
      }
    }
  },
  {
    id: 'pending-crm-docs-ready',
    phase: 'PENDING_CRM',
    order: 2,
    title: 'Documents preparats',
    description: 'Confirmar que tots els documents necessaris estan preparats.',
    isRequired: true,
    resourceType: null,
    allowedRoles: ['CRM_COMERCIAL', 'CRM_CONTINGUT', 'ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'],
    activityField: {
      type: 'note',
      requiredFields: ['activityNote'],
      labels: {
        activityNote: 'Llista de documents preparats i pendents'
      }
    }
  },

  // ========== FASE: CRM_APPROVED ==========
  {
    id: 'crm-approved-validation',
    phase: 'CRM_APPROVED',
    order: 1,
    title: 'Validació CRM completada',
    description: 'El CRM ha verificat i aprovat totes les dades del lead.',
    isRequired: true,
    resourceType: null,
    allowedRoles: ['CRM_COMERCIAL', 'CRM_CONTINGUT', 'ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'],
    activityField: {
      type: 'note',
      requiredFields: ['activityNote'],
      labels: {
        activityNote: 'Resum de la validació i observacions'
      }
    }
  },

  // ========== FASE: PENDING_ADMIN ==========
  {
    id: 'pending-admin-contract',
    phase: 'PENDING_ADMIN',
    order: 1,
    title: 'Contracte signat',
    description: 'Confirmar que el contracte està signat per ambdues parts.',
    isRequired: true,
    resourceType: 'eines',
    resourceSlug: 'contracte-tipus-empresa',
    allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'],
    activityField: {
      type: 'document',
      requiredFields: ['documentName', 'sentDate'],
      labels: {
        documentName: 'Referència del contracte',
        sentDate: 'Data de signatura'
      }
    }
  },
  {
    id: 'pending-admin-payment',
    phase: 'PENDING_ADMIN',
    order: 2,
    title: 'Pagament confirmat',
    description: 'Verificar que s\'ha rebut el pagament inicial o confirmat la domiciliació.',
    isRequired: false, // Opcional si és trial gratuït
    resourceType: null,
    allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'],
    activityField: {
      type: 'note',
      requiredFields: ['activityNote'],
      labels: {
        activityNote: 'Mètode de pagament i confirmació (o indicar si és trial gratuït)'
      }
    }
  }
]

// ============================================
// FUNCIONS D'UTILITAT
// ============================================

/**
 * Obté els checks per una fase específica
 */
export function getChecksForPhase(phase: string): PhaseCheckConfig[] {
  return PHASE_CHECKS
    .filter(check => check.phase === phase)
    .sort((a, b) => a.order - b.order)
}

/**
 * Obté els checks obligatoris per una fase
 */
export function getRequiredChecksForPhase(phase: string): PhaseCheckConfig[] {
  return getChecksForPhase(phase).filter(check => check.isRequired)
}

/**
 * Verifica si un usuari pot completar un check
 */
export function canUserCompleteCheck(userRole: string, check: PhaseCheckConfig): boolean {
  return check.allowedRoles.includes(userRole)
}

/**
 * Obté la configuració de camps d'activitat per un tipus
 */
export function getActivityFieldConfig(type: CheckFieldType): CheckFieldConfig {
  return ACTIVITY_FIELD_CONFIGS[type]
}