const BASE_TYPE_MAP = {
    int: "number",
    long: "number",
    float: "number",
    double: "number",

    string: "string",
    char: "string",

    bool: "boolean",
    boolean: "boolean",

    void: "void",
};

/**
 * Normalize language-specific type to generic type
 * @param {string} type
 * @returns {string}
 *
 * Examples:
 *  int -> number
 *  int[] -> array<number>
 *  int[][] -> array<array<number>>
 */
export function normalizeType(type) {
    if (!type || typeof type !== "string") {
        throw new Error("Invalid type provided");
    }

    let cleanType = type.trim().toLowerCase();

    // Count array depth
    let arrayDepth = 0;
    while (cleanType.endsWith("[]")) {
        arrayDepth++;
        cleanType = cleanType.slice(0, -2);
    }

    // Map base type
    const baseType = BASE_TYPE_MAP[cleanType];

    if (!baseType) {
        throw new Error(`Unsupported type: ${type}`);
    }

    // Build nested array type
    let normalized = baseType;
    for (let i = 0; i < arrayDepth; i++) {
        normalized = `array<${normalized}>`;
    }

    return normalized;
}