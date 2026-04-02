import { submitCode } from "./judge0.service.js";
import { pollJudge0Result } from "../utils/pollJudge0.js";
import { VERDICTS } from "../constants/verdicts.js";
import { injectCode } from "../utils/codeInjector.js";
import { generateRunnerCode } from "../utils/generateRunnerCode.js";
import { outputComparator } from "../utils/outputComparator.js";
import { decodeBase64 } from "../utils/decodeBase64.js";

/**
 * Optimized batch execution version
 */
export async function runTestCases({
    template,
    studentCode,
    language_id,
    testcases,
    functionSignature,
    comparisonType = "ORDERED"
}) {
    try {
        // ✅ Map Judge0 language_id → our internal language
        let language;
        if (language_id === 54) language = "cpp";
        else if (language_id === 71) language = "python";
        else throw new Error("Unsupported language");

        // ✅ 1. Generate batch runner code
        const runnerCode = generateRunnerCode(
            language,
            testcases,
            functionSignature
        );

        // ✅ 2. Inject into template
        const finalCode = injectCode(template, studentCode, runnerCode);
        // console.log(finalCode)
        // console.log("Final Code:\n", finalCode);

        // ✅ 3. Submit ONCE (batch execution)
        const submission = await submitCode({
            source_code: finalCode,
            language_id
        });

        // ✅ 4. Poll result
        const result = await pollJudge0Result(submission.token);

        const stdout = decodeBase64(result.stdout);
        const stderr = decodeBase64(result.stderr);
        const compileOutput = decodeBase64(result.compile_output);

        // ✅ 5. Handle errors
        if (compileOutput) {
            return {
                error: compileOutput,
                verdict: VERDICTS.COMPILATION_ERROR
            };
        }

        if (stderr) {
            return {
                error: stderr,
                verdict: VERDICTS.RUNTIME_ERROR
            };
        }

        // ✅ 6. Prepare expected outputs
        const expectedOutputs = testcases.map(tc => {
            try {
                return tc.output;
            } catch {
                return tc.output;
            }
        });

        // Convert expected to string (important)
        // const normalizedExpected = expectedOutputs.map(o => String(o));
        // console.log("Expected", expectedOutputs)
        // console.log("stdout", stdout)

        // ✅ 7. Compare outputs
        const returnType = functionSignature.returnType === "void" ? functionSignature.parameters[0].type : functionSignature.returnType;
        const results = outputComparator(stdout, expectedOutputs, returnType, comparisonType);

        // ✅ 8. Find first failed testcase
        const failedIndex = results.findIndex(r => !r.passed);

        // ✅ 9. Execution stats
        const executionTime = Number(result.time) * 1000;
        const memory = Number(result.memory) / 1024;

        if (failedIndex !== -1) {
            console.log(failedIndex)
            return {
                verdict: VERDICTS.WRONG_ANSWER,
                testcase: failedIndex + 1,
                actualOutput: results[failedIndex].actual,
                expectedOutput: results[failedIndex].expected,
                executionTime,
                memory: Number(memory.toFixed(3))
            };
        }

        // ✅ 10. All passed
        return {
            verdict: VERDICTS.ACCEPTED,
            executionTime,
            memory: Number(memory.toFixed(3))
        };

    } catch (error) {
        return {
            verdict: VERDICTS.RUNTIME_ERROR,
            error: error.message
        };
    }
}