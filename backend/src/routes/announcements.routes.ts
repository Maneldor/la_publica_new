import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
// import { authDevMiddleware, requireAuthDev } from '../middleware/auth-dev.middleware';
import {
  createAnnouncement,
  listAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  pinAnnouncement,
  expireAnnouncement,
  markAnnouncementAsRead,
  getReadStatus,
  getAnnouncementStats,
  getActiveAnnouncements,
  approveAnnouncement,
  rejectAnnouncement,
  getPendingAnnouncements
} from '../modules/announcements/announcements.controller';

const router = Router();

// Usar middleware JWT para producción
router.post('/', authenticateToken, createAnnouncement);
router.get('/', authenticateToken, listAnnouncements);
router.get('/active', authenticateToken, getActiveAnnouncements);
router.get('/:id', authenticateToken, getAnnouncement);
router.put('/:id', authenticateToken, updateAnnouncement);
router.delete('/:id', authenticateToken, deleteAnnouncement);

router.patch('/:id/pin', authenticateToken, pinAnnouncement);
router.patch('/:id/expire', authenticateToken, expireAnnouncement);

router.post('/:id/read', authenticateToken, markAnnouncementAsRead);
router.get('/:id/read-status', authenticateToken, getReadStatus);
router.get('/:id/stats', authenticateToken, getAnnouncementStats);

// Moderation endpoints (admin only)
router.get('/pending/list', authenticateToken, getPendingAnnouncements);
router.patch('/:id/approve', authenticateToken, approveAnnouncement);
router.patch('/:id/reject', authenticateToken, rejectAnnouncement);

export default router;