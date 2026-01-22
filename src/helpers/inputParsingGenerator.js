import { CPP_TYPE_MAP } from "../typeMappings/cpp.js";
import { PYTHON_TYPE_MAP } from "../typeMappings/python.js";
import { toCppLiteral, toPythonLiteral } from "../utils/literals.js";
import { inferCppType } from '../helpers/cppTypeInfer.js'

// cppInputParser.js
export function generateCppInputCode(parameters, inputObj) {
    let code = "";

    for (const param of parameters) {
        const { name } = param;

        if (!(name in inputObj)) {
            throw new Error(`Missing input value for parameter: ${name}`);
        }

        const value = inputObj[name];
        const literal = toCppLiteral(value);
        const cppType = inferCppType(value);

        code += `${cppType} ${name} = ${literal};\n`;
    }

    return code;
}

// pythonInputParser.js
export function generatePythonInputCode(parameters, inputObj) {
    let code = "";

    for (const param of parameters) {
        const { name } = param;

        if (!(name in inputObj)) {
            throw new Error(`Missing input value for parameter: ${name}`);
        }

        const literal = toPythonLiteral(inputObj[name]);
        code += `${name} = ${literal}\n`;
    }

    return code;
}
