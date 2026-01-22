import { Router } from 'express'
import { getMysubmissions } from '../controllers/user.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router();

router.get('/mysubmissions', authenticate, getMysubmissions);

export default router;