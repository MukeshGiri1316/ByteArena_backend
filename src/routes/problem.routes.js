import { Router } from "express";
import {
    listProblems,
    getProblemBySlug
} from "../controllers/problem.controller.js";

const router = Router();

router.get("/problems", listProblems);
router.get("/problems/:slug", getProblemBySlug);

export default router;
