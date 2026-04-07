/**
 * Normalize date to start of day (timezone-safe)
 */
function normalizeToDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Get difference in days
 */
function getDayDiff(date1, date2) {
    const d1 = normalizeToDay(date1);
    const d2 = normalizeToDay(date2);

    return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

/**
 * 🔥 APPLY SOLVE EVENT
 */
export function applySolveEvent(streak, now = new Date()) {
    const updated = { ...streak };

    if (!updated.lastSolvedAt) {
        updated.current = 1;
    } else {
        const diff = getDayDiff(updated.lastSolvedAt, now);

        if (diff === 0) {
            // same day → no change
        }
        else if (diff === 1) {
            updated.current += 1;
        }
        else {
            updated.current = 1;
        }
    }

    updated.lastSolvedAt = now;
    updated.warningStartedAt = null;

    updated.longest = Math.max(updated.longest, updated.current);

    return updated;
}

/**
 * 🔥 CHECK WARNING STATE
 */
export function applyWarningCheck(streak, now = new Date()) {
    const updated = { ...streak };

    if (!updated.lastSolvedAt) return updated;

    const diff = getDayDiff(updated.lastSolvedAt, now);
    // console.log(diff)
    if (diff >= 1 && !updated.warningStartedAt) {
        updated.warningStartedAt = now;
    }

    return updated;
}

/**
 * 🔥 CHECK RESET AFTER WARNING
 */
export function applyResetCheck(streak, now = new Date()) {
    const updated = { ...streak };

    if (!updated.warningStartedAt) return updated;

    const diffHours =
        (now - new Date(updated.lastSolvedAt)) / (1000 * 60 * 60);

    if (diffHours >= 48) {
        updated.current = 0;
        updated.warningStartedAt = null;
    }

    return updated;
}

/**
 * 🔥 MASTER FUNCTION (SAFE COMBINED)
 */
export function resolveStreakState(streak, now = new Date()) {
    let updated = { ...streak };
    // console.log(updated);

    updated = applyWarningCheck(updated, now);
    updated = applyResetCheck(updated, now);

    return updated;
}