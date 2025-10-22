import { Router } from 'express';
import {
  createReport,
  listReports,
  updateReportStatus,
  getReport
} from '../modules/reports/reports.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/', createReport);
router.get('/', listReports);
router.get('/:id', getReport);
router.patch('/:id', updateReportStatus);

export default router;