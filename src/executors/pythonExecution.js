import { generatePythonInputCode } from "../helpers/inputParsingGenerator.js";
import { generatePythonOutput } from "../helpers/outputPrintingGenerator.js";

export function generatePythonExecutionCode(signature, inputObj) {
    let code = "";

    // Ensure top-level execution code (NO indentation)
    code += "\n";

    // 1. Generate variables
    code += generatePythonInputCode(signature.parameters, inputObj);

    // 2. Create Solution instance
    code += "sol = Solution()\n";

    // 3. Call function
    const args = signature.parameters.map(p => p.name).join(", ");
    code += `__result = sol.${signature.functionName}(${args})\n`;

    // 4. Output
    code += generatePythonOutput(signature.returnType, "__result") + "\n";

    return code;
}