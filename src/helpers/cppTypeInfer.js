export function inferCppType(value) {
    if (Array.isArray(value)) {
        if (value.length === 0) return "vector<int>"; // safe default

        const innerType = inferCppType(value[0]);
        return `vector<${innerType}>`;
    }

    if (typeof value === "number") {
        return Number.isInteger(value) ? "int" : "double";
    }

    if (typeof value === "boolean") {
        return "bool";
    }

    if (typeof value === "string") {
        return value.length === 1 ? "char" : "string";
    }

    throw new Error("Unsupported input type");
}
