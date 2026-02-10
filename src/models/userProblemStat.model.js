import mongoose from "mongoose";

const userProblemStatSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true,
            index: true
        },

        attempts: {
            type: Number,
            default: 0
        },

        solved: {
            type: Boolean,
            default: false,
            index: true
        },

        firstSolvedAt: {
            type: Date,
            default: null
        },

        lastAttemptAt: {
            type: Date,
            default: null
        },

        bestExecutionTime: {
            type: Number,
            default: null
        },

        bestMemoryUsed: {
            type: Number,
            default: null
        },

        lastVerdict: {
            type: String,
            default: null
        },

        firstAcceptedSubmissionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Submission",
            default: null
        }
    },
    { timestamps: true }
);

userProblemStatSchema.index(
    { userId: 1, problemId: 1 },
    { unique: true }
);

export const UserProblemStat = mongoose.model(
    "UserProblemStat",
    userProblemStatSchema
);
