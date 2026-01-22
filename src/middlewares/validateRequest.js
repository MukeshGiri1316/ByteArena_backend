import { isLanguageAllowed } from "../utils/allowedLanguages.js";

export function validateSubmission(req, res, next) {
    const { sourceCode, languageId, stdin } = req.body;

    // Source code validation
    if (!sourceCode || typeof sourceCode !== "string") {
        return res.status(400).json({ error: "Invalid source code" });
    }

    if (sourceCode.length > 5000) {
        return res.status(413).json({ error: "Source code too large" });
    }

    // Language validation
    if (!languageId || !isLanguageAllowed(languageId)) {
        return res.status(400).json({ error: "Unsupported language" });
    }

    // stdin validation (optional)
    if (stdin && typeof stdin !== "string") {
        return res.status(400).json({ error: "Invalid stdin format" });
    }

    next();
}
