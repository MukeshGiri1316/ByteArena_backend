function normalizeOutput(value) {
    // If already an array → stringify elements
    if (Array.isArray(value)) {
        return value.map(String);
    }

    // Convert to string, trim, split by whitespace
    return String(value)
        .trim()
        .split(/\s+/)
        .filter(Boolean);
}



export function isOutputCorrect(actual, expected) {
    const normActual = normalizeOutput(actual);
    const normExpected = normalizeOutput(expected);

    if (normActual.length !== normExpected.length) return false;

    for (let i = 0; i < normActual.length; i++) {
        if (normActual[i] !== normExpected[i]) {
            return {
                isCorrect: false,
                expected: normExpected,
                actual: normActual
            }
        };
    }

    return {
        isCorrect: true,
        expectedOutput: normExpected,
        actualOutput: normActual
    };
}