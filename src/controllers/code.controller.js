import mongoose from "mongoose";
import { runTestCases } from "../services/testCaseRunner.service.js";
import { getSubmissionCount, getSubmission, saveSubmission, getLastCorrectSubmission } from '../services/submission.service.js'
import { LanguageTemplate } from "../models/languageTemplate.model.js";
import { sendResponse } from '../utils/response.js';
import { sendError } from '../utils/error.js';
import { VERDICTS } from "../constants/verdicts.js";
import { saveUserProblemStat, updateUserProfile, getUserProfile } from '../services/user.service.js';
import { getProblemById } from '../services/problem.service.js';
import { getHash } from '../utils/generateHash.js';
import { serveBoilerPlate } from '../services/boilerplate.service.js';

export async function submitCodeController(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user.id;
        const { sourceCode, languageId, problemId } = req.body;

        if (!problemId || !sourceCode || !languageId) {
            await session.abortTransaction();
            return sendError(res, 400, "Missing required field(s)");
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

        const testcases = [
            ...problem.publicTestCases,
            ...problem.hiddenTestCases
        ];

        /* ================= Check for duplicate submission ================= */
        const hashedCode = getHash(sourceCode);
        const existingResult = await getSubmission({ userId, hashedCode }, session);
        console.log(existingResult);
        if (existingResult) {
            return sendResponse(res, 200, existingResult.verdict, {
                verdict: existingResult.verdict,
                actualOutput: existingResult.actualOutput || null,
                expectedOutput: existingResult.expectedOutput || null,
                executionTime: existingResult.executionTime || null,
                memory: existingResult.memoryUsed || null,
                failedTestcase: existingResult.failedTestcase || null
            });
        }

        const result = await runTestCases({
            template: templateDoc.template,       // template from DB
            studentCode: sourceCode,              // student function code
            language_id: languageId,              // Judge0 language ID
            testcases,                             // array of test cases
            functionSignature: problem.functionSignature,
            comparisonType: problem.comparisonType
        });

        const isError = result.verdict === VERDICTS.RUNTIME_ERROR || result.verdict === VERDICTS.COMPILATION_ERROR;

        if (isError) {
            return sendError(res, 400, result.verdict, result.error);
        }

        const isSolved = result.verdict === VERDICTS.ACCEPTED;
        const isWrong = result.verdict !== VERDICTS.ACCEPTED;
        const alreadySolved = await getLastCorrectSubmission({ userId, problemId }, session);

        /* ================= Save submission ================= */
        const passedTestcases = isSolved ? testcases.length : result.testcase - 1;
        const failedTestcase = isWrong ? {
            testcaseNumber: result.testcase,
            reason: result.verdict
        } : null;

        const submissionPayload = {
            userId,
            problemId: problem.id,
            languageId,
            code: sourceCode,
            hashedCode,
            contestId: req.body.contestId || null,
            verdict: result.verdict,
            failedTestcase: result.testCase || null,
            executionTime: result.executionTime || null,
            memoryUsed: result.memory || null,
            score: req.body.points || 0,
            totalTestcases: testcases.length,
            passedTestcases,
            failedTestcase,
            testcaseVersion: problem.testcaseVersion
        };

        const submission = await saveSubmission(submissionPayload, session);

        /* ================= UPDATE USER PROFILE ================= */

        const submissionCount = await getSubmissionCount(
            userId,
            problemId,
            session
        );

        const incPayload = {
            totalSubmissions: 1,
            ...(isSolved && { acceptedSubmissions: 1 }),
            ...(isWrong && { wrongSubmissions: 1 })
        };

        // first attempt → mark attempted
        if (submissionCount === 1) {
            incPayload.problemsAttempted = 1;
        }

        // first time solving the problem
        if (isSolved && !alreadySolved) {
            incPayload.problemsSolved = 1;

            if (problem.difficulty === "EASY") incPayload.easySolved = 1;
            if (problem.difficulty === "MEDIUM") incPayload.mediumSolved = 1;
            if (problem.difficulty === "HARD") incPayload.hardSolved = 1;
        }

        const profile = await getUserProfile(userId, session);
        // console.log(profile);
        const updatedTotalSubmissions =
            (profile.totalSubmissions || 0) + 1;

        const updatedAccepted =
            (profile.acceptedSubmissions || 0) + (isSolved ? 1 : 0);

        const accuracy =
            updatedTotalSubmissions === 0
                ? 0
                : Number(((updatedAccepted / updatedTotalSubmissions) * 100).toFixed(2));

        await updateUserProfile(
            userId,
            {
                ...incPayload,
                accuracyPercentage: accuracy,
                lastActiveAt: new Date()
            },
            session
        );

        /* ================= UPDATE User Problem Stat ================= */
        const payload = {
            userId,
            problemId,
            verdict: result.verdict,
            executionTime: result.executionTime,
            memoryUsed: result.memory,
            submissionId: submission._id || null
        }

        await saveUserProblemStat(payload, session);

        await session.commitTransaction();

        return sendResponse(res, 200, result.verdict, {
            verdict: result.verdict,
            actualOutput: result.actualOutput || null,
            expectedOutput: result.expectedOutput || null,
            executionTime: result.executionTime || null,
            memory: result.memory || null,
            failedTestcase: result.testcase || null
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
    const userId = req.user.id;

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

    const testcases = [
        ...problem.publicTestCases
    ];

    try {
        const hashedCode = getHash(sourceCode);
        const existingResult = await getSubmission({ userId, hashedCode });
        console.log(existingResult);
        if (existingResult) {
            return sendResponse(res, 200, existingResult.verdict, {
                verdict: existingResult.verdict,
                actualOutput: existingResult.actualOutput || null,
                expectedOutput: existingResult.expectedOutput || null,
                executionTime: existingResult.executionTime || null,
                memory: existingResult.memoryUsed || null,
                failedTestcase: existingResult.failedTestcase || null
            });
        }

        const result = await runTestCases({
            template: templateDoc.template,       // template from DB
            studentCode: sourceCode,              // student function code
            language_id: languageId,              // Judge0 language ID
            testcases,                             // array of test cases
            functionSignature: problem.functionSignature,
            comparisonType: problem.comparisonType
        });

        const isError = result.verdict === VERDICTS.RUNTIME_ERROR || result.verdict === VERDICTS.COMPILATION_ERROR;

        if (isError) {
            return sendError(res, 400, result.verdict, result.error);
        }

        // if (result.verdict === VERDICTS.WRONG_ANSWER) {
        //     return sendError(res, 400, result.verdict, {
        //         verdict: result.verdict,
        //         actualOutput: result.actualOutput || null,
        //         expectedOutput: result.expectedOutput || null,
        //         failedTestcase: result.testcase || null
        //     });
        // }

        return sendResponse(res, 200, result.verdict, {
            verdict: result.verdict,
            actualOutput: result.actualOutput || null,
            expectedOutput: result.expectedOutput || null,
            executionTime: result.executionTime || null,
            memory: result.memory || null,
            failedTestcase: result.testcase || null
        });
    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Execution failed");
    }
};

export async function getBoilerPlate(req, res) {
    const { languageId, functionSignature } = req.body;

    if (!languageId || typeof languageId !== "number") {
        return sendError(res, 400, "Invalid language ID");
    }

    const boilerplate = serveBoilerPlate(functionSignature, languageId);

    if (!boilerplate) {
        return sendError(res, 500, "Something went wrong");
    }

    return sendResponse(res, 200, "Served successfully", { boilerplate });
}