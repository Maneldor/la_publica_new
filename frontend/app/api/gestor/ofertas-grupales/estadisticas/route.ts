import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

// Función helper para convertir prioridad numérica a string
function mapPriorityToString(priority: number): string {
  if (priority >= 8) return 'HIGH';
  if (priority >= 5) return 'MEDIUM';
  return 'LOW';
}

// Función helper para calcular diferencia en días
function daysDifference(date1: Date, date2: Date): number {
  const diffInMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // SEGURIDAD: Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.warn('[SECURITY] Intento de acceso sin autenticación a estadísticas');
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
      console.warn(`[SECURITY] Usuario ${user?.email} intentó acceder a estadísticas sin permisos de gestor`);
      return NextResponse.json(
        { success: false, error: 'Accés denegat. Només per gestors.' },
        { status: 403 }
      );
    }

    // CÁLCULO 1: Total de solicitudes asignadas al gestor
    const totalAsignadas = await prismaClient.groupOfferRequest.count({
      where: { reviewedBy: session.user.id }
    });

    // CÁLCULO 2: Solicitudes por estado
    const solicitudesPorEstado = await prismaClient.groupOfferRequest.groupBy({
      by: ['status'],
      where: { reviewedBy: session.user.id },
      _count: { status: true }
    });

    // Formatear estadísticas de estado
    const statusStats = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0
    };

    solicitudesPorEstado.forEach(stat => {
      statusStats[stat.status as keyof typeof statusStats] = stat._count.status;
    });

    // CÁLCULO 3: Solicitudes por prioridad (convertir números a strings)
    const solicitudesConPrioridad = await prismaClient.groupOfferRequest.findMany({
      where: { reviewedBy: session.user.id },
      select: { priority: true }
    });

    const priorityStats = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    solicitudesConPrioridad.forEach(item => {
      const priorityString = mapPriorityToString(item.priority);
      priorityStats[priorityString as keyof typeof priorityStats]++;
    });

    // CÁLCULO 4: Solicitudes con configuración creada
    const conConfiguracion = await prismaClient.groupOfferConfig.count({
      where: {
        OR: [
          // Si existe campo gestorId en GroupOfferConfig
          { createdBy: session.user.id },
          // O buscar por solicitudes relacionadas
          {
            relatedRequestId: {
              in: await prismaClient.groupOfferRequest.findMany({
                where: { reviewedBy: session.user.id },
                select: { id: true }
              }).then(requests => requests.map(r => r.id))
            }
          }
        ]
      }
    });

    // CÁLCULO 5: Tiempo promedio de gestión (asignación hasta hoy)
    const solicitudesConAsignacion = await prismaClient.groupOfferRequest.findMany({
      where: {
        reviewedBy: session.user.id,
        reviewedAt: { not: null }
      },
      select: {
        reviewedAt: true,
        updatedAt: true,
        status: true
      }
    });

    let tiempoPromedioGestion = 0;
    if (solicitudesConAsignacion.length > 0) {
      const tiempos = solicitudesConAsignacion.map(solicitud => {
        const fechaAsignacion = solicitud.reviewedAt!;
        const fechaUltimaActualizacion = solicitud.updatedAt;
        return daysDifference(fechaAsignacion, fechaUltimaActualizacion);
      });

      tiempoPromedioGestion = tiempos.reduce((sum, time) => sum + time, 0) / tiempos.length;
    }

    // CÁLCULO 6: Tasa de conversión (con configuración / total)
    const tasaConversion = totalAsignadas > 0 ? (conConfiguracion / totalAsignadas) * 100 : 0;

    // CÁLCULO 7: Rendimiento última semana
    const unaSemanAtras = new Date();
    unaSemanAtras.setDate(unaSemanAtras.getDate() - 7);

    const [asignadasUltimaSemana, configuracionesUltimaSemana] = await Promise.all([
      prismaClient.groupOfferRequest.count({
        where: {
          reviewedBy: session.user.id,
          reviewedAt: { gte: unaSemanAtras }
        }
      }),
      prismaClient.groupOfferConfig.count({
        where: {
          createdAt: { gte: unaSemanAtras },
          OR: [
            { createdBy: session.user.id },
            {
              relatedRequestId: {
                in: await prismaClient.groupOfferRequest.findMany({
                  where: { reviewedBy: session.user.id },
                  select: { id: true }
                }).then(requests => requests.map(r => r.id))
              }
            }
          ]
        }
      })
    ]);

    // CÁLCULO 8: Rendimiento último mes
    const unMesAtras = new Date();
    unMesAtras.setMonth(unMesAtras.getMonth() - 1);

    const [asignadasUltimoMes, configuracionesUltimoMes] = await Promise.all([
      prismaClient.groupOfferRequest.count({
        where: {
          reviewedBy: session.user.id,
          reviewedAt: { gte: unMesAtras }
        }
      }),
      prismaClient.groupOfferConfig.count({
        where: {
          createdAt: { gte: unMesAtras },
          OR: [
            { createdBy: session.user.id },
            {
              relatedRequestId: {
                in: await prismaClient.groupOfferRequest.findMany({
                  where: { reviewedBy: session.user.id },
                  select: { id: true }
                }).then(requests => requests.map(r => r.id))
              }
            }
          ]
        }
      })
    ]);

    // CÁLCULO 9: Comparativa con otros gestores
    const todosLosGestores = await prismaClient.user.findMany({
      where: {
        role: 'ADMIN',
        isActive: true
      },
      select: { id: true }
    });

    // Calcular tiempo promedio de todos los gestores
    const tiemposGestores: number[] = [];

    for (const gestor of todosLosGestores) {
      const solicitudesGestor = await prismaClient.groupOfferRequest.findMany({
        where: {
          reviewedBy: gestor.id,
          reviewedAt: { not: null }
        },
        select: {
          reviewedAt: true,
          updatedAt: true
        }
      });

      if (solicitudesGestor.length > 0) {
        const tiemposGestor = solicitudesGestor.map(s =>
          daysDifference(s.reviewedAt!, s.updatedAt)
        );
        const promedioGestor = tiemposGestor.reduce((a, b) => a + b, 0) / tiemposGestor.length;
        tiemposGestores.push(promedioGestor);
      }
    }

    const promedioTodosGestores = tiemposGestores.length > 0
      ? tiemposGestores.reduce((a, b) => a + b, 0) / tiemposGestores.length
      : 0;

    // Calcular posición en ranking (cuántos gestores son mejores)
    const gestoresMejores = tiemposGestores.filter(tiempo => tiempo < tiempoPromedioGestion).length;
    const posicionRanking = gestoresMejores + 1;

    // CÁLCULO 10: Solicitudes por categoría de producto
    const solicitudesPorCategoria = await prismaClient.groupOfferRequest.groupBy({
      by: ['productCategory'],
      where: { reviewedBy: session.user.id },
      _count: { productCategory: true },
      orderBy: { _count: { productCategory: 'desc' } },
      take: 5
    });

    const categoriaStats = solicitudesPorCategoria.map(stat => ({
      categoria: stat.productCategory,
      cantidad: stat._count.productCategory,
      porcentaje: totalAsignadas > 0 ? (stat._count.productCategory / totalAsignadas) * 100 : 0
    }));

    // AUDIT LOG para acceso a estadísticas
    await prismaClient.notification.create({
      data: {
        type: 'AUDIT_LOG',
        title: 'GESTOR_ACCESS: Consulta estadísticas',
        message: `${user.email} consultó sus estadísticas de gestión`,
        priority: 'LOW',
        userId: user.id,
        isRead: true,
        metadata: JSON.stringify({
          action: 'VIEW_GESTOR_STATS',
          totalSolicitudes: totalAsignadas,
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        })
      }
    });

    console.log(`[GESTOR_SUCCESS] ${user.email} consultó estadísticas - ${totalAsignadas} solicitudes asignadas`);
    console.log(`[PERFORMANCE] Tiempo de respuesta: ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      data: {
        resumen: {
          totalAsignadas,
          conConfiguracion,
          tiempoPromedioGestion: Math.round(tiempoPromedioGestion * 100) / 100, // Redondear a 2 decimales
          tasaConversion: Math.round(tasaConversion * 100) / 100
        },
        porEstado: statusStats,
        porPrioridad: priorityStats,
        porCategoria: categoriaStats,
        rendimiento: {
          ultimaSemana: {
            asignadas: asignadasUltimaSemana,
            configuradas: configuracionesUltimaSemana
          },
          ultimoMes: {
            asignadas: asignadasUltimoMes,
            configuradas: configuracionesUltimoMes
          }
        },
        comparativa: {
          promedioGestores: Math.round(promedioTodosGestores * 100) / 100,
          posicionRanking,
          totalGestoresActivos: todosLosGestores.length
        },
        tendencias: {
          eficiencia: tiempoPromedioGestion < promedioTodosGestores ? 'ALTA' : 'NORMAL',
          productividad: conConfiguracion > totalAsignadas * 0.5 ? 'ALTA' : 'NORMAL',
          actividad: asignadasUltimaSemana > 0 ? 'ACTIVA' : 'BAJA'
        }
      }
    });

  } catch (error) {
    console.error('[ERROR] Error obteniendo estadísticas de gestor:', error);

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