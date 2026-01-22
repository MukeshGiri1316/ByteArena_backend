import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { sendResponse } from '../utils/response.js'
import { sendError } from '../utils/error.js'
import { LanguageTemplate } from "../models/languageTemplate.model.js";

export const registerTeacher = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendError(res, 400, "All fields are required");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(res, 409, "Email already registered");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            role: "TEACHER",
            passwordHash,
            createdBy: req.user.id
        });

        return sendResponse(res, 201, "Teacher registered successfully", {
            username: user.username,
            email: user.email
        });
    } catch (error) {
        console.error("Register error:", error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: "TEACHER" }).select("-passwordHash");
        return sendResponse(res, 200, "Teachers retrieved successfully", { teachers });
    } catch (error) {
        console.error("Get teachers error:", error);
        return sendError(res, 500, "Internal server error");
    }
}

export const createLanguageTemplate = async (req, res) => {
    try {
        const { languageId, languageName, template } = req.body;

        if (!languageId || !languageName || !template) {
            return sendError(res, 400, "All fields are required");
        }

        // Template must include both placeholders
        if (!template.includes("{{STUDENT_CODE}}") || !template.includes("{{AUTO_CODE}}")) {
            return sendError(
                res,
                400,
                "Template must include both {{STUDENT_CODE}} and {{AUTO_CODE}} placeholders"
            );
        }

        const updatedTemplate = await LanguageTemplate.findOneAndUpdate(
            { languageId },
            {
                languageId,
                languageName,
                template
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        return sendResponse(res, 201, "Language template saved successfully", {
            template: updatedTemplate
        });
    } catch (error) {
        console.error("Error saving language template:", error);
        return sendError(res, 500, "Failed to save language template");
    }
};