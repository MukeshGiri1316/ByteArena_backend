import mongoose from "mongoose";

const contestEligibilitySchema = new mongoose.Schema(
    {
        contestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contest",
            required: true,
            unique: true,
            index: true,
        },

        /* -------------------- Eligibility Rules -------------------- */

        allowedDepartments: {
            type: [String],
            enum: ["CSE", "CYS", "DS", "AIML"],
            default: [], // empty = all
        },

        allowedSections: {
            type: [String],
            default: [], // e.g. ["A", "B"]
        },

        allowedBatchYears: {
            type: [Number],
            enum: [1, 2, 3, 4],
            default: [],
        },

        allowedBatches: {
            type: [String],
            default: [], // e.g. ["2022-26"]
        },

        /* -------------------- Special Rules -------------------- */

        allowSpecificUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],

        excludeSpecificUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],

        /* -------------------- Access Mode -------------------- */
        accessType: {
            type: String,
            enum: ["OPEN", "RESTRICTED", "INVITE_ONLY"],
            default: "OPEN",
            index: true,
        },
    },
    { timestamps: true }
);

export const ContestEligibility = mongoose.model(
    "ContestEligibility",
    contestEligibilitySchema
);
