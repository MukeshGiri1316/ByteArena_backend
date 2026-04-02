import { getUserProfile } from '../services/user.service.js';
import { sendError } from '../utils/error.js';
import { sendResponse } from '../utils/response.js';
import { getRecentProblems } from '../services/submission.service.js';

export async function getUserStatController(req, res) {
    try {
        const userId = req.user.id;

        if (!userId) {
            return sendError(res, 400, "User ID is required");
        }

        const userStat = await getUserProfile(userId);

        const recentProblems = await getRecentProblems({
            userId,
            numOfSubmissions: 10
        })

        return sendResponse(res, 200, "User stats fetched successfully", { userStat, recentProblems });
    } catch (error) {
        return sendError(res, 500, "Internal server error");
    }
}