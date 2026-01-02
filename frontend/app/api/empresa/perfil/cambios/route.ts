import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * POST /api/empresa/perfil/cambios
 * Envia els canvis del perfil de l'empresa per a revisio
 * Els canvis no s'apliquen directament, van a una cua de revisio del CRM
 */
export async function POST(request: NextRequest) {
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

    const company = user?.ownedCompany || user?.memberCompany;

    if (!company) {
      return NextResponse.json(
        { error: 'No tens cap empresa associada' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { changes, description } = body;

    if (!changes || Object.keys(changes).length === 0) {
      return NextResponse.json(
        { error: 'No hi ha canvis per enviar' },
        { status: 400 }
      );
    }

    // Obtenir valors actuals de l'empresa per comparar
    const currentCompany = await prismaClient.company.findUnique({
      where: { id: company.id },
      select: {
        name: true,
        cif: true,
        email: true,
        phone: true,
        website: true,
        address: true,
        description: true,
        sector: true,
        size: true,
        foundingYear: true,
        logo: true,
        logoUrl: true,
        coverImage: true,
        slogan: true,
        socialMedia: true,
        certifications: true,
        tags: true,
      }
    });

    // Determinar el tipus de canvi basat en els camps modificats
    const determineChangeType = (changedFields: string[]): string => {
      const logoFields = ['logo', 'logoUrl', 'coverImage'];
      const contactFields = ['email', 'phone', 'website', 'address'];
      const descriptionFields = ['description', 'slogan'];

      if (changedFields.some(f => logoFields.includes(f))) return 'LOGO';
      if (changedFields.some(f => contactFields.includes(f))) return 'CONTACT_INFO';
      if (changedFields.some(f => descriptionFields.includes(f))) return 'DESCRIPTION';
      return 'COMPANY_DATA';
    };

    const changedFields = Object.keys(changes);
    const changeType = determineChangeType(changedFields);

    // Verificar si ja existeix una sol·licitud pendent per aquest tipus
    const existingPending = await prismaClient.companyProfileChange.findFirst({
      where: {
        companyId: company.id,
        status: 'PENDING',
      }
    });

    if (existingPending) {
      // Actualitzar la sol·licitud existent amb els nous canvis
      const mergedOldValue = {
        ...(existingPending.oldValue as object || {}),
        ...Object.fromEntries(
          changedFields.map(field => [field, (currentCompany as any)?.[field]])
        )
      };

      const mergedNewValue = {
        ...(existingPending.newValue as object || {}),
        ...changes
      };

      await prismaClient.companyProfileChange.update({
        where: { id: existingPending.id },
        data: {
          oldValue: mergedOldValue,
          newValue: mergedNewValue,
          description: description || existingPending.description,
          createdAt: new Date(), // Actualitzar data
        }
      });

      // Notificar als gestors CRM que s'ha actualitzat la sol·licitud
      try {
        const crmUsers = await prismaClient.user.findMany({
          where: {
            OR: [
              { role: 'ADMIN_GESTIO' },
              { role: 'CRM_COMERCIAL' },
            ],
            isActive: true,
          },
          select: { id: true }
        });

        if (crmUsers.length > 0) {
          await prismaClient.notification.createMany({
            data: crmUsers.map(crmUser => ({
              userId: crmUser.id,
              type: 'COMPANY_PENDING',
              title: `Canvis actualitzats: ${company.name}`,
              message: `L'empresa ${company.name} ha actualitzat la seva sol·licitud de canvis pendent.`,
              data: {
                changeRequestId: existingPending.id,
                companyId: company.id,
                companyName: company.name,
                changeType: changeType,
              },
              isRead: false,
              actionUrl: '/gestio/empreses/canvis-pendents',
            }))
          });
        }
      } catch (notifError) {
        console.error('Error creant notificacions:', notifError);
      }

      return NextResponse.json({
        success: true,
        message: 'Sol·licitud de canvis actualitzada. Esta pendent de revisio.',
        data: {
          changeRequestId: existingPending.id,
          status: 'PENDING',
          isUpdate: true,
        }
      });
    }

    // Crear nova sol·licitud de canvis
    const oldValue = Object.fromEntries(
      changedFields.map(field => [field, (currentCompany as any)?.[field]])
    );

    const changeRequest = await prismaClient.companyProfileChange.create({
      data: {
        companyId: company.id,
        type: changeType as any,
        status: 'PENDING',
        oldValue: oldValue,
        newValue: changes,
        description: description || `Sol·licitud de canvis de perfil`,
        requestedById: session.user.id,
      }
    });

    // Crear notificacio per als gestors CRM
    try {
      // Obtenir gestors CRM per notificar
      const crmUsers = await prismaClient.user.findMany({
        where: {
          OR: [
            { role: 'ADMIN_GESTIO' },
            { role: 'CRM_COMERCIAL' },
          ],
          isActive: true,
        },
        select: { id: true }
      });

      // Crear notificacions
      if (crmUsers.length > 0) {
        await prismaClient.notification.createMany({
          data: crmUsers.map(crmUser => ({
            userId: crmUser.id,
            type: 'COMPANY_PENDING',
            title: `Nova sol·licitud de canvis: ${company.name}`,
            message: `L'empresa ${company.name} ha sol·licitat canvis al seu perfil. Revisa'ls per aprovar o rebutjar.`,
            data: {
              changeRequestId: changeRequest.id,
              companyId: company.id,
              companyName: company.name,
              changeType: changeType,
            },
            isRead: false,
            actionUrl: '/gestio/empreses/canvis-pendents',
          }))
        });
      }
    } catch (notifError) {
      console.error('Error creant notificacions:', notifError);
      // No fallar si les notificacions fallen
    }

    return NextResponse.json({
      success: true,
      message: 'Sol·licitud de canvis enviada correctament. Esta pendent de revisio pel CRM.',
      data: {
        changeRequestId: changeRequest.id,
        status: 'PENDING',
        isUpdate: false,
      }
    });

  } catch (error) {
    console.error('Error enviant canvis:', error);
    return NextResponse.json(
      { error: 'Error al enviar els canvis', details: error instanceof Error ? error.message : 'Error desconegut' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/empresa/perfil/cambios
 * Obte l'estat dels canvis pendents de l'empresa
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

    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      include: {
        ownedCompany: true,
        memberCompany: true,
      }
    });

    const company = user?.ownedCompany || user?.memberCompany;

    if (!company) {
      return NextResponse.json(
        { error: 'No tens cap empresa associada' },
        { status: 403 }
      );
    }

    // Obtenir canvis pendents
    const pendingChanges = await prismaClient.companyProfileChange.findMany({
      where: {
        companyId: company.id,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10, // Ultims 10 canvis
    });

    const hasPendingChanges = pendingChanges.some(c => c.status === 'PENDING');

    return NextResponse.json({
      success: true,
      data: {
        hasPendingChanges,
        pendingCount: pendingChanges.filter(c => c.status === 'PENDING').length,
        changes: pendingChanges.map(change => ({
          id: change.id,
          type: change.type,
          status: change.status,
          description: change.description,
          newValue: change.newValue,
          rejectionReason: change.rejectionReason,
          createdAt: change.createdAt.toISOString(),
          reviewedAt: change.reviewedAt?.toISOString() || null,
        }))
      }
    });

  } catch (error) {
    console.error('Error obtenint canvis:', error);
    return NextResponse.json(
      { error: 'Error al obtenir els canvis' },
      { status: 500 }
    );
  }
}
