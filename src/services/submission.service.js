import { Submission } from "../models/submission.model.js";

export async function saveSubmission({
    userId,
    problemId,
    languageId,
    verdict,
    failedTestCase,
    executionTime,
    memory
}) {
    return Submission.create({
        userId,
        problemId,
        languageId,
        verdict,
        failedTestCase,
        executionTime,
        memory
    });
}
