import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
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

        contestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contest",
            default: null,
            index: true
        },

        languageId: {
            type: Number,
            required: true
        },

        verdict: {
            type: String,
            enum: [
                "Accepted",
                "Wrong Answer",
                "Time Limit Exceeded",
                "Runtime Error",
                "Compilation Error"
            ],
            required: true,
            index: true
        },

        failedTestCase: {
            type: Number,
            default: null
        },

        executionTime: Number,
        memory: Number,

        isContestSubmission: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    { timestamps: true }
);

export const Submission = mongoose.model(
    "Submission",
    submissionSchema
);
