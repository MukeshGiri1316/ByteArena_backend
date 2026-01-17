export function normalizeOutput(output) {
    if (!output) return "";
    return output.trim().replace(/\s+/g, " ");
}

export function isOutputCorrect(actual, expected) {
    return normalizeOutput(actual) === normalizeOutput(expected);
}
