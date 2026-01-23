import { Router } from 'express';
import { createProblem, updateProblem, deleteProblem, getProblems } from '../controllers/teacher.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

router.post("/create-problem", authenticate, authorize("TEACHER"), createProblem);
router.patch("/update-problem/:problemId", authenticate, authorize("TEACHER"), updateProblem);
router.delete("/delete-problem/:problemId", authenticate, authorize("TEACHER"), deleteProblem);
router.get("/get-problems", authenticate, authorize("TEACHER"), getProblems);

export default router;