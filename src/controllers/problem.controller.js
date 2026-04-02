import { getProblemById, getProblems } from '../services/problem.service.js';
import { sendResponse } from '../utils/response.js';
import { sendError } from '../utils/error.js';
import { categories } from '../constants/categories.js';
import { serveBoilerPlate } from '../services/boilerplate.service.js';
import { ALLOWED_LANGUAGES } from '../utils/allowedLanguages.js';

export async function getProblemsController(req, res) {
    try {
        const {
            page = 1,
            limit = 10,
            difficulty,
            tags,
            search,
            sortBy
        } = req.query;

        const query = { isActive: true };

        if (difficulty && difficulty.toUpperCase() !== "ALL") query.difficulty = difficulty.toUpperCase();

        if (tags) {
            const tagsArray = tags.split(",").map(tag => tag.trim().toLowerCase());
            query.tags = { $all: tagsArray };
        };

        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

        if (isNaN(page) || isNaN(limit)) {
            return sendError(res, 400, "Invalid page or limit value");
        }

        const sortOrder = sortBy?.toUpperCase() === "DESC" ? -1 : 1;

        const selectFields = "title slug difficulty tags";
        const { problems, total } = await getProblems(query, page, limit, selectFields, sortOrder);

        return sendResponse(res, 200, "Problems fetched successfully", {
            problems,
            pagination: {
                limit: Number(limit),
                page: Number(page),
                totalPages: Math.ceil(Number(total) / Number(limit)) || 1,
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
        problem.hiddenTestCases = [];

        const boilerplate = serveBoilerPlate(problem.functionSignature, defaultLanguage);

        return sendResponse(res, 200, "Problem fetched successfully", { problem, boilerplate, languages: ALLOWED_LANGUAGES });
    } catch (error) {
        console.log(error);
        return sendError(res, 500, "Internal server error");
    }
}