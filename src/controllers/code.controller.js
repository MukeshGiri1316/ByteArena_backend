import mongoose from "mongoose";
import { runTestCases } from "../services/testCaseRunner.service.js";
import { getSubmissionCount, saveSubmission } from '../services/submission.service.js'
import { LanguageTemplate } from "../models/languageTemplate.model.js";
import { sendResponse } from '../utils/response.js';
import { sendError } from '../utils/error.js';
import { VERDICTS } from "../constants/verdicts.js";
import { saveUserStat } from '../services/user.service.js';
import { getProblemById } from '../services/problem.service.js';

export async function submitCodeController(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user.id;
        const { sourceCode, languageId, problemId } = req.body;

        if (!problemId) {
            await session.abortTransaction();
            return sendError(res, 400, "Problem ID is required");
        }

        const { problem } = await getProblemById(problemId);
        if (!problem) {
            await session.abortTransaction();
            return sendError(res, 404, "Problem not found");
        }

        const templateDoc = await LanguageTemplate.findOne({ languageId });
        if (!templateDoc) {
            await session.abortTransaction();
            return sendError(res, 400, "Language not supported");
        }

        const testCases = [
            ...problem.publicTestCases,
            ...problem.hiddenTestCases
        ];

        const result = await runTestCases({
            template: templateDoc.template,
            studentCode: sourceCode,
            language_id: languageId,
            testCases,
            functionSignature: problem.functionSignature
        });

        const submissionPayload = {
            userId,
            problemId: problem.id,
            languageId,
            verdict: result.verdict,
            failedTestCase: result.testCase || null,
            executionTime: result.executionTime || null,
            memory: result.memory || null
        };

        await saveSubmission(submissionPayload, session);

        const isSolved = result.verdict === VERDICTS.ACCEPTED;

        // count submissions inside transaction
        const submissionCount = await getSubmissionCount(
            userId,
            problemId,
            session
        );

        if (submissionCount === 1) {
            const incPayload = {
                problemsAttempted: 1,
                totalSubmissions: 1
            };

            if (isSolved) {
                incPayload.problemsSolved = 1;

                if (problem.difficulty === "EASY") incPayload.easySolved = 1;
                if (problem.difficulty === "MEDIUM") incPayload.mediumSolved = 1;
                if (problem.difficulty === "HARD") incPayload.hardSolved = 1;
            }

            await saveUserStat(
                userId,
                { $inc: incPayload },
                session
            );
        }

        await session.commitTransaction();

        return sendResponse(res, 200, result.verdict, {
            verdict: result.verdict,
            actualOutput: result.actualOutput || null,
            expectedOutput: result.expectedOutput || null,
            executionTime: result.executionTime || null,
            memory: result.memory || null,
            failedTestCase: result.testCase || null
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Error in submitCodeController:", error);
        return sendError(res, 500, "Execution failed");
    } finally {
        await session.endSession();
    }
};

export async function runCodeController(req, res) {
    const { sourceCode, languageId, problemId } = req.body;

    if (!problemId) {
        return sendError(res, 400, "Problem ID is required");
    }

    const { problem } = await getProblemById(problemId);

    if (!problem) {
        return sendError(res, 404, "Problem not found");
    }

    const templateDoc = await LanguageTemplate.findOne({ languageId });
    if (!templateDoc) {
        return sendError(res, 400, "Language not supported");
    }

    const testCases = [
        ...problem.publicTestCases
    ];

    try {
        const result = await runTestCases({
            template: templateDoc.template,       // template from DB
            studentCode: sourceCode,              // student function code
            language_id: languageId,              // Judge0 language ID
            testCases,                             // array of test cases
            functionSignature: problem.functionSignature
        });

        return sendResponse(res, 200, result.verdict, {
            verdict: result.verdict,
            actualOutput: result.actualOutput || null,
            expectedOutput: result.expectedOutput || null,
            executionTime: result.executionTime || null,
            memory: result.memory || null,
            failedTestCase: result.testCase || null
        });
    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Execution failed");
    }
};