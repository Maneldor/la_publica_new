// simple-seed.ts - Script simplificado para poblar recursos
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const simpleResources = [
  {
    slug: 'presentacio-inicial-pyme',
    title: 'Presentació Inicial per a PYMEs',
    description: 'Discurs introductori per al primer contacte amb petites i mitjanes empreses',
    type: 'SPEECH',
    phase: 'PROSPECCIO',
    category: 'TRUCADA_INICIAL',
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
      ]
    },
    tags: ['primer-contacte', 'pyme', 'telemarketing'],
    isActive: true
  },
  {
    slug: 'email-seguiment-inicial',
    title: 'Email de Seguiment Inicial',
    description: 'Plantilla per al primer email de seguiment després del contacte inicial',
    type: 'EMAIL_TEMPLATE',
    phase: 'PROSPECCIO',
    category: 'SEGUIMENT',
    content: {
      subject: 'Seguiment de la nostra conversa - {{company.name}}',
      body: `Estimat/da {{contact.name}},

Espero que es trobi bé. Li escric per fer seguiment de la nostra conversa d'ahir sobre com La Pública Solucions pot ajudar a {{company.name}}.

Com li comentava, el nostre pla Pioner està dissenyat específicament per a empreses com la seva, oferint:

✓ Optimització de la presència digital
✓ Millora dels processos comercials
✓ Accés a subvencions i finançament públic
✓ Suport personalitzat durant tot el procés

Estaria disponible per a una reunió de 30 minuts aquesta setmana?

Cordials salutacions,
{{system.user.name}}
La Pública Solucions`,
      followUpDays: 3
    },
    tags: ['seguiment', 'email', 'primer-contacte'],
    isActive: true
  },
  {
    slug: 'contracte-basic-pioner',
    title: 'Contracte Bàsic Pla Pioner',
    description: 'Plantilla de contracte per al pla Pioner de La Pública',
    type: 'DOCUMENT',
    phase: 'TANCAMENT',
    category: 'DOCUMENTACIO',
    content: {
      format: 'PDF',
      content: `CONTRACTE DE SERVEIS DIGITALS

ENTRE: La Pública Solucions SL
I: {{company.name}}

OBJECTE DEL CONTRACTE:
La prestació de serveis de digitalització i optimització comercial per a {{company.name}}.

CONDICIONS DEL PLA PIONER:
- Tarifa mensual: 299€ + IVA
- Durada mínima: 12 mesos
- Condicions especials per les primeres 100 empreses

SERVEIS INCLOSOS:
- Optimització presència digital
- Suport comercial personalitzat
- Accés a subvencions i ajuts
- Assessorament estratègic mensual

Data: {{system.date}}
Gestor assignat: {{system.user.name}}`,
      sections: [
        {
          title: 'Condicions Generals',
          content: 'Detalls de les condicions generals del servei'
        },
        {
          title: 'Serveis Inclosos',
          content: 'Descripció detallada dels serveis'
        }
      ]
    },
    tags: ['contracte', 'pioner', 'legal'],
    isActive: true
  }
]

async function main() {
  console.log('🌱 Iniciando seed simplificado...')

  try {
    // Crear usuario sistema si no existe
    let systemUser = await prisma.user.findFirst({
      where: { email: 'sistema@lapublica.com' }
    })

    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          email: 'sistema@lapublica.com',
          name: 'Sistema La Pública',
          role: 'CRM_CONTINGUT',
          isActive: true
        }
      })
      console.log('✅ Usuario sistema creado')
    }

    // Limpiar recursos existentes
    console.log('🗑️  Limpiando recursos existentes...')
    await prisma.commercialResource.deleteMany({})

    // Crear recursos
    console.log('📝 Creando recursos...')
    for (const resourceData of simpleResources) {
      const resource = await prisma.commercialResource.create({
        data: {
          ...resourceData,
          createdById: systemUser.id
        }
      })
      console.log(`✅ Creado: ${resource.title}`)
    }

    const total = await prisma.commercialResource.count()
    console.log(`\n🎉 Seed completado! ${total} recursos creados.`)

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('Error fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })