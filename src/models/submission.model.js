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
            type: String,
            required: true,
            index: true
        },

        languageId: {
            type: Number,
            required: true
        },

        verdict: {
            type: String,
            required: true
        },

        failedTestCase: {
            type: Number,
            default: null
        },

        executionTime: String,
        memory: Number
    },
    { timestamps: true }
);

export const Submission = mongoose.model(
    "Submission",
    submissionSchema
);
