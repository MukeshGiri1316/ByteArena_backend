import { Submission } from "../models/submission.model.js";

export async function saveSubmission({
    problemId,
    languageId,
    verdict,
    failedTestCase,
    executionTime,
    memory
}) {
    return Submission.create({
        problemId,
        languageId,
        verdict,
        failedTestCase,
        executionTime,
        memory
    });
}
