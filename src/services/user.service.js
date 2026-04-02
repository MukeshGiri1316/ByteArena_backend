import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { UserProfile } from '../models/userProfile.model.js';
import { UserProblemStat } from "../models/userProblemStat.model.js";
import { VERDICTS } from "../constants/verdicts.js";

export async function createUserProfile(fields, session = null) {
    const requiredFields = [
        "userId",
        "email",
        "username",
        "rollNumber",
        "section",
        "batch",
        "department",
        "batchYear",
    ];

    try {
        const missing = requiredFields.filter(
            field => fields[field] === undefined
        );

        if (missing.length > 0) {
            throw new Error(
                `Missing required fields for profile creation: ${missing.join(", ")}`
            );
        }

        const existing = await UserProfile.findOne(
            { userId: fields.userId },
            { _id: 1 },
            { session }
        );

        if (existing) {
            throw new Error("UserProfile already exists");
        }

        const profile = new UserProfile(fields);
        await profile.save({ session });

        return profile;
    } catch (error) {
        console.error("createUserProfile error:", error);
        throw error;
    }
}

export async function updateUserProfile(userId, fields = {}, session = null) {
    const incFields = [
        "problemsAttempted",
        "problemsSolved",
        "easySolved",
        "mediumSolved",
        "hardSolved",
        "totalSubmissions",
        "acceptedSubmissions",
        "wrongSubmissions",
        "contestsAttempted",
        "contestsWon",
        "currentStreak",
        "longestStreak",
        "rating",
        "maxRating",
    ];

    const setFields = [
        "email",
        "username",
        "profileImage",
        "bio",
        "accuracyPercentage",
        "globalRank",
        "departmentRank",
        "lastActiveAt",
        "section",
        "batch",
        "department",
        "batchYear",
        "badgeIds",
        "accountStatus",
    ];

    try {
        if (!fields || Object.keys(fields).length === 0) {
            throw new Error("No fields provided for update");
        }

        const $inc = {};
        const $set = {};

        for (const [key, value] of Object.entries(fields)) {
            if (incFields.includes(key)) {
                if (typeof value !== "number") {
                    throw new Error(`$inc field "${key}" must be a number`);
                }
                $inc[key] = value;
            } else if (setFields.includes(key)) {
                $set[key] = value;
            } else {
                throw new Error(`Invalid field in profile update: ${key}`);
            }
        }

        const updateQuery = {};
        if (Object.keys($inc).length) updateQuery.$inc = $inc;
        if (Object.keys($set).length) updateQuery.$set = $set;

        return await UserProfile.findOneAndUpdate(
            { userId },
            updateQuery,
            {
                new: true,
                runValidators: true,
                session,
            }
        );
    } catch (error) {
        console.error("updateUserProfile error:", error);
        throw error;
    }
}

export async function saveUserProblemStat(payload, session = null) {
    try {
        /* ================= REQUIRED VALIDATION ================= */

        const required = [
            "userId",
            "problemId",
            "verdict",
            "executionTime",
            "memoryUsed",
            "submissionId"
        ];

        const missing = required.filter(f => payload[f] === undefined);
        if (missing.length)
            throw new Error(`Missing fields: ${missing.join(", ")}`);

        if (!mongoose.Types.ObjectId.isValid(payload.userId))
            throw new Error("Invalid userId");

        if (!mongoose.Types.ObjectId.isValid(payload.problemId))
            throw new Error("Invalid problemId");

        if (!mongoose.Types.ObjectId.isValid(payload.submissionId))
            throw new Error("Invalid submissionId");

        if (typeof payload.verdict !== "string")
            throw new Error("Invalid verdict");

        if (payload.executionTime !== null &&
            typeof payload.executionTime !== "number")
            throw new Error("executionTime must be number or null");

        if (payload.memoryUsed !== null &&
            typeof payload.memoryUsed !== "number")
            throw new Error("memoryUsed must be number or null");

        const now = new Date();
        const isAccepted = payload.verdict === VERDICTS.ACCEPTED;

        /* ================= FIND EXISTING ================= */

        let stat = await UserProblemStat.findOne({
            userId: payload.userId,
            problemId: payload.problemId
        }).session(session);

        /* ================= FIRST ATTEMPT ================= */

        if (!stat) {
            stat = await new UserProblemStat({
                userId: payload.userId,
                problemId: payload.problemId,
                attempts: 1,
                solved: isAccepted,
                firstSolvedAt: isAccepted ? now : null,
                lastAttemptAt: now,
                bestExecutionTime: isAccepted ? payload.executionTime : null,
                bestMemoryUsed: isAccepted ? payload.memoryUsed : null,
                lastVerdict: payload.verdict,
                firstAcceptedSubmissionId: isAccepted
                    ? payload.submissionId
                    : null
            }).save({ session });

            return stat;
        }

        /* ================= UPDATE EXISTING ================= */

        stat.attempts += 1;
        stat.lastAttemptAt = now;
        stat.lastVerdict = payload.verdict;

        if (isAccepted) {
            if (!stat.solved) {
                stat.solved = true;
                stat.firstSolvedAt = now;
                stat.firstAcceptedSubmissionId = payload.submissionId;
            }

            if (
                payload.executionTime !== null &&
                (stat.bestExecutionTime === null ||
                    payload.executionTime < stat.bestExecutionTime)
            ) {
                stat.bestExecutionTime = payload.executionTime;
            }

            if (
                payload.memoryUsed !== null &&
                (stat.bestMemoryUsed === null ||
                    payload.memoryUsed < stat.bestMemoryUsed)
            ) {
                stat.bestMemoryUsed = payload.memoryUsed;
            }
        }

        await stat.save({ session });

        return stat;

    } catch (error) {
        console.error("saveUserProblemStat error:", error);
        throw error;
    }
}


export async function getUserProfile(userId, session = null) {
    const userProfile = await UserProfile.findOne({ userId }).select("-createdAt -updatedAt -__v -_id -lastActiveAt").session(session);

    return userProfile;
}