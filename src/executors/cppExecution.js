import { generateCppInputCode } from "../helpers/inputParsingGenerator.js";
import { generateCppOutput } from "../helpers/outputPrintingGenerator.js";

export function generateCppExecutionCode(signature, inputObj) {
    let code = "";

    // 1. Input variables
    code += generateCppInputCode(signature.parameters, inputObj);

    // 2. Create Solution object
    code += `Solution sol;\n`;

    // 3. Function call
    const args = signature.parameters.map(p => p.name).join(", ");
    code += `auto __result = sol.${signature.functionName}(${args});\n`;

    // 4. Output handling
    code += generateCppOutput(signature.returnType, "__result") + "\n";

    return code;
}
