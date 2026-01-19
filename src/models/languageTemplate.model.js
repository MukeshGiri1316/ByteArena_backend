import mongoose from "mongoose";

const languageTemplateSchema = new mongoose.Schema(
    {
        languageId: {
            type: Number,
            required: true,
            unique: true
        },

        languageName: {
            type: String,
            required: true
        },

        template: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

export const LanguageTemplate = mongoose.model(
    "LanguageTemplate",
    languageTemplateSchema
);
