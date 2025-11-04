import { Router } from 'express';
import { register, login, getProfile, checkNick, checkEmail, refreshToken } from '../modules/auth/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, cacheMiddleware(180), getProfile);
router.post('/refresh', authenticateToken, refreshToken);
router.get('/check-nick/:nick', checkNick);
router.get('/check-email/:email', checkEmail);

export default router;