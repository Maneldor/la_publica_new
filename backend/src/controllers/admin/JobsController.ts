import { Request, Response, NextFunction } from 'express';
import { JobsService } from '../../services/admin/JobsService';

export class JobsController {
  private service: JobsService;

  constructor() {
    this.service = new JobsService();
  }

  // GET /api/admin/jobs
  getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, priority, sourceId, limit, offset } = req.query;

      const filters: any = {};

      if (status) {
        // Permetre múltiples status separats per comes
        filters.status = typeof status === 'string'
          ? status.split(',')
          : status;
      }

      if (priority) filters.priority = priority;
      if (sourceId) filters.sourceId = sourceId as string;
      if (limit) filters.limit = parseInt(limit as string);
      if (offset) filters.offset = parseInt(offset as string);

      const result = await this.service.getAllJobs(filters);

      res.json({
        success: true,
        data: result.jobs,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/admin/jobs/:id
  getJobById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const job = await this.service.getJobById(id);

      res.json({
        success: true,
        data: job
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/admin/jobs/:id/cancel
  cancelJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const job = await this.service.cancelJob(id);

      res.json({
        success: true,
        data: job,
        message: 'Job cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/admin/jobs/:id/retry
  retryJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const newJob = await this.service.retryJob(id);

      res.json({
        success: true,
        data: newJob,
        message: 'Job retry scheduled'
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/admin/jobs/:id
  deleteJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.service.deleteJob(id);

      res.json({
        success: true,
        message: 'Job deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/admin/jobs/stats
  getJobStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sourceId, since } = req.query;

      const filters: any = {};
      if (sourceId) filters.sourceId = sourceId as string;
      if (since) filters.since = new Date(since as string);

      const stats = await this.service.getJobStats(filters);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/admin/jobs/active
  getActiveJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobs = await this.service.getActiveJobs();

      res.json({
        success: true,
        data: jobs,
        count: jobs.length
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/admin/jobs/history
  getJobHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, sourceId, page, pageSize } = req.query;

      const options: any = {};

      if (status) {
        options.status = typeof status === 'string'
          ? status.split(',')
          : status;
      }

      if (sourceId) options.sourceId = sourceId as string;
      if (page) options.page = parseInt(page as string);
      if (pageSize) options.pageSize = parseInt(pageSize as string);

      const result = await this.service.getJobHistory(options);

      res.json({
        success: true,
        data: result.jobs,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/admin/jobs/cleanup
  cleanupOldJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { days } = req.query;
      const olderThanDays = days ? parseInt(days as string) : 30;

      const result = await this.service.cleanupOldJobs(olderThanDays);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}