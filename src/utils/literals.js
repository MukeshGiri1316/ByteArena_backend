// cpp literals
export function toCppLiteral(value) {
    // Array (recursive)
    if (Array.isArray(value)) {
        return `{${value.map(toCppLiteral).join(", ")}}`;
    }

    // Single character → char
    if (typeof value === "string" && value.length === 1) {
        return `'${value}'`;
    }

    // String
    if (typeof value === "string") {
        return `"${value}"`;
    }

    // Boolean
    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }

    // Number
    return value;
}

// python Literals
export function toPythonLiteral(value) {
    if (Array.isArray(value)) {
        return `[${value.map(toPythonLiteral).join(", ")}]`;
    }
    if (typeof value === "string") {
        return `"${value}"`;
    }
    if (typeof value === "boolean") {
        return value ? "True" : "False";
    }
    return value;
}
