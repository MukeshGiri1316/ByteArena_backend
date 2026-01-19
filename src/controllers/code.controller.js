import { runTestCases } from "../services/testCaseRunner.service.js";
import { pollJudge0Result } from '../utils/pollJudge0.js';
import { getSubmissions } from "../services/submissionQuery.service.js";
import { getProblemById } from '../services/problem.service.js'
import { saveSubmission } from '../services/submission.service.js'
import { LanguageTemplate } from "../models/languageTemplate.model.js";

const submitCodeController = async (req, res) => {
    const userId = req.user.id;
    const { sourceCode, languageId, problemId } = req.body;

    if (!problemId) {
        return res.status(400).json({ error: "Problem ID is required" });
    }

    const problem = getProblemById(problemId);

    if (!problem) {
        return res.status(404).json({ error: "Problem not found" });
    }

    const template = await LanguageTemplate.findOne({ languageId });
    if (!template) {
        return res.status(400).json({ message: "Language not supported" });
    }

    const finalCode = injectCode(template.template, sourceCode);

    const testCases = [
        ...problem.publicTestCases,
        ...problem.hiddenTestCases
    ];

    try {
        const result = await runTestCases({
            source_code: finalCode,
            language_id: languageId,
            testCases: testCases
        });

        await saveSubmission({
            userId: userId,
            problemId: problem.id,
            languageId: languageId,
            verdict: result.verdict,
            failedTestCase: result.testCase || null,
            executionTime: result.executionTime,
            memory: result.memory
        });

        return res.json({
            problemId: problem.id,
            verdict: result.verdict,
            failedTestCase: result.testCase || null
        });
    } catch (error) {
        console.error("Error in submitCodeController: ", error);
        return res.status(500).json({
            error: "Execution failed"
        });
    }
}

const getResultController = async (req, res) => {
    const { token } = req.params;

    if (!token || token.length > 100) {
        return res.status(400).json({ error: "Invalid token" });
    }

    try {
        const result = await pollJudge0Result(token);

        return res.json({
            status: result.status,
            stdout: result.stdout,
            stderr: result.stderr,
            compile_output: result.compile_output,
            time: result.time,
            memory: result.memory
        });
    } catch (error) {
        return res.status(408).json({
            error: "Execution took too long"
        });
    }
}

const getSubmissionsController = async (req, res) => {
    const { problemId, limit } = req.query;

    // Limit protection
    const safeLimit = Math.min(Number(limit) || 10, 50);

    try {
        const submissions = await getSubmissions({
            problemId,
            limit: safeLimit
        });

        return res.json(submissions);
    } catch (error) {
        return res.status(500).json({
            error: "Failed to fetch submissions"
        });
    }
}

export {
    submitCodeController,
    getResultController,
    getSubmissionsController
}