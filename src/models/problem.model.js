import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
    {
        input: String,
        output: String
    },
    { _id: false }
);

const problemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        description: {
            type: String,
            required: true
        },

        difficulty: {
            type: String,
            enum: ["EASY", "MEDIUM", "HARD"],
            required: true,
            index: true
        },

        tags: {
            type: [String],
            index: true
        },

        constraints: String,

        publicTestCases: [testCaseSchema],

        hiddenTestCases: [testCaseSchema],

        boilerplate: {
            cpp: String,
            python: String,
            java: String
        },

        timeLimit: {
            type: Number,
            default: 1000
        },

        memoryLimit: {
            type: Number,
            default: 262144 // 256MB
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export const Problem = mongoose.model("Problem", problemSchema);
