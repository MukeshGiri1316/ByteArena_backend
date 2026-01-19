export function injectCode(template, userCode) {
    if (!template.includes("// USER_CODE")) {
        throw new Error("Invalid language template");
    }

    return template.replace("// USER_CODE", userCode);
}
