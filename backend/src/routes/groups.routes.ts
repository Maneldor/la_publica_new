import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { cache, cacheList, invalidateCache } from '../middleware/cache.middleware';
import {
  createGroup,
  listGroups,
  getGroup,
  updateGroup,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
  updateMemberRole,
  getGroupMembers,
  createGroupPost,
  getGroupPosts,
  updateGroupPost,
  deleteGroupPost
} from '../modules/groups/groups.controller';

const router = Router();

router.post('/', authenticateToken, invalidateCache('groups:*'), createGroup);
router.get('/', cacheList({ baseKey: 'groups', ttl: 600 }), listGroups);
router.get('/:id', cache({ ttl: 300 }), getGroup);
router.put('/:id', authenticateToken, invalidateCache('groups:*'), updateGroup);
router.delete('/:id', authenticateToken, invalidateCache('groups:*'), deleteGroup);

router.get('/:id/members', cache({ ttl: 300 }), getGroupMembers);
router.post('/:id/members', authenticateToken, invalidateCache('groups:*'), addGroupMember);
router.delete('/:id/members/:usuarioId', authenticateToken, removeGroupMember);
router.put('/:id/members/:usuarioId/role', authenticateToken, updateMemberRole);

router.get('/:id/posts', getGroupPosts);
router.post('/:id/posts', authenticateToken, createGroupPost);
router.put('/posts/:postId', authenticateToken, updateGroupPost);
router.delete('/posts/:postId', authenticateToken, deleteGroupPost);

export default router;