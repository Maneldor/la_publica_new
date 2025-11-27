import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { z } from 'zod';

// SEGURIDAD: Schema de validación
const AsignacionSchema = z.object({
  gestorId: z.string().cuid('ID de gestor invàlid'),
  notes: z.string()
    .max(1000, 'Les notes no poden superar 1000 caràcters')
    .optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();

  try {
    // SEGURIDAD: Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.warn('[SECURITY] Intento de asignación sin autenticación');
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    // SEGURIDAD: Verificar rol ADMIN
    const admin = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true
      }
    });

    if (!admin || admin.role !== 'ADMIN') {
      console.warn(`[SECURITY] Usuario ${admin?.email} intentó asignar sin permisos admin`);
      return NextResponse.json(
        { success: false, error: 'Accés denegat. Només per administradors.' },
        { status: 403 }
      );
    }

    // Verificar que la solicitud existe
    const requestId = params.id;
    const existingRequest = await prismaClient.groupOfferRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: {
          include: {
            ownedCompany: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: 'Sol·licitud no trobada' },
        { status: 404 }
      );
    }

    // SEGURIDAD: Verificar estado permitido - debe estar APPROVED para asignar
    if (existingRequest.status !== 'APPROVED') {
      return NextResponse.json(
        {
          success: false,
          error: `No es pot assignar una sol·licitud en estat ${existingRequest.status}. Ha d'estar aprovada primer.`
        },
        { status: 400 }
      );
    }

    // Parsear y validar body
    const body = await req.json();
    const validationResult = AsignacionSchema.safeParse(body);

    if (!validationResult.success) {
      console.warn(`[VALIDATION] Datos de asignación inválidos:`, validationResult.error.issues);
      return NextResponse.json(
        {
          success: false,
          error: 'Dades d\'assignació invàlides',
          details: validationResult.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    const { gestorId, notes } = validationResult.data;

    // SEGURIDAD: Verificar que el gestor existe y tiene el rol correcto
    const gestor = await prismaClient.user.findUnique({
      where: { id: gestorId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        isActive: true
      }
    });

    if (!gestor) {
      return NextResponse.json(
        { success: false, error: 'Gestor no trobat' },
        { status: 404 }
      );
    }

    // Verificar que es un admin (ya que no tenemos rol GESTOR_EMPRESES)
    if (gestor.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: `L'usuari ${gestor.email} no té permisos de gestió d'empreses`
        },
        { status: 400 }
      );
    }

    if (!gestor.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: `L'usuari ${gestor.email} no està actiu`
        },
        { status: 400 }
      );
    }

    // Verificar si ya está asignado (mirando en internalNotes)
    const isReassignment = existingRequest.internalNotes && existingRequest.internalNotes.includes('ASSIGNAT A:');
    let previousGestorInfo = null;

    if (isReassignment) {
      // Extraer info del gestor anterior de las notas internas
      const match = existingRequest.internalNotes?.match(/ASSIGNAT A: (.+) \((.+)\)/);
      if (match) {
        previousGestorInfo = { name: match[1], email: match[2] };
      }
    }

    // Preparar nueva información de asignación
    const assignmentInfo = {
      gestorId: gestor.id,
      gestorName: gestor.name,
      gestorEmail: gestor.email,
      assignedAt: new Date().toISOString(),
      assignedBy: admin.id,
      assignedByName: admin.name,
      notes: notes || ''
    };

    const assignmentText = `\n\n--- ASSIGNACIÓ ${isReassignment ? '(REASSIGNACIÓ)' : ''} (${new Date().toLocaleDateString()}) ---\nASSIGNAT A: ${gestor.name} (${gestor.email})\nPER: ${admin.name}\n${notes ? `NOTES: ${notes}` : ''}\nDATA: ${new Date().toISOString()}`;

    const newInternalNotes = `${existingRequest.internalNotes || ''}${assignmentText}`;

    // TRANSACCIÓN: Actualizar solicitud y crear notificaciones
    const updatedRequest = await prismaClient.groupOfferRequest.update({
      where: { id: requestId },
      data: {
        // Cambiar estado a ASSIGNED usando reviewedBy como gestor asignado temporalmente
        reviewedBy: gestorId,
        reviewedAt: new Date(),
        internalNotes: newInternalNotes,
        // Incrementar prioridad si es primera asignación
        priority: isReassignment ? existingRequest.priority : Math.max(existingRequest.priority, 7)
      },
      include: {
        requester: {
          include: {
            ownedCompany: true
          }
        }
      }
    });

    // Crear notificaciones
    await Promise.all([
      // Notificación al gestor asignado
      prismaClient.notification.create({
        data: {
        type: 'SYSTEM',
          title: isReassignment ? 'Sol·licitud reassignada' : 'Nova sol·licitud assignada',
          message: `Se t'ha assignat la gestió de la sol·licitud "${existingRequest.title}" de ${existingRequest.requester.ownedCompany?.name || 'empresa'}`,
          priority: 'HIGH',
          userId: gestorId,
          isRead: false,
          metadata: JSON.stringify({
            requestId: existingRequest.id,
            companyId: existingRequest.requester.ownedCompany?.id,
            companyName: existingRequest.requester.ownedCompany?.name,
            title: existingRequest.title,
            targetPrice: existingRequest.targetPrice,
            minParticipants: existingRequest.minParticipants,
            adminId: admin.id,
            assignmentNotes: notes || ''
          })
        }
      }),

      // Notificación a la empresa
      prismaClient.notification.create({
        data: {
        type: 'SYSTEM',
          title: 'Sol·licitud assignada a gestor',
          message: `La teva sol·licitud "${existingRequest.title}" ha estat assignada a ${gestor.name}, que es posarà en contacte amb tu aviat per iniciar el procés.`,
          priority: 'NORMAL',
          userId: existingRequest.requester.id,
          isRead: false,
          metadata: JSON.stringify({
            requestId: existingRequest.id,
            gestorId: gestor.id,
            gestorName: gestor.name,
            gestorEmail: gestor.email
          })
        }
      }),

      // AUDIT LOG usando notificaciones
      prismaClient.notification.create({
        data: {
        type: 'SYSTEM',
          title: `ADMIN_ASSIGNMENT: ${isReassignment ? 'REASSIGNED' : 'ASSIGNED'}`,
          message: `${admin.email} ${isReassignment ? 'reasignó' : 'asignó'} solicitud ${requestId} a gestor ${gestor.email}`,
          priority: 'LOW',
          userId: admin.id,
          isRead: true,
          metadata: JSON.stringify({
            action: isReassignment ? 'REASSIGN_GROUP_REQUEST' : 'ASSIGN_GROUP_REQUEST',
            requestId,
            gestorId: gestor.id,
            gestorName: gestor.name,
            previousGestor: previousGestorInfo,
            assignmentNotes: notes,
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown'
          })
        }
      })
    ]);

    // Logging
    console.log(`[ADMIN_SUCCESS] ${admin.email} ${isReassignment ? 'reasignó' : 'asignó'} solicitud ${requestId} a ${gestor.email}`);
    console.log(`[PERFORMANCE] Tiempo de respuesta: ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      message: isReassignment
        ? 'Sol·licitud reassignada correctament'
        : 'Sol·licitud assignada correctament',
      data: {
        id: updatedRequest.id,
        status: 'ASSIGNED',
        assignedTo: {
          id: gestor.id,
          name: gestor.name,
          email: gestor.email
        },
        assignedAt: updatedRequest.reviewedAt,
        previousGestor: previousGestorInfo,
        company: {
          id: updatedRequest.requester.ownedCompany?.id,
          name: updatedRequest.requester.ownedCompany?.name
        },
        title: updatedRequest.title,
        isReassignment,
        assignedBy: {
          id: admin.id,
          name: admin.name
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[ERROR] Error asignando solicitud:', error);

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
export async function GET() {
  return NextResponse.json({ error: 'Mètode no permès' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Mètode no permès. Usa POST per assignar.' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Mètode no permès' }, { status: 405 });
}