'use server'

import { prisma } from '@/lib/prisma'

export interface Contact {
  id: string
  name: string
  position: string | null
  phone: string | null
  email: string | null
  isPrimary: boolean
  entityType: 'lead' | 'company'
  entityId: string
  entityName: string
  sector: string | null
}

/**
 * Obtenir tots els contactes de leads i empreses de l'usuari
 */
export async function getAllContacts(userId: string): Promise<Contact[]> {
  const contacts: Contact[] = []

  // Contactes de leads
  const leads = await prisma.lead.findMany({
    where: {
      assignedToId: userId,
      status: { notIn: ['LOST'] }
    },
    include: {
      contacts: {
        orderBy: { isPrimary: 'desc' }
      }
    }
  })

  leads.forEach(lead => {
    lead.contacts.forEach(contact => {
      contacts.push({
        id: contact.id,
        name: contact.name,
        position: contact.position,
        phone: contact.phone,
        email: contact.email,
        isPrimary: contact.isPrimary,
        entityType: 'lead',
        entityId: lead.id,
        entityName: lead.companyName,
        sector: lead.sector
      })
    })
  })

  // Contactes d'empreses
  const companies = await prisma.company.findMany({
    where: {
      managerId: userId,
      status: 'ACTIVE'
    },
    include: {
      contacts: {
        orderBy: { isPrimary: 'desc' }
      }
    }
  })

  companies.forEach(company => {
    company.contacts.forEach(contact => {
      contacts.push({
        id: contact.id,
        name: contact.name,
        position: contact.position,
        phone: contact.phone,
        email: contact.email,
        isPrimary: contact.isPrimary,
        entityType: 'company',
        entityId: company.id,
        entityName: company.name,
        sector: company.sector
      })
    })
  })

  // Ordenar per nom
  return contacts.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Cercar contactes
 */
export async function searchContacts(
  query: string,
  userId: string,
  filter: 'all' | 'leads' | 'companies' = 'all'
): Promise<Contact[]> {
  const allContacts = await getAllContacts(userId)

  let filtered = allContacts

  // Filtrar per tipus
  if (filter === 'leads') {
    filtered = filtered.filter(c => c.entityType === 'lead')
  } else if (filter === 'companies') {
    filtered = filtered.filter(c => c.entityType === 'company')
  }

  // Filtrar per query
  if (query && query.length >= 2) {
    const lowerQuery = query.toLowerCase()
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.entityName.toLowerCase().includes(lowerQuery) ||
      (c.position && c.position.toLowerCase().includes(lowerQuery))
    )
  }

  return filtered
}