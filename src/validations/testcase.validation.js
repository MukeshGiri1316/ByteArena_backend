function validateTestCase(testCase, functionSignature) {
    const input = JSON.parse(testCase.input);

    functionSignature.parameters.forEach(p => {
        if (!(p.name in input)) {
            throw new Error(`Missing input param: ${p.name}`);
        }
    });
}
