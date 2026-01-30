import { Submission } from "../models/submission.model.js";

export async function saveSubmission(payload, session=null) {

    const allowedFields = [
        "userId",
        "problemId",
        "languageId",
        "verdict",
        "failedTestCase",
        "executionTime",
        "memory"
    ]

    const isValidPayload = Object.keys(payload).every(field => allowedFields.includes(field));
    if (!isValidPayload) {
        throw new Error("Invalid fields in submission payload");
    }

    const newSubmission = new Submission(payload);

    const submission = newSubmission.save({session});

    return submission;
}

export async function getSubmissionCount(userId, problemId, session=null) {
    let query = { userId };
    if (problemId) {
        query.problemId = problemId;
    }

    return Submission.countDocuments(query).session(session);
}