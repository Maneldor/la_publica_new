import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { z } from 'zod';

// SEGURIDAD: Schema de validación para ID de solicitud
const ParamsSchema = z.object({
  id: z.string().uuid('ID de sol·licitud invàlid')
});

// Función helper para convertir prioridad numérica a string
function mapPriorityToString(priority: number): string {
  if (priority >= 8) return 'HIGH';
  if (priority >= 5) return 'MEDIUM';
  return 'LOW';
}

// Función helper para extraer timeline de internalNotes
function parseTimelineFromNotes(internalNotes: string | null): any[] {
  if (!internalNotes) return [];

  const timeline: any[] = [];

  // Buscar patrones de análisis admin
  const analysisMatch = internalNotes.match(/--- ANÁLISIS ADMIN \(([^)]+)\) ---/g);
  if (analysisMatch) {
    analysisMatch.forEach(match => {
      const dateMatch = match.match(/\(([^)]+)\)/);
      if (dateMatch) {
        timeline.push({
          fecha: dateMatch[1],
          evento: 'Análisis Admin',
          descripcion: 'Solicitud analizada por administrador',
          usuario: 'Sistema'
        });
      }
    });
  }

  // Buscar patrones de asignación
  const assignmentMatch = internalNotes.match(/--- ASSIGNACIÓ.*?\(([^)]+)\) ---.*?ASSIGNAT A: ([^(]+)\(([^)]+)\).*?PER: ([^\n]+)/g);
  if (assignmentMatch) {
    assignmentMatch.forEach(match => {
      const parts = match.match(/\(([^)]+)\).*?ASSIGNAT A: ([^(]+)\(([^)]+)\).*?PER: ([^\n]+)/);
      if (parts) {
        timeline.push({
          fecha: parts[1],
          evento: 'Assignació a Gestor',
          descripcion: `Assignat a ${parts[2].trim()}`,
          usuario: parts[4].trim()
        });
      }
    });
  }

  // Buscar notas de negociación (formato timestamp)
  const negotiationMatches = internalNotes.match(/\[([^\]]+)\] Negociació - ([^:]+):/g);
  if (negotiationMatches) {
    negotiationMatches.forEach(match => {
      const parts = match.match(/\[([^\]]+)\] Negociació - ([^:]+):/);
      if (parts) {
        timeline.push({
          fecha: parts[1],
          evento: 'Nota de Negociació',
          descripcion: 'Gestor ha afegit notes de negociació',
          usuario: parts[2].trim()
        });
      }
    });
  }

  // Ordenar por fecha descendente
  return timeline.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();

  try {
    // SEGURIDAD: Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.warn('[SECURITY] Intento de acceso sin autenticación a detalle solicitud');
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    // SEGURIDAD: Verificar rol ADMIN (gestores son ADMIN)
    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true
      }
    });

    if (!user || user.role !== 'ADMIN') {
      console.warn(`[SECURITY] Usuario ${user?.email} intentó acceder a detalle sin permisos de gestor`);
      return NextResponse.json(
        { success: false, error: 'Accés denegat. Només per gestors.' },
        { status: 403 }
      );
    }

    // Validar parámetros
    const validationResult = ParamsSchema.safeParse(params);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de sol·licitud invàlid',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { id: requestId } = validationResult.data;

    // Obtener solicitud con toda la información relacionada
    const solicitud = await prismaClient.groupOfferRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: {
          include: {
            ownedCompany: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                logo: true,
                category: true,
                description: true,
                website: true
              }
            }
          }
        },
        reviewedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    // Verificar que existe la solicitud
    if (!solicitud) {
      return NextResponse.json(
        { success: false, error: 'Sol·licitud no trobada' },
        { status: 404 }
      );
    }

    // SEGURIDAD: Verificar que es el gestor asignado
    if (solicitud.reviewedBy !== session.user.id) {
      console.warn(`[SECURITY] Usuario ${user.email} intentó acceder a solicitud no asignada: ${requestId}`);
      return NextResponse.json(
        { success: false, error: 'No tens permisos per veure aquesta sol·licitud. Només pots accedir a les teves assignacions.' },
        { status: 403 }
      );
    }

    // Buscar configuración de oferta grupal si existe
    let configuracion = null;
    try {
      configuracion = await prismaClient.groupOfferConfig.findFirst({
        where: {
          // Buscar por empresa o solicitud relacionada
          OR: [
            { relatedRequestId: requestId },
            { companyId: solicitud.requester.ownedCompany?.id || '' }
          ]
        }
      });
    } catch (error) {
      console.log('No se encontró configuración asociada'); // Normal si aún no se ha creado
    }

    // Obtener historial de notificaciones relacionadas con esta solicitud
    const historial = await prismaClient.notification.findMany({
      where: {
        OR: [
          // Notificaciones al usuario de la empresa
          {
            AND: [
              { userId: solicitud.requesterId },
              {
                OR: [
                  { message: { contains: solicitud.title } },
                  { metadata: { path: ['requestId'], equals: requestId } }
                ]
              }
            ]
          },
          // Notificaciones al gestor
          {
            AND: [
              { userId: session.user.id },
              {
                OR: [
                  { message: { contains: solicitud.title } },
                  { metadata: { path: ['requestId'], equals: requestId } }
                ]
              }
            ]
          },
          // Audit logs relacionados
          {
            AND: [
              { type: 'AUDIT_LOG' },
              { message: { contains: requestId } }
            ]
          }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        priority: true,
        createdAt: true,
        isRead: true
      }
    });

    // Generar timeline desde internalNotes
    const timeline = parseTimelineFromNotes(solicitud.internalNotes);

    // Formatear respuesta completa
    const response = {
      solicitud: {
        id: solicitud.id,
        empresaId: solicitud.requesterId,
        title: solicitud.title,
        productCategory: solicitud.productCategory,
        estimatedParticipants: solicitud.minParticipants,
        targetPrice: solicitud.targetPrice,
        description: solicitud.description,
        additionalRequirements: solicitud.description,
        status: solicitud.status,
        priority: mapPriorityToString(solicitud.priority),
        internalNotes: solicitud.internalNotes,
        assignedAt: solicitud.reviewedAt?.toISOString() || null,
        createdAt: solicitud.createdAt.toISOString(),
        updatedAt: solicitud.updatedAt.toISOString(),
        rejectionReason: solicitud.rejectionReason
      },
      empresa: {
        id: solicitud.requester.ownedCompany?.id || null,
        name: solicitud.requester.ownedCompany?.name || 'Sin empresa asociada',
        email: solicitud.requester.ownedCompany?.email || solicitud.requester.email,
        phone: solicitud.requester.ownedCompany?.phone || null,
        logo: solicitud.requester.ownedCompany?.logo || null,
        category: solicitud.requester.ownedCompany?.category || 'General',
        description: solicitud.requester.ownedCompany?.description || null,
        website: solicitud.requester.ownedCompany?.website || null
      },
      gestor: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      configuracion,
      historial: historial.map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        priority: notif.priority,
        createdAt: notif.createdAt.toISOString(),
        isRead: notif.isRead
      })),
      timeline,
      analytics: {
        diasDesdeAsignacion: solicitud.reviewedAt
          ? Math.floor((Date.now() - solicitud.reviewedAt.getTime()) / (1000 * 60 * 60 * 24))
          : null,
        diasDesdeCreacion: Math.floor((Date.now() - solicitud.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        tieneConfiguracion: !!configuracion,
        totalNotificaciones: historial.length
      }
    };

    // AUDIT LOG para acceso a detalle
    await prismaClient.notification.create({
      data: {
        type: 'AUDIT_LOG',
        title: 'GESTOR_ACCESS: Detalle solicitud',
        message: `${user.email} accedió al detalle de la solicitud ${requestId}`,
        priority: 'LOW',
        userId: user.id,
        isRead: true,
        metadata: JSON.stringify({
          action: 'VIEW_REQUEST_DETAIL',
          requestId,
          companyId: solicitud.requester.ownedCompany?.id,
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        })
      }
    });

    console.log(`[GESTOR_SUCCESS] ${user.email} accedió a detalle de solicitud ${requestId}`);
    console.log(`[PERFORMANCE] Tiempo de respuesta: ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('[ERROR] Error obteniendo detalle de solicitud:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Error intern del servidor. Intenta-ho més tard.'
      },
      { status: 500 }
    );
  }
}

// SEGURIDAD: Bloquear otros métodos HTTP
export async function POST() {
  return NextResponse.json({ error: 'Mètode no permès. Usa GET per consultar.' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Mètode no permès. Usa GET per consultar.' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Mètode no permès. Usa GET per consultar.' }, { status: 405 });
}