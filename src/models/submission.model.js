import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        /* -------------------- Core Relations -------------------- */
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true,
            index: true,
        },

        contestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contest",
            default: null,
            index: true,
        },

        /* -------------------- Submission Details -------------------- */
        languageId: {
            type: Number,
            required: true,
            index: true,
        },

        code: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubmissionCode",
            required: true,
        },

        /* -------------------- Judge Result -------------------- */
        verdict: {
            type: String,
            enum: [
                "Pending",
                "Accepted",
                "Wrong Answer",
                "Time Limit Exceeded",
                "Memory Limit Exceeded",
                "Runtime Error",
                "Compilation Error",
                "Partial Accepted",
            ],
            default: "Pending",
            index: true,
        },

        executionTime: {
            type: Number, // milliseconds
            default: null,
        },

        memoryUsed: {
            type: Number, // KB
            default: null,
        },

        score: {
            type: Number,
            default: 0, // useful for partial / contest problems
        },

        /* -------------------- Testcase Tracking -------------------- */
        testcaseVersion: {
            type: Number,
            required: true,
        },

        totalTestcases: {
            type: Number,
            default: null,
        },

        passedTestcases: {
            type: Number,
            default: null,
        },

        /* -------------------- Attempt Tracking -------------------- */
        attemptNumber: {
            type: Number,
            required: true,
            min: 1,
        },

        isFirstAccepted: {
            type: Boolean,
            default: false,
            index: true,
        },

        /* -------------------- Testcase Failure Info -------------------- */
        failedTestcase: {
            type: {
                testcaseNumber: Number,
                reason: {
                    type: String,
                    enum: [
                        "Wrong Answer",
                        "Time Limit Exceeded",
                        "Memory Limit Exceeded",
                        "Runtime Error"
                    ],
                },
            },
            default: null,
        },


        /* -------------------- Plagiarism & Integrity -------------------- */
        plagiarismStatus: {
            type: String,
            enum: ["CLEAN", "SUSPECTED", "CONFIRMED"],
            default: "CLEAN",
            index: true,
        },

        plagiarismScore: {
            type: Number,
            default: null, // percentage similarity
        },

        /* -------------------- Rejudge Support -------------------- */
        isRejudged: {
            type: Boolean,
            default: false,
        },

        previousVerdict: {
            type: String,
            enum: [
                "Pending",
                "Accepted",
                "Wrong Answer",
                "Time Limit Exceeded",
                "Memory Limit Exceeded",
                "Runtime Error",
                "Compilation Error",
                "Partial Accepted",
            ],
            default: null,
        },

    },
    {
        timestamps: true,
    }
);

/* -------------------- Indexes -------------------- */
submissionSchema.index({ userId: 1, problemId: 1 });
submissionSchema.index({ contestId: 1, userId: 1 });
submissionSchema.index({ problemId: 1, verdict: 1 });
submissionSchema.index({ submittedAt: -1 });

export const Submission = mongoose.model("Submission", submissionSchema);
