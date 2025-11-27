import { PrismaClient } from '@prisma/client';

export interface DashboardStats {
  overview: {
    totalLeads: number;
    leadsToday: number;
    leadsThisWeek: number;
    leadsThisMonth: number;
    pendingReview: number;
    approvedLeads: number;
    rejectedLeads: number;
  };
  sources: {
    total: number;
    active: number;
    inactive: number;
    byType: Array<{ type: string; count: number }>;
    topPerformers: Array<{
      id: string;
      name: string;
      leadsGenerated: number;
      successRate: number;
    }>;
  };
  aiProviders: {
    total: number;
    active: number;
    byType: Array<{ type: string; count: number }>;
    usage: {
      totalRequests: number;
      successfulRequests: number;
      failedRequests: number;
      totalCost: number;
    };
  };
  jobs: {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    recentActivity: Array<{
      id: string;
      status: string;
      sourceName: string;
      leadsGenerated: number;
      createdAt: Date;
    }>;
  };
  trends: {
    leadsPerDay: Array<{ date: string; count: number }>;
    successRateOverTime: Array<{ date: string; rate: number }>;
  };
}

export class DashboardService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // GET /api/admin/dashboard/stats - Stats complets del dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. OVERVIEW DE LEADS (usando company_leads con guión bajo)
    const [
      totalLeads,
      leadsToday,
      leadsThisWeek,
      leadsThisMonth,
      leadsByStatus
    ] = await Promise.all([
      this.prisma.company_leads.count().catch(() => 0),
      this.prisma.company_leads.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0),
      this.prisma.company_leads.count({ where: { createdAt: { gte: weekStart } } }).catch(() => 0),
      this.prisma.company_leads.count({ where: { createdAt: { gte: monthStart } } }).catch(() => 0),
      this.prisma.company_leads.groupBy({
        by: ['status'],
        _count: { status: true }
      }).catch(() => [])
    ]);

    const overview = {
      totalLeads,
      leadsToday,
      leadsThisWeek,
      leadsThisMonth,
      // Mapear estados de company_leads a los esperados por el frontend
      // company_leads usa LeadStatus enum: NEW, CONTACTED, QUALIFIED, WON, LOST, etc.
      // Frontend espera: pendingReview, approvedLeads, rejectedLeads
      pendingReview: leadsByStatus.find(s => s.status === 'NEW')?._count.status || 0,
      approvedLeads: leadsByStatus.find(s => s.status === 'WON')?._count.status || 0,
      rejectedLeads: leadsByStatus.find(s => s.status === 'LOST')?._count.status || 0,
    };

    // 2. STATS DE FONTS (leadSource - SECCIÓN COMENTADA PORQUE EL MODELO FALTA EN schema.prisma)
    
    /*
    const [
      totalSources,
      activeSources,
      sourcesByType,
      topSources
    ] = await Promise.all([
      (this.prisma as any).leadSource.count(),
      (this.prisma as any).leadSource.count({ where: { isActive: true } }),
      (this.prisma as any).leadSource.groupBy({
        by: ['type'],
        _count: { type: true }
      }),
      (this.prisma as any).leadSource.findMany({
        select: {
          id: true,
          name: true,
          leadsGenerated: true,
          leadsApproved: true,
        },
        orderBy: { leadsGenerated: 'desc' },
        take: 5
      })
    ]);

    const sources = {
      total: totalSources,
      active: activeSources,
      inactive: totalSources - activeSources,
      byType: sourcesByType.map(s => ({
        type: s.type,
        count: s._count.type
      })),
      topPerformers: topSources.map(s => ({
        id: s.id,
        name: s.name,
        leadsGenerated: s.leadsGenerated,
        successRate: s.leadsGenerated > 0
          ? Math.round((s.leadsApproved / s.leadsGenerated) * 100)
          : 0
      }))
    };
    */
    
    // --- Valores por defecto para que compile ---
    const sources = { total: 0, active: 0, inactive: 0, byType: [], topPerformers: [] };


    // 3. STATS D'AI PROVIDERS (aIProvider - SECCIÓN COMENTADA PORQUE EL MODELO FALTA EN schema.prisma)
    
    /*
    const [
      totalProviders,
      activeProviders,
      providersByType,
      providersUsage
    ] = await Promise.all([
      this.prisma.aIProvider.count(),
      this.prisma.aIProvider.count({ where: { isActive: true } }),
      this.prisma.aIProvider.groupBy({
        by: ['type'],
        _count: { type: true }
      }),
      this.prisma.aIProvider.aggregate({
        _sum: {
          totalRequests: true,
          successfulRequests: true,
          failedRequests: true,
          totalCost: true,
        }
      })
    ]);

    const aiProviders = {
      total: totalProviders,
      active: activeProviders,
      byType: providersByType.map(p => ({
        type: p.type,
        count: p._count.type
      })),
      usage: {
        totalRequests: providersUsage._sum.totalRequests || 0,
        successfulRequests: providersUsage._sum.successfulRequests || 0,
        failedRequests: providersUsage._sum.failedRequests || 0,
        totalCost: providersUsage._sum.totalCost || 0,
      }
    };
    */
    
    // --- Valores por defecto para que compile ---
    const aiProviders = { total: 0, active: 0, byType: [], usage: { totalRequests: 0, successfulRequests: 0, failedRequests: 0, totalCost: 0 } };


    // 4. STATS DE JOBS (scrapingJob - SECCIÓN COMENTADA PORQUE EL MODELO FALTA EN schema.prisma)
    
    /*
    const [
      jobsByStatus,
      recentJobs
    ] = await Promise.all([
      (this.prisma as any).scrapingJob.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      (this.prisma as any).scrapingJob.findMany({
        select: {
          id: true,
          status: true,
          leadsGenerated: true,
          createdAt: true,
          source: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    const jobs = {
      total: jobsByStatus.reduce((sum, s) => sum + s._count.status, 0),
      pending: jobsByStatus.find(s => s.status === 'PENDING')?._count.status || 0,
      running: jobsByStatus.find(s => s.status === 'RUNNING')?._count.status || 0,
      completed: jobsByStatus.find(s => s.status === 'COMPLETED')?._count.status || 0,
      failed: jobsByStatus.find(s => s.status === 'FAILED')?._count.status || 0,
      recentActivity: recentJobs.map(j => ({
        id: j.id,
        status: j.status,
        sourceName: j.source.name,
        leadsGenerated: j.leadsGenerated,
        createdAt: j.createdAt
      }))
    };
    */

    // --- Valores por defecto para que compile ---
    const jobs = { total: 0, pending: 0, running: 0, completed: 0, failed: 0, recentActivity: [] };


    // 5. TRENDS (últims 7 dies)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date;
    }).reverse();

    const leadsPerDay = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const count = await this.prisma.company_leads.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDay
            }
          }
        }).catch(() => 0);

        return {
          date: date.toISOString().split('T')[0],
          count
        };
      })
    );

    const successRateOverTime = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const [total, approved] = await Promise.all([
          this.prisma.company_leads.count({
            where: {
              createdAt: { gte: date, lt: nextDay }
            }
          }).catch(() => 0),
          this.prisma.company_leads.count({
            where: {
              createdAt: { gte: date, lt: nextDay },
              status: 'WON' // company_leads usa 'WON' para leads convertidos
            }
          }).catch(() => 0)
        ]);

        return {
          date: date.toISOString().split('T')[0],
          rate: total > 0 ? Math.round((approved / total) * 100) : 0
        };
      })
    );

      return {
        overview,
        sources,
        aiProviders,
        jobs,
        trends: {
          leadsPerDay,
          successRateOverTime
        }
      };
    } catch (error) {
      console.error('Error en getDashboardStats:', error);
      // Retornar datos vacíos en caso de error
      return {
        overview: {
          totalLeads: 0,
          leadsToday: 0,
          leadsThisWeek: 0,
          leadsThisMonth: 0,
          pendingReview: 0,
          approvedLeads: 0,
          rejectedLeads: 0,
        },
        sources: { total: 0, active: 0, inactive: 0, byType: [], topPerformers: [] },
        aiProviders: { total: 0, active: 0, byType: [], usage: { totalRequests: 0, successfulRequests: 0, failedRequests: 0, totalCost: 0 } },
        jobs: { total: 0, pending: 0, running: 0, completed: 0, failed: 0, recentActivity: [] },
        trends: { leadsPerDay: [], successRateOverTime: [] }
      };
    }
  }

  // GET /api/admin/dashboard/quick-stats - Stats ràpides per header
  async getQuickStats() {
    try {
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));

    const [
      pendingReview,
      activeJobs,
      leadsToday,
      activeSources
    ] = await Promise.all([
      this.prisma.company_leads.count({
        where: { status: 'NEW' } // company_leads usa 'NEW' del enum LeadStatus
      }).catch(() => 0),
      // (this.prisma as any).scrapingJob.count({ // SECCIÓN COMENTADA
      //   where: { status: { in: ['PENDING', 'RUNNING'] } }
      // }),
      Promise.resolve(0), // Valor por defecto para activeJobs
      this.prisma.company_leads.count({
        where: { createdAt: { gte: todayStart } }
      }).catch(() => 0),
      // (this.prisma as any).leadSource.count({ // SECCIÓN COMENTADA
      //   where: { isActive: true }
      // })
      Promise.resolve(0) // Valor por defecto para activeSources
    ]);

      return {
        pendingReview,
        activeJobs,
        leadsToday,
        activeSources
      };
    } catch (error) {
      console.error('Error en getQuickStats:', error);
      // Retornar datos vacíos en caso de error
      return {
        pendingReview: 0,
        activeJobs: 0,
        leadsToday: 0,
        activeSources: 0
      };
    }
  }
}