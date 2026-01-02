// lib/actions/public-companies-actions.ts
'use server'

import { prismaClient } from '@/lib/prisma'

export interface PublicCompany {
  id: string
  name: string
  description: string | null
  sector: string | null
  address: string | null
  logo: string | null
  coverImage: string | null
  collaborationType: string | null
  isVerified: boolean
  email: string | null
  phone: string | null
  website: string | null
  services: string[]
  certifications: any
  foundingYear: number | null
  employeeCount: number | null
  size: string | null
  slogan: string | null
  rating: number
  reviewsCount: number
  isHighlighted: boolean
  planType: string | null
}

/**
 * Obtenir empreses publicades per a la vista pública
 */
export async function getPublishedCompanies(): Promise<{
  success: boolean
  companies: PublicCompany[]
  error?: string
}> {
  try {
    const companies = await prismaClient.company.findMany({
      where: {
        status: 'PUBLISHED',
        stage: 'ACTIVA'
      },
      include: {
        currentPlan: {
          select: {
            nombreCorto: true,
            nombre: true
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      },
      orderBy: [
        { isVerified: 'desc' },
        { updatedAt: 'desc' }
      ]
    })

    // Calculate average rating from reviews
    const companyIds = companies.map(c => c.id)
    const ratingsData = await prismaClient.review.groupBy({
      by: ['companyId'],
      where: {
        companyId: { in: companyIds }
      },
      _avg: {
        rating: true
      }
    })

    const ratingsMap = new Map(ratingsData.map(r => [r.companyId, r._avg.rating || 0]))

    const publicCompanies: PublicCompany[] = companies.map(company => ({
      id: company.id,
      name: company.name,
      description: company.description,
      sector: company.sector,
      address: company.address,
      logo: company.logo,
      coverImage: company.coverImage,
      collaborationType: company.collaborationType,
      isVerified: company.isVerified,
      email: company.contactEmail || company.email,
      phone: company.contactPhone || company.phone,
      website: company.website,
      services: company.services || [],
      certifications: company.certifications,
      foundingYear: company.foundingYear,
      employeeCount: company.employeeCount,
      size: company.size,
      slogan: company.slogan,
      rating: ratingsMap.get(company.id) || 0,
      reviewsCount: company._count.reviews,
      isHighlighted: company.isVerified || (company.currentPlan?.nombreCorto === 'Premium'),
      planType: company.currentPlan?.nombreCorto || company.currentPlan?.nombre || null
    }))

    return { success: true, companies: publicCompanies }
  } catch (error) {
    console.error('Error obtenint empreses publicades:', error)
    return { success: false, companies: [], error: 'Error carregant empreses' }
  }
}

/**
 * Cercar empreses publicades
 */
export async function searchPublishedCompanies(params: {
  query?: string
  sector?: string
  location?: string
  limit?: number
}): Promise<{
  success: boolean
  companies: PublicCompany[]
  error?: string
}> {
  try {
    const { query, sector, location, limit = 50 } = params

    const whereConditions: any = {
      status: 'PUBLISHED',
      stage: 'ACTIVA'
    }

    if (query && query.length >= 2) {
      whereConditions.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { sector: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (sector) {
      whereConditions.sector = { contains: sector, mode: 'insensitive' }
    }

    if (location) {
      whereConditions.address = { contains: location, mode: 'insensitive' }
    }

    const companies = await prismaClient.company.findMany({
      where: whereConditions,
      include: {
        currentPlan: {
          select: {
            nombreCorto: true,
            nombre: true
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      },
      take: limit,
      orderBy: [
        { isVerified: 'desc' },
        { updatedAt: 'desc' }
      ]
    })

    const companyIds = companies.map(c => c.id)
    const ratingsData = await prismaClient.review.groupBy({
      by: ['companyId'],
      where: {
        companyId: { in: companyIds }
      },
      _avg: {
        rating: true
      }
    })

    const ratingsMap = new Map(ratingsData.map(r => [r.companyId, r._avg.rating || 0]))

    const publicCompanies: PublicCompany[] = companies.map(company => ({
      id: company.id,
      name: company.name,
      description: company.description,
      sector: company.sector,
      address: company.address,
      logo: company.logo,
      coverImage: company.coverImage,
      collaborationType: company.collaborationType,
      isVerified: company.isVerified,
      email: company.contactEmail || company.email,
      phone: company.contactPhone || company.phone,
      website: company.website,
      services: company.services || [],
      certifications: company.certifications,
      foundingYear: company.foundingYear,
      employeeCount: company.employeeCount,
      size: company.size,
      slogan: company.slogan,
      rating: ratingsMap.get(company.id) || 0,
      reviewsCount: company._count.reviews,
      isHighlighted: company.isVerified || (company.currentPlan?.nombreCorto === 'Premium'),
      planType: company.currentPlan?.nombreCorto || company.currentPlan?.nombre || null
    }))

    return { success: true, companies: publicCompanies }
  } catch (error) {
    console.error('Error cercant empreses:', error)
    return { success: false, companies: [], error: 'Error cercant empreses' }
  }
}

/**
 * Obtenir una empresa publicada per ID o slug
 */
export async function getPublishedCompanyBySlug(slug: string): Promise<{
  success: boolean
  company?: PublicCompany
  error?: string
}> {
  try {
    const company = await prismaClient.company.findFirst({
      where: {
        OR: [
          { id: slug },
          { slug: slug }
        ],
        status: 'PUBLISHED',
        stage: 'ACTIVA'
      },
      include: {
        currentPlan: {
          select: {
            nombreCorto: true,
            nombre: true
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    })

    if (!company) {
      return { success: false, error: 'Empresa no trobada' }
    }

    const ratingData = await prismaClient.review.aggregate({
      where: { companyId: company.id },
      _avg: { rating: true }
    })

    const publicCompany: PublicCompany = {
      id: company.id,
      name: company.name,
      description: company.description,
      sector: company.sector,
      address: company.address,
      logo: company.logo,
      coverImage: company.coverImage,
      collaborationType: company.collaborationType,
      isVerified: company.isVerified,
      email: company.contactEmail || company.email,
      phone: company.contactPhone || company.phone,
      website: company.website,
      services: company.services || [],
      certifications: company.certifications,
      foundingYear: company.foundingYear,
      employeeCount: company.employeeCount,
      size: company.size,
      slogan: company.slogan,
      rating: ratingData._avg.rating || 0,
      reviewsCount: company._count.reviews,
      isHighlighted: company.isVerified || (company.currentPlan?.nombreCorto === 'Premium'),
      planType: company.currentPlan?.nombreCorto || company.currentPlan?.nombre || null
    }

    return { success: true, company: publicCompany }
  } catch (error) {
    console.error('Error obtenint empresa:', error)
    return { success: false, error: 'Error carregant empresa' }
  }
}
