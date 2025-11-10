import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { empresaId: string } }
) {
  try {
    // Verificar autenticación y rol admin
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { empresaId } = params;

    // TODO: Reemplazar con consulta real a Prisma cuando esté configurado
    // const presupuesto = await prisma.presupuesto.findFirst({
    //   where: {
    //     companyId: empresaId,
    //     estado: 'APROBADO'
    //   },
    //   include: {
    //     items: {
    //       include: {
    //         featureExtra: true
    //       }
    //     },
    //     company: {
    //       select: {
    //         name: true,
    //         subscriptionPlan: true
    //       }
    //     }
    //   },
    //   orderBy: {
    //     fechaRespuesta: 'desc'
    //   }
    // });

    // Mock data para desarrollo - buscar presupuesto APROBADO
    const mockPresupuestos = [
      {
        id: 'presup_001',
        companyId: 'emp_1',
        estado: 'APROBADO',
        basePremium: 299,
        subtotal: 524,
        total: 573.64,
        impuestos: 49.64,
        fechaCreacion: '2024-10-01T10:00:00Z',
        fechaRespuesta: '2024-10-05T15:30:00Z',
        fechaVencimiento: '2024-10-15T23:59:59Z',
        comentarios: 'Pressupost aprovat pel client amb personalitzacions específiques',
        items: [
          {
            id: 'item_001',
            presupuestoId: 'presup_001',
            featureExtraId: 'extra_1',
            cantidad: 1,
            precioSnapshot: 25,
            nombreSnapshot: 'Emmagatzematge +50GB',
            limitesSnapshot: '{"maxStorage": 50}',
            featureExtra: {
              id: 'extra_1',
              nombre: 'Emmagatzematge +50GB',
              descripcion: 'Espai addicional d\'emmagatzematge de 50GB per a documents i fitxers',
              categoria: 'storage',
              precio: 25,
              activo: true,
              orden: 1
            }
          },
          {
            id: 'item_002',
            presupuestoId: 'presup_001',
            featureExtraId: 'extra_4',
            cantidad: 1,
            precioSnapshot: 30,
            nombreSnapshot: 'Usuaris adicionals +10',
            limitesSnapshot: '{"maxMembers": 10}',
            featureExtra: {
              id: 'extra_4',
              nombre: 'Usuaris adicionals +10',
              descripcion: 'Capacitat per a 10 usuaris addicionals en l\'organització',
              categoria: 'users',
              precio: 30,
              activo: true,
              orden: 1
            }
          },
          {
            id: 'item_003',
            presupuestoId: 'presup_001',
            featureExtraId: 'extra_7',
            cantidad: 1,
            precioSnapshot: 75,
            nombreSnapshot: 'Agents IA +5',
            limitesSnapshot: '{"maxAIAgents": 5}',
            featureExtra: {
              id: 'extra_7',
              nombre: 'Agents IA +5',
              descripcion: '5 agents d\'intel·ligència artificial addicionals',
              categoria: 'ia',
              precio: 75,
              activo: true,
              orden: 1
            }
          },
          {
            id: 'item_004',
            presupuestoId: 'presup_001',
            featureExtraId: 'extra_10',
            cantidad: 1,
            precioSnapshot: 100,
            nombreSnapshot: 'API Access Pro',
            limitesSnapshot: '{"hasAPIAccess": true, "apiCallsPerMonth": 10000}',
            featureExtra: {
              id: 'extra_10',
              nombre: 'API Access Pro',
              descripcion: 'Accés complet a l\'API amb 10,000 crides mensuals',
              categoria: 'features',
              precio: 100,
              activo: true,
              orden: 1
            }
          },
          {
            id: 'item_005',
            presupuestoId: 'presup_001',
            featureExtraId: 'extra_13',
            cantidad: 1,
            precioSnapshot: 150,
            nombreSnapshot: 'Suport 24/7 Premium',
            limitesSnapshot: '{"supportLevel": "premium", "responseTime": "1h"}',
            featureExtra: {
              id: 'extra_13',
              nombre: 'Suport 24/7 Premium',
              descripcion: 'Suport tècnic disponible 24 hores, 7 dies a la setmana',
              categoria: 'support',
              precio: 150,
              activo: true,
              orden: 1
            }
          },
          {
            id: 'item_006',
            presupuestoId: 'presup_001',
            featureExtraId: 'extra_16',
            cantidad: 1,
            precioSnapshot: 50,
            nombreSnapshot: 'Templates Premium',
            limitesSnapshot: '{"premiumTemplates": true, "templateDownloads": -1}',
            featureExtra: {
              id: 'extra_16',
              nombre: 'Templates Premium',
              descripcion: 'Accés a biblioteca de plantilles premium i recursos exclusius',
              categoria: 'content',
              precio: 50,
              activo: true,
              orden: 1
            }
          }
        ],
        company: {
          name: 'TechSolutions BCN',
          subscriptionPlan: 'PREMIUM'
        }
      },
      {
        id: 'presup_002',
        companyId: 'emp_2',
        estado: 'APROBADO',
        basePremium: 299,
        subtotal: 450,
        total: 494.50,
        impuestos: 44.50,
        fechaCreacion: '2024-09-25T12:00:00Z',
        fechaRespuesta: '2024-09-28T16:45:00Z',
        fechaVencimiento: '2024-10-28T23:59:59Z',
        comentarios: 'Pressupost aprovat per InnovaCorp',
        items: [
          {
            id: 'item_007',
            presupuestoId: 'presup_002',
            featureExtraId: 'extra_2',
            cantidad: 1,
            precioSnapshot: 45,
            nombreSnapshot: 'Emmagatzematge +100GB',
            limitesSnapshot: '{"maxStorage": 100}',
            featureExtra: {
              id: 'extra_2',
              nombre: 'Emmagatzematge +100GB',
              descripcion: 'Espai addicional d\'emmagatzematge de 100GB per a documents i fitxers',
              categoria: 'storage',
              precio: 45,
              activo: true,
              orden: 2
            }
          },
          {
            id: 'item_008',
            presupuestoId: 'presup_002',
            featureExtraId: 'extra_5',
            cantidad: 1,
            precioSnapshot: 65,
            nombreSnapshot: 'Usuaris adicionals +25',
            limitesSnapshot: '{"maxMembers": 25}',
            featureExtra: {
              id: 'extra_5',
              nombre: 'Usuaris adicionals +25',
              descripcion: 'Capacitat per a 25 usuaris addicionals en l\'organització',
              categoria: 'users',
              precio: 65,
              activo: true,
              orden: 2
            }
          },
          {
            id: 'item_009',
            presupuestoId: 'presup_002',
            featureExtraId: 'extra_11',
            cantidad: 1,
            precioSnapshot: 300,
            nombreSnapshot: 'Whitelabeling',
            limitesSnapshot: '{"hasWhitelabel": true, "customDomains": 3}',
            featureExtra: {
              id: 'extra_11',
              nombre: 'Whitelabeling',
              descripcion: 'Personalització completa de marca i dominis propis',
              categoria: 'features',
              precio: 300,
              activo: true,
              orden: 2
            }
          }
        ],
        company: {
          name: 'InnovaCorp SL',
          subscriptionPlan: 'STANDARD'
        }
      }
    ];

    // Buscar presupuesto APROBADO para esta empresa
    const presupuesto = mockPresupuestos.find(p =>
      p.companyId === empresaId && p.estado === 'APROBADO'
    );

    if (!presupuesto) {
      return NextResponse.json(
        { message: 'No hay presupuestos aprobados' },
        { status: 404 }
      );
    }

    return NextResponse.json(presupuesto);

  } catch (error) {
    console.error('Error al obtener presupuesto aprobado:', error);
    return NextResponse.json(
      { error: 'Error al obtener presupuesto' },
      { status: 500 }
    );
  }
}