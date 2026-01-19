import mongoose from "mongoose";

const authTokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        tokenHash: {
            type: String,
            required: true
        },

        expiresAt: {
            type: Date,
            required: true
        },

        revoked: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export const AuthToken = mongoose.model(
    "AuthToken",
    authTokenSchema
);
