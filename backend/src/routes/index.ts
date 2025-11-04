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
import crmRoutes from './crm.routes';
// conversations-simple.routes disabled due to TS errors - using conversations.js instead
const conversationsRoutes = require('./conversations.js');
const empresaMessagesRoutes = require('./empresa/messages.js');
import eventsRoutes from './events.routes';

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
router.use('/crm', crmRoutes);
router.use('/conversations', conversationsRoutes);
router.use('/empresa/messages', empresaMessagesRoutes);
router.use('/events', eventsRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;