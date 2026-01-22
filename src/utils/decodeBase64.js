export function decodeBase64(str) {
    if (!str) return null;
    return Buffer.from(str, "base64").toString("utf-8");
}
