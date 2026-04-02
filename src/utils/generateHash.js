import crypto from "crypto";

export function getHash(input) {
    return crypto
        .createHash("sha256")
        .update(input, "utf8")
        .digest("hex");
}