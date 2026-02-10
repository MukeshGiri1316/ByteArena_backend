import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { signToken } from "../utils/jwt.js";
import { sendResponse } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import { createUserProfile } from '../services/user.service.js';

export const registerUser = async (req, res) => {
    const session = await mongoose.startSession();

    session.startTransaction();
    try {
        const { username, email, password, profile_details } = req.body;

        if (!username || !email || !password || !profile_details) {
            return sendError(res, 400, "All fields are required");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(res, 409, "Email already registered");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            role: "USER",
            passwordHash,
        });

        const user = await newUser.save({ session });

        const payload = {
            userId: user._id,
            role: user.role,
        };

        // initiate user stats
        profile_details.email = email;
        profile_details.userId = user._id;
        await createUserProfile(profile_details, session);

        await session.commitTransaction();

        const token = signToken(payload);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        return sendResponse(res, 201, "User registered successfully");
    } catch (error) {
        await session.abortTransaction();
        console.error("Register error:", error);
        return sendError(res, 500, "Internal server error");
    } finally {
        await session.endSession();
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
            return sendError(res, 404, "User not found");
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return sendError(res, 401, "Wrong password");
        }

        const payload = {
            userId: user._id,
            role: user.role,
        };

        const token = signToken(payload);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        return sendResponse(res, 200, "Login successful");
    } catch (error) {
        console.error("Login error:", error);
        return sendError(res, 500, "Internal server error");
    }
};

export async function isMe(req, res) {
    return sendResponse(res, 200, "User Logged in");
}

export async function logoutUser(req, res) {
    res.clearCookie("token");
    return sendResponse(res, 200, "Logout successful");
}