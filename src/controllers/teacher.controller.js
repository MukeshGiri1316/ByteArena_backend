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

export async function updateProblem(req, res) {
    const ALLOWED_FIELDS = [
        "title",
        "slug",
        "descriptionMarkdown",
        "difficulty",
        "tags",
        "constraints",
        "solutionType",
        "functionSignature",
        "publicTestCases",
        "hiddenTestCases",
        "ioFormat",
        "timeLimit",
        "memoryLimit",
        "isActive"
    ];

    try {
        const { problemId } = req.params;
        const payload = req.body;

        if (!payload || Object.keys(payload).length === 0) {
            return sendError(res, 400, "No data provided for update");
        }

        // 🔐 Build safe update object
        const updates = {};
        for (const key of Object.keys(payload)) {
            if (ALLOWED_FIELDS.includes(key)) {
                updates[key] = payload[key];
            }
        }

        if (Object.keys(updates).length === 0) {
            return sendError(res, 400, "No valid fields provided for update");
        }

        const updatedProblem = await Problem.findByIdAndUpdate(
            problemId,
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedProblem) {
            return sendError(res, 404, "Problem not found");
        }

        return sendResponse(res, 200, "Problem updated successfully");

    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Internal server error");
    }
}

export async function deleteProblem(req, res) {
    try {
        const { problemId } = req.params;
        const problem = await Problem.findByIdAndDelete(problemId);

        if (!problem) {
            return sendError(res, 404, "Problem not found");
        }

        return sendResponse(res, 200, "Problem deleted successfully");
    } catch (error) {
        return sendError(res, 500, "Internal server error");
    }
}

export async function getProblems(req, res) {
    try {
        const teacherId = req.user.id;

        // Pagination
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const skip = (page - 1) * limit;

        // Filters
        const {
            search,
            difficulty,
            tags,
            isActive
        } = req.query;

        // 🔍 Build query
        const query = {
            createdBy: teacherId
        };

        // Search by title (case-insensitive)
        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

        // Difficulty filter
        if (difficulty) {
            query.difficulty = difficulty;
        }

        // isActive filter
        if (typeof isActive !== "undefined") {
            query.isActive = isActive === "true";
        }

        // Tags filter (any match)
        if (tags) {
            const tagArray = tags.split(",").map(t => t.trim());
            query.tags = { $in: tagArray };
        }

        // Fetch data
        const [problems, total] = await Promise.all([
            Problem.find(query)
                .select()
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Problem.countDocuments(query)
        ]);

        return sendResponse(res, 200, "Problems fetched successfully", {
            problems,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error("Get Teacher Problems Error:", error);
        return sendError(res, 500, "Internal server error");
    }
}