import { Submission } from "../models/submission.model.js";

export async function getSubmissions({
    problemId,
    limit = 10
}) {
    const query = {};

    if (problemId) {
        query.problemId = problemId;
    }

    return Submission.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .select(
            "problemId languageId verdict failedTestCase executionTime memory createdAt"
        )
        .lean();
}
