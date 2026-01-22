import { Router } from 'express';
import { createProblem } from '../controllers/teacher.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

router.post("/create-problem", authenticate, authorize("TEACHER"), createProblem);

export default router;