import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/empresa/perfil
 * Obte el perfil complet de l'empresa de l'usuari actual
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticat' },
        { status: 401 }
      );
    }

    // Obtenir l'empresa de l'usuari
    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      include: {
        ownedCompany: true,
        memberCompany: true,
      }
    });

    const companyId = user?.ownedCompany?.id || user?.memberCompany?.id;

    if (!companyId) {
      return NextResponse.json(
        { error: 'No tens cap empresa associada' },
        { status: 403 }
      );
    }

    // Obtenir dades completes de l'empresa
    const company = await prismaClient.company.findUnique({
      where: { id: companyId },
      include: {
        currentPlan: {
          select: {
            id: true,
            planType: true,
            name: true,
            badge: true,
            badgeColor: true,
          }
        },
        accountManager: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        originalLead: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
            sector: true,
            website: true,
            address: true,
            city: true,
            notes: true,
          }
        },
        profileChanges: {
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa no trobada' },
        { status: 404 }
      );
    }

    // Combinar dades de l'empresa amb dades del lead original si existeixen
    const leadData = company.originalLead;

    // Preparar resposta amb tots els camps
    const profileData = {
      id: company.id,
      // Dades basiques
      name: company.name,
      cif: company.cif,
      email: company.email || leadData?.email,
      phone: company.phone || leadData?.phone,
      website: company.website || leadData?.website,
      address: company.address || leadData?.address,
      city: leadData?.city || null,
      // Descripcio
      description: company.description,
      slogan: company.slogan,
      sector: company.sector || leadData?.sector,
      size: company.size,
      foundingYear: company.foundingYear,
      employeeCount: company.employeeCount,
      // Imatges
      logo: company.logo || company.logoUrl,
      coverImage: company.coverImage,
      // Xarxes socials (JSON)
      socialLinks: company.socialMedia || {},
      // Certificacions (JSON)
      certifications: company.certifications || [],
      // Tags
      tags: company.tags || [],
      // Configuracio
      configuration: company.configuration || {},
      // Estat
      status: company.status,
      isActive: company.isActive,
      isVerified: company.isVerified,
      // Dates
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
      approvedAt: company.approvedAt?.toISOString() || null,
      // Relacions
      currentPlan: company.currentPlan,
      accountManager: company.accountManager,
      // Canvis pendents
      hasPendingChanges: company.profileChanges.length > 0,
      pendingChanges: company.profileChanges.length > 0 ? {
        id: company.profileChanges[0].id,
        createdAt: company.profileChanges[0].createdAt.toISOString(),
        changes: company.profileChanges[0].newValue,
      } : null,
    };

    return NextResponse.json({
      success: true,
      data: profileData,
    });

  } catch (error) {
    console.error('Error obtenint perfil empresa:', error);
    return NextResponse.json(
      { error: 'Error al obtenir el perfil', details: error instanceof Error ? error.message : 'Error desconegut' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/empresa/perfil
 * Actualitza directament el perfil (NOMES per admins/CRM)
 * Les empreses han d'usar /api/empresa/perfil/cambios
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticat' },
        { status: 401 }
      );
    }

    // Verificar si es admin o CRM
    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: true,
        userType: true,
        ownedCompanyId: true,
        memberCompanyId: true,
      }
    });

    const isAdminOrCRM = ['ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO', 'CRM_COMERCIAL'].includes(user?.role || '');

    if (!isAdminOrCRM) {
      return NextResponse.json(
        { error: 'Accio no permesa. Utilitza /api/empresa/perfil/cambios per sol·licitar canvis.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { companyId, ...updateData } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId es obligatori' },
        { status: 400 }
      );
    }

    // Preparar dades per actualitzar
    const dataToUpdate: any = {};

    // Camps basics
    if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
    if (updateData.cif !== undefined) dataToUpdate.cif = updateData.cif;
    if (updateData.email !== undefined) dataToUpdate.email = updateData.email;
    if (updateData.phone !== undefined) dataToUpdate.phone = updateData.phone;
    if (updateData.website !== undefined) dataToUpdate.website = updateData.website;
    if (updateData.address !== undefined) dataToUpdate.address = updateData.address;
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
    if (updateData.slogan !== undefined) dataToUpdate.slogan = updateData.slogan;
    if (updateData.sector !== undefined) dataToUpdate.sector = updateData.sector;
    if (updateData.size !== undefined) dataToUpdate.size = updateData.size;
    if (updateData.foundingYear !== undefined) dataToUpdate.foundingYear = parseInt(updateData.foundingYear) || null;
    if (updateData.employeeCount !== undefined) dataToUpdate.employeeCount = parseInt(updateData.employeeCount) || null;

    // Imatges
    if (updateData.logo !== undefined) dataToUpdate.logo = updateData.logo;
    if (updateData.logoUrl !== undefined) dataToUpdate.logoUrl = updateData.logoUrl;
    if (updateData.coverImage !== undefined) dataToUpdate.coverImage = updateData.coverImage;

    // JSON fields
    if (updateData.socialLinks !== undefined) dataToUpdate.socialMedia = updateData.socialLinks;
    if (updateData.certifications !== undefined) dataToUpdate.certifications = updateData.certifications;
    if (updateData.tags !== undefined) dataToUpdate.tags = updateData.tags;
    if (updateData.configuration !== undefined) dataToUpdate.configuration = updateData.configuration;

    const updatedCompany = await prismaClient.company.update({
      where: { id: companyId },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: 'Perfil actualitzat correctament',
      data: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        updatedAt: updatedCompany.updatedAt.toISOString(),
      }
    });

  } catch (error) {
    console.error('Error actualitzant perfil:', error);
    return NextResponse.json(
      { error: 'Error al actualitzar el perfil', details: error instanceof Error ? error.message : 'Error desconegut' },
      { status: 500 }
    );
  }
}
