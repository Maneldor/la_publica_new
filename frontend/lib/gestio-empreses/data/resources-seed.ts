// data/resources-seed.ts - Datos iniciales para recursos comerciales

import {
  CommercialResource,
  ResourceType,
  PipelinePhase,
  ResourceCategory,
  ResourceRole,
  PlaceholderType,
  SpeechContent,
  EmailTemplateContent,
  DocumentContent,
  GuideContent,
  ChecklistContent
} from '../types/resources'

// Recursos de SPEECH
const speechResources: Omit<CommercialResource, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    slug: 'presentacio-inicial-pyme',
    title: 'Presentació Inicial per a PYMEs',
    description: 'Discurs introductori per al primer contacte amb petites i mitjanes empreses',
    type: ResourceType.SPEECH,
    phase: PipelinePhase.PROSPECCIO,
    category: ResourceCategory.TRUCADA_INICIAL,
    content: {
      script: `Bon dia {{contact.name}},

Sóc {{system.user.name}} de La Pública Solucions.

Ens hem posat en contacte amb vostè perquè hem vist que {{company.name}} podria beneficiar-se dels nostres serveis digitals.

Estem especialitzats en ajudar a empreses com la seva a:
- Optimitzar la seva presència digital
- Millorar els processos comercials
- Accedir a subvencions i ajuts públics

El nostre pla Pioner, especialment dissenyat per a les primeres 100 empreses, ofereix condicions molt avantatjoses.

Podríem concertar una reunió de 15 minuts aquesta setmana per explicar-li com podem ajudar a {{company.name}}?`,
      duration: 3,
      objectives: [
        'Establir contacte inicial',
        'Presentar La Pública Solucions',
        'Despertar interès en els serveis',
        'Concertar reunió de seguiment'
      ],
      keyPoints: [
        'Mencionar el pla Pioner',
        'Personalitzar amb el nom de l\'empresa',
        'Ser concís i directe',
        'Proposar següent pas clar'
      ],
      objections: [
        {
          objection: 'No estem interessats',
          response: 'Ho entenc. Podria preguntar-li què els motiva principalment en aquests moments? Potser podem ajudar d\'una manera que no havia considerat.'
        },
        {
          objection: 'Ja tenim proveïdors',
          response: 'Perfecte, això demostra que són una empresa proactiva. El nostre enfocament és complementari i pot potenciar els resultats dels seus proveïdors actuals.'
        }
      ]
    } as SpeechContent,
    // placeholders: [
      {
        key: 'contact.name',
        label: 'Nom del contacte',
        type: PlaceholderType.CONTACT,
        required: true
      },
      {
        key: 'company.name',
        label: 'Nom de l\'empresa',
        type: PlaceholderType.COMPANY,
        required: true
      },
      {
        key: 'system.user.name',
        label: 'Nom del gestor',
        type: PlaceholderType.SYSTEM,
        required: true
      }
    // ],
    tags: ['primer-contacte', 'pyme', 'telemarketing'],
    // accessRoles: [
      ResourceRole.GESTOR_ESTANDARD,
      ResourceRole.GESTOR_ESTRATEGIC,
      ResourceRole.GESTOR_ENTERPRISE
    // ],
    isActive: true,
    // version: '1.0'
  }
]

// Recursos de EMAIL_TEMPLATE
const emailTemplateResources: Omit<CommercialResource, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    slug: 'email-seguiment-inicial',
    title: 'Email de Seguiment Inicial',
    description: 'Plantilla per al primer email de seguiment després del contacte inicial',
    type: ResourceType.EMAIL_TEMPLATE,
    phase: PipelinePhase.PROSPECCIO,
    category: ResourceCategory.SEGUIMENT,
    content: {
      subject: 'Seguiment de la nostra conversa - {{company.name}}',
      body: `Estimat/da {{contact.name}},

Espero que es trobi bé. Li escric per fer seguiment de la nostra conversa d'ahir sobre com La Pública Solucions pot ajudar a {{company.name}}.

Com li comentava, el nostre pla Pioner està dissenyat específicament per a empreses com la seva, oferint:

✓ Optimització de la presència digital
✓ Millora dels processos comercials
✓ Accés a subvencions i finançament públic
✓ Suport personalitzat durant tot el procés

Adjunto trobarà una presentació amb més detalls sobre els nostres serveis i casos d'èxit similars al seu sector.

Estaria disponible per a una reunió de 30 minuts aquesta setmana? Podríem concretar exactament com podem ajudar a {{company.name}} a assolir els seus objectius.

Quedo a la seva disposició per a qualsevol dubte.

Cordials salutacions,
{{system.user.name}}
La Pública Solucions
{{system.company.phone}}`,
      attachments: ['presentacio-serveis.pdf'],
      followUpDays: 3
    } as EmailTemplateContent,
    // placeholders: [
      {
        key: 'contact.name',
        label: 'Nom del contacte',
        type: PlaceholderType.CONTACT,
        required: true
      },
      {
        key: 'company.name',
        label: 'Nom de l\'empresa',
        type: PlaceholderType.COMPANY,
        required: true
      }
    // ],
    tags: ['seguiment', 'email', 'primer-contacte'],
    // accessRoles: [
      ResourceRole.GESTOR_ESTANDARD,
      ResourceRole.GESTOR_ESTRATEGIC,
      ResourceRole.GESTOR_ENTERPRISE
    // ],
    isActive: true,
    // version: '1.0'
  }
]

// Recursos de DOCUMENT
const documentResources: Omit<CommercialResource, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    slug: 'proposta-comercial-pioner',
    title: 'Proposta Comercial - Pla Pioner',
    description: 'Document de proposta comercial per al pla Pioner destinat a les primeres 100 empreses',
    type: ResourceType.DOCUMENT,
    phase: PipelinePhase.NEGOTIATION,
    category: ResourceCategory.PRESENTACIO_PLANS,
    content: {
      format: 'MARKDOWN',
      content: `# PROPOSTA COMERCIAL
## Pla Pioner - La Pública Solucions

**Per a:** {{company.name}}
**Contacte:** {{contact.name}}
**Data:** {{system.date}}
**Gestor:** {{system.user.name}}

---

## 1. RESUM EXECUTIU

{{company.name}} és una empresa amb gran potencial de creixement. El nostre Pla Pioner està dissenyat específicament per a empreses innovadores com la seva.

**Beneficis principals:**
- Presència digital optimitzada
- Processos comercials millorats
- Accés a finançament públic
- ROI demostrable

## 2. SERVEIS INCLOSOS

### Digitalització Empresarial
- Auditoria digital completa
- Optimització de processos
- Implementació d'eines digitals

### Gestió Comercial
- Anàlisi del pipeline comercial
- Optimització de vendes
- Formació de l'equip

### Gestió de Subvencions
- Identificació d'oportunitats
- Preparació de documentació
- Seguiment de tramitació

## 3. INVERSIÓ

**Pla Pioner (Oferta especial primeres 100 empreses):**
- Inversió inicial: {{quote.amount}} € (descompte del 40%)
- Pagament: Fraccionat en 6 mesos
- Garantia de resultats: 100%

## 4. SEGÜENTS PASSOS

1. Aprovació de la proposta
2. Signatura del contracte
3. Auditoria inicial
4. Implementació (6-8 setmanes)

---

*Aquesta oferta té validesa fins al {{quote.expiry_date}}*

**{{system.user.name}}**
La Pública Solucions`,
      sections: [
        {
          title: 'Resum Executiu',
          content: 'Visió general de la proposta'
        },
        {
          title: 'Serveis Inclosos',
          content: 'Detall dels serveis oferits'
        },
        {
          title: 'Inversió',
          content: 'Condicions econòmiques'
        }
      ]
    } as DocumentContent,
    // placeholders: [
      {
        key: 'company.name',
        label: 'Nom de l\'empresa',
        type: PlaceholderType.COMPANY,
        required: true
      },
      {
        key: 'contact.name',
        label: 'Nom del contacte',
        type: PlaceholderType.CONTACT,
        required: true
      },
      {
        key: 'quote.amount',
        label: 'Import de la proposta',
        type: PlaceholderType.CUSTOM,
        description: 'Import econòmic de la proposta',
        required: true
      },
      {
        key: 'quote.expiry_date',
        label: 'Data de venciment',
        type: PlaceholderType.CUSTOM,
        description: 'Data límit de l\'oferta',
        required: true
      }
    // ],
    tags: ['proposta', 'pioner', 'contracte'],
    // accessRoles: [
      ResourceRole.GESTOR_ESTRATEGIC,
      ResourceRole.GESTOR_ENTERPRISE,
      ResourceRole.CRM_MANAGER
    // ],
    isActive: true,
    // version: '1.0'
  }
]

// Recursos de GUIDE
const guideResources: Omit<CommercialResource, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    slug: 'guia-primera-reunio',
    title: 'Guia per a la Primera Reunió',
    description: 'Pas a pas per conduir la primera reunió comercial amb èxit',
    type: ResourceType.GUIDE,
    phase: PipelinePhase.PROSPECCIO,
    category: ResourceCategory.DOCUMENTACIO,
    content: {
      steps: [
        {
          title: 'Preparació prèvia (5 min)',
          description: 'Revisar la informació de {{company.name}} i preparar materials',
          tips: [
            'Revisar el web de l\'empresa',
            'Preparar preguntes específiques',
            'Tenir a mà la presentació del Pla Pioner'
          ]
        },
        {
          title: 'Obertura i presentació (5 min)',
          description: 'Saludar i establir rapport amb {{contact.name}}',
          tips: [
            'Començar amb una pregunta oberta sobre l\'empresa',
            'Mostrar interès genuí',
            'Explicar breument La Pública Solucions'
          ]
        },
        {
          title: 'Descoberta de necessitats (15 min)',
          description: 'Identificar els reptes i objectius de l\'empresa',
          tips: [
            'Fer preguntes obertes',
            'Escoltar activament',
            'Prendre notes visibles'
          ]
        },
        {
          title: 'Presentació de solucions (10 min)',
          description: 'Connectar els nostres serveis amb les seves necessitats',
          tips: [
            'Personalitzar la presentació',
            'Mencionar casos d\'èxit similars',
            'Destacar els beneficis del Pla Pioner'
          ]
        },
        {
          title: 'Tancament i següents passos (5 min)',
          description: 'Acordar les accions següents',
          tips: [
            'Resumir els punts clau',
            'Proposar una reunió de seguiment',
            'Enviar proposta si procedeix'
          ]
        }
      ],
      estimatedTime: 40
    } as GuideContent,
    // placeholders: [
      {
        key: 'company.name',
        label: 'Nom de l\'empresa',
        type: PlaceholderType.COMPANY,
        required: true
      },
      {
        key: 'contact.name',
        label: 'Nom del contacte',
        type: PlaceholderType.CONTACT,
        required: true
      }
    // ],
    tags: ['primera-reunio', 'guia', 'vendes'],
    // accessRoles: [
      ResourceRole.GESTOR_ESTANDARD,
      ResourceRole.GESTOR_ESTRATEGIC,
      ResourceRole.GESTOR_ENTERPRISE
    // ],
    isActive: true,
    // version: '1.0'
  }
]

// Recursos de CHECKLIST
const checklistResources: Omit<CommercialResource, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    slug: 'checklist-qualificacio-lead',
    title: 'Checklist de Qualificació de Lead',
    description: 'Llista de verificació per qualificar adequadament un lead abans d\'avançar a negociació',
    type: ResourceType.CHECKLIST,
    phase: PipelinePhase.NEGOCIACIO,
    category: ResourceCategory.TRUCADA_INICIAL,
    content: {
      items: [
        {
          id: 'budget-confirmed',
          label: 'Pressupost confirmat',
          description: 'El client té pressupost assignat per al projecte',
          required: true,
          order: 1
        },
        {
          id: 'decision-maker',
          label: 'Persona de decisió identificada',
          description: 'Sabem qui pren les decisions d\'inversió a {{company.name}}',
          required: true,
          order: 2
        },
        {
          id: 'timeline-defined',
          label: 'Timeline definit',
          description: 'El client té una data límit clara per implementar',
          required: true,
          order: 3
        },
        {
          id: 'needs-understood',
          label: 'Necessitats compreses',
          description: 'Entenem clarament els reptes i objectius de l\'empresa',
          required: true,
          order: 4
        },
        {
          id: 'competition-known',
          label: 'Competència coneguda',
          description: 'Sabem amb qui competim i el nostre avantatge diferencial',
          required: false,
          order: 5
        },
        {
          id: 'pioner-explained',
          label: 'Pla Pioner explicat',
          description: 'El client coneix els avantatges del nostre pla promocional',
          required: true,
          order: 6
        }
      ],
      successCriteria: 'Tots els ítems marcats com a requerits han de ser completats abans d\'enviar la proposta comercial'
    } as ChecklistContent,
    // placeholders: [
      {
        key: 'company.name',
        label: 'Nom de l\'empresa',
        type: PlaceholderType.COMPANY,
        required: true
      }
    // ],
    tags: ['qualificacio', 'checklist', 'leads'],
    // accessRoles: [
      ResourceRole.GESTOR_ESTANDARD,
      ResourceRole.GESTOR_ESTRATEGIC,
      ResourceRole.GESTOR_ENTERPRISE,
      ResourceRole.CRM_MANAGER
    // ],
    isActive: true,
    // version: '1.0'
  }
]

// Exportar tots els recursos de seed
export const SEED_RESOURCES: Omit<CommercialResource, 'id' | 'createdAt' | 'updatedAt'>[] = [
  ...speechResources,
  ...emailTemplateResources,
  ...documentResources,
  ...guideResources,
  ...checklistResources
]

// Función para obtener recursos por fase
export function getResourcesByPhase(phase: PipelinePhase): typeof SEED_RESOURCES {
  return SEED_RESOURCES.filter(resource => resource.phase === phase)
}

// Función para obtener recursos por tipo
export function getResourcesByType(type: ResourceType): typeof SEED_RESOURCES {
  return SEED_RESOURCES.filter(resource => resource.type === type)
}

// Función para obtener recursos por rol
export function getResourcesByRole(role: ResourceRole): typeof SEED_RESOURCES {
  return SEED_RESOURCES.filter(resource =>
    resource.accessRoles.includes(role)
  )
}

// Metadata de los recursos de seed
export const SEED_METADATA = {
  totalResources: SEED_RESOURCES.length,
  byType: {
    [ResourceType.SPEECH]: speechResources.length,
    [ResourceType.EMAIL_TEMPLATE]: emailTemplateResources.length,
    [ResourceType.DOCUMENT]: documentResources.length,
    [ResourceType.GUIDE]: guideResources.length,
    [ResourceType.CHECKLIST]: checklistResources.length,
    [ResourceType.VIDEO]: 0 // No hay videos en el seed inicial
  },
  byPhase: {
    [PipelinePhase.PROSPECCIO]: SEED_RESOURCES.filter(r => r.phase === PipelinePhase.PROSPECCIO).length,
    [PipelinePhase.NEGOTIATION]: SEED_RESOURCES.filter(r => r.phase === PipelinePhase.NEGOTIATION).length,
    [PipelinePhase.NEGOCIACIO]: SEED_RESOURCES.filter(r => r.phase === PipelinePhase.NEGOCIACIO).length
  },
  version: '1.0.0',
  createdFor: 'La Pública Solucions - Sistema de Recursos Comerciales'
}