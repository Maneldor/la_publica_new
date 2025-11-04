import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  // Leads
  createLead,
  listLeads,
  getLead,
  updateLead,
  convertLead,

  // Interactions
  createInteraction,
  listInteractions,
  updateInteraction,
  markActionCompleted,

  // Contacts
  createContact,
  listContacts,

  // Dashboard
  getDashboardData,
  getPendingTasks,

  // Notifications
  listNotifications,
  getAvailableRecipients,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  generateAutomaticNotifications
} from '../modules/crm/crm.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// ============================================================================
// LEADS
// ============================================================================
router.post('/leads', createLead);
router.get('/leads', listLeads);
router.get('/leads/:id', getLead);
router.put('/leads/:id', updateLead);
router.post('/leads/:id/convert', convertLead);

// ============================================================================
// INTERACTIONS
// ============================================================================
router.post('/interactions', createInteraction);
router.get('/interactions', listInteractions);
router.put('/interactions/:id', updateInteraction);
router.put('/interactions/:id/complete-action', markActionCompleted);

// ============================================================================
// CONTACTS
// ============================================================================
router.post('/contacts', createContact);
router.get('/contacts', listContacts);

// ============================================================================
// DASHBOARD
// ============================================================================
router.get('/dashboard', getDashboardData);
router.get('/tasks/pending', getPendingTasks);

// ============================================================================
// NOTIFICATIONS - Solo para gestores de empresas con restricciones
// ============================================================================
router.get('/notifications', listNotifications);
router.get('/notifications/available-recipients', getAvailableRecipients);
router.put('/notifications/:id/read', markNotificationAsRead);
router.put('/notifications/read-all', markAllNotificationsAsRead);
router.post('/notifications', createNotification);
router.post('/notifications/generate-automatic', generateAutomaticNotifications);

export default router;