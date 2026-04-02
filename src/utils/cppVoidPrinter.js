
function generateCppValuePrint(type, expr) {
    // 🔹 BOOLEAN
    if (type === "boolean") {
        return `(${expr} ? "true" : "false")`;
    }

    // 🔹 STRING
    if (type === "string") {
        return `"\"" + ${expr} + "\""`;
    }

    // 🔹 NUMBER
    if (type === "number") {
        return expr;
    }

    throw new Error("Unsupported primitive type: " + type);
}

/**
 * Recursive printer generator (SAFE VERSION)
 */
function generateCppLoopPrint(type, varName, depth = 0) {
    // 🔹 BASE CASE (primitive)
    if (!type.startsWith("array<")) {
        return `cout << ${generateCppValuePrint(type, varName)};`;
    }

    const innerType = type.slice(6, -1);
    const i = `i${depth}`;
    const nextVar = `${varName}[${i}]`;

    return `
cout << "[";
for (int ${i} = 0; ${i} < ${varName}.size(); ${i}++) {
    ${generateCppLoopPrint(innerType, nextVar, depth + 1)}
    if (${i} != ${varName}.size() - 1) cout << ",";
}
cout << "]";
`;
}

/**
 * Main VOID printer
 */
export function generateCppVoidPrint(type, varName) {
    // 🔹 Primitive (edge case)
    if (!type.startsWith("array<")) {
        return `cout << "__RESULT__:" << ${generateCppValuePrint(type, varName)} << endl;`;
    }

    // 🔹 Array (any depth)
    return `
cout << "__RESULT__:";
${generateCppLoopPrint(type, varName)}
cout << endl;
`;
}