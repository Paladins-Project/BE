import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
// Connect to database first
connectDB().then(async () => {
    // Configure session store after DB connection
    const mongoStore = MongoStore.create({
        client: mongoose.connection.getClient(),
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