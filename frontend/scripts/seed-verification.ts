// scripts/seed-verification.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creant dades de prova per Verificació CRM...')

  // Obtenir un usuari existent per assignar
  const user = await prisma.user.findFirst({
    where: { isActive: true },
  })

  if (!user) {
    console.error('❌ No hi ha cap usuari actiu. Crea un usuari primer.')
    return
  }

  console.log(`📌 Usant usuari: ${user.name || user.email}`)

  const testLeads = [
    {
      companyName: 'Tech Innovators BCN',
      sector: 'TECHNOLOGY',
      contactName: 'Maria Garcia',
      contactEmail: 'maria@techinnovators.com',
      contactPhone: '+34 612 345 678',
      contactPosition: 'CEO',
      estimatedRevenue: 75000,
      priority: 'HIGH',
      city: 'Barcelona',
      website: 'https://techinnovators.com',
      notes: 'Empresa interessada en el pla Enterprise. Han sol·licitat demo.',
      daysAgo: 1,
    },
    {
      companyName: 'Marketing Solutions SL',
      sector: 'MARKETING',
      contactName: 'Joan Pérez',
      contactEmail: 'joan@marketingsolutions.es',
      contactPhone: '+34 623 456 789',
      contactPosition: 'Director Comercial',
      estimatedRevenue: 35000,
      priority: 'MEDIUM',
      city: 'Madrid',
      website: 'https://marketingsolutions.es',
      notes: 'Referit per client existent. Interessats en pla Estàndard.',
      daysAgo: 2,
    },
    {
      companyName: 'Consultoria Financera Global',
      sector: 'FINANCE',
      contactName: 'Laura Sánchez',
      contactEmail: 'laura@cfglobal.com',
      contactPhone: '+34 634 567 890',
      contactPosition: 'CFO',
      estimatedRevenue: 120000,
      priority: 'HIGH',
      city: 'Barcelona',
      website: 'https://cfglobal.com',
      notes: 'Gran empresa amb 200+ empleats. Molt potencial.',
      daysAgo: 3,
    },
    {
      companyName: 'Retail Express Catalunya',
      sector: 'RETAIL',
      contactName: 'Pere Fernández',
      contactEmail: 'pere@retailexpress.cat',
      contactPhone: '+34 645 678 901',
      contactPosition: 'Gerent',
      estimatedRevenue: 25000,
      priority: 'LOW',
      city: 'Girona',
      notes: 'Petita empresa local. Interessats en pla bàsic.',
      daysAgo: 4,
    },
    {
      companyName: 'Logística Mediterrània',
      sector: 'LOGISTICS',
      contactName: 'Anna Martínez',
      contactEmail: 'anna@logmed.es',
      contactPhone: '+34 656 789 012',
      contactPosition: 'Directora d\'Operacions',
      estimatedRevenue: 55000,
      priority: 'MEDIUM',
      city: 'Tarragona',
      website: 'https://logmed.es',
      notes: 'Empresa en expansió. Necessiten gestió de flota.',
      daysAgo: 5,
    },
  ]

  for (const leadData of testLeads) {
    const updatedAt = new Date(Date.now() - leadData.daysAgo * 24 * 60 * 60 * 1000)
    const createdAt = new Date(Date.now() - (leadData.daysAgo + 2) * 24 * 60 * 60 * 1000)

    // Crear el lead amb estat PENDING_CRM
    const lead = await prisma.companyLead.create({
      data: {
        companyName: leadData.companyName,
        sector: leadData.sector,
        contactName: leadData.contactName,
        email: leadData.contactEmail,
        phone: leadData.contactPhone,
        estimatedRevenue: leadData.estimatedRevenue,
        priority: leadData.priority,
        city: leadData.city,
        website: leadData.website,
        notes: leadData.notes,
        status: 'DOCUMENTATION',
        source: 'MANUAL',
        assignedTo: {
          connect: { id: user.id }
        },
        createdAt,
        updatedAt,
      },
    })

    console.log(`✅ Lead creat: ${lead.companyName}`)

    // Crear activitats
    await prisma.leadActivity.createMany({
      data: [
        {
          leadId: lead.id,
          type: 'CREATED',
          description: 'Lead creat al sistema',
          userId: user.id,
          createdAt: new Date(createdAt.getTime()),
        },
        {
          leadId: lead.id,
          type: 'STATUS_CHANGE',
          description: 'Estat canviat a Contactat',
          userId: user.id,
          createdAt: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000),
        },
        {
          leadId: lead.id,
          type: 'NOTE',
          description: 'Trucada inicial realitzada. Client interessat.',
          userId: user.id,
          createdAt: new Date(updatedAt.getTime() - 12 * 60 * 60 * 1000),
        },
        {
          leadId: lead.id,
          type: 'STATUS_CHANGE',
          description: 'Enviat a verificació CRM',
          userId: user.id,
          createdAt: updatedAt,
        },
      ],
    })
  }

  console.log('')
  console.log('🎉 Dades de prova creades correctament!')
  console.log('📍 Navega a /gestio/crm/verificacio per veure els leads')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })