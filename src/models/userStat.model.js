import mongoose from "mongoose";

const userStatSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            unique: true,
            required: true
        },

        problemsSolved: { type: Number, default: 0 },
        problemsAttempted: { type: Number, default: 0 },

        easySolved: { type: Number, default: 0 },
        mediumSolved: { type: Number, default: 0 },
        hardSolved: { type: Number, default: 0 },

        totalSubmissions: { type: Number, default: 0 },

        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },

        contestScore: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export const UserStat = mongoose.model(
    "UserStat",
    userStatSchema
);
