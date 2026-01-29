import { generateCppBoilerplate, generatePythonBoilerplate } from '../helpers/generateBoilerPlate.js';

export function serveBoilerPlate(functionSignature, language_id) {
    let boilerplate = "";

    if (language_id === 54) {
        boilerplate = generateCppBoilerplate(functionSignature);
    } else if (language_id === 71) {
        boilerplate = generatePythonBoilerplate(functionSignature);
    }

    return boilerplate;
}