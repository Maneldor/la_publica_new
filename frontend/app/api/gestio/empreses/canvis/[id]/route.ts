import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/gestio/empreses/canvis/[id]
 * Obte el detall d'un canvi de perfil
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticat' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const change = await prismaClient.companyProfileChange.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            logoUrl: true,
            email: true,
            phone: true,
            website: true,
            address: true,
            description: true,
            sector: true,
            size: true,
            foundingYear: true,
            socialMedia: true,
            certifications: true,
            tags: true,
            configuration: true,
          }
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        rejectedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!change) {
      return NextResponse.json(
        { error: 'Canvi no trobat' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: change.id,
        company: change.company,
        type: change.type,
        status: change.status,
        oldValue: change.oldValue,
        newValue: change.newValue,
        description: change.description,
        requestedBy: change.requestedBy,
        reviewedBy: change.approvedBy || change.rejectedBy,
        rejectionReason: change.rejectionReason,
        createdAt: change.createdAt.toISOString(),
        reviewedAt: change.reviewedAt?.toISOString() || null,
      }
    });

  } catch (error) {
    console.error('Error obtenint canvi:', error);
    return NextResponse.json(
      { error: 'Error al obtenir el canvi' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/gestio/empreses/canvis/[id]
 * Aprovar o rebutjar un canvi de perfil
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticat' },
        { status: 401 }
      );
    }

    // Verificar permisos
    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, userType: true }
    });

    const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO', 'CRM_COMERCIAL'];
    if (!allowedRoles.includes(user?.role || '')) {
      return NextResponse.json(
        { error: 'No tens permisos per aprovar/rebutjar canvis' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action, rejectionReason } = body;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Accio invalida. Ha de ser "approve" o "reject"' },
        { status: 400 }
      );
    }

    // Obtenir el canvi
    const change = await prismaClient.companyProfileChange.findUnique({
      where: { id },
      include: { company: true }
    });

    if (!change) {
      return NextResponse.json(
        { error: 'Canvi no trobat' },
        { status: 404 }
      );
    }

    if (change.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Aquest canvi ja ha estat processat' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Aplicar els canvis a l'empresa
      const newValue = change.newValue as Record<string, any>;
      const updateData: any = {};

      // Mapear camps del formulari a camps de la base de dades
      if (newValue.name !== undefined) updateData.name = newValue.name;
      if (newValue.cif !== undefined) updateData.cif = newValue.cif;
      if (newValue.email !== undefined) updateData.email = newValue.email;
      if (newValue.phone !== undefined) updateData.phone = newValue.phone;
      if (newValue.website !== undefined) updateData.website = newValue.website;
      if (newValue.address !== undefined) updateData.address = newValue.address;
      if (newValue.description !== undefined) updateData.description = newValue.description;
      if (newValue.sector !== undefined) updateData.sector = newValue.sector;
      if (newValue.size !== undefined) updateData.size = newValue.size;
      if (newValue.foundingYear !== undefined) updateData.foundingYear = newValue.foundingYear;
      if (newValue.logo !== undefined) updateData.logo = newValue.logo;
      if (newValue.coverImage !== undefined) updateData.coverImage = newValue.coverImage;
      if (newValue.slogan !== undefined) updateData.slogan = newValue.slogan;
      if (newValue.socialLinks !== undefined) updateData.socialMedia = newValue.socialLinks;
      if (newValue.certifications !== undefined) updateData.certifications = newValue.certifications;
      if (newValue.tags !== undefined) updateData.tags = newValue.tags;
      if (newValue.services !== undefined) updateData.tags = newValue.services;
      if (newValue.configuration !== undefined) {
        // Merge configuration
        const currentConfig = (change.company.configuration as object) || {};
        updateData.configuration = { ...currentConfig, ...newValue.configuration };
      }

      // Actualitzar empresa i canvi en una transaccio
      await prismaClient.$transaction([
        prismaClient.company.update({
          where: { id: change.companyId },
          data: updateData,
        }),
        prismaClient.companyProfileChange.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approvedById: session.user.id,
            reviewedAt: new Date(),
          }
        })
      ]);

      // Crear notificacio per l'empresa
      try {
        const companyUsers = await prismaClient.user.findMany({
          where: {
            OR: [
              { ownedCompanyId: change.companyId },
              { memberCompanyId: change.companyId }
            ]
          },
          select: { id: true }
        });

        if (companyUsers.length > 0) {
          await prismaClient.notification.createMany({
            data: companyUsers.map(u => ({
              userId: u.id,
              type: 'COMPANY_APPROVED',
              title: 'Canvis aprovats',
              message: 'Els teus canvis de perfil han estat aprovats i publicats.',
              data: {
                changeId: id,
                companyId: change.companyId,
              },
              isRead: false,
            }))
          });
        }
      } catch (notifError) {
        console.error('Error creant notificacions:', notifError);
      }

      return NextResponse.json({
        success: true,
        message: 'Canvis aprovats i aplicats correctament',
      });

    } else {
      // Rebutjar
      if (!rejectionReason?.trim()) {
        return NextResponse.json(
          { error: 'Cal indicar el motiu del rebuig' },
          { status: 400 }
        );
      }

      await prismaClient.companyProfileChange.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectedById: session.user.id,
          reviewedAt: new Date(),
          rejectionReason: rejectionReason.trim(),
        }
      });

      // Crear notificacio per l'empresa
      try {
        const companyUsers = await prismaClient.user.findMany({
          where: {
            OR: [
              { ownedCompanyId: change.companyId },
              { memberCompanyId: change.companyId }
            ]
          },
          select: { id: true }
        });

        if (companyUsers.length > 0) {
          await prismaClient.notification.createMany({
            data: companyUsers.map(u => ({
              userId: u.id,
              type: 'COMPANY_REJECTED',
              title: 'Canvis rebutjats',
              message: `Els teus canvis de perfil han estat rebutjats. Motiu: ${rejectionReason}`,
              data: {
                changeId: id,
                companyId: change.companyId,
                reason: rejectionReason,
              },
              isRead: false,
            }))
          });
        }
      } catch (notifError) {
        console.error('Error creant notificacions:', notifError);
      }

      return NextResponse.json({
        success: true,
        message: 'Canvis rebutjats correctament',
      });
    }

  } catch (error) {
    console.error('Error processant canvi:', error);
    return NextResponse.json(
      { error: 'Error al processar el canvi' },
      { status: 500 }
    );
  }
}
