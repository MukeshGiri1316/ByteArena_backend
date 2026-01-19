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
            default: false
        },

        firstSolvedAt: Date,
        lastAttemptAt: Date,

        bestExecutionTime: Number
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
