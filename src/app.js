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

/**
 * Routes
 */
app.use("/api/v1/code", codeRoutes);

export default app;