import { User } from '../models/user.model.js';
import { UserStat } from '../models/userStat.model.js';

export async function saveUserStat(userId, update = {}, session = null) {
    const allowedFields = [
        "problemsSolved",
        "problemsAttempted",
        "easySolved",
        "mediumSolved",
        "hardSolved",
        "totalSubmissions",
        "currentStreak",
        "longestStreak",
        "contestScore",
    ];

    try {

        const isEmpty = Object.entries(update).length === 0;

        let isValidUpdate = true;
        if (!isEmpty) {
            isValidUpdate = Object.keys(update.$inc).every(field =>
                allowedFields.includes(field)
            );
        }

        if (!isValidUpdate) {
            throw new Error("Invalid fields in stats update");
        }

        await UserStat.findOneAndUpdate(
            { userId },
            update,
            {
                upsert: true,
                new: true,
                session
            }
        );

    } catch (error) {
        console.error("saveUserStat error:", error);
        throw error;
    }
}
