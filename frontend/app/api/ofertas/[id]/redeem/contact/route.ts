import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { z } from 'zod';

const redeemContactSchema = z.object({
  name: z.string()
    .min(2, 'El nom ha de tenir almenys 2 caràcters')
    .max(100, 'El nom no pot superar 100 caràcters'),
  email: z.string()
    .email('Email invàlid')
    .max(255, 'Email massa llarg'),
  phone: z.string()
    .min(9, 'Telèfon ha de tenir almenys 9 dígits')
    .max(20, 'Telèfon massa llarg')
    .regex(/^[+]?[0-9\s()-]*$/, 'Format de telèfon invàlid'),
  message: z.string()
    .min(10, 'El missatge ha de tenir almenys 10 caràcters')
    .max(1000, 'El missatge no pot superar 1000 caràcters'),
  acceptsMarketing: z.boolean().optional().default(false),
  userAgent: z.string().optional(),
  referrer: z.string().optional()
});

// Función para sanitizar texto y prevenir XSS
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    // 2. Validar ID
    if (!params.id || params.id.length < 10) {
      return NextResponse.json(
        { success: false, error: 'ID invàlid' },
        { status: 400 }
      );
    }

    // 3. Obtener y validar body
    const body = await request.json();
    const validated = redeemContactSchema.parse(body);

    // 4. Buscar oferta
    const offer = await prismaClient.offer.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Oferta no trobada' },
        { status: 404 }
      );
    }

    // 5. Validar tipo de redención
    if (offer.redemptionType !== 'CONTACT_FORM') {
      return NextResponse.json(
        {
          success: false,
          error: 'Aquesta oferta no és de tipus formulari de contacte',
          actualType: offer.redemptionType
        },
        { status: 400 }
      );
    }

    // 6. Verificar estado oferta
    if (offer.status !== 'PUBLISHED') {
      return NextResponse.json(
        { success: false, error: 'Oferta no disponible' },
        { status: 400 }
      );
    }

    // 7. Verificar expiración
    if (offer.expiresAt && new Date(offer.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Oferta caducada' },
        { status: 400 }
      );
    }

    // 8. Verificar lead duplicado (mismo email y oferta)
    const existingLead = await prismaClient.lead.findFirst({
      where: {
        email: validated.email,
        offerId: offer.id
      }
    });

    if (existingLead) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ja existeix una sol·licitud de contacte per aquest email i oferta',
          leadId: existingLead.id,
          status: existingLead.status
        },
        { status: 409 }
      );
    }

    // 9. Operación atómica: Crear Lead + Evento + Notificaciones
    const result = await prismaClient.$transaction(async (prisma) => {
      // Crear lead
      const lead = await prisma.lead.create({
        data: {
          offerId: offer.id,
          userId: session.user.id,
          companyId: offer.companyId,
          name: sanitizeText(validated.name),
          email: validated.email.toLowerCase().trim(),
          phone: validated.phone.replace(/\s+/g, ''),
          message: sanitizeText(validated.message),
          source: 'OFFER_REDEMPTION',
          status: 'NEW',
          acceptsMarketing: validated.acceptsMarketing,
          metadata: {
            offerTitle: offer.title,
            userAgent: validated.userAgent || request.headers.get('user-agent'),
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            referrer: validated.referrer,
            timestamp: new Date().toISOString(),
            redemptionType: 'CONTACT_FORM'
          }
        },
        include: {
          offer: {
            select: { title: true }
          },
          company: {
            select: { name: true }
          }
        }
      });

      // Crear evento de tracking
      await prisma.offerEvent.create({
        data: {
          offerId: offer.id,
          userId: session.user.id,
          companyId: offer.companyId,
          eventType: 'CONTACT_FORM_SUBMIT',
          userAgent: validated.userAgent || request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          referrer: validated.referrer,
          metadata: {
            leadId: lead.id,
            contactEmail: validated.email,
            contactPhone: validated.phone,
            timestamp: new Date().toISOString()
          }
        }
      });

      // Incrementar contador de contactos
      await prisma.offer.update({
        where: { id: offer.id },
        data: {
          contacts: { increment: 1 }
        }
      });

      return lead;
    });

    // 10. Notificar empresa (alta prioridad para leads)
    await prismaClient.notification.create({
      data: {
        userId: offer.companyId,
        type: 'LEAD_NOTIFICATION',
        title: 'Nou lead generat',
        message: `Nou contacte interessat en la teva oferta "${offer.title}": ${validated.name} (${validated.email})`,
        priority: 'HIGH',
        metadata: JSON.stringify({
          leadId: result.id,
          offerId: offer.id,
          contactName: validated.name,
          contactEmail: validated.email,
          contactPhone: validated.phone,
          offerTitle: offer.title,
          timestamp: new Date().toISOString()
        })
      }
    }).catch(err => console.error('Error creant notificació empresa:', err));

    // 11. Notificar usuario de confirmación
    await prismaClient.notification.create({
      data: {
        userId: session.user.id,
        type: 'SYSTEM_NOTIFICATION',
        title: 'Sol·licitud de contacte enviada',
        message: `La teva sol·licitud de contacte per "${offer.title}" s'ha enviat correctament. L'empresa es posarà en contacte amb tu aviat.`,
        priority: 'NORMAL',
        metadata: JSON.stringify({
          leadId: result.id,
          offerId: offer.id,
          companyName: offer.company.name,
          expectedContact: '24-48 horas'
        })
      }
    }).catch(err => console.error('Error creant notificació usuari:', err));

    // 12. Email a empresa (opcional - aquí puedes agregar servicio de email)
    console.log(`[LEAD_CREATED] Nuevo lead para empresa ${offer.company.name}: ${validated.email} - Oferta: ${offer.title}`);

    // 13. Response exitosa
    return NextResponse.json({
      success: true,
      data: {
        lead: {
          id: result.id,
          status: result.status,
          name: result.name,
          email: result.email,
          phone: result.phone,
          message: result.message,
          createdAt: result.createdAt.toISOString()
        },
        company: {
          name: offer.company.name,
          contactInfo: {
            email: offer.company.email,
            phone: offer.company.phone
          }
        },
        offer: {
          title: offer.title,
          description: offer.description
        },
        nextSteps: [
          'L\'empresa revisarà la teva sol·licitud',
          'Et contactaran en un termini de 24-48 hores',
          'Rebràs una notificació quan responguin'
        ]
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dades del formulari invàlides',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    console.error('Error en redeem contact:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}

// Bloquear otros métodos
export async function GET() {
  return NextResponse.json(
    { error: 'Mètode no permès' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Mètode no permès' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Mètode no permès' },
    { status: 405 }
  );
}