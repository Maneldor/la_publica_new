import { Router } from 'express';
import { LeadSourceController } from '../../controllers/admin/LeadSourceController';
import { adminAuth } from '../../middleware/adminAuth';
import { validateLeadSource, validateLeadSourceUpdate } from '../../validators/leadSource.validator';

const router = Router();
const controller = new LeadSourceController();

// Totes les rutes requereixen autenticació admin
router.use(adminAuth);

// GET /api/admin/sources - Llistar fonts
router.get('/', controller.getAllSources);

// GET /api/admin/sources/:id - Obtenir font
router.get('/:id', controller.getSourceById);

// POST /api/admin/sources - Crear font
router.post('/', validateLeadSource, controller.createSource);

// PUT /api/admin/sources/:id - Actualitzar font
router.put('/:id', validateLeadSourceUpdate, controller.updateSource);

// DELETE /api/admin/sources/:id - Eliminar font
router.delete('/:id', controller.deleteSource);

// POST /api/admin/sources/:id/test - Test scraping
router.post('/:id/test', controller.testSource);

// POST /api/admin/sources/:id/execute - Executar ara
router.post('/:id/execute', controller.executeSource);

// PUT /api/admin/sources/:id/toggle - Activar/desactivar
router.put('/:id/toggle', controller.toggleSource);

export default router;