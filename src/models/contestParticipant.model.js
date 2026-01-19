import mongoose from "mongoose";

const contestParticipantSchema = new mongoose.Schema(
    {
        contestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contest",
            required: true,
            index: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        score: {
            type: Number,
            default: 0
        },

        penalty: {
            type: Number,
            default: 0
        },

        lastSubmissionAt: Date
    },
    { timestamps: true }
);

contestParticipantSchema.index(
    { contestId: 1, userId: 1 },
    { unique: true }
);

export const ContestParticipant = mongoose.model(
    "ContestParticipant",
    contestParticipantSchema
);
