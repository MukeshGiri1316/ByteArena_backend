import { UserProfile } from "../models/userProfile.model.js";
import {
    applySolveEvent,
    resolveStreakState
} from "../utils/streakEngine.js";

/**
 * Called when user solves a problem
 */
export async function handleSolveStreak(userId, session = null) {
    const user = await UserProfile.findOne({ userId });

    if (!user) throw new Error("User not found");

    const updated = applySolveEvent(user.streak);

    user.streak = updated;

    await user.save({ session: session });

    return updated;
}

/**
 * Called on login / dashboard load
 */
export async function refreshStreak(userId, session = null) {
    const user = await UserProfile.findOne({ userId });

    if (!user) throw new Error("User not found");

    const updated = resolveStreakState(user.streak);

    user.streak = updated;

    await user.save({ session: session });

    return updated;
}