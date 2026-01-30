import { submitCode } from "./judge0.service.js";
import { pollJudge0Result } from "../utils/pollJudge0.js";
import { isOutputCorrect } from "../utils/compareOutput.js";
import { VERDICTS } from "../constants/verdicts.js";
import { injectCode } from "../utils/codeInjector.js";
import { generateCppExecutionCode } from '../executors/cppExecution.js'
import { generatePythonExecutionCode } from '../executors/pythonExecution.js'
import { decodeBase64 } from '../utils/decodeBase64.js'

/**
 * Runs test cases for LeetCode-style problems
 * @param {string} template - Language template from DB
 * @param {string} studentCode - Student's code
 * @param {number} language_id - Judge0 language id
 * @param {Array} testCases - Problem test cases (JSON)
 * @param {object} functionSignature - { functionName, returnType, params }
 * @returns {object} verdict info
 */

export async function runTestCases({
    template,
    studentCode,
    language_id,
    testCases,
    functionSignature
}) {

    let final_time = 0;
    let final_memory = 0;

    for (let i = 0; i < testCases.length; i++) {
        const inputObj = JSON.parse(testCases[i].input);
        const expectedOutput = JSON.parse(testCases[i].output);

        // 1️⃣ Generate auto code based on language
        let autoCode = "";
        if (language_id === 54) { // C++
            autoCode = generateCppExecutionCode(functionSignature, inputObj);
        } else if (language_id === 71) { // Python
            autoCode = generatePythonExecutionCode(functionSignature, inputObj);
        } else {
            throw new Error("Unsupported language");
        }

        // 2️⃣ Inject student code + auto code into template
        const finalCode = injectCode(template, studentCode, autoCode);
        // console.log("Final Code:\n", finalCode);
        // console.log("***************************");

        // 3️⃣ Submit to Judge0
        const submission = await submitCode({
            source_code: finalCode,
            language_id
        });

        // 4️⃣ Poll Judge0 result
        const result = await pollJudge0Result(submission.token);
        // console.log("Judge0 Result: ", result);

        const stdout = decodeBase64(result.stdout);
        const stderr = decodeBase64(result.stderr);
        const compileOutput = decodeBase64(result.compile_output);
        // console.log(stderr);

        // 5️⃣ Handle compilation/runtime errors
        if (compileOutput) {
            return {
                verdict: VERDICTS.COMPILATION_ERROR,
                testCase: i + 1
            };
        }
        if (stderr) {
            return {
                verdict: VERDICTS.RUNTIME_ERROR,
                testCase: i + 1
            };
        }

        // get worst case time and space for fair judgement
        final_time = Math.max(final_time, Number(result.time) * 1000);
        final_memory = ((Math.max(final_time, Number(result.memory))) / 1024).toFixed(3);

        // 6️⃣ Compare output
        const { isCorrect, actual, expected } = isOutputCorrect(stdout, expectedOutput);
        if (!isCorrect) {
            return {
                verdict: VERDICTS.WRONG_ANSWER,
                actualOutput: actual,
                expectedOutput: expected,
                testCase: i + 1,
                executionTime: final_time,
                memory: parseFloat(final_memory)
            };
        }
    }

    // 7️⃣ All test cases passed
    return {
        verdict: VERDICTS.ACCEPTED,
        executionTime: final_time,
        memory: parseFloat(final_memory)
    };
}
