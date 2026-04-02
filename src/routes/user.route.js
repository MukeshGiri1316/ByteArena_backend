import { Router } from 'express'
import { getUserStatController } from '../controllers/user.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router();

router.get('/stats', authenticate, getUserStatController);

export default router;