import { Problem } from "../models/problem.model.js";

export async function listProblems(req, res) {
    const {
        page = 1,
        limit = 20,
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

    const problems = await Problem.find(query)
        .select(
            "title slug difficulty tags createdAt"
        )
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean();

    const total = await Problem.countDocuments(query);

    res.json({
        data: problems,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total
        }
    });
}

export async function getProblemBySlug(req, res) {
    const { slug } = req.params;

    const problem = await Problem.findOne({
        slug,
        isActive: true
    })
        .select(
            `
            title
            slug
            descriptionMarkdown
            difficulty
            tags
            constraints
            ioFormat
            publicTestCases
            timeLimit
            memoryLimit
            `
        )
        .lean();

    if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
    }

    res.json(problem);
}