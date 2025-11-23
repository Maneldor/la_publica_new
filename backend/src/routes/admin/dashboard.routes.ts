import { Router } from 'express';
import { DashboardController } from '../../controllers/admin/DashboardController';
import { adminAuth } from '../../middleware/adminAuth';

const router = Router();
const controller = new DashboardController();

router.use(adminAuth);

router.get('/stats', controller.getDashboardStats);
router.get('/quick-stats', controller.getQuickStats);

export default router;