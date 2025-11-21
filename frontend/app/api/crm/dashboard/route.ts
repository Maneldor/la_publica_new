import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar rol (ADMIN, SUPER_ADMIN, COMPANY_MANAGER pueden ser gestores)
    const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'COMPANY_MANAGER', 'ACCOUNT_MANAGER'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos de gestor' },
        { status: 403 }
      );
    }

    const userId = session.user.id;

    console.log(`🏢 [CRM Dashboard] Loading for user: ${session.user.email} (${session.user.role})`);

    // KPIs principales
    const [
      totalLeads,
      newLeads,
      contactedLeads,
      wonLeads,
      lostLeads,
      tasksTotal,
      tasksPending,
      tasksOverdue
    ] = await Promise.all([
      // Total leads asignados a este gestor
      prismaClient.companyLead.count({
        where: {
          assignedToId: userId,
          status: { notIn: ['WON', 'LOST'] }
        }
      }),

      // Leads nuevos (últimos 7 días)
      prismaClient.companyLead.count({
        where: {
          assignedToId: userId,
          status: 'NEW',
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),

      // Leads contactados (no NEW ni perdidos)
      prismaClient.companyLead.count({
        where: {
          assignedToId: userId,
          status: { in: ['CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'DOCUMENTATION'] }
        }
      }),

      // Leads ganados este mes
      prismaClient.companyLead.count({
        where: {
          assignedToId: userId,
          status: 'WON',
          convertedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),

      // Leads perdidos este mes
      prismaClient.companyLead.count({
        where: {
          assignedToId: userId,
          status: 'LOST',
          updatedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),

      // Total tareas
      prismaClient.leadTask.count({
        where: { userId }
      }),

      // Tareas pendientes
      prismaClient.leadTask.count({
        where: {
          userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] }
        }
      }),

      // Tareas vencidas
      prismaClient.leadTask.count({
        where: {
          userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: { lt: new Date() }
        }
      })
    ]);

    console.log(`📊 [CRM KPIs] Total: ${totalLeads}, New: ${newLeads}, Won: ${wonLeads}`);

    // Comparación mes anterior para conversión
    const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0);

    const wonLastMonth = await prismaClient.companyLead.count({
      where: {
        assignedToId: userId,
        status: 'WON',
        convertedAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd
        }
      }
    });

    const conversionChange = wonLastMonth > 0
      ? ((wonLeads - wonLastMonth) / wonLastMonth) * 100
      : wonLeads > 0 ? 100 : 0;

    // Métricas de rendimiento
    const wonLeadsWithTiming = await prismaClient.companyLead.findMany({
      where: {
        assignedToId: userId,
        status: 'WON',
        convertedAt: { not: null }
      },
      select: {
        createdAt: true,
        convertedAt: true,
        estimatedRevenue: true
      },
      take: 50 // Últimos 50 para cálculo
    });

    // Calcular tiempo promedio de cierre
    let avgClosingTime = 45; // Default
    if (wonLeadsWithTiming.length > 0) {
      const totalDays = wonLeadsWithTiming.reduce((sum, lead) => {
        const days = Math.floor(
          (new Date(lead.convertedAt!).getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      avgClosingTime = Math.round(totalDays / wonLeadsWithTiming.length);
    }

    // Valor promedio por deal
    let avgDealValue = 0;
    if (wonLeadsWithTiming.length > 0) {
      const totalRevenue = wonLeadsWithTiming.reduce((sum, lead) => {
        return sum + (lead.estimatedRevenue ? Number(lead.estimatedRevenue) : 0);
      }, 0);
      avgDealValue = totalRevenue / wonLeadsWithTiming.length;
    }

    // Tasa de conversión
    const totalProcessedLeads = wonLeads + lostLeads;
    const conversionRate = totalProcessedLeads > 0
      ? (wonLeads / totalProcessedLeads) * 100
      : 0;

    // Leads recientes (para el dashboard)
    const recentLeads = await prismaClient.companyLead.findMany({
      where: {
        assignedToId: userId,
        status: { notIn: ['WON', 'LOST'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        companyName: true,
        contactName: true,
        email: true,
        phone: true,
        status: true,
        priority: true,
        source: true,
        estimatedRevenue: true,
        lastContactDate: true,
        nextFollowUpDate: true,
        createdAt: true,
        currentPlatforms: true,
        discountTypes: true
      }
    });

    // Actividad reciente
    const recentActivity = await prismaClient.leadActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        lead: {
          select: {
            id: true,
            companyName: true
          }
        }
      }
    });

    // Leads que necesitan atención urgente
    const needsAttention = await prismaClient.companyLead.findMany({
      where: {
        assignedToId: userId,
        status: { notIn: ['WON', 'LOST', 'ON_HOLD'] },
        OR: [
          // Sin contacto hace más de 5 días
          {
            lastContactDate: {
              lt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            }
          },
          // Nunca contactado y creado hace más de 3 días
          {
            lastContactDate: null,
            status: 'NEW',
            createdAt: {
              lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            }
          },
          // Follow-up vencido
          {
            nextFollowUpDate: {
              lt: new Date()
            }
          },
          // Alta prioridad sin contactar
          {
            priority: 'URGENT',
            lastContactDate: null
          }
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      take: 5,
      select: {
        id: true,
        companyName: true,
        contactName: true,
        status: true,
        priority: true,
        lastContactDate: true,
        nextFollowUpDate: true,
        createdAt: true
      }
    });

    // Estadísticas por fuente
    const sourceStats = await prismaClient.companyLead.groupBy({
      by: ['source'],
      where: {
        assignedToId: userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
        }
      },
      _count: {
        id: true
      }
    });

    console.log(`✅ [CRM Dashboard] Data loaded successfully for ${session.user.email}`);

    // Response estructurada para compatibilidad con frontend
    return NextResponse.json({
      success: true,
      data: {
        // KPIs principales
        totalLeads,
        newLeads,
        inProgressLeads: contactedLeads,
        convertedLeads: wonLeads,
        lostLeads,

        // Métricas calculadas
        conversionRate: Math.round(conversionRate * 10) / 10,
        conversionChange: Math.round(conversionChange),
        avgDealSize: Math.round(avgDealValue),
        avgTimeToClose: avgClosingTime,
        totalValue: avgDealValue * wonLeads,

        // Tareas
        tasksPending,
        tasksOverdue,

        // Datos para componentes del dashboard
        recentLeads: recentLeads.map(lead => ({
          id: lead.id,
          companyName: lead.companyName,
          contact: `${lead.contactName}`,
          email: lead.email,
          phone: lead.phone,
          status: lead.status.toLowerCase(), // Para compatibilidad con frontend
          priority: lead.priority.toLowerCase(),
          estimatedValue: Number(lead.estimatedRevenue || 0),
          source: lead.source.toLowerCase(),
          createdAt: lead.createdAt.toISOString(),
          lastContactDate: lead.lastContactDate?.toISOString() || null,
          nextFollowUpDate: lead.nextFollowUpDate?.toISOString() || null,
          platforms: lead.currentPlatforms,
          discountTypes: lead.discountTypes
        })),

        recentActivity: recentActivity.map(activity => ({
          id: activity.id,
          type: activity.type,
          description: activity.description,
          leadId: activity.lead?.id,
          leadName: activity.lead?.companyName,
          createdAt: activity.createdAt.toISOString()
        })),

        needsAttention: needsAttention.map(lead => {
          const daysSinceContact = lead.lastContactDate
            ? Math.floor((Date.now() - new Date(lead.lastContactDate).getTime()) / (1000 * 60 * 60 * 24))
            : Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24));

          return {
            id: lead.id,
            companyName: lead.companyName,
            contactName: lead.contactName,
            status: lead.status.toLowerCase(),
            priority: lead.priority.toLowerCase(),
            daysSinceContact,
            overdue: lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate) < new Date() : false,
            reason: lead.lastContactDate === null ? 'never_contacted' :
                   lead.nextFollowUpDate && new Date(lead.nextFollowUpDate) < new Date() ? 'overdue_followup' : 'stale'
          };
        }),

        sourceStats: sourceStats.map(stat => ({
          source: stat.source,
          count: stat._count.id
        }))
      },
      meta: {
        userId,
        userEmail: session.user.email,
        userRole: session.user.role,
        generatedAt: new Date().toISOString(),
        period: 'current_month'
      }
    });

  } catch (error) {
    console.error('❌ [CRM Dashboard] Error:', error);

    // En caso de error, devolver datos básicos para que el frontend funcione
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      data: {
        totalLeads: 0,
        newLeads: 0,
        inProgressLeads: 0,
        convertedLeads: 0,
        lostLeads: 0,
        conversionRate: 0,
        conversionChange: 0,
        avgDealSize: 0,
        avgTimeToClose: 45,
        totalValue: 0,
        tasksPending: 0,
        tasksOverdue: 0,
        recentLeads: [],
        recentActivity: [],
        needsAttention: [],
        sourceStats: []
      }
    }, { status: 500 });
  }
}

// Para otros métodos HTTP
export async function POST() {
  return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
}