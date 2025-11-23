import { Router, RequestHandler } from 'express';
import { SettingsController } from '../../controllers/admin/SettingsController';
import { adminAuth } from '../../middleware/adminAuth';
import { validateSettings } from '../../validators/settings.validator';

const router = Router();
const controller = new SettingsController();

// Aplica el middleware de autenticación a todas las rutas
router.use(adminAuth);

// GET Settings: Forzamos el casting a RequestHandler para evitar el error de sobrecarga (TS2769)
router.get('/', controller.getSettings as unknown as RequestHandler);

// PUT Settings (updateSettings): El casting soluciona el conflicto de tipos Request vs AuthenticatedRequest
router.put('/', validateSettings, controller.updateSettings as unknown as RequestHandler);

// POST Reset (resetSettings): El casting soluciona el conflicto de tipos Request vs AuthenticatedRequest
router.post('/reset', controller.resetSettings as unknown as RequestHandler);

export default router;