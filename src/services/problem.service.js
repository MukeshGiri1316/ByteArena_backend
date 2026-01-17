import { problems } from "../data/problems.js";

export function getProblemById(problemId) {
    return problems[problemId] || null;
}
