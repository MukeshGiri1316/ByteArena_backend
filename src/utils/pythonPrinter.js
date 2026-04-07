export function generatePythonHelper() {
    return `
def __fix_empty(val):
    if isinstance(val, list):
        # 🔥 fix case: [""] → []
        if len(val) == 1 and val[0] == "":
            return []

        return [__fix_empty(x) for x in val]

    return val
`;
}

function generatePythonPrintExpr(type, expr) {
    if (type === "boolean") {
        return `"true" if ${expr} else "false"`;
    }

    if (type === "number") return `str(${expr})`;

    if (type === "string") return expr;

    if (type.startsWith("array<")) {
        return `str(__fix_empty(${expr}))`;
    }

    throw new Error(`Unsupported type: ${type}`);
}

export function generatePythonResultPrint(type, expr) {
    return `
print("__RESULT__:" + ${generatePythonPrintExpr(type, expr)})
`;
}