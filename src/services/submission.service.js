import mongoose from "mongoose";
import { Submission } from "../models/submission.model.js";
import { SubmissionCode } from "../models/submissionCode.model.js";
import { getProblemById } from '../services/problem.service.js';
import { compressCode } from '../utils/codeCompression.js';
import { getContestById } from '../services/contest.service.js';
import { VERDICTS } from "../constants/verdicts.js";

export async function saveSubmission(payload, session = null) {
    try {
        const submissionId = new mongoose.Types.ObjectId();
        const submissionCodeId = new mongoose.Types.ObjectId();

        /* ============================================================
           3️⃣ AUTO ATTEMPT NUMBER
        ============================================================ */

        const previousAttempts = await getSubmissionCount(payload.userId, payload.problemId, session);

        const attemptNumber = previousAttempts + 1;

        /* ============================================================
           5️⃣ SAVE SUBMISSION CODE
        ============================================================ */

        const codeSize = Buffer.byteLength(payload.code, "utf8");
        const compressedCode = compressCode(payload.code);
        const hashedCode = payload.hashedCode;

        const submissionCode = await new SubmissionCode({
            _id: submissionCodeId,
            submissionId: submissionId,
            userId: payload.userId,
            languageId: payload.languageId,
            code: compressedCode,
            codeHash: hashedCode,
            codeSize,
            isObfuscated: false,
        }).save({ session });

        /* ============================================================
           4️⃣ CREATE SUBMISSION (FULL INITIAL STATE)
        ============================================================ */

        const submission = await new Submission({
            userId: payload.userId,
            problemId: payload.problemId,
            contestId: payload.contestId ?? null,

            languageId: payload.languageId,
            code: submissionCodeId,

            verdict: payload.verdict,
            executionTime: payload.executionTime,
            memoryUsed: payload.memoryUsed,
            score: 0,

            testcaseVersion: payload.testcaseVersion,
            totalTestcases: payload.totalTestcases,
            passedTestcases: payload.passedTestcases,

            attemptNumber,
            isFirstAccepted: false,

            failedTestcase: payload.failedTestcase,

            plagiarismStatus: "CLEAN",
            plagiarismScore: null,

            isRejudged: false,
            previousVerdict: null,
        }).save({ session });

        /* ============================================================
           7️⃣ COMMIT
        ============================================================ */

        return submission;

    } catch (error) {
        console.error("createSubmissionAtomic error:", error);
        throw error;
    }
}

export async function getSubmissionCount(userId, problemId, session = null) {
    let query = { userId };
    if (problemId) {
        query.problemId = problemId;
    }

    return Submission.countDocuments(query).session(session);
}

export async function getSubmission(payload, session = null) {
    try {
        const codeExist = await SubmissionCode.findOne({
            userId: payload.userId,
            codeHash: payload.hashedCode
        }).session(session);

        if (!codeExist) {
            return;
        }

        const submission = await Submission.find({
            code: codeExist._id
        })
        console.log(submission);

        return submission[0];

    } catch (error) {
        throw error;
    }
}

export async function getLastCorrectSubmission(payload, session = null) {
    const { userId, problemId, contestId } = payload;
    const query = {
        userId,
        problemId,
        verdict: VERDICTS.ACCEPTED
    };

    if (contestId !== null && contestId !== undefined) {
        query.contestId = contestId;
    } else {
        query.contestId = null;
    }

    const submission = await Submission
        .findOne(query)
        .sort({ createdAt: -1 })
        .session(session);

    return submission;
}

export async function getRecentProblems(payload, session = null) {
    const { userId, numOfSubmissions } = payload;

    const submissions = await Submission.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId)
            }
        },

        // latest submissions first
        {
            $sort: { createdAt: -1 }
        },

        // remove duplicates (keep latest submission per problem)
        {
            $group: {
                _id: "$problemId",
                latestSubmission: { $first: "$$ROOT" }
            }
        },

        // flatten الوثيقة
        {
            $replaceRoot: { newRoot: "$latestSubmission" }
        },

        // join with problems collection
        {
            $lookup: {
                from: "problems", // ⚠️ ensure correct collection name
                localField: "problemId",
                foreignField: "_id",
                as: "problem"
            }
        },

        {
            $unwind: "$problem"
        },

        // pick required fields
        {
            $project: {
                _id: 0,
                problemId: "$problem._id",
                problemTitle: "$problem.title",
                difficulty: "$problem.difficulty",
                verdict: 1,
                createdAt: 1
            }
        },

        // latest submissions first
        {
            $sort: { createdAt: -1 }
        },

        {
            $limit: numOfSubmissions
        }
    ]);

    // helper function to convert time
    const getTimeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);

        if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
        if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
        return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
    };

    // format response
    const formatted = submissions.map(sub => ({
        problemId: sub.problemId,
        problemTitle: sub.problemTitle,
        difficulty: sub.difficulty,
        verdict: sub.verdict,
        submittedAt: getTimeAgo(sub.createdAt),
    }));

    return formatted;
}
