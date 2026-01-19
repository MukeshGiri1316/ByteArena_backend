import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["SUPER_ADMIN", "TEACHER", "USER"],
            required: true,
            index: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true
        },

        username: {
            type: String,
            unique: true,
            sparse: true, // allows SUPER_ADMIN without username
            index: true
        },

        passwordHash: {
            type: String,
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        lastLoginAt: Date,

        profile: {
            fullName: String,
            avatar: String,
            country: String
        }
    },
    { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
