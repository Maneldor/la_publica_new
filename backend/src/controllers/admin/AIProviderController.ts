import { Request, Response, NextFunction } from 'express';
import { AIProviderService } from '../../services/admin/AIProviderService';

export class AIProviderController {
  private service: AIProviderService;

  constructor() {
    this.service = new AIProviderService();
  }

  // GET /api/admin/ai-providers
  getAllProviders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isActive, type } = req.query;

      const filters: any = {};
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (type) filters.type = type;

      const providers = await this.service.getAllProviders(filters);

      res.json({
        success: true,
        data: providers,
        count: providers.length
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/admin/ai-providers/:id
  getProviderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const provider = await this.service.getProviderById(id);

      res.json({
        success: true,
        data: provider
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/admin/ai-providers
  createProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const provider = await this.service.createProvider(req.body);

      res.status(201).json({
        success: true,
        data: provider,
        message: 'AI Provider created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/admin/ai-providers/:id
  updateProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const provider = await this.service.updateProvider(id, req.body);

      res.json({
        success: true,
        data: provider,
        message: 'AI Provider updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/admin/ai-providers/:id
  deleteProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.service.deleteProvider(id);

      res.json({
        success: true,
        message: 'AI Provider deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/admin/ai-providers/:id/test
  testProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.service.testProvider(id);

      res.json({
        success: result.success,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/admin/ai-providers/:id/toggle
  toggleProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const provider = await this.service.toggleProvider(id);

      res.json({
        success: true,
        data: provider,
        message: `Provider ${provider.isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      next(error);
    }
  };
}