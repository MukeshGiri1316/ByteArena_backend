import { Problem } from "../models/problem.model.js";
import { sendError } from "../utils/error.js";
import { sendResponse } from "../utils/response.js";

export async function createProblem(req, res) {
    try {
        // Ensure authenticated user exists
        if (!req.user || !req.user.id) {
            return sendError(res, 401, "Unauthorized access");
        }

        const teacherId = req.user.id;

        const {
            title,
            slug,
            descriptionMarkdown,
            difficulty,
            tags,
            constraints,
            ioFormat,
            publicTestCases,
            hiddenTestCases,
            timeLimit,
            memoryLimit,
            functionSignature // New field for LeetCode-style execution
        } = req.body;

        // Basic validation
        if (!title || !slug || !descriptionMarkdown || !difficulty || !functionSignature) {
            return sendError(res, 400, "Missing required fields");
        }

        // Validate functionSignature structure
        const { functionName, returnType, parameters } = functionSignature;
        if (!functionName || !returnType || !Array.isArray(parameters)) {
            return sendError(res, 400, "Invalid functionSignature format");
        }

        // Check for existing problem with same slug
        const existing = await Problem.findOne({ slug });
        if (existing) {
            return sendError(res, 409, "Problem with this slug already exists");
        }

        // Create problem
        const problem = await Problem.create({
            title,
            slug,
            descriptionMarkdown,
            difficulty,
            tags,
            constraints,
            ioFormat,
            publicTestCases,
            hiddenTestCases,
            timeLimit,
            memoryLimit,
            functionSignature, // Store it in DB
            createdBy: teacherId
        });

        return sendResponse(res, 201, "Problem created successfully", {
            problemId: problem._id
        });

    } catch (error) {
        console.error("Create Problem Error:", error);

        // Handle MongoDB duplicate key error (extra safety)
        if (error.code === 11000) {
            return sendError(res, 409, "Duplicate field value detected", {
                field: Object.keys(error.keyValue)
            });
        }

        return sendError(res, 500, "Internal server error");
    }
}