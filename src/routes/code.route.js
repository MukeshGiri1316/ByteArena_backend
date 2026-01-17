import {Router} from "express";
import { validateSubmission } from "../middlewares/validateRequest.js";
import { submitCodeController, getResultController, getSubmissionsController } from "../controllers/code.controller.js";

const router = Router();

router.post('/submit', validateSubmission, submitCodeController);
router.get('/result/:token', getResultController);
router.get('/submissions', getSubmissionsController);


export default router;