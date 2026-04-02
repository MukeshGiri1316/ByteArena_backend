import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
    {
        input: {
            type: String,
            required: true,
        },
        output: {
            type: String,
        },
        isPublic: {
            type: Boolean,
            default: false,
        },
        weight: {
            type: Number,
            default: 1,
        },
    },
    { _id: false }
);

const functionParamSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        type: { type: String, required: true },
    },
    { _id: false }
);

const problemSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },

        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        descriptionMarkdown: {
            type: String,
            required: true,
        },

        difficulty: {
            type: String,
            enum: ["EASY", "MEDIUM", "HARD"],
            required: true,
            index: true,
        },

        tags: {
            type: [String],
            default: [],
        },

        constraints: String,

        solutionType: {
            type: String,
            enum: ["STDIN", "FUNCTION"],
            default: "FUNCTION",
            index: true,
        },

        comparisonType: {
            type: String,
            enum: ["ORDERED", "UNORDERED"],
            default: "ORDERED"
        },

        functionSignature: {
            functionName: String,
            returnType: String,
            parameters: [functionParamSchema],
        },

        publicTestCases: [testCaseSchema],
        hiddenTestCases: [testCaseSchema],

        ioFormat: {
            input: String,
            output: String,
        },

        timeLimit: {
            type: Number,
            default: 1000,
        },

        memoryLimit: {
            type: Number,
            default: 262144,
        },

        testcaseVersion: {
            type: Number,
            default: 1,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

problemSchema.index({ tags: 1 });
problemSchema.index({ title: 1 });

export const Problem = mongoose.model("Problem", problemSchema);
