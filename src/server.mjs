console.log('=== server.mjs: Starting imports ===');
import mongoose from "mongoose";
console.log('=== server.mjs: mongoose imported ===');
import dotenv from "dotenv";
console.log('=== server.mjs: dotenv imported ===');
import MongoStore from "connect-mongo";
console.log('=== server.mjs: MongoStore imported ===');
import connectDB from "./config/database.mjs";
console.log('=== server.mjs: connectDB imported ===');
import app, { configureSession } from "./app.mjs";
console.log('=== server.mjs: app and configureSession imported ===');

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