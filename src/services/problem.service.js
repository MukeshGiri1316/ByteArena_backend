import { Problem } from "../models/problem.model.js";

export async function getProblemById(problemId) {
    return await Problem.findById(problemId);
}
