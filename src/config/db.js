import mongoose from "mongoose";

export async function connectDB() {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
        console.log("MongoDB connected: ", connectionInstance.connection.host);
    } catch (error) {
        console.error("MongoDB connection failed: ", error);
        process.exit(1);
    }
}
