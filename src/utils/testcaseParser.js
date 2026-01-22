export function parseTestCase(testCase) {
    try {
        return {
            input: JSON.parse(testCase.input),
            output: JSON.parse(testCase.output)
        };
    } catch (err) {
        throw new Error("Invalid JSON in test case");
    }
}
