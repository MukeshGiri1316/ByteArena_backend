import { literalGenerator } from "./literalGenerator.js";

/**
 * Build function call string
 * @param {string} language - "cpp" | "python"
 * @param {object} functionSignature
 * @param {Array} parsedArgs
 * @returns {string}
 */
export function functionCallBuilder(language, functionSignature, parsedArgs) {
    if (!functionSignature || !functionSignature.functionName) {
        throw new Error("Invalid function signature");
    }

    const { functionName, parameters } = functionSignature;

    if (!Array.isArray(parsedArgs)) {
        throw new Error("Invalid parsed arguments");
    }

    // ✅ Maintain correct order using functionSignature
    const argsInOrder = parameters.map((param) => {
        const found = parsedArgs.find((arg) => arg.name === param.name);

        if (!found) {
            throw new Error(`Missing argument: ${param.name}`);
        }

        return literalGenerator(language, found.type, found.value);
    });

    const argsString = argsInOrder.join(",");

    // Same format for both languages
    return `sol.${functionName}(${argsString})`;
}