import { Router } from 'express';
import { loginUser, registerUser, logoutUser, isMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', authenticate, isMe);

export default router;