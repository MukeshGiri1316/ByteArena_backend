import { indentPythonCode } from '../helpers/indentPythonCode.js';

export function injectCode(template, studentCode, autoCode) {
    if (!template.includes("{{STUDENT_CODE}}")) {
        throw new Error("Invalid template: missing {{STUDENT_CODE}}");
    }

    if (!template.includes("{{AUTO_CODE}}")) {
        throw new Error("Invalid template: missing {{AUTO_CODE}}");
    }

    return template
        .replace("{{STUDENT_CODE}}", indentPythonCode(studentCode))
        .replace("{{AUTO_CODE}}", autoCode);
}
