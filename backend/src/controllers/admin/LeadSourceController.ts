import { Request, Response, NextFunction } from 'express';
import { LeadSourceService } from '../../services/admin/LeadSourceService';

export class LeadSourceController {
  private service: LeadSourceService;

  constructor() {
    this.service = new LeadSourceService();
  }

  // GET /api/admin/sources
  getAllSources = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isActive, type } = req.query;

      const filters: any = {};
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (type) filters.type = type;

      const sources = await this.service.getAllSources(filters);

      res.json({
        success: true,
        data: sources,
        count: sources.length
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/admin/sources/:id
  getSourceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const source = await this.service.getSourceById(id);

      res.json({
        success: true,
        data: source
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/admin/sources
  createSource = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const source = await this.service.createSource(req.body);

      res.status(201).json({
        success: true,
        data: source,
        message: 'Lead source created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/admin/sources/:id
  updateSource = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const source = await this.service.updateSource(id, req.body);

      res.json({
        success: true,
        data: source,
        message: 'Lead source updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/admin/sources/:id
  deleteSource = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.service.deleteSource(id);

      res.json({
        success: true,
        message: 'Lead source deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/admin/sources/:id/test
  testSource = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { maxResults } = req.body;

      const result = await this.service.testSource(id, { maxResults });

      res.json({
        success: result.success,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/admin/sources/:id/execute
  executeSource = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { maxResults, runAI } = req.body;

      const result = await this.service.executeSource(id, { maxResults, runAI });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/admin/sources/:id/toggle
  toggleSource = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const source = await this.service.toggleSource(id);

      res.json({
        success: true,
        data: source,
        message: `Source ${source.isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      next(error);
    }
  };
}