import mongoose from "mongoose";

const contestProblemSchema = new mongoose.Schema(
    {
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true
        },
        points: {
            type: Number,
            required: true
        }
    },
    { _id: false }
);

const contestSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        description: String,

        startTime: {
            type: Date,
            required: true,
            index: true
        },

        endTime: {
            type: Date,
            required: true,
            index: true
        },

        problems: [contestProblemSchema],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export const Contest = mongoose.model("Contest", contestSchema);
