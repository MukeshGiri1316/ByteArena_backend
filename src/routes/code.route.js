import { Router } from "express";
import { validateSubmission } from "../middlewares/validateRequest.js";
import { submitCodeController, getResultController, getSubmissionsController } from "../controllers/code.controller.js";
import { authenticate } from '../middlewares/auth.middleware.js'
import { authorize } from '../middlewares/role.middleware.js'

const router = Router();

router.post('/submit', authenticate, authorize("USER"), validateSubmission, submitCodeController);
router.get('/result/:token', getResultController);
router.get('/submissions', getSubmissionsController);


export default router;