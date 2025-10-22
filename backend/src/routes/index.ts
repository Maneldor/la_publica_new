import { Router } from 'express';
import authRoutes from './auth.routes';
import contentRoutes from './content.routes';
import groupsRoutes from './groups.routes';
import forumsRoutes from './forums.routes';
import announcementsRoutes from './announcements.routes';
import companiesRoutes from './companies.routes';
import uploadRoutes from './upload.routes';
import cloudinaryRoutes from './cloudinary.routes';
import aiRoutes from './ai.routes';
import reportsRoutes from './reports.routes';
import moderationRoutes from './moderation.routes';
import roleRoutes from './role.routes';
import adminRoutes from './admin.routes';
import cacheRoutes from './cache.routes';
import coursesRoutes from './courses.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/content', contentRoutes);
router.use('/groups', groupsRoutes);
router.use('/forums', forumsRoutes);
router.use('/announcements', announcementsRoutes);
router.use('/companies', companiesRoutes);
router.use('/upload', uploadRoutes);
router.use('/cloudinary', cloudinaryRoutes);
router.use('/ai', aiRoutes);
router.use('/reports', reportsRoutes);
router.use('/moderation', moderationRoutes);
router.use('/roles', roleRoutes);
router.use('/admin', adminRoutes);
router.use('/cache', cacheRoutes);
router.use('/courses', coursesRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;