import express from "express";
import cors from "cors";

const app = express();

/**
 * Global Middlewares
*/
app.use(express.json({ limit: "50kb" }));
app.use(cors());

// importing routes
import codeRoutes from "./routes/code.route.js";
import userRoutes from './routes/user.route.js'
import teacherRoutes from './routes/teacher.route.js'
import problemRoutes from './routes/problem.routes.js'

/**
 * Routes
 */
app.use("/api/v1/code", codeRoutes);
app.use("/api/v1/problem", problemRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/teacher', teacherRoutes);

export default app;