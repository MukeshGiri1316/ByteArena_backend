export function generateCppOutput(returnType, resultVar = "__result") {
    // Scalars
    if (
        returnType === "int" ||
        returnType === "long" ||
        returnType === "double" ||
        returnType === "string" ||
        returnType === "char"
    ) {
        return `cout << ${resultVar} << endl;`;
    }

    if (returnType === "bool") {
        return `cout << (${resultVar} ? "true" : "false") << endl;`;
    }

    // 1D containers (vector<T>, string already handled)
    if (returnType.endsWith("[]")) {
        return `
        for (int i = 0; i < ${resultVar}.size(); i++) {
            if (i) cout << " ";
            cout << ${resultVar}[i];
        }
        cout << endl;
        `;
    }

    // 2D containers
    if (returnType.endsWith("[][]")) {
        return `
        for (int i = 0; i < ${resultVar}.size(); i++) {
            for (int j = 0; j < ${resultVar}[i].size(); j++) {
                if (j) cout << " ";
                cout << ${resultVar}[i][j];
            }
            cout << endl;
        }
        `;
    }

    // Fallback (debug-friendly)
    return `
    // Fallback printer (attempt)
    cout << ${resultVar} << endl;
    `;
}

export function generatePythonOutput(returnType, resultVar = "__result") {
    // Scalars
    if (
        returnType === "int" ||
        returnType === "float" ||
        returnType === "string"
    ) {
        return `print(${resultVar})`;
    }

    if (returnType === "bool") {
        return `print("true" if ${resultVar} else "false")`;
    }

    // 1D list
    if (returnType.endsWith("[]")) {
        return `print(" ".join(map(str, ${resultVar})))`;
    }

    // 2D list
    if (returnType.endsWith("[][]")) {
        return `
        for row in ${resultVar}:
            print(" ".join(map(str, row)))
        `;
    }

    // Fallback
    return `print(${resultVar})`;
}