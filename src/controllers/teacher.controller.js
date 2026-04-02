import { createProblem, updateProblem, getProblems, deleteProblem } from '../services/problem.service.js';
import { sendError } from "../utils/error.js";
import { sendResponse } from "../utils/response.js";

export async function createProblemController(req, res) {
    try {
        const teacherId = req.user.id;

        const payload = req.body;
        payload.createdBy = teacherId;
        payload.tags = payload.tags.map(t => t.trim().toLowerCase());

        // Create problem
        const problem = await createProblem(payload);

        return sendResponse(res, 201, "Problem created successfully", { title: problem.title });

    } catch (error) {
        // console.error("Create Problem Error:", error);

        // Handle MongoDB duplicate key error (extra safety)
        if (error.code === 11000) {
            return sendError(res, 409, "Duplicate field value detected", {
                field: Object.keys(error.keyValue)
            });
        }

        return sendError(res, 500, "Internal server error");
    }
}

export async function updateProblemController(req, res) {
    try {
        const { problemId } = req.params;
        const payload = req.body;

        const isExist = await getProblems({
            _id: problemId,
            createdBy: req.user.id
        })

        if (!isExist) {
            return sendError(res, 404, "Problem not found");
        }

        const updatedProblem = await updateProblem(problemId, payload);

        if (!updatedProblem) {
            return sendError(res, 404, "Problem not found");
        }

        return sendResponse(res, 200, "Problem updated successfully");

    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Internal server error");
    }
}

export async function deleteProblemController(req, res) {
    try {
        const { problemId } = req.params;

        const isExist = await getProblems({
            _id: problemId,
            createdBy: req.user.id
        })

        if (!isExist) {
            return sendError(res, 404, "Problem not found");
        }

        await deleteProblem(problemId);

        return sendResponse(res, 200, "Problem deleted successfully");
    } catch (error) {
        return sendError(res, 500, "Internal server error");
    }
}

export async function getProblemsByteacherId(req, res) {
    try {
        const teacherId = req.user.id;

        // Pagination
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);

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
            const tagArray = tags.split(",").map(t => t.trim().toLowerCase());
            query.tags = { $in: tagArray };
        }

        // Fetch data
        const { problems, total } = await getProblems(query, page, limit);

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