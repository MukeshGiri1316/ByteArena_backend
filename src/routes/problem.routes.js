import { Router } from "express";
import { getProblemsController, getProblemByIdController } from "../controllers/problem.controller.js";

const router = Router();

router.get("/get-problems", getProblemsController);
router.get("/get-problem/:problemId", getProblemByIdController);

export default router;
