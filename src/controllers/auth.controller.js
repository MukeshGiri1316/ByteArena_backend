import bcrypt from "bcrypt";
import {User} from "../models/user.model.js";
import { signToken } from "../utils/jwt.js";
import { sendResponse } from "../utils/response.js";
import { sendError } from "../utils/error.js";

export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return sendError(res, 400, "All fields are required");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(res, 409, "Email already registered");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            role: "USER",
            passwordHash,
        });

        const payload = {
            userId: user._id,
            role: user.role,
        };

        return sendResponse(res, 201, "User registered successfully", {
            token: signToken(payload),
        });
    } catch (error) {
        console.error("Register error:", error);
        return sendError(res, 500, "Internal server error");
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendError(res, 400, "Email and password are required");
        }

        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, 401, "Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return sendError(res, 401, "Invalid credentials");
        }

        const payload = {
            userId: user._id,
            role: user.role,
        };

        return sendResponse(res, 200, "Login successful", {
            token: signToken(payload),
        });
    } catch (error) {
        console.error("Login error:", error);
        return sendError(res, 500, "Internal server error");
    }
};