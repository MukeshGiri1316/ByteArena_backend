import { submitCode } from "../services/judge0.service.js";
import {pollJudge0Result} from '../utils/pollJudge0.js';

const submitCodeController = async (req, res) => {
    const { source_code, language_id, stdin } = req.body;

    try {
        const result = await submitCode({
            source_code,
            language_id,
            stdin
        });

        return res.status(201).json({
            token: result.token
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Code submission failed"
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

export {
    submitCodeController,
    getResultController
}