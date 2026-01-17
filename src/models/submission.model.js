import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
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

        executionTime: {
            type: String,
            default: null
        },

        memory: {
            type: Number,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export const Submission = mongoose.model(
    "Submission",
    submissionSchema
);
