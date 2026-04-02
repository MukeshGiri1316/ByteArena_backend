
/**
 * Generate language-specific literal from value
 * @param {string} language - "cpp" | "python"
 * @param {string} type - normalized type (e.g., array<number>)
 * @param {any} value
 * @returns {string}
 */
export function literalGenerator(language, type, value) {
    if (!language || !type) {
        throw new Error("Invalid arguments to literalGenerator");
    }

    // Handle array types
    if (type.startsWith("array<")) {
        const innerType = extractInnerType(type);

        if (!Array.isArray(value)) {
            throw new Error(`Expected array value for type ${type}`);
        }

        const elements = value.map((item) =>
            literalGenerator(language, innerType, item)
        );

        if (language === "cpp") {
            return `{${elements.join(",")}}`;
        }

        if (language === "python") {
            return `[${elements.join(",")}]`;
        }

        throw new Error(`Unsupported language: ${language}`);
    }

    // Handle primitive types
    switch (type) {
        case "number":
            return String(value);

        case "string":
            return formatString(language, value);

        case "boolean":
            return formatBoolean(language, value);

        case "void":
            return "";

        default:
            throw new Error(`Unsupported type: ${type}`);
    }
}

/**
 * Extract inner type from array<...>
 * e.g. array<number> → number
 */
function extractInnerType(type) {
    return type.slice(6, -1); // removes "array<" and ">"
}

/**
 * Format string literal
 */
function formatString(language, value) {
    const escaped = String(value).replace(/"/g, '\\"');

    if (language === "cpp" || language === "python") {
        return `"${escaped}"`;
    }

    throw new Error(`Unsupported language: ${language}`);
}

/**
 * Format boolean literal
 */
function formatBoolean(language, value) {
    if (language === "cpp") {
        return value ? "true" : "false";
    }

    if (language === "python") {
        return value ? "True" : "False";
    }

    throw new Error(`Unsupported language: ${language}`);
}