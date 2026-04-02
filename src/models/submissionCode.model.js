import mongoose from "mongoose";

const submissionCodeSchema = new mongoose.Schema(
    {
        submissionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Submission",
            required: true,
            unique: true,
            index: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        languageId: {
            type: Number,
            required: true,
        },

        code: {
            type: Buffer,
            required: true,
        },

        codeHash: {
            type: String,
            required: true,
            index: true
        },

        codeSize: {
            type: Number, // bytes
            required: true,
        },

        /* Optional: future safety */
        isObfuscated: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const SubmissionCode = mongoose.model(
    "SubmissionCode",
    submissionCodeSchema
);
