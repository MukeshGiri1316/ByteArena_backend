import { getProblemById, getProblems } from '../services/problem.service.js';
import { sendResponse } from '../utils/response.js';
import { sendError } from '../utils/error.js';
import { categories } from '../constants/categories.js';
import { serveBoilerPlate } from '../services/boilerplate.service.js';

export async function getProblemsController(req, res) {
    try {
        const {
            page = 1,
            limit = 10,
            difficulty,
            tag,
            search
        } = req.query;

        const query = { isActive: true };

        if (difficulty) query.difficulty = difficulty;
        if (tag) query.tags = tag;

        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

        const selectFields = "title slug difficulty tags";
        const { problems, total } = await getProblems(query, page, limit, selectFields);

        return sendResponse(res, 200, "Problems fetched successfully", {
            problems,
            pagination: {
                limit: Number(limit),
                page: Number(page),
                totalPages: Math.ceil(Number(total) / Number(limit)),
                totalItems: total
            }
        });
    } catch (error) {
        console.log(error);
        return sendError(res, 500, "Internal server error");
    }
}

export async function getCategoriesController(req, res) {
    try {
        return sendResponse(res, 200, "Categories fetched successfully", { categories });
    } catch (error) {
        return sendError(res, 500, "Internal server error");
    }
}

export async function getProblemByIdController(req, res) {
    try {
        const { problemId } = req.params;
        const defaultLanguage = 54; // get prefered language afterwards

        if (!problemId) {
            return sendError(res, 400, "Problem Id is missing");
        }

        
        const { problem } = await getProblemById(problemId);

        const boilerplate = serveBoilerPlate(problem.functionSignature, defaultLanguage);

        return sendResponse(res, 200, "Problem fetched successfully", { problem, boilerplate });
    } catch (error) {
        console.log(error);
        return sendError(res, 500, "Internal server error");
    }
}