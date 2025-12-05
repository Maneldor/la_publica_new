'use server'

import { prisma } from '@/lib/prisma'

export interface ContactInfo {
  id: string
  name: string
  position: string | null
  phone: string | null
  email: string | null
  isPrimary: boolean
}

export interface SearchResult {
  id: string
  type: 'lead' | 'company'
  name: string
  sector: string | null
  status: string
  contacts: ContactInfo[]
}

/**
 * Buscar leads i empreses per nom
 */
export async function searchLeadsAndCompanies(
  query: string,
  filter: 'all' | 'leads' | 'companies' = 'all',
  userId: string
): Promise<SearchResult[]> {
  const results: SearchResult[] = []

  if (!query || query.length < 2) {
    // Si no hi ha query, retornar els últims 10 leads/empreses
    if (filter === 'all' || filter === 'leads') {
      const leads = await prisma.lead.findMany({
        where: {
          assignedToId: userId,
          status: { notIn: ['CONVERTED', 'LOST'] }
        },
        include: {
          contacts: {
            orderBy: { isPrimary: 'desc' }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 5
      })

      leads.forEach(lead => {
        results.push({
          id: lead.id,
          type: 'lead',
          name: lead.companyName,
          sector: lead.sector,
          status: lead.status,
          contacts: lead.contacts.map(c => ({
            id: c.id,
            name: c.name,
            position: c.position,
            phone: c.phone,
            email: c.email,
            isPrimary: c.isPrimary
          }))
        })
      })
    }

    if (filter === 'all' || filter === 'companies') {
      const companies = await prisma.company.findMany({
        where: {
          managerId: userId,
          status: 'ACTIVE'
        },
        include: {
          contacts: {
            orderBy: { isPrimary: 'desc' }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 5
      })

      companies.forEach(company => {
        results.push({
          id: company.id,
          type: 'company',
          name: company.name,
          sector: company.sector,
          status: company.status,
          contacts: company.contacts.map(c => ({
            id: c.id,
            name: c.name,
            position: c.position,
            phone: c.phone,
            email: c.email,
            isPrimary: c.isPrimary
          }))
        })
      })
    }

    return results
  }

  // Buscar amb query
  if (filter === 'all' || filter === 'leads') {
    const leads = await prisma.lead.findMany({
      where: {
        assignedToId: userId,
        status: { notIn: ['CONVERTED', 'LOST'] },
        OR: [
          { companyName: { contains: query, mode: 'insensitive' } },
          { contacts: { some: { name: { contains: query, mode: 'insensitive' } } } }
        ]
      },
      include: {
        contacts: {
          orderBy: { isPrimary: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    })

    leads.forEach(lead => {
      results.push({
        id: lead.id,
        type: 'lead',
        name: lead.companyName,
        sector: lead.sector,
        status: lead.status,
        contacts: lead.contacts.map(c => ({
          id: c.id,
          name: c.name,
          position: c.position,
          phone: c.phone,
          email: c.email,
          isPrimary: c.isPrimary
        }))
      })
    })
  }

  if (filter === 'all' || filter === 'companies') {
    const companies = await prisma.company.findMany({
      where: {
        managerId: userId,
        status: 'ACTIVE',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { contacts: { some: { name: { contains: query, mode: 'insensitive' } } } }
        ]
      },
      include: {
        contacts: {
          orderBy: { isPrimary: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    })

    companies.forEach(company => {
      results.push({
        id: company.id,
        type: 'company',
        name: company.name,
        sector: company.sector,
        status: company.status,
        contacts: company.contacts.map(c => ({
          id: c.id,
          name: c.name,
          position: c.position,
          phone: c.phone,
          email: c.email,
          isPrimary: c.isPrimary
        }))
      })
    })
  }

  return results
}