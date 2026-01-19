import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/user.model.js";

export async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = verifyToken(token);

        const user = await User.findById(decoded.userId).select(
            "_id role isActive"
        );

        if (!user || !user.isActive) {
            return res.status(401).json({ message: "Account disabled" });
        }

        req.user = {
            id: user._id,
            role: user.role
        };

        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
