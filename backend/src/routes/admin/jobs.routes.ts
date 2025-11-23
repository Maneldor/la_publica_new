import { Router } from 'express';
import { JobsController } from '../../controllers/admin/JobsController';
import { adminAuth } from '../../middleware/adminAuth';

const router = Router();
const controller = new JobsController();

// Totes les rutes requereixen autenticació admin
router.use(adminAuth);

// GET /api/admin/jobs/stats - Stats globals (abans de :id)
router.get('/stats', controller.getJobStats);

// GET /api/admin/jobs/active - Jobs actius (abans de :id)
router.get('/active', controller.getActiveJobs);

// GET /api/admin/jobs/history - Historial amb paginació (abans de :id)
router.get('/history', controller.getJobHistory);

// DELETE /api/admin/jobs/cleanup - Netejar jobs antics (abans de :id)
router.delete('/cleanup', controller.cleanupOldJobs);

// GET /api/admin/jobs - Llistar jobs
router.get('/', controller.getAllJobs);

// GET /api/admin/jobs/:id - Detalls job
router.get('/:id', controller.getJobById);

// POST /api/admin/jobs/:id/cancel - Cancel·lar job
router.post('/:id/cancel', controller.cancelJob);

// POST /api/admin/jobs/:id/retry - Reintentar job
router.post('/:id/retry', controller.retryJob);

// DELETE /api/admin/jobs/:id - Eliminar job
router.delete('/:id', controller.deleteJob);

export default router;