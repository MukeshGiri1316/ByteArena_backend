import { Problem } from "../models/problem.model.js";

export async function createProblem(req, res) {
    try {
        // Ensure authenticated user exists
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Unauthorized access"
            });
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
            memoryLimit
        } = req.body;

        // Basic validation
        if (!title || !slug || !descriptionMarkdown || !difficulty) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        // Check for existing problem with same slug
        const existing = await Problem.findOne({ slug });
        if (existing) {
            return res.status(409).json({
                message: "Problem with this slug already exists"
            });
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
            createdBy: teacherId
        });

        return res.status(201).json({
            message: "Problem created successfully",
            problemId: problem._id
        });

    } catch (error) {
        console.error("Create Problem Error:", error);

        // Handle MongoDB duplicate key error (extra safety)
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Duplicate field value detected",
                field: Object.keys(error.keyValue)
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}
