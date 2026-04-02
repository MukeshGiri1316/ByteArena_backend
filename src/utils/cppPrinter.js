export function generateCppPrintExpr(type, varName, depth = 0) {
    // boolean
    if (type === "boolean") {
        return `(${varName} ? "true" : "false")`;
    }

    // number / string
    if (type === "number" || type === "string") {
        return varName;
    }

    // array
    if (type.startsWith("array<")) {
        const innerType = type.slice(6, -1);

        const idx = `i${depth}`;   // ✅ unique index
        const nextVar = `${varName}[${idx}]`;

        return `([&]() {
            string s = "[";
            for (int ${idx} = 0; ${idx} < ${varName}.size(); ${idx}++) {
                s += ${generateCppPrintExpr(innerType, nextVar, depth + 1)};
                if (${idx} != ${varName}.size() - 1) s += ",";
            }
            s += "]";
            return s;
        })()`;
    }

    throw new Error(`Unsupported type for printing: ${type}`);
}

export function generateCppResultPrint(type, expr) {
    return `cout << "__RESULT__:" << ${generateCppPrintExpr(type, expr)} << endl;`;
}