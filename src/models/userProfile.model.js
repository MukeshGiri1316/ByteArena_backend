import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
    {
        /* -------------------- Identity & Display -------------------- */
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        email: {
            type: String,
            required: true
        },

        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },

        profileImage: {
            type: String,
            default: "",
        },

        bio: {
            type: String,
            default: "",
            maxlength: 300,
        },

        /* -------------------- Problem Statistics (Cached) -------------------- */
        problemsAttempted: { type: Number, default: 0, min: 0 },
        problemsSolved: { type: Number, default: 0, min: 0 },
        easySolved: { type: Number, default: 0, min: 0 },
        mediumSolved: { type: Number, default: 0, min: 0 },
        hardSolved: { type: Number, default: 0, min: 0 },

        totalSubmissions: { type: Number, default: 0, min: 0 },
        acceptedSubmissions: { type: Number, default: 0, min: 0 },
        wrongSubmissions: { type: Number, default: 0, min: 0 },

        accuracyPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        /* -------------------- Contest Performance -------------------- */
        contestsAttempted: { type: Number, default: 0, min: 0 },
        contestsWon: { type: Number, default: 0, min: 0 },

        rating: {
            type: Number,
            default: 1200,
            index: true,
        },

        maxRating: {
            type: Number,
            default: 1200,
        },

        globalRank: {
            type: Number,
            default: null,
            index: true,
        },

        departmentRank: {
            type: Number,
            default: null,
            index: true,
        },

        /* -------------------- Streaks & Activity -------------------- */
        streak: {
            current: { type: Number, default: 0, min: 0 },
            longest: { type: Number, default: 0, min: 0 },

            lastSolvedAt: {
                type: Date,
                default: null,
                index: true,
            },

            warningStartedAt: {
                type: Date,
                default: null,
            }
        },

        /* -------------------- Academic Context -------------------- */
        rollNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        section: {
            type: String,
            required: true,
            index: true,
        },

        batch: {
            type: String,
            required: true,
        },

        department: {
            type: String,
            enum: ["CSE", "CYS", "DS", "AIML"],
            required: true,
            index: true,
        },

        batchYear: {
            type: Number,
            enum: [1, 2, 3, 4],
            required: true,
            index: true,
        },

        /* -------------------- Achievements -------------------- */
        badgeIds: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Badge",
                },
            ],
            default: [],
        },

        /* -------------------- Account Meta -------------------- */
        accountStatus: {
            type: String,
            enum: ["ACTIVE", "SUSPENDED", "BANNED"],
            default: "ACTIVE",
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

/* -------------------- Index Optimizations -------------------- */
userProfileSchema.index({ rating: -1 });

export const UserProfile = mongoose.model("UserProfile", userProfileSchema);
