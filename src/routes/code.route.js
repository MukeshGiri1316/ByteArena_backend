import {Router} from "express";
import { validateSubmission } from "../middlewares/validateRequest.js";
import { submitCodeController, getResultController } from "../controllers/code.controller.js";

const router = Router();

router.post('/submit', validateSubmission, submitCodeController);
router.get('/result/:token', getResultController);

export default router;