export function indentPythonCode(code, spaces = 4) {
    const pad = " ".repeat(spaces);
    return code
        .split("\n")
        .map(line => line.trim() ? pad + line : line)
        .join("\n");
}
