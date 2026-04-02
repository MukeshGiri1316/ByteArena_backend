import { Problem } from "../models/problem.model.js";

export async function getProblems(query, page = 1, limit = 10, selectFields = "", sortOrder = 1) {
    const problems = await Problem.find(query)
        .select(
            selectFields
        )
        .sort({ title: sortOrder })
        .collation({ locale: "en", strength: 2 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean();

    const total = await Problem.countDocuments(query);

    return { problems, total };
}

export async function getProblemById(problemId, session = null) {
    const problem = await Problem.findById(problemId, null, { session }).select("-solutionType -ioFormat -createdBy -createdAt -updatedAt -__v");

    return { problem };
}

export async function createProblem(payload, session = null) {
    const requiredFields = [
        "title",
        "slug",
        "descriptionMarkdown",
        "difficulty",
        "createdBy",
    ];

    const allowedDifficulties = ["EASY", "MEDIUM", "HARD"];
    const allowedSolutionTypes = ["STDIN", "FUNCTION"];

    try {
        /* -------------------- Required fields check -------------------- */
        const missing = requiredFields.filter(
            field => payload[field] === undefined
        );

        if (missing.length > 0) {
            throw new Error(
                `Missing required fields for problem creation: ${missing.join(", ")}`
            );
        }

        /* -------------------- Enum validations -------------------- */
        if (!allowedDifficulties.includes(payload.difficulty)) {
            throw new Error("Invalid difficulty value");
        }

        if (
            payload.solutionType &&
            !allowedSolutionTypes.includes(payload.solutionType)
        ) {
            throw new Error("Invalid solutionType value");
        }

        /* -------------------- Slug uniqueness -------------------- */
        const existing = await Problem.findOne(
            { slug: payload.slug },
            { _id: 1 },
            { session }
        );

        if (existing) {
            throw new Error("Problem with this slug already exists");
        }

        /* -------------------- Solution type consistency -------------------- */
        const solutionType = payload.solutionType || "FUNCTION";

        if (solutionType === "FUNCTION") {
            if (!payload.functionSignature) {
                throw new Error("functionSignature is required for FUNCTION problems");
            }

            const { functionName, returnType, parameters } = payload.functionSignature;

            if (!functionName || !returnType) {
                throw new Error("Invalid functionSignature definition");
            }

            if (parameters && !Array.isArray(parameters)) {
                throw new Error("functionSignature.parameters must be an array");
            }
        }

        if (solutionType === "STDIN" && payload.functionSignature) {
            throw new Error("functionSignature must not be provided for STDIN problems");
        }

        /* -------------------- Test case validation -------------------- */
        const validateTestCases = (cases = []) => {
            if (!Array.isArray(cases)) {
                throw new Error("Test cases must be an array");
            }

            for (const tc of cases) {
                if (tc.input === undefined || tc.input === null || tc.output === null || tc.output === undefined) {
                    throw new Error("Each test case must have input and output");
                }
            }
        };

        validateTestCases(payload.publicTestCases);
        validateTestCases(payload.hiddenTestCases);

        /* -------------------- Create document -------------------- */
        const problem = new Problem({
            title: payload.title,
            slug: payload.slug,
            descriptionMarkdown: payload.descriptionMarkdown,
            difficulty: payload.difficulty,
            tags: payload.tags || [],
            constraints: payload.constraints,
            solutionType,
            functionSignature: payload.functionSignature,
            publicTestCases: payload.publicTestCases || [],
            hiddenTestCases: payload.hiddenTestCases || [],
            ioFormat: payload.ioFormat,
            timeLimit: payload.timeLimit,
            memoryLimit: payload.memoryLimit,
            createdBy: payload.createdBy,
            isActive: payload.isActive ?? true,
        });

        await problem.save({ session });

        return problem;
    } catch (error) {
        console.error("createProblem error:", error);
        throw error;
    }
}

export async function updateProblem(problemId, payload = {}, session = null) {
    const settableFields = [
        "title",
        "descriptionMarkdown",
        "difficulty",
        "tags",
        "constraints",
        "solutionType",
        "functionSignature",
        "ioFormat",
        "timeLimit",
        "memoryLimit",
        "isActive",
    ];

    const testCaseFields = [
        "publicTestCases",
        "hiddenTestCases",
    ];

    const allowedDifficulties = ["EASY", "MEDIUM", "HARD"];
    const allowedSolutionTypes = ["STDIN", "FUNCTION"];

    try {
        if (!payload || Object.keys(payload).length === 0) {
            throw new Error("No fields provided for problem update");
        }

        if (payload.tags) {
            payload.tags = payload.tags.map(t => t.trim().toLowerCase());
        }

        const $set = {};
        let testcaseChanged = false;

        /* -------------------- Field validation -------------------- */
        for (const [key, value] of Object.entries(payload)) {
            if (settableFields.includes(key)) {
                if (key === "difficulty" && !allowedDifficulties.includes(value)) {
                    throw new Error("Invalid difficulty value");
                }

                if (key === "solutionType" && !allowedSolutionTypes.includes(value)) {
                    throw new Error("Invalid solutionType value");
                }

                $set[key] = value;
            } else if (testCaseFields.includes(key)) {
                if (!Array.isArray(value)) {
                    throw new Error(`${key} must be an array`);
                }
                $set[key] = value;
                testcaseChanged = true;
            } else {
                throw new Error(`Invalid field in problem update: ${key}`);
            }
        }

        /* -------------------- Solution consistency -------------------- */
        if ($set.solutionType === "FUNCTION") {
            if (!$set.functionSignature) {
                throw new Error("functionSignature required for FUNCTION problems");
            }
        }

        if ($set.solutionType === "STDIN") {
            if ($set.functionSignature) {
                throw new Error("functionSignature must not exist for STDIN problems");
            }
        }

        /* -------------------- Build update query -------------------- */
        const updateQuery = { $set };

        if (testcaseChanged) {
            updateQuery.$inc = { testcaseVersion: 1 };
        }

        /* -------------------- Execute update -------------------- */
        return await Problem.findByIdAndUpdate(
            problemId,
            updateQuery,
            {
                new: true,
                runValidators: true,
                session,
            }
        );
    } catch (error) {
        console.error("updateProblem error:", error);
        throw error;
    }
}

export async function deleteProblem(problemId, session = null) {
    try {
        return await Problem.findByIdAndDelete(problemId);
    } catch (error) {
        console.error("deleteProblem error:", error);
        throw error;
    }
}
