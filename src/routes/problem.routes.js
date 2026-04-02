import { Router } from "express";
import { getProblemsController, getProblemByIdController, getCategoriesController } from "../controllers/problem.controller.js";

const router = Router();

router.get("/get-problems", getProblemsController);
router.get("/get-problem/:problemId", getProblemByIdController);
router.get("/get-categories", getCategoriesController);

export default router;
