import { PrismaClient } from '@prisma/client';

export class JobsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // GET /api/admin/jobs - Llistar jobs amb filtres
  async getAllJobs(filters?: {
    status?: any | any[];
    priority?: any;
    sourceId?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = Array.isArray(filters.status)
        ? { in: filters.status }
        : filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.sourceId) {
      where.sourceId = filters.sourceId;
    }

    const [jobs, total] = await Promise.all([
      (this.prisma as any).scrapingJob.findMany({
        where,
        include: {
          source: {
            select: {
              id: true,
              name: true,
              type: true,
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      (this.prisma as any).scrapingJob.count({ where })
    ]);

    return {
      jobs,
      total,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
    };
  }

  // GET /api/admin/jobs/:id - Obtenir detalls d'un job
  async getJobById(id: string) {
    const job = await (this.prisma as any).scrapingJob.findUnique({
      where: { id },
      include: {
        source: {
          include: {
            aiProvider: {
              select: {
                id: true,
                displayName: true,
                type: true,
              }
            }
          }
        }
      }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // Obtenir leads generats per aquest job si està completat
    let generatedLeads = null;
    if (job.status === 'COMPLETED' && job.leadsGenerated > 0) {
      generatedLeads = await (this.prisma as any).company_leads.findMany({
        where: {
          sourceId: job.sourceId,
          createdAt: {
            gte: job.startedAt || job.createdAt,
            lte: job.completedAt || new Date(),
          }
        },
        select: {
          id: true,
          companyName: true,
          reviewStatus: true,
          aiScore: true,
          createdAt: true,
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
    }

    return {
      ...job,
      generatedLeads,
    };
  }

  // POST /api/admin/jobs/:id/cancel - Cancel·lar un job
  async cancelJob(id: string) {
    const job = await (this.prisma as any).scrapingJob.findUnique({
      where: { id }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== 'PENDING' && job.status !== 'RUNNING') {
      throw new Error(`Cannot cancel job with status ${job.status}`);
    }

    const updated = await (this.prisma as any).scrapingJob.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
        error: 'Cancelled by user',
      }
    });

    return updated;
  }

  // POST /api/admin/jobs/:id/retry - Reintentar un job fallat
  async retryJob(id: string) {
    const job = await (this.prisma as any).scrapingJob.findUnique({
      where: { id },
      include: { source: true }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== 'FAILED' && job.status !== 'CANCELLED') {
      throw new Error(`Cannot retry job with status ${job.status}`);
    }

    // Crear nou job amb la mateixa configuració
    const newJob = await (this.prisma as any).scrapingJob.create({
      data: {
        sourceId: job.sourceId,
        status: 'PENDING',
        priority: job.priority,
        scheduledFor: new Date(),
        config: job.config,
      },
      include: {
        source: true,
      }
    });

    // Nota: L'execució real del job la farà el worker/scheduler
    // Aquí només creem el job a la DB

    return newJob;
  }

  // DELETE /api/admin/jobs/:id - Eliminar un job
  async deleteJob(id: string) {
    const job = await (this.prisma as any).scrapingJob.findUnique({
      where: { id }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // Només permetre eliminar jobs completats o fallats
    if (job.status === 'RUNNING' || job.status === 'PENDING') {
      throw new Error(`Cannot delete ${job.status.toLowerCase()} job. Cancel it first.`);
    }

    await (this.prisma as any).scrapingJob.delete({
      where: { id }
    });

    return { success: true };
  }

  // GET /api/admin/jobs/stats - Estadístiques globals
  async getJobStats(filters?: {
    sourceId?: string;
    since?: Date;
  }) {
    const where: any = {};

    if (filters?.sourceId) {
      where.sourceId = filters.sourceId;
    }

    if (filters?.since) {
      where.createdAt = { gte: filters.since };
    }

    // Stats per estat
    const statusStats = await (this.prisma as any).scrapingJob.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    });

    // Stats per prioritat
    const priorityStats = await (this.prisma as any).scrapingJob.groupBy({
      by: ['priority'],
      where,
      _count: { priority: true },
    });

    // Total leads generats
    const totalLeadsGenerated = await (this.prisma as any).scrapingJob.aggregate({
      where: {
        ...where,
        status: 'COMPLETED',
      },
      _sum: { leadsGenerated: true },
      _avg: { leadsGenerated: true },
    });

    // Jobs recents (últimes 24h)
    const recentJobs = await (this.prisma as any).scrapingJob.count({
      where: {
        ...where,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        }
      }
    });

    // Temps mitjà d'execució (només completats)
    const completedJobs = await (this.prisma as any).scrapingJob.findMany({
      where: {
        ...where,
        status: 'COMPLETED',
        startedAt: { not: null },
        completedAt: { not: null },
      },
      select: {
        startedAt: true,
        completedAt: true,
      }
    });

    let averageExecutionTime = 0;
    if (completedJobs.length > 0) {
      const totalTime = completedJobs.reduce((sum: any, job: any) => {
        const duration = job.completedAt!.getTime() - job.startedAt!.getTime();
        return sum + duration;
      }, 0);
      averageExecutionTime = Math.round(totalTime / completedJobs.length);
    }

    // Tasa d'èxit
    const totalCompleted = statusStats.find((s: any) => s.status === 'COMPLETED')?._count.status || 0;
    const totalFailed = statusStats.find((s: any) => s.status === 'FAILED')?._count.status || 0;
    const totalJobs = totalCompleted + totalFailed;
    const successRate = totalJobs > 0 ? (totalCompleted / totalJobs) * 100 : 0;

    return {
      statusStats: statusStats.map((stat: any) => ({
        status: stat.status,
        count: stat._count.status,
      })),
      priorityStats: priorityStats.map((stat: any) => ({
        priority: stat.priority,
        count: stat._count.priority,
      })),
      leadsGenerated: {
        total: totalLeadsGenerated._sum.leadsGenerated || 0,
        average: Math.round(totalLeadsGenerated._avg.leadsGenerated || 0),
      },
      recentJobs,
      averageExecutionTime, // en ms
      successRate: Math.round(successRate * 100) / 100, // 2 decimals
    };
  }

  // GET /api/admin/jobs/active - Jobs actius (PENDING + RUNNING)
  async getActiveJobs() {
    const jobs = await (this.prisma as any).scrapingJob.findMany({
      where: {
        status: { in: ['PENDING', 'RUNNING'] }
      },
      include: {
        source: {
          select: {
            id: true,
            name: true,
            type: true,
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledFor: 'asc' }
      ]
    });

    return jobs;
  }

  // GET /api/admin/jobs/history - Historial amb paginació
  async getJobHistory(options: {
    status?: any[];
    sourceId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = options.page || 1;
    const pageSize = options.pageSize || 20;
    const offset = (page - 1) * pageSize;

    const where: any = {};

    if (options.status && options.status.length > 0) {
      where.status = { in: options.status };
    }

    if (options.sourceId) {
      where.sourceId = options.sourceId;
    }

    const [jobs, total] = await Promise.all([
      (this.prisma as any).scrapingJob.findMany({
        where,
        include: {
          source: {
            select: {
              id: true,
              name: true,
              type: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: offset,
      }),
      (this.prisma as any).scrapingJob.count({ where })
    ]);

    return {
      jobs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      }
    };
  }

  // DELETE /api/admin/jobs/cleanup - Netejar jobs antics
  async cleanupOldJobs(olderThanDays: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await (this.prisma as any).scrapingJob.deleteMany({
      where: {
        status: { in: ['COMPLETED', 'FAILED', 'CANCELLED'] },
        completedAt: { lte: cutoffDate }
      }
    });

    return {
      success: true,
      deletedCount: result.count,
      message: `Deleted ${result.count} jobs older than ${olderThanDays} days`
    };
  }
}