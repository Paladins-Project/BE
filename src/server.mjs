import mongoose from "mongoose";
import dotenv from "dotenv";
import MongoStore from "connect-mongo";
import connectDB from "./config/database.mjs";
import app, { configureSession } from "./app.mjs";

dotenv.config();
// Connect to database first
connectDB().then(async () => {
    // Configure session store after DB connection
    const mongoStore = MongoStore.create({
        client: mongoose.connection.getClient(),
        dbName: 'EXE2', // Chỉ định database name để tránh tạo database "test"
    });

    await configureSession(mongoStore);

    // Start server
    const PORT = process.env.PORT;

    app.listen(PORT, () => {
        console.log(`Running on port http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});