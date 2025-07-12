import mongoose from "mongoose";
import dotenv from "dotenv";
import MongoStore from "connect-mongo";
import connectDB from "./config/database.mjs";
import app, { configureSession } from "./app.mjs";

console.log('=== Starting server initialization ===');
dotenv.config();

// Connect to database first
console.log('=== Connecting to database ===');
connectDB().then(async () => {
    console.log('=== Database connected successfully ===');
    
    // Configure session store after DB connection
    console.log('=== Creating MongoStore ===');
    const mongoStore = MongoStore.create({
        client: mongoose.connection.getClient(),
        dbName: 'EXE2', // Chỉ định database name để tránh tạo database "test"
    });
    console.log('=== MongoStore created successfully ===');

    console.log('=== Calling configureSession ===');
    await configureSession(mongoStore);
    console.log('=== configureSession completed ===');

    // Start server
    const PORT = process.env.PORT || 8386;
    console.log('=== Starting server on port:', PORT, '===');
    app.listen(PORT, () => {
        console.log(`Running on port http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});