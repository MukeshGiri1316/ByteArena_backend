import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { generateToken } from "../utils/auth.js";
import { getUserSubmissions } from "../services/submissionQuery.service.js";

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        email,
        passwordHash
    });

    res.json({ token: generateToken(user) });
}

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    res.json({ token: generateToken(user) });
}

const getMysubmissions = async (req, res) => {
    const submissions = await getUserSubmissions({
        userId: req.user.id,
        limit: 20
    });

    res.json(submissions);
}

export {
    registerUser,
    loginUser,
    getMysubmissions
}