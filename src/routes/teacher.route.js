import { Router } from 'express';
import { createProblemController, updateProblemController, deleteProblemController, getProblemsByteacherId } from '../controllers/teacher.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

router.post("/create-problem", authenticate, authorize("TEACHER"), createProblemController);
router.patch("/update-problem/:problemId", authenticate, authorize("TEACHER"), updateProblemController);
router.delete("/delete-problem/:problemId", authenticate, authorize("TEACHER"), deleteProblemController);
router.get("/get-problems", authenticate, authorize("TEACHER"), getProblemsByteacherId);

export default router;