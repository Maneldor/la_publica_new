import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { z } from 'zod';

// SEGURIDAD: Función de sanitización simple pero efectiva
function sanitizeText(text: string): string {
  if (!text) return '';

  return text
    // Eliminar caracteres peligrosos
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '') // Eliminar todas las etiquetas HTML
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '') // Eliminar event handlers
    .replace(/&lt;script/gi, '')
    .replace(/&lt;\/script/gi, '')
    // Normalizar espacios
    .replace(/\s+/g, ' ')
    .trim();
}

// SEGURIDAD: Schema de validación con Zod
const SolicitudSchema = z.object({
  title: z.string()
    .min(10, 'El títol ha de tenir almenys 10 caràcters')
    .max(200, 'El títol no pot superar 200 caràcters')
    .trim(),

  description: z.string()
    .min(50, 'La descripció ha de tenir almenys 50 caràcters')
    .max(5000, 'La descripció no pot superar 5000 caràcters')
    .trim(),

  category: z.string()
    .optional(),

  location: z.string()
    .max(200, 'La ubicació no pot superar 200 caràcters')
    .optional(),

  targetPrice: z.number()
    .positive('El preu ha de ser positiu')
    .max(1000000, 'El preu no pot superar 1.000.000€')
    .finite()
    .optional(),

  minParticipants: z.number()
    .int('Ha de ser un número enter')
    .min(5, 'Mínim 5 persones')
    .max(10000, 'Màxim 10.000 persones'),

  maxParticipants: z.number()
    .int('Ha de ser un número enter')
    .min(5, 'Mínim 5 persones')
    .max(10000, 'Màxim 10.000 persones')
    .optional(),

  contactEmail: z.string()
    .email('Email no vàlid')
    .optional(),

  contactPhone: z.string()
    .max(20, 'Telèfon massa llarg')
    .optional(),

  tags: z.array(z.string().max(50))
    .max(10, 'Màxim 10 etiquetes')
    .optional(),

  priority: z.number()
    .int()
    .min(0)
    .max(10)
    .optional(),

  internalNotes: z.string()
    .max(2000, 'Les notes internes no poden superar 2000 caràcters')
    .optional(),
});

// Rate limiting simple (en producción usar Redis)
const requestCounts = new Map<string, { count: number, resetAt: Date }>();

function checkRateLimit(userId: string): boolean {
  const now = new Date();
  const existing = requestCounts.get(userId);

  if (!existing || now > existing.resetAt) {
    requestCounts.set(userId, {
      count: 1,
      resetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000)
    });
    return true;
  }

  if (existing.count >= 10) {
    return false;
  }

  existing.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // SEGURIDAD: Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.warn('[SECURITY] Intento de solicitud sin autenticación');
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    // SEGURIDAD: Verificar rol COMPANY
    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      include: {
        ownedCompany: true
      }
    });

    if (!user || user.role !== 'COMPANY') {
      console.warn(`[SECURITY] Usuario ${user?.email} intentó solicitar sin ser empresa`);
      return NextResponse.json(
        { success: false, error: 'Només les empreses poden sol·licitar ofertes grupals' },
        { status: 403 }
      );
    }

    // SEGURIDAD: Verificar que está vinculado a empresa
    if (!user.ownedCompanyId || !user.ownedCompany) {
      console.error(`[SECURITY] Usuario ${user.email} sin empresa vinculada`);
      return NextResponse.json(
        { success: false, error: 'No tens empresa vinculada' },
        { status: 403 }
      );
    }

    // SEGURIDAD: Verificar que empresa está activa
    if (user.ownedCompany.status !== 'PUBLISHED') {
      console.warn(`[SECURITY] Empresa ${user.ownedCompany.name} no aprobada intentó solicitar`);
      return NextResponse.json(
        { success: false, error: 'La teva empresa no està aprovada' },
        { status: 403 }
      );
    }

    // SEGURIDAD: Rate limiting
    if (!checkRateLimit(user.id)) {
      console.warn(`[SECURITY] Rate limit excedido para usuario ${user.email}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Has superat el límit de sol·licituds diàries (10). Torna demà.'
        },
        { status: 429 }
      );
    }

    // Parsear body
    const body = await req.json();

    // SEGURIDAD: Validar con Zod
    const validationResult = SolicitudSchema.safeParse(body);

    if (!validationResult.success) {
      console.warn(`[VALIDATION] Datos inválidos de ${user.email}:`, validationResult.error.issues);
      return NextResponse.json(
        {
          success: false,
          error: 'Dades invàlides',
          details: validationResult.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // SEGURIDAD: Validación adicional
    if (data.maxParticipants && data.maxParticipants < data.minParticipants) {
      return NextResponse.json(
        {
          success: false,
          error: 'El número màxim de persones ha de ser major o igual al mínim'
        },
        { status: 400 }
      );
    }

    // SEGURIDAD: Sanitizar textos (prevenir XSS)
    const sanitizedTitle = sanitizeText(data.title);
    const sanitizedDescription = sanitizeText(data.description);
    const sanitizedNotes = data.internalNotes ? sanitizeText(data.internalNotes) : undefined;

    // Crear solicitud
    const request = await prismaClient.groupOfferRequest.create({
      data: {
        title: sanitizedTitle,
        description: sanitizedDescription,
        category: data.category,
        location: data.location,
        targetPrice: data.targetPrice,
        minParticipants: data.minParticipants,
        maxParticipants: data.maxParticipants,
        contactEmail: data.contactEmail || user.ownedCompany.email,
        contactPhone: data.contactPhone || user.ownedCompany.phone,
        requesterId: user.id,
        status: 'PENDING',
        tags: data.tags || [],
        priority: data.priority || 0,
        internalNotes: sanitizedNotes,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
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

    // Obtener admin para notificación
    const admin = await prismaClient.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (admin) {
      await prismaClient.notification.create({
        data: {
          type: 'COMPANY_PENDING',
          title: 'Nova sol·licitud d\'Oferta Grupal',
          message: `${user.ownedCompany.name} ha sol·licitat una oferta grupal: ${sanitizedTitle}`,
          priority: 'HIGH',
          userId: admin.id,
          isRead: false,
        }
      });
    }

    // Logging
    console.log(`[SUCCESS] Solicitud creada: ${request.id} por ${user.ownedCompany.name}`);
    console.log(`[PERFORMANCE] Tiempo de respuesta: ${Date.now() - startTime}ms`);

    return NextResponse.json(
      {
        success: true,
        requestId: request.id,
        message: 'Sol·licitud creada correctament',
        request: {
          id: request.id,
          title: request.title,
          status: request.status,
          createdAt: request.createdAt,
          requester: request.requester
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('[ERROR] Error creando solicitud:', error);

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
  return NextResponse.json({ error: 'Mètode no permès' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Mètode no permès' }, { status: 405 });
}