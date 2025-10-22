import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
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
  getActiveAnnouncements
} from '../modules/announcements/announcements.controller';

const router = Router();

router.post('/', authenticateToken, createAnnouncement);
router.get('/', listAnnouncements);
router.get('/active', getActiveAnnouncements);
router.get('/:id', getAnnouncement);
router.put('/:id', authenticateToken, updateAnnouncement);
router.delete('/:id', authenticateToken, deleteAnnouncement);

router.patch('/:id/pin', authenticateToken, pinAnnouncement);
router.patch('/:id/expire', authenticateToken, expireAnnouncement);

router.post('/:id/read', authenticateToken, markAnnouncementAsRead);
router.get('/:id/read-status', authenticateToken, getReadStatus);
router.get('/:id/stats', authenticateToken, getAnnouncementStats);

export default router;