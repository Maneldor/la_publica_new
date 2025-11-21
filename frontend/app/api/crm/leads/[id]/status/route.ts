import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// PATCH /api/crm/leads/[id]/status - Cambiar estado del lead (para drag & drop)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const userId = session.user.id;
    const leadId = params.id;
    const { status, priority } = await request.json();

    console.log(`🔄 [CRM Status] Updating status for lead: ${leadId} to: ${status}`);

    // Validar que se proporciona el status
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status és obligatori' },
        { status: 400 }
      );
    }

    // Mapear estados frontend a backend
    const statusMap: Record<string, string> = {
      'new': 'NEW',
      'contacted': 'CONTACTED',
      'qualified': 'QUALIFIED',
      'proposal_sent': 'PROPOSAL_SENT',
      'proposal': 'PROPOSAL_SENT',
      'negotiation': 'NEGOTIATION',
      'documentation': 'DOCUMENTATION',
      'won': 'WON',
      'lost': 'LOST',
      'on_hold': 'ON_HOLD',
    };

    const backendStatus = statusMap[status.toLowerCase()] || status.toUpperCase();

    // Verificar que el lead existe y pertenece al usuario
    const existingLead = await prismaClient.companyLead.findFirst({
      where: {
        id: leadId,
        assignedToId: userId,
      },
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, error: 'Lead no trobat' },
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const updateData: any = {
      status: backendStatus,
      updatedAt: new Date(),
    };

    // Si se está marcando como convertido, agregar fecha
    if (backendStatus === 'WON') {
      updateData.convertedAt = new Date();
    }

    // Si también se incluye prioridad
    if (priority) {
      const priorityMap: Record<string, string> = {
        'low': 'LOW',
        'medium': 'MEDIUM',
        'high': 'HIGH',
        'urgent': 'URGENT',
      };
      updateData.priority = priorityMap[priority.toLowerCase()] || priority.toUpperCase();
    }

    // Actualizar el lead
    const updatedLead = await prismaClient.companyLead.update({
      where: { id: leadId },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Registrar actividad de cambio de estado
    const activityDescription = existingLead.status !== backendStatus
      ? `Estat canviat de ${existingLead.status} a ${backendStatus} per ${session.user.name}`
      : `Lead actualitzat per ${session.user.name}`;

    await prismaClient.leadActivity.create({
      data: {
        leadId: leadId,
        userId: userId,
        type: 'STATUS_CHANGED',
        description: activityDescription,
        metadata: {
          previousStatus: existingLead.status,
          newStatus: backendStatus,
          previousPriority: existingLead.priority,
          newPriority: updateData.priority || existingLead.priority,
          changedBy: session.user.email,
        },
      },
    });

    console.log(`✅ [CRM Status] Status updated: ${existingLead.status} → ${backendStatus}`);

    // Respuesta compatible con el frontend
    const response = {
      id: updatedLead.id,
      companyName: updatedLead.companyName,
      cif: updatedLead.cif,
      sector: updatedLead.sector,
      source: updatedLead.source.toLowerCase(),
      priority: updatedLead.priority.toLowerCase(),
      status: updatedLead.status.toLowerCase(),
      estimatedValue: updatedLead.estimatedRevenue ? Number(updatedLead.estimatedRevenue) : undefined,
      assignedToId: updatedLead.assignedToId,
      assignedTo: updatedLead.assignedTo ? {
        id: updatedLead.assignedTo.id,
        email: updatedLead.assignedTo.email
      } : undefined,
      createdAt: updatedLead.createdAt.toISOString(),
      updatedAt: updatedLead.updatedAt.toISOString(),
      lastContactDate: updatedLead.lastContactDate?.toISOString() || null,
      nextFollowUpDate: updatedLead.nextFollowUpDate?.toISOString() || null,
      convertedAt: updatedLead.convertedAt?.toISOString() || null,
      contacts: [], // TODO: Agregar cuando se cree el modelo
      _count: {
        contacts: 0, // TODO: Contar contactos reales
        interactions: 0 // Se puede calcular si es necesario
      }
    };

    return NextResponse.json({
      success: true,
      data: response,
      message: 'Estat actualitzat correctament',
      changes: {
        status: {
          from: existingLead.status.toLowerCase(),
          to: updatedLead.status.toLowerCase()
        }
      }
    });

  } catch (error) {
    console.error('❌ [CRM Status] Error updating status:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}

// Otros métodos HTTP no permitidos
export async function GET() {
  return NextResponse.json({ error: 'Método no permitido. Usa PATCH para actualizar estado' }, { status: 405 });
}

export async function POST() {
  return NextResponse.json({ error: 'Método no permitido. Usa PATCH para actualizar estado' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Método no permitido. Usa PATCH para actualizar estado' }, { status: 405 });
}