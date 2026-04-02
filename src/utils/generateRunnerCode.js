import { parseTestCaseInput } from "./parseTestCaseInput.js";
import { literalGenerator } from "./literalGenerator.js";
import { normalizeType } from "./normalizeType.js";
import { generateCppResultPrint } from "./cppPrinter.js";
import { generatePythonResultPrint } from "./pythonPrinter.js";
import { generateCppVoidPrint } from "./cppVoidPrinter.js";

/**
 * Map normalized type → C++ type
 */
function getCppType(normalizedType) {
    if (normalizedType === "number") return "int";
    if (normalizedType === "string") return "string";
    if (normalizedType === "boolean") return "bool";

    if (normalizedType.startsWith("array<")) {
        const inner = getCppType(normalizedType.slice(6, -1));
        return `vector<${inner}>`;
    }

    throw new Error(`Unsupported C++ type: ${normalizedType}`);
}

/**
 * Convert value → printable string (Python)
 */
function generatePythonPrint(varName, type) {
    return `print(${varName})`;
}

/**
 * Generate runner code for all testcases
 */
export function generateRunnerCode(language, testcases, functionSignature) {
    if (!Array.isArray(testcases)) {
        throw new Error("Invalid testcases");
    }

    const returnType = normalizeType(functionSignature.returnType);
    let code = "";

    // ✅ Create solution instance
    if (language === "cpp") {
        code += "Solution sol;\n";
    } else if (language === "python") {
        code += "sol = Solution()\n";
    } else {
        throw new Error(`Unsupported language: ${language}`);
    }

    // ✅ Process each testcase
    testcases.forEach((testcase, index) => {
        const parsedArgs = parseTestCaseInput(
            testcase.input,
            functionSignature
        );

        const varNames = [];

        // 1️⃣ Declare variables
        parsedArgs.forEach((arg) => {
            const varName = `${arg.name}_${index}`;
            varNames.push(varName);

            const literal = literalGenerator(language, arg.type, arg.value);

            if (language === "cpp") {
                const cppType = getCppType(arg.type);
                code += `${cppType} ${varName} = ${literal};\n`;
            } else if (language === "python") {
                code += `${varName} = ${literal}\n`;
            }
        });

        const argsString = varNames.join(",");

        // 2️⃣ Handle function call + output
        if (returnType === "void") {
            // 🔥 VOID FUNCTION HANDLING
            if (language === "cpp") {
                if (language === "cpp") {
                    code += `sol.${functionSignature.functionName}(${argsString});\n`;
                    code += generateCppVoidPrint(parsedArgs[0].type, varNames[0]);
                }
            } else {
                code += `sol.${functionSignature.functionName}(${argsString})\n`;
                code += `print("__RESULT__:", end="")\n`;
                code += `print(${varNames[0]})\n`;
            }
        } else {
            // 🔥 NON-VOID FUNCTION
            if (language === "cpp") {
                const callExpr = `sol.${functionSignature.functionName}(${argsString})`;
                code += generateCppResultPrint(returnType, callExpr) + "\n";
            } else {
                const callExpr = `sol.${functionSignature.functionName}(${argsString})`;
                code += generatePythonResultPrint(returnType, callExpr) + "\n";
            }
        }

        code += "\n"; // spacing
    });

    return code;
}