import { Problem } from "../models/problem.model.js";

export async function getProblems(query, page = 1, limit = 10, selectFields = "") {
    const problems = await Problem.find(query)
        .select(
            selectFields
        )
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean();

    const total = await Problem.countDocuments(query);

    return { problems, total };
}

export async function getProblemById(problemId) {
    const problem = await Problem.findById(problemId).select("-solutionType -ioFormat -isActive -createdBy -createdAt -updatedAt -__v");

    return { problem };
}