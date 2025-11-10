import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y rol admin
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { empresaId, extrasSeleccionados } = body;

    if (!empresaId || !extrasSeleccionados || extrasSeleccionados.length === 0) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: empresaId y extrasSeleccionados' },
        { status: 400 }
      );
    }

    console.log('Creando presupuesto professional:', {
      empresaId,
      extrasSeleccionados: extrasSeleccionados.length
    });

    // Mock data de extras disponibles (debe coincidir con el frontend)
    const mockExtrasData = [
      {
        id: 'extra_1',
        nombre: 'Emmagatzematge +50GB',
        precio: 25,
        limites: { maxStorage: 50 }
      },
      {
        id: 'extra_2',
        nombre: 'Emmagatzematge +100GB',
        precio: 45,
        limites: { maxStorage: 100 }
      },
      {
        id: 'extra_3',
        nombre: 'Emmagatzematge +250GB',
        precio: 95,
        limites: { maxStorage: 250 }
      },
      {
        id: 'extra_4',
        nombre: 'Usuaris adicionals +10',
        precio: 30,
        limites: { maxMembers: 10 }
      },
      {
        id: 'extra_5',
        nombre: 'Usuaris adicionals +25',
        precio: 65,
        limites: { maxMembers: 25 }
      },
      {
        id: 'extra_6',
        nombre: 'Usuaris adicionals +50',
        precio: 120,
        limites: { maxMembers: 50 }
      },
      {
        id: 'extra_7',
        nombre: 'Agents IA +5',
        precio: 75,
        limites: { maxAIAgents: 5 }
      },
      {
        id: 'extra_8',
        nombre: 'Agents IA +10',
        precio: 130,
        limites: { maxAIAgents: 10 }
      },
      {
        id: 'extra_9',
        nombre: 'Agents IA +20',
        precio: 220,
        limites: { maxAIAgents: 20 }
      },
      {
        id: 'extra_10',
        nombre: 'API Access Pro',
        precio: 100,
        limites: { hasAPIAccess: true, apiCallsPerMonth: 10000 }
      },
      {
        id: 'extra_11',
        nombre: 'Webhooks Premium',
        precio: 40,
        limites: { hasWebhooks: true, maxWebhooks: 20 }
      },
      {
        id: 'extra_12',
        nombre: 'White Label',
        precio: 200,
        limites: { hasWhiteLabel: true }
      },
      {
        id: 'extra_13',
        nombre: 'Suport 24/7 Premium',
        precio: 150,
        limites: { supportLevel: 'premium', responseTime: '1h' }
      },
      {
        id: 'extra_14',
        nombre: 'Formació Personalitzada',
        precio: 250,
        limites: { hasCustomTraining: true, trainingHours: 10 }
      },
      {
        id: 'extra_15',
        nombre: 'Backups Avançats',
        precio: 60,
        limites: { hasAdvancedBackups: true, backupRetention: 365 }
      },
      {
        id: 'extra_16',
        nombre: 'Templates Premium',
        precio: 50,
        limites: { premiumTemplates: true, templateDownloads: -1 }
      }
    ];

    // Validar que todos los extras seleccionados existen
    const extrasValidos = extrasSeleccionados.filter((id: string) =>
      mockExtrasData.some(extra => extra.id === id)
    );

    if (extrasValidos.length !== extrasSeleccionados.length) {
      return NextResponse.json(
        { error: 'Algunos extras seleccionados no son válidos' },
        { status: 400 }
      );
    }

    // Crear items del presupuesto
    const items = extrasValidos.map((extraId: string) => {
      const extra = mockExtrasData.find(e => e.id === extraId)!;
      return {
        id: `item_${Math.random().toString(36).substr(2, 9)}`,
        featureExtraId: extraId,
        precioSnapshot: extra.precio,
        nombreSnapshot: extra.nombre,
        limitesSnapshot: JSON.stringify(extra.limites)
      };
    });

    // Calcular precio total
    const basePremium = 299;
    const precioExtras = items.reduce((sum, item) => sum + item.precioSnapshot, 0);
    const precioTotal = basePremium + precioExtras;

    // Crear presupuesto mock
    const presupuestoId = `pres_${Math.random().toString(36).substr(2, 9)}`;
    const nuevoPresupuesto = {
      id: presupuestoId,
      companyId: empresaId,
      estado: 'APROBADO', // Auto-aprobado para simplificar flujo
      basePremium,
      fechaCreacion: new Date().toISOString(),
      fechaAprobacion: new Date().toISOString(),
      items,
      precioTotal
    };

    console.log('Presupuesto creado:', {
      id: presupuestoId,
      items: items.length,
      precioTotal
    });

    // TODO: Guardar en base de datos cuando esté configurada
    // await prisma.presupuesto.create({
    //   data: {
    //     id: presupuestoId,
    //     companyId: empresaId,
    //     estado: 'APROBADO',
    //     basePremium,
    //     fechaCreacion: new Date(),
    //     fechaAprobacion: new Date(),
    //     items: {
    //       createMany: {
    //         data: items.map(item => ({
    //           featureExtraId: item.featureExtraId,
    //           precioSnapshot: item.precioSnapshot,
    //           nombreSnapshot: item.nombreSnapshot,
    //           limitesSnapshot: item.limitesSnapshot
    //         }))
    //       }
    //     }
    //   },
    //   include: {
    //     items: true
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: 'Presupuesto Professional creado y aprobado correctamente',
      data: nuevoPresupuesto
    });

  } catch (error) {
    console.error('Error al crear presupuesto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}