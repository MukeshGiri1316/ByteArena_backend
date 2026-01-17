import { submitCode } from "./judge0.service.js";
import { pollJudge0Result } from "../utils/pollJudge0.js";
import { isOutputCorrect } from "../utils/compareOutput.js";
import { VERDICTS } from "../utils/verdicts.js";

export async function runTestCases({
    source_code,
    language_id,
    testCases
}) {
    for (let i = 0; i < testCases.length; i++) {
        const { input, expectedOutput } = testCases[i];

        // 1. Submit code
        const submission = await submitCode({
            source_code,
            language_id,
            stdin: input
        });

        // 2. Poll result
        const result = await pollJudge0Result(submission.token);

        // 3. Handle errors
        if (result.compile_output) {
            return {
                verdict: VERDICTS.COMPILATION_ERROR,
                testCase: i + 1
            };
        }

        if (result.stderr) {
            return {
                verdict: VERDICTS.RUNTIME_ERROR,
                testCase: i + 1
            };
        }

        // 4. Compare output
        const isCorrect = isOutputCorrect(
            result.stdout,
            expectedOutput
        );

        if (!isCorrect) {
            return {
                verdict: VERDICTS.WRONG_ANSWER,
                testCase: i + 1,
                executionTime: result.time,
                memory: result.memory
            };
        }
    }

    // 5. All passed
    return {
        verdict: VERDICTS.ACCEPTED,
        executionTime: result.time,
        memory: result.memory
    };
}
