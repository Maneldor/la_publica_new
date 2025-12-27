import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CATEGORIES = [
  { name: 'Administració Autonòmica', color: '#06b6d4' },
  { name: 'Administració Local', color: '#3b82f6' },
  { name: 'Administració Estatal', color: '#6366f1' },
  { name: 'Col·legis Professionals', color: '#8b5cf6' },
  { name: 'Associacions', color: '#ec4899' },
  { name: 'Institucions de Control', color: '#ef4444' },
  { name: 'Sindicats', color: '#f97316' },
  { name: 'Fundacions', color: '#eab308' },
  { name: 'Universitats', color: '#22c55e' },
  { name: 'Organismes Europeus', color: '#14b8a6' },
  { name: 'Entitats Financeres Públiques', color: '#0ea5e9' },
  { name: 'Empreses Públiques', color: '#a855f7' }
]

const LINKS = [
  // Administració Autonòmica
  {
    name: 'Generalitat de Catalunya',
    slogan: 'Portal oficial del Govern de Catalunya',
    website: 'https://www.gencat.cat',
    phone: '012',
    email: 'info@gencat.cat',
    description: 'Portal oficial de la Generalitat de Catalunya amb informació sobre serveis, tràmits i actualitat.',
    category: 'Administració Autonòmica',
    isHighlighted: true
  },
  {
    name: 'Parlament de Catalunya',
    slogan: 'Institució legislativa de Catalunya',
    website: 'https://www.parlament.cat',
    description: 'Seu del poder legislatiu a Catalunya.',
    category: 'Administració Autonòmica'
  },
  {
    name: 'Departament d\'Economia i Hisenda',
    slogan: 'Gestió econòmica i fiscal de Catalunya',
    website: 'https://economia.gencat.cat',
    phone: '934 70 30 00',
    email: 'economia.hisenda@gencat.cat',
    description: 'Departament responsable de la política econòmica i fiscal de la Generalitat.',
    category: 'Administració Autonòmica',
    isHighlighted: true
  },
  // Administració Local
  {
    name: 'Ajuntament de Barcelona',
    slogan: 'Barcelona, ciutat compromesa amb el progrés',
    website: 'https://www.barcelona.cat',
    phone: '010',
    email: 'info@bcn.cat',
    description: 'Portal oficial de l\'Ajuntament de Barcelona amb serveis per a la ciutadania.',
    category: 'Administració Local',
    isHighlighted: true
  },
  {
    name: 'Diputació de Barcelona',
    slogan: 'Treballem pels municipis',
    website: 'https://www.diba.cat',
    description: 'Suport als ajuntaments i millora de la qualitat de vida dels ciutadans.',
    category: 'Administració Local'
  },
  // Administració Estatal
  {
    name: 'Gobierno de España',
    slogan: 'Portal del Govern Central',
    website: 'https://www.lamoncloa.gob.es',
    description: 'Portal oficial del Govern d\'Espanya.',
    category: 'Administració Estatal'
  },
  {
    name: 'BOE - Butlletí Oficial de l\'Estat',
    slogan: 'Diari oficial',
    website: 'https://www.boe.es',
    description: 'Butlletí Oficial de l\'Estat amb tota la legislació vigent.',
    category: 'Administració Estatal',
    isHighlighted: true
  },
  {
    name: 'Agència Tributària',
    slogan: 'Administració tributària estatal',
    website: 'https://www.agenciatributaria.es',
    phone: '901 33 55 33',
    description: 'Agència Estatal d\'Administració Tributària.',
    category: 'Administració Estatal'
  },
  // Col·legis Professionals
  {
    name: 'COSITAL Catalunya',
    slogan: 'Secretaris, Interventors i Tresorers',
    website: 'https://www.cositac.cat',
    phone: '934 54 78 90',
    email: 'info@cositac.cat',
    description: 'Col·legi professional que agrupa els funcionaris d\'habilitació nacional.',
    category: 'Col·legis Professionals',
    isHighlighted: true
  },
  // Associacions
  {
    name: 'Associació Catalana de Municipis',
    slogan: 'Representant dels municipis catalans',
    website: 'https://www.acm.cat',
    phone: '934 48 20 20',
    email: 'acm@acm.cat',
    description: 'Associació que representa i defensa els interessos dels municipis de Catalunya.',
    category: 'Associacions'
  },
  {
    name: 'Federació de Municipis de Catalunya',
    slogan: 'Municipalisme al servei dels ciutadans',
    website: 'https://www.fmc.cat',
    phone: '934 88 90 00',
    email: 'fmc@fmc.cat',
    description: 'Federació que agrupa municipis i comarques de Catalunya.',
    category: 'Associacions'
  },
  // Institucions de Control
  {
    name: 'Tribunal de Comptes',
    slogan: 'Control extern del sector públic',
    website: 'https://www.tcu.es',
    phone: '914 46 30 00',
    email: 'comunicacion@tcu.es',
    description: 'Òrgan constitucional de control extern de l\'activitat econòmica del sector públic.',
    category: 'Institucions de Control'
  },
  {
    name: 'Síndic de Greuges de Catalunya',
    slogan: 'Defensor dels drets i les llibertats',
    website: 'https://www.sindic.cat',
    phone: '933 01 75 75',
    email: 'sindic@sindic.cat',
    description: 'Institució que vetlla pels drets i llibertats dels ciutadans davant les administracions.',
    category: 'Institucions de Control',
    isHighlighted: true
  },
  {
    name: 'Sindicatura de Comptes de Catalunya',
    slogan: 'Fiscalització del sector públic català',
    website: 'https://www.sindicatura.cat',
    description: 'Òrgan fiscalitzador extern dels comptes de la Generalitat.',
    category: 'Institucions de Control'
  },
  // Organismes Europeus
  {
    name: 'Comissió Europea',
    slogan: 'Institució executiva de la UE',
    website: 'https://ec.europa.eu',
    description: 'Òrgan executiu de la Unió Europea.',
    category: 'Organismes Europeus'
  },
  {
    name: 'Parlament Europeu',
    slogan: 'La veu dels ciutadans europeus',
    website: 'https://www.europarl.europa.eu',
    description: 'Institució parlamentària de la Unió Europea.',
    category: 'Organismes Europeus'
  }
]

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function seedUsefulLinks() {
  console.log('🔗 Seeding useful links...')

  // Crear categories
  const categoryMap: Record<string, string> = {}

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i]
    const slug = generateSlug(cat.name)

    const created = await prisma.usefulLinkCategory.upsert({
      where: { slug },
      update: {},
      create: {
        name: cat.name,
        slug,
        color: cat.color,
        order: i
      }
    })

    categoryMap[cat.name] = created.id
  }

  console.log(`✅ Created ${CATEGORIES.length} categories`)

  // Crear enllaços
  let linksCreated = 0
  for (const link of LINKS) {
    const slug = generateSlug(link.name)
    const categoryId = categoryMap[link.category]

    if (!categoryId) {
      console.warn(`⚠️ Category not found: ${link.category}`)
      continue
    }

    try {
      await prisma.usefulLink.upsert({
        where: { slug },
        update: {},
        create: {
          name: link.name,
          slug,
          slogan: link.slogan,
          description: link.description,
          website: link.website,
          phone: link.phone,
          email: link.email,
          categoryId,
          isHighlighted: link.isHighlighted || false
        }
      })
      linksCreated++
    } catch (error) {
      console.warn(`⚠️ Error creating link ${link.name}:`, error)
    }
  }

  console.log(`✅ Created ${linksCreated} links`)
}

// Executar si s'executa directament
if (require.main === module) {
  seedUsefulLinks()
    .then(() => {
      console.log('✅ Seed completed')
      process.exit(0)
    })
    .catch((e) => {
      console.error('❌ Seed failed:', e)
      process.exit(1)
    })
}
