import { Response, NextFunction } from 'express';
// CORRECCIÓN 1: Usamos 'import type' para importar la interfaz de declaración de tipos (.d.ts)
import type { AuthenticatedRequest } from '../../types/express.d.ts'; 
import { SettingsService, GlobalSettings } from '../../services/admin/SettingsService';

export class SettingsController {
  private service: SettingsService;

  constructor() {
    this.service = new SettingsService();
  }

  // Usamos Request base aquí, ya que no necesitamos req.user
  getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await this.service.getSettings();
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  };

  // Usamos AuthenticatedRequest, que asegura req.user
  updateSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // 1. Extraemos el ID del usuario autenticado
      const userId = req.user.id; 

      // CORRECCIÓN 2: Hacemos casting de req.body a Partial<GlobalSettings>
      const settings = await this.service.updateSettings(req.body as Partial<GlobalSettings>, userId); 
      
      res.json({
        success: true,
        data: settings,
        message: 'Settings updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Usamos AuthenticatedRequest
  resetSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // 1. Extraemos el ID del usuario autenticado
      const userId = req.user.id; 

      const settings = await this.service.resetSettings(userId);
      
      res.json({
        success: true,
        data: settings,
        message: 'Settings reset to defaults'
      });
    } catch (error) {
      next(error);
    }
  };
}