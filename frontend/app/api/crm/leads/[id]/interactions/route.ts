import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/crm/leads/[id]/interactions - Obtener timeline
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    if (!['ADMIN', 'SUPER_ADMIN', 'COMPANY_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'No tens permisos' },
        { status: 403 }
      );
    }

    const leadId = params.id;

    console.log(`🔍 [CRM Timeline] Loading timeline for lead: ${leadId}`);

    // Verificar que el lead existe y el usuario tiene acceso
    const lead = await prismaClient.companyLead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        assignedToId: true,
        companyName: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead no trobat' },
        { status: 404 }
      );
    }

    if (
      lead.assignedToId !== session.user.id &&
      !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: 'No tens accés a aquest lead' },
        { status: 403 }
      );
    }

    // Obtener interacciones Y actividades para timeline completo
    const [interactions, activities] = await Promise.all([
      prismaClient.leadInteraction.findMany({
        where: { leadId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prismaClient.leadActivity.findMany({
        where: { leadId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    // Combinar y ordenar por fecha
    const timeline = [
      ...interactions.map(i => ({
        id: i.id,
        type: 'interaction',
        interactionType: i.type,
        title: i.title,
        description: i.description,
        outcome: i.outcome,
        duration: i.duration,
        metadata: i.metadata,
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
        user: i.user,
        canEdit: i.userId === session.user.id || ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role),
      })),
      ...activities.map(a => ({
        id: a.id,
        type: 'activity',
        activityType: a.type,
        description: a.description,
        metadata: a.metadata,
        createdAt: a.createdAt.toISOString(),
        user: a.user,
        canEdit: false, // Las actividades no se pueden editar
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log(`✅ [CRM Timeline] Found ${interactions.length} interactions and ${activities.length} activities`);

    return NextResponse.json({
      success: true,
      data: {
        timeline,
        stats: {
          totalInteractions: interactions.length,
          totalActivities: activities.length,
          lastInteraction: interactions[0]?.createdAt?.toISOString() || null,
          interactionsByType: interactions.reduce((acc, curr) => {
            acc[curr.type] = (acc[curr.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        },
        leadInfo: {
          id: lead.id,
          companyName: lead.companyName,
        },
      },
    });
  } catch (error) {
    console.error('❌ [CRM Timeline] Error obteniendo timeline:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/crm/leads/[id]/interactions - Añadir interacción
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    if (!['ADMIN', 'SUPER_ADMIN', 'COMPANY_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'No tens permisos' },
        { status: 403 }
      );
    }

    const leadId = params.id;
    const body = await request.json();

    console.log(`📝 [CRM Interaction] Creating interaction for lead: ${leadId}`);

    // Validación
    if (!body.type) {
      return NextResponse.json(
        { success: false, error: 'Camp type obligatori' },
        { status: 400 }
      );
    }

    if (!body.description || body.description.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Camp description obligatori' },
        { status: 400 }
      );
    }

    // Validar tipo de interacción
    const validTypes = ['NOTE', 'CALL', 'EMAIL', 'MEETING', 'WHATSAPP'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { success: false, error: 'Tipus d\'interacció invàlid' },
        { status: 400 }
      );
    }

    // Verificar que el lead existe y el usuario tiene acceso
    const lead = await prismaClient.companyLead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        assignedToId: true,
        companyName: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead no trobat' },
        { status: 404 }
      );
    }

    if (
      lead.assignedToId !== session.user.id &&
      !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: 'No tens accés a aquest lead' },
        { status: 403 }
      );
    }

    // Crear interacción en transacción
    const result = await prismaClient.$transaction(async (tx) => {
      // Crear interacción
      const interaction = await tx.leadInteraction.create({
        data: {
          leadId,
          userId: session.user.id,
          type: body.type,
          title: body.title || null,
          description: body.description,
          outcome: body.outcome || null,
          duration: body.duration || null,
          metadata: body.metadata || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Actualizar lastContactDate del lead
      await tx.companyLead.update({
        where: { id: leadId },
        data: {
          lastContactDate: new Date(),
        },
      });

      // Registrar actividad
      await tx.leadActivity.create({
        data: {
          leadId,
          userId: session.user.id,
          type: 'INTERACTION_ADDED',
          description: `${body.type}: ${body.description.substring(0, 100)}${body.description.length > 100 ? '...' : ''}`,
          metadata: {
            interactionId: interaction.id,
            interactionType: body.type,
          },
        },
      });

      return interaction;
    });

    console.log(`✅ [CRM Interaction] Interaction created: ${result.id}`);

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        type: 'interaction',
        interactionType: result.type,
        title: result.title,
        description: result.description,
        outcome: result.outcome,
        duration: result.duration,
        metadata: result.metadata,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
        user: result.user,
        canEdit: true,
      },
      message: 'Interacció afegida correctament',
    });
  } catch (error) {
    console.error('❌ [CRM Interaction] Error creando interacción:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}