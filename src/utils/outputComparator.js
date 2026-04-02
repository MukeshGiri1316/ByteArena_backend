import { normalizeType } from "./normalizeType.js";

const EPSILON = 1e-4;

/**
 * Extract results from raw output
 */
function extractResults(rawOutput) {
    return rawOutput
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.startsWith("__RESULT__:"))
        .map(line => line.replace("__RESULT__:", "").trim());
}

function fixLooseArraySyntax(value) {
    // already valid JSON
    if (value.includes('"')) return value;

    // 🔥 wrap bare words with quotes
    return value.replace(/([a-zA-Z_][a-zA-Z0-9_]*)/g, '"$1"');
}

/**
 * Get the base type of a nested type
 */
function getBaseType(type) {
    while (type.startsWith("array<")) {
        type = type.slice(6, -1);
    }
    return type;
}

/**
 * Try parsing JSON safely
 */
function tryParseJSON(value) {
    try {
        // 🔥 Fix single quotes → double quotes
        const fixed = fixLooseArraySyntax(
            value.replace(/'/g, '"')
        );

        // console.log("fixed", fixed, typeof fixed)
        return JSON.parse(fixed);
    } catch {
        return null;
    }
}

/**
 * Normalize strings inside arrays recursively
 */
function normalizeStrings(val) {
    if (Array.isArray(val)) {
        return val.map(normalizeStrings);
    }

    if (typeof val === "string") {
        // 🔥 Remove ALL surrounding quotes repeatedly
        let cleaned = val.trim();

        while (
            (cleaned.startsWith("'") && cleaned.endsWith("'")) ||
            (cleaned.startsWith('"') && cleaned.endsWith('"'))
        ) {
            cleaned = cleaned.slice(1, -1).trim();
        }

        return cleaned;
    }

    return val;
}

/**
 * Deep sort array (for UNORDERED comparison)
 */
function deepSort(arr) {
    if (!Array.isArray(arr)) return arr;

    const sorted = arr.map(deepSort);

    return sorted.sort((a, b) => {
        return JSON.stringify(a).localeCompare(JSON.stringify(b));
    });
}

/**
 * 🔥 TYPE-AWARE PARSER
 */
function parseByType(value, type) {
    if (value === undefined || value === null) return value;

    // already parsed (from JSON)
    if (typeof value !== "string") {
        if (Array.isArray(value) && type.startsWith("array<")) {
            const inner = type.slice(6, -1);
            return value.map(v => parseByType(v, inner));
        }
        return value;
    }

    value = value.trim();

    // 🔹 BOOLEAN
    if (type === "boolean") {
        if (["true", "True", "1"].includes(value)) return true;
        if (["false", "False", "0"].includes(value)) return false;
        return false;
    }

    // 🔹 NUMBER (int + float)
    if (type === "number") {
        return Number(value);
    }

    // 🔹 STRING
    if (type === "string") {
        return value;
    }

    // 🔹 ARRAY
    if (type.startsWith("array<")) {
        const innerType = type.slice(6, -1);

        const jsonParsed = tryParseJSON(value);

        if (jsonParsed !== null) {
            return jsonParsed.map(v => parseByType(v, innerType));
        }

        // 🔥 LAST fallback
        throw new Error("Invalid array format: " + value);
    }

    return value;
}

/**
 * Flatten a nested array
 */
function flattenArray(arr) {
    if (!Array.isArray(arr)) return [arr];

    return arr.reduce((acc, val) => {
        if (Array.isArray(val)) {
            acc.push(...flattenArray(val));
        } else {
            acc.push(val);
        }
        return acc;
    }, []);
}

/**
 * 🔥 TYPE-AWARE COMPARATOR
 */
function compareByType(a, b, type, comparisonType) {
    // 🔹 NUMBER (float-safe)
    if (type === "number") {
        return Math.abs(a - b) < EPSILON;
    }

    // 🔹 BOOLEAN / STRING
    if (type === "boolean" || type === "string") {
        return a === b;
    }

    // 🔹 ARRAY (recursive)
    if (type.startsWith("array<")) {
        const innerType = type.slice(6, -1);

        if (!Array.isArray(a) || !Array.isArray(b)) return false;

        // 🔥 UNORDERED handling
        if (comparisonType === "UNORDERED") {
            const sortedA = deepSort(a);
            const sortedB = deepSort(b);

            if (sortedA.length !== sortedB.length) return false;

            for (let i = 0; i < sortedA.length; i++) {
                if (!compareByType(sortedA[i], sortedB[i], innerType, comparisonType)) {
                    return false;
                }
            }
            return true;
        }

        // ✅ ORDERED
        if (a.length === b.length) {
            let same = true;
            for (let i = 0; i < a.length; i++) {
                if (!compareByType(a[i], b[i], innerType, comparisonType)) {
                    same = false;
                    break;
                }
            }
            if (same) return true;
        }

        // 🔥 FLATTEN fallback
        const flatA = flattenArray(a);
        const flatB = flattenArray(b);

        if (flatA.length !== flatB.length) return false;

        const baseType = getBaseType(type);

        for (let i = 0; i < flatA.length; i++) {
            if (!compareByType(flatA[i], flatB[i], baseType, comparisonType)) {
                return false;
            }
        }

        return true;
    }

    return a === b;
}

/**
 * Main comparator (TYPE-AWARE)
 */
export function outputComparator(rawOutput, expectedOutputs, returnTypeRaw, comparisonType = "ORDERED") {
    const returnType = normalizeType(returnTypeRaw);
    // console.log(returnType);
    const actualRaw = extractResults(rawOutput);
    // console.log(actualRaw);
    const results = [];

    for (let i = 0; i < expectedOutputs.length; i++) {
        const expected = expectedOutputs[i];
        // console.log("expected", expected, ", ", typeof expected)

        // 🔥 parse using TYPE
        let parsedExpected = parseByType(expected, returnType);
        // console.log("parsedExpected", parsedExpected);
        let parsedActual = parseByType(actualRaw[i], returnType);
        // console.log(parsedActual);

        // 🔥 normalize string quotes
        parsedExpected = normalizeStrings(parsedExpected);
        // console.log(parsedExpected);
        parsedActual = normalizeStrings(parsedActual);
        // console.log(parsedActual);

        const passed = compareByType(
            parsedActual,
            parsedExpected,
            returnType,
            comparisonType
        );

        results.push({
            passed,
            actual: actualRaw[i] ?? "",
            expected: String(expected)
        });
    }

    return results;
}