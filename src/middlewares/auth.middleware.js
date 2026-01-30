import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/user.model.js";
import {sendError} from '../utils/error.js';

export async function authenticate(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
        
        if (!token) {
            return sendError(res, 401, "Authorization token missing");
        }

        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId).select(
            "_id role isActive"
        );

        if (!user || !user.isActive) {
            return sendError(res, 401, "Account disabled");
        }

        req.user = {
            id: user._id,
            role: user.role
        };

        next();
    } catch (err) {
        return sendError(res, 401, "Invalid or expired token");
    }
}