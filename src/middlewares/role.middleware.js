import { sendError } from '../utils/error.js';

export function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, 401, "Unauthorized");
        }

        if (!allowedRoles.includes(req.user.role)) {
            return sendError(res, 403, "Forbidden: insufficient permissions");
        }

        next();
    };
}
