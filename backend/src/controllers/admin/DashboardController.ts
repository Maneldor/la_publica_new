import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../../services/admin/DashboardService';

export class DashboardController {
  private service: DashboardService;

  constructor() {
    this.service = new DashboardService();
  }

  getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.service.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };

  getQuickStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.service.getQuickStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };
}