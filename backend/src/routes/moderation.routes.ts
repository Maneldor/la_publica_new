import { Router } from 'express';
import { ModerationController } from '../modules/moderation/moderation.controller';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();
const moderationController = new ModerationController();

// Todas las rutas requieren autenticación y permisos de admin
router.use(authenticateToken);
router.use(isAdmin);

// Obtener todo el contenido reportado (vista unificada)
router.get('/content', moderationController.getAllReportedContent);

// Obtener estadísticas de moderación
router.get('/stats', moderationController.getModerationStats);

// Moderar un reporte específico
router.patch('/reports/:reportId', moderationController.moderateContent);

// Moderación en lote
router.post('/bulk', moderationController.bulkModeration);

// Obtener detalles de contenido específico
router.get('/content/:type/:contentId', moderationController.getContentDetails);

// Obtener historial de reportes de un usuario
router.get('/users/:userId/reports', moderationController.getReportHistory);

export default router;