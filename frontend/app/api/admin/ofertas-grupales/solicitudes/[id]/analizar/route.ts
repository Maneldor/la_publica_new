import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { z } from 'zod';

// SEGURIDAD: Schema de validación adaptado a los campos existentes
const AnalisisSchema = z.object({
  // Análisis del admin
  adminViability: z.enum(['ALTA', 'MITJANA', 'BAIXA'] as const),
  adminComplexity: z.enum(['SIMPLE', 'MITJANA', 'ALTA'] as const),
  adminRisk: z.enum(['BAIX', 'MIG', 'ALT'] as const),
  adminNotes: z.string()
    .min(20, 'Les notes han de tenir almenys 20 caràcters')
    .max(2000, 'Les notes no poden superar 2000 caràcters'),

  // Presupuesto básico (se guardará en internalNotes como JSON)
  budgetServiceFee: z.number()
    .positive('El preu del servei ha de ser positiu')
    .max(10000, 'El preu del servei no pot superar 10.000€'),
  budgetCommission: z.number()
    .min(0, 'La comissió no pot ser negativa')
    .max(20, 'La comissió no pot superar 20%'),

  // Timeline en días
  budgetPhase1Days: z.number()
    .int()
    .min(7, 'Fase 1 mínim 7 dies')
    .max(60, 'Fase 1 màxim 60 dies'),
  budgetPhase2Days: z.number()
    .int()
    .min(3, 'Fase 2 mínim 3 dies')
    .max(30, 'Fase 2 màxim 30 dies'),
  budgetPhase3Days: z.number()
    .int()
    .min(7, 'Fase 3 mínim 7 dies')
    .max(90, 'Fase 3 màxim 90 dies'),

  // Presupuesto - Límites personas (opcional, si no se especifica usa los de la solicitud)
  budgetMinPeople: z.number()
    .int()
    .min(5, 'Mínim 5 persones')
    .max(10000, 'Màxim 10.000 persones')
    .optional(),
  budgetMaxPeople: z.number()
    .int()
    .min(5, 'Mínim 5 persones')
    .max(10000, 'Màxim 10.000 persones')
    .optional(),

  // Escalas de precio simplificadas
  budgetPriceScales: z.array(
    z.object({
      minPersonas: z.number().int().positive(),
      precio: z.number().positive()
    })
  )
    .min(1, 'Mínim 1 escala de preu')
    .max(5, 'Màxim 5 escalas de preu')
    .refine(
      (scales) => {
        // Verificar orden ascendente de personas
        for (let i = 1; i < scales.length; i++) {
          if (scales[i].minPersonas <= scales[i - 1].minPersonas) {
            return false;
          }
        }
        return true;
      },
      { message: 'Les escalas han de estar ordenades per nombre de persones creixent' }
    ),

  // Depósito requerido
  budgetDeposit: z.number()
    .min(0, 'El dipòsit no pot ser negatiu')
    .optional(),

  // Notas para el gestor
  budgetNotes: z.string()
    .max(2000, 'Les notes no poden superar 2000 caràcters')
    .optional(),

  // Decisión final
  approved: z.boolean()
    .default(true), // Por defecto se aprueba al analizar
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
      console.warn('[SECURITY] Intento de análisis sin autenticación');
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    // SEGURIDAD: Verificar rol ADMIN
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
      console.warn(`[SECURITY] Usuario ${user?.email} intentó analizar sin permisos admin`);
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

    // SEGURIDAD: Verificar estado permitido
    if (existingRequest.status !== 'PENDING') {
      return NextResponse.json(
        {
          success: false,
          error: `No es pot analitzar una sol·licitud en estat ${existingRequest.status}`
        },
        { status: 400 }
      );
    }

    // Parsear y validar body
    const body = await req.json();
    const validationResult = AnalisisSchema.safeParse(body);

    if (!validationResult.success) {
      console.warn(`[VALIDATION] Datos de análisis inválidos:`, validationResult.error.issues);
      return NextResponse.json(
        {
          success: false,
          error: 'Dades d\'anàlisi invàlides',
          details: validationResult.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // VALIDACIONES ADICIONALES
    const budgetMinPeople = data.budgetMinPeople || existingRequest.minParticipants;
    const budgetMaxPeople = data.budgetMaxPeople || existingRequest.maxParticipants || (existingRequest.minParticipants * 2);

    if (budgetMaxPeople < budgetMinPeople) {
      return NextResponse.json(
        {
          success: false,
          error: 'El màxim de persones ha de ser major o igual al mínim'
        },
        { status: 400 }
      );
    }

    // Verificar que la primera escala coincida con el mínimo (si hay escalas múltiples)
    if (data.budgetPriceScales.length > 1 && data.budgetPriceScales[0].minPersonas !== budgetMinPeople) {
      return NextResponse.json(
        {
          success: false,
          error: 'La primera escala de preu ha de coincidir amb el mínim de persones'
        },
        { status: 400 }
      );
    }

    // Calcular timeline total
    const budgetTimeline = data.budgetPhase1Days + data.budgetPhase2Days + data.budgetPhase3Days;

    // Preparar análisis completo para guardar en internalNotes
    const analysisData = {
      adminAnalysis: {
        viability: data.adminViability,
        complexity: data.adminComplexity,
        risk: data.adminRisk,
        notes: data.adminNotes,
        reviewedBy: user.id,
        reviewedAt: new Date().toISOString(),
        approved: data.approved
      },
      budget: {
        serviceFee: data.budgetServiceFee,
        commission: data.budgetCommission,
        timeline: {
          total: budgetTimeline,
          phase1: data.budgetPhase1Days,
          phase2: data.budgetPhase2Days,
          phase3: data.budgetPhase3Days
        },
        deposit: data.budgetDeposit || 0,
        people: {
          min: budgetMinPeople,
          max: budgetMaxPeople
        },
        priceScales: data.budgetPriceScales,
        notes: data.budgetNotes || ''
      },
      timestamp: new Date().toISOString(),
      adminId: user.id,
      adminName: user.name
    };

    const newStatus = data.approved ? 'APPROVED' : 'REJECTED';
    const newInternalNotes = `${existingRequest.internalNotes || ''}\n\n--- ANÁLISIS ADMIN (${new Date().toLocaleDateString()}) ---\n${JSON.stringify(analysisData, null, 2)}`;

    // TRANSACCIÓN: Actualizar solicitud
    const updatedRequest = await prismaClient.groupOfferRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        reviewedBy: user.id,
        rejectionReason: data.approved ? null : `Análisis admin: ${data.adminViability} viabilitat, ${data.adminComplexity} complexitat, ${data.adminRisk} risc. ${data.adminNotes}`,
        internalNotes: newInternalNotes,
        priority: data.approved ? Math.max(existingRequest.priority, 5) : 0, // Prioridad alta si se aprueba
      },
      include: {
        requester: {
          include: {
            ownedCompany: true
          }
        }
      }
    });

    // Crear notificación para la empresa
    const notificationMessage = data.approved
      ? `La teva sol·licitud "${existingRequest.title}" ha estat aprovada i està sent processada per l'equip.`
      : `La teva sol·licitud "${existingRequest.title}" ha estat revisada. Contactarem amb tu aviat amb més informació.`;

    await prismaClient.notification.create({
      data: {
        type: 'SYSTEM',
        title: data.approved ? 'Sol·licitud Aprovada' : 'Sol·licitud Revisada',
        message: notificationMessage,
        priority: 'HIGH',
        userId: existingRequest.requester.id,
        isRead: false,
        metadata: JSON.stringify({
          requestId: updatedRequest.id,
          adminId: user.id,
          approved: data.approved,
          analysisDate: new Date().toISOString()
        })
      }
    });

    // AUDIT LOG (usando la tabla Notification como registro de auditoría temporal)
    await prismaClient.notification.create({
      data: {
        type: 'SYSTEM',
        title: `ADMIN_ANALYSIS: ${data.approved ? 'APPROVED' : 'REJECTED'}`,
        message: `${user.email} analizó solicitud ${requestId} - Viabilidad: ${data.adminViability}, Complejidad: ${data.adminComplexity}, Riesgo: ${data.adminRisk}`,
        priority: 'LOW',
        userId: user.id,
        isRead: true,
        metadata: JSON.stringify({
          action: 'ANALYZE_GROUP_REQUEST',
          requestId,
          originalStatus: existingRequest.status,
          newStatus,
          analysis: analysisData,
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        })
      }
    });

    // Logging
    console.log(`[ADMIN_SUCCESS] ${user.email} analizó solicitud ${requestId} - ${data.approved ? 'APROBADA' : 'RECHAZADA'}`);
    console.log(`[PERFORMANCE] Tiempo de respuesta: ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      message: data.approved ? 'Sol·licitud aprovada correctament' : 'Análisi completat',
      data: {
        id: updatedRequest.id,
        status: updatedRequest.status,
        approved: data.approved,
        analysis: {
          viability: data.adminViability,
          complexity: data.adminComplexity,
          risk: data.adminRisk,
          notes: data.adminNotes,
          reviewedBy: {
            id: user.id,
            name: user.name,
            email: user.email
          },
          reviewedAt: updatedRequest.reviewedAt
        },
        budget: {
          serviceFee: data.budgetServiceFee,
          commission: data.budgetCommission,
          timeline: {
            total: budgetTimeline,
            phase1: data.budgetPhase1Days,
            phase2: data.budgetPhase2Days,
            phase3: data.budgetPhase3Days
          },
          deposit: data.budgetDeposit || 0,
          people: {
            min: budgetMinPeople,
            max: budgetMaxPeople
          },
          priceScales: data.budgetPriceScales,
          notes: data.budgetNotes || ''
        },
        company: updatedRequest.requester.ownedCompany
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[ERROR] Error analizando solicitud:', error);

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
  return NextResponse.json({ error: 'Mètode no permès. Usa POST per analitzar.' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Mètode no permès' }, { status: 405 });
}