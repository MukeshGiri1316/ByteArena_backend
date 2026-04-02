import { normalizeType } from "./normalizeType.js";

/**
 * Parse testcase input into structured IR
 * @param {string} input - JSON string
 * @param {object} functionSignature
 * @returns {Array<{name: string, type: string, value: any}>}
 */
export function parseTestCaseInput(input, functionSignature) {
    if (!input || typeof input !== "string") {
        throw new Error("Invalid testcase input");
    }

    if (!functionSignature || !functionSignature.parameters) {
        throw new Error("Invalid function signature");
    }

    let parsedInput;

    // ✅ Safe JSON parsing
    try {
        parsedInput = JSON.parse(input);
    } catch (err) {
        throw new Error(`Invalid JSON input: ${input}`);
    }

    const result = [];

    for (const param of functionSignature.parameters) {
        const { name, type } = param;

        // ❌ Missing parameter
        if (!(name in parsedInput)) {
            throw new Error(`Missing parameter "${name}" in testcase input`);
        }

        const rawValue = parsedInput[name];

        result.push({
            name,
            type: normalizeType(type),
            value: rawValue,
        });
    }

    return result;
}