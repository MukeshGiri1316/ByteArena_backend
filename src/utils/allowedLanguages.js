export const ALLOWED_LANGUAGES = {
    cpp: {
        id: 54,
        name: "cpp"
    },
    python: {
        id: 71,
        name: "python"
    }
};

/**
 * Check if language_id is allowed
 */
export function isLanguageAllowed(language_id) {
    return Object.values(ALLOWED_LANGUAGES).some(
        (lang) => lang.id === Number(language_id)
    );
}
