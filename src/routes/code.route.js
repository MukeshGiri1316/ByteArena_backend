import { Router } from "express";
import { validateSubmission } from "../middlewares/validateRequest.js";
import { submitCodeController, runCodeController, getBoilerPlate } from "../controllers/code.controller.js";
import { authenticate } from '../middlewares/auth.middleware.js'
import { authorize } from '../middlewares/role.middleware.js'

const router = Router();

router.post('/submit', authenticate, authorize("USER"), validateSubmission, submitCodeController);
router.post('/run', authenticate, authorize("USER"), runCodeController);
router.post('/get-boilerplate', getBoilerPlate);


export default router;