import mongoose from "mongoose";

const contestProblemSchema = new mongoose.Schema(
    {
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true,
        },
        points: {
            type: Number,
            required: true,
            min: 0,
        },
        order: {
            type: Number,
            required: true, // problem sequence in contest
        }
    },
    { _id: false }
);

const contestSchema = new mongoose.Schema(
    {
        /* -------------------- Basic Info -------------------- */
        title: {
            type: String,
            required: true,
            index: true,
        },

        description: {
            type: String,
            default: "",
        },

        contestType: {
            type: String,
            enum: ["PRACTICE", "RATED", "ICPC"],
            default: "RATED",
            index: true,
        },

        /* -------------------- Time Control -------------------- */
        startTime: {
            type: Date,
            required: true,
            index: true,
        },

        endTime: {
            type: Date,
            required: true,
            index: true,
        },

        freezeTime: {
            type: Date,
            default: null, // rankings freeze after this
        },

        /* -------------------- Problems -------------------- */
        problems: {
            type: [contestProblemSchema],
            required: true,
        },

        /* -------------------- Rules -------------------- */
        penaltyPerWrongSubmission: {
            type: Number,
            default: 20, // minutes (ICPC style)
        },

        requiresRegistration: {
            type: Boolean,
            default: false,
        },

        /* -------------------- Visibility & State -------------------- */
        status: {
            type: String,
            enum: ["DRAFT", "UPCOMING", "RUNNING", "FINISHED"],
            default: "DRAFT",
            index: true,
        },

        isRated: {
            type: Boolean,
            default: true,
            index: true,
        },

        eligibilityEnabled: {
            type: Boolean,
            default: false,
        },

        /* -------------------- Ownership -------------------- */
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

/* -------------------- Indexes -------------------- */
contestSchema.index({ startTime: 1, endTime: 1 });
contestSchema.index({ status: 1 });

export const Contest = mongoose.model("Contest", contestSchema);
