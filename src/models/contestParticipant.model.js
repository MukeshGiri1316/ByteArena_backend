import mongoose from "mongoose";

const contestParticipantSchema = new mongoose.Schema(
    {
        /* -------------------- Relations -------------------- */
        contestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contest",
            required: true,
            index: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        /* -------------------- Participation State -------------------- */
        status: {
            type: String,
            enum: ["REGISTERED", "ACTIVE", "FINISHED", "DISQUALIFIED"],
            default: "REGISTERED",
            index: true,
        },

        /* -------------------- Scoring -------------------- */
        score: {
            type: Number,
            default: 0,
        },

        problemsSolved: {
            type: Number,
            default: 0,
            min: 0,
        },

        penalty: {
            type: Number,
            default: 0, // minutes (ICPC style)
            min: 0,
        },

        rank: {
            type: Number,
            default: null,
            index: true,
        },

        /* -------------------- Timing -------------------- */
        firstAcceptedAt: {
            type: Date,
            default: null,
        },

        lastSubmissionAt: {
            type: Date,
            default: null,
        },

        /* -------------------- Freeze Handling -------------------- */
        isFrozen: {
            type: Boolean,
            default: false,
            index: true,
        },

        /* -------------------- Rating Impact -------------------- */
        ratingChange: {
            type: Number,
            default: 0, // +ve or -ve after contest
        },
    },
    { timestamps: true }
);

/* -------------------- Indexes -------------------- */
contestParticipantSchema.index(
    { contestId: 1, userId: 1 },
    { unique: true }
);

contestParticipantSchema.index({ contestId: 1, rank: 1 });
contestParticipantSchema.index({ contestId: 1, score: -1, penalty: 1 });

export const ContestParticipant = mongoose.model(
    "ContestParticipant",
    contestParticipantSchema
);
