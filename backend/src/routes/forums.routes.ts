import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  createForum,
  listForums,
  getForum,
  updateForum,
  deleteForum,
  createTopic,
  listTopics,
  getTopic,
  updateTopic,
  deleteTopic,
  pinTopic,
  lockTopic,
  createReply,
  listReplies,
  updateReply,
  deleteReply,
  addModerator,
  removeModerator
} from '../modules/forums/forums.controller';

const router = Router();

router.post('/', authenticateToken, createForum);
router.get('/', listForums);
router.get('/:id', getForum);
router.put('/:id', authenticateToken, updateForum);
router.delete('/:id', authenticateToken, deleteForum);

router.get('/:id/topics', listTopics);
router.post('/:id/topics', authenticateToken, createTopic);

router.get('/topics/:topicId', getTopic);
router.put('/topics/:topicId', authenticateToken, updateTopic);
router.delete('/topics/:topicId', authenticateToken, deleteTopic);
router.patch('/topics/:topicId/pin', authenticateToken, pinTopic);
router.patch('/topics/:topicId/lock', authenticateToken, lockTopic);

router.get('/topics/:topicId/replies', listReplies);
router.post('/topics/:topicId/replies', authenticateToken, createReply);
router.put('/replies/:replyId', authenticateToken, updateReply);
router.delete('/replies/:replyId', authenticateToken, deleteReply);

router.post('/:id/moderators', authenticateToken, addModerator);
router.delete('/:id/moderators/:usuarioId', authenticateToken, removeModerator);

export default router;