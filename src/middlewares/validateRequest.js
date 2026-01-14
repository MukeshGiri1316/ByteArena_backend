import { isLanguageAllowed } from "../utils/allowedLanguages.js";

export function validateSubmission(req, res, next) {
    const { source_code, language_id, stdin } = req.body;

    // Source code validation
    if (!source_code || typeof source_code !== "string") {
        return res.status(400).json({ error: "Invalid source code" });
    }

    if (source_code.length > 5000) {
        return res.status(413).json({ error: "Source code too large" });
    }

    // Language validation
    if (!language_id || !isLanguageAllowed(language_id)) {
        return res.status(400).json({ error: "Unsupported language" });
    }

    // stdin validation (optional)
    if (stdin && typeof stdin !== "string") {
        return res.status(400).json({ error: "Invalid stdin format" });
    }

    next();
}
