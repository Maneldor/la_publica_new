import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { z } from 'zod';

// SEGURIDAD: Schema de validación para parámetros
const ParamsSchema = z.object({
  id: z.string().uuid('ID de sol·licitud invàlid')
});

// SEGURIDAD: Schema de validación para actualizaciones
const UpdateSchema = z.object({
  internalNotes: z.string()
    .max(2000, 'Les notes internes no poden superar 2000 caràcters')
    .optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW'], {
    errorMap: () => ({ message: 'Prioritat ha de ser HIGH, MEDIUM o LOW' })
  }).optional(),
  negotiationNote: z.string()
    .min(10, 'La nota de negociació ha de tenir almenys 10 caràcters')
    .max(1000, 'La nota de negociació no pot superar 1000 caràcters')
    .optional(),
  action: z.enum(['update', 'add_note'], {
    errorMap: () => ({ message: 'Acció ha de ser update o add_note' })
  }).default('update')
}).refine(data => {
  // Al menos un campo debe ser proporcionado
  return data.internalNotes || data.priority || data.negotiationNote;
}, {
  message: 'Almenys un camp ha de ser proporcionat per actualitzar (internalNotes, priority o negotiationNote)'
});

// Función helper para convertir string prioridad a número
function mapPriorityStringToNumber(priority: string): number {
  switch (priority) {
    case 'HIGH': return 8;
    case 'MEDIUM': return 5;
    case 'LOW': return 2;
    default: return 5;
  }
}

// Función helper para convertir prioridad numérica a string
function mapPriorityToString(priority: number): string {
  if (priority >= 8) return 'HIGH';
  if (priority >= 5) return 'MEDIUM';
  return 'LOW';
}

// Función de sanitización para prevenir XSS
function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/&lt;script/gi, '')
    .replace(/&lt;\/script/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Rate limiting simple (en memoria)
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, requestId: string): boolean {
  const key = `${userId}:${requestId}`;
  const now = Date.now();
  const limit = 30; // 30 actualizaciones por hora
  const window = 60 * 60 * 1000; // 1 hora en milisegundos

  const record = rateLimiter.get(key);

  if (!record || now > record.resetTime) {
    rateLimiter.set(key, { count: 1, resetTime: now + window });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();

  try {
    // SEGURIDAD: Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.warn('[SECURITY] Intento de actualización sin autenticación');
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
      console.warn(`[SECURITY] Usuario ${user?.email} intentó actualizar sin permisos de gestor`);
      return NextResponse.json(
        { success: false, error: 'Accés denegat. Només per gestors.' },
        { status: 403 }
      );
    }

    // Validar parámetros URL
    const paramsValidation = ParamsSchema.safeParse(params);
    if (!paramsValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de sol·licitud invàlid',
          details: paramsValidation.error.errors
        },
        { status: 400 }
      );
    }

    const { id: requestId } = paramsValidation.data;

    // SEGURIDAD: Rate limiting por usuario y solicitud
    if (!checkRateLimit(user.id, requestId)) {
      console.warn(`[RATE_LIMIT] Usuario ${user.email} excedió límite de actualizaciones para ${requestId}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Massa actualitzacions. Espera una estona abans de continuar.'
        },
        { status: 429 }
      );
    }

    // Parsear y validar body
    const body = await req.json();
    const validationResult = UpdateSchema.safeParse(body);

    if (!validationResult.success) {
      console.warn(`[VALIDATION] Datos de actualización inválidos:`, validationResult.error.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Dades d\'actualització invàlides',
          details: validationResult.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Verificar que la solicitud existe y está asignada al gestor
    const existingSolicitud = await prismaClient.groupOfferRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        title: true,
        requesterId: true,
        reviewedBy: true,
        status: true,
        priority: true,
        internalNotes: true,
        updatedAt: true,
        requester: {
          include: {
            ownedCompany: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!existingSolicitud) {
      return NextResponse.json(
        { success: false, error: 'Sol·licitud no trobada' },
        { status: 404 }
      );
    }

    // SEGURIDAD: Verificar que es el gestor asignado
    if (existingSolicitud.reviewedBy !== user.id) {
      console.warn(`[SECURITY] Usuario ${user.email} intentó actualizar solicitud no asignada: ${requestId}`);
      return NextResponse.json(
        { success: false, error: 'No tens permisos per actualitzar aquesta sol·licitud. Només pots modificar les teves assignacions.' },
        { status: 403 }
      );
    }

    // SEGURIDAD: No permitir actualización de solicitudes rechazadas
    if (existingSolicitud.status === 'REJECTED') {
      return NextResponse.json(
        { success: false, error: 'No es poden actualitzar sol·licituds rebutjades.' },
        { status: 400 }
      );
    }

    // Preparar datos de actualización
    const updatePayload: any = {
      updatedAt: new Date()
    };

    const cambios = {
      priority: false,
      internalNotes: false,
      negotiationNote: false
    };

    // Manejar diferentes tipos de actualizaciones
    if (updateData.action === 'add_note' && updateData.negotiationNote) {
      // Agregar nota de negociación con timestamp
      const timestamp = new Date().toISOString();
      const notaFormateada = `\n\n[${timestamp}] Negociació - ${user.name}:\n${sanitizeText(updateData.negotiationNote)}\n`;
      const notasActuales = existingSolicitud.internalNotes || '';

      updatePayload.internalNotes = notasActuales + notaFormateada;
      cambios.negotiationNote = true;

    } else if (updateData.action === 'update') {
      // Actualización completa de campos
      if (updateData.internalNotes !== undefined) {
        updatePayload.internalNotes = sanitizeText(updateData.internalNotes);
        cambios.internalNotes = true;
      }

      if (updateData.priority !== undefined) {
        updatePayload.priority = mapPriorityStringToNumber(updateData.priority);
        cambios.priority = true;
      }
    }

    // Ejecutar actualización en transacción con notificaciones
    const [updatedSolicitud] = await prismaClient.$transaction(async (prisma) => {
      // 1. Actualizar solicitud
      const updated = await prisma.groupOfferRequest.update({
        where: { id: requestId },
        data: updatePayload,
        include: {
          requester: {
            include: {
              ownedCompany: true
            }
          }
        }
      });

      // 2. Crear notificaciones según los cambios

      // Notificar a admin si cambió prioridad
      if (cambios.priority) {
        await prisma.notification.create({
          data: {
            type: 'SYSTEM_NOTIFICATION',
            title: 'Prioritat de sol·licitud actualitzada',
            message: `${user.name} ha canviat la prioritat de la sol·licitud "${existingSolicitud.title}" a ${updateData.priority}`,
            priority: 'NORMAL',
            userId: 'admin', // Cambiar por ID de admin real
            isRead: false,
            metadata: JSON.stringify({
              requestId,
              gestorId: user.id,
              oldPriority: mapPriorityToString(existingSolicitud.priority),
              newPriority: updateData.priority
            })
          }
        });
      }

      // Notificar a empresa si agregó nota de negociación (opcional)
      if (cambios.negotiationNote) {
        await prisma.notification.create({
          data: {
            type: 'SYSTEM_NOTIFICATION',
            title: 'Actualització del gestor',
            message: `El gestor ${user.name} ha actualitzat la informació de la vostra sol·licitud "${existingSolicitud.title}".`,
            priority: 'NORMAL',
            userId: existingSolicitud.requesterId,
            isRead: false,
            metadata: JSON.stringify({
              requestId,
              gestorId: user.id,
              gestorName: user.name,
              updateType: 'negotiation_note'
            })
          }
        });
      }

      // 3. AUDIT LOG
      await prisma.notification.create({
        data: {
          type: 'AUDIT_LOG',
          title: 'GESTOR_UPDATE: Solicitud actualizada',
          message: `${user.email} actualizó solicitud ${requestId} - Cambios: ${Object.keys(cambios).filter(key => cambios[key as keyof typeof cambios]).join(', ')}`,
          priority: 'LOW',
          userId: user.id,
          isRead: true,
          metadata: JSON.stringify({
            action: 'UPDATE_ASSIGNED_REQUEST',
            requestId,
            changes: cambios,
            oldValues: {
              priority: existingSolicitud.priority,
              internalNotesLength: existingSolicitud.internalNotes?.length || 0
            },
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown'
          })
        }
      });

      return [updated];
    });

    console.log(`[GESTOR_SUCCESS] ${user.email} actualizó solicitud ${requestId} - Cambios: ${Object.keys(cambios).filter(key => cambios[key as keyof typeof cambios]).join(', ')}`);
    console.log(`[PERFORMANCE] Tiempo de respuesta: ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      message: 'Sol·licitud actualitzada correctament',
      data: {
        solicitud: {
          id: updatedSolicitud.id,
          status: updatedSolicitud.status,
          priority: mapPriorityToString(updatedSolicitud.priority),
          internalNotes: updatedSolicitud.internalNotes,
          updatedAt: updatedSolicitud.updatedAt.toISOString()
        },
        cambios,
        empresa: {
          name: updatedSolicitud.requester.ownedCompany?.name || 'Sin empresa'
        }
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dades invàlides',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    console.error('[ERROR] Error actualizando solicitud:', error);

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
  return NextResponse.json({ error: 'Mètode no permès. Usa PATCH per actualitzar.' }, { status: 405 });
}

export async function POST() {
  return NextResponse.json({ error: 'Mètode no permès. Usa PATCH per actualitzar.' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Mètode no permès. Usa PATCH per actualitzar.' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Mètode no permès. Usa PATCH per actualitzar.' }, { status: 405 });
}