import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
    {
        input: {
            type: String, // JSON string
            required: true
        },
        output: {
            type: String, // JSON string
            required: true
        }
    },
    { _id: false }
);


const functionParamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true // e.g. int, vector<int>, List[int]
        }
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

        descriptionMarkdown: {
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

        solutionType: {
            type: String,
            enum: ["STDIN", "FUNCTION"],
            default: "FUNCTION",
            index: true
        },

        /* 🔑 FUNCTION-STYLE METADATA */
        functionSignature: {
            functionName: String,
            returnType: String,
            parameters: [functionParamSchema]
        },

        publicTestCases: [testCaseSchema],
        hiddenTestCases: [testCaseSchema],

        ioFormat: {
            input: String,
            output: String
        },

        timeLimit: {
            type: Number,
            default: 1000
        },

        memoryLimit: {
            type: Number,
            default: 262144
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
