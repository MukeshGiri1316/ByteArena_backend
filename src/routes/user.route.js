import { Router } from 'express'
import { registerUser, loginUser, getMysubmissions } from '../controllers/user.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/mysubmissions', authenticate, getMysubmissions);

export default router;