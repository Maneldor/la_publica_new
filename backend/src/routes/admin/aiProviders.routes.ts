import { Router } from 'express';
import { AIProviderController } from '../../controllers/admin/AIProviderController';
import { adminAuth } from '../../middleware/adminAuth';
import { validateAIProvider, validateAIProviderUpdate } from '../../validators/aiProvider.validator';

const router = Router();
const controller = new AIProviderController();

// Totes les rutes requereixen autenticació admin
router.use(adminAuth);

// GET /api/admin/ai-providers - Llistar providers
router.get('/', controller.getAllProviders);

// GET /api/admin/ai-providers/:id - Obtenir provider
router.get('/:id', controller.getProviderById);

// POST /api/admin/ai-providers - Crear provider
router.post('/', validateAIProvider, controller.createProvider);

// PUT /api/admin/ai-providers/:id - Actualitzar provider
router.put('/:id', validateAIProviderUpdate, controller.updateProvider);

// DELETE /api/admin/ai-providers/:id - Eliminar provider
router.delete('/:id', controller.deleteProvider);

// POST /api/admin/ai-providers/:id/test - Test connexió
router.post('/:id/test', controller.testProvider);

// PUT /api/admin/ai-providers/:id/toggle - Activar/desactivar
router.put('/:id/toggle', controller.toggleProvider);

export default router;