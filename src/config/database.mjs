import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.DBCONNECTIONSTRING;
        
        if (!mongoURI) {
            throw new Error('DBCONNECTIONSTRING environment variable is not set');
        }
        
        // Đảm bảo connection string có database name EXE2
        let finalConnectionString = mongoURI;
        if (!mongoURI.split('/').pop() || mongoURI.endsWith('/')) {
            finalConnectionString = mongoURI.replace(/\/$/, '') + '/EXE2';
        } else if (mongoURI.split('/').pop().split('?')[0] === '') {
            finalConnectionString = mongoURI.replace(/\/(\?|$)/, '/EXE2$1');
        }
        
        // Kết nối với explicit database name
        await mongoose.connect(finalConnectionString, {
            dbName: 'EXE2' // Force sử dụng database EXE2
        });
        
        // Verify và switch nếu cần
        if (mongoose.connection.db.databaseName !== 'EXE2') {
            mongoose.connection.useDb('EXE2');
        }
        
        // Final check - throw error nếu vẫn sai database
        if (mongoose.connection.db.databaseName !== 'EXE2') {
            throw new Error(`Failed to connect to EXE2. Connected to: ${mongoose.connection.db.databaseName}`);
        }
        
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

export default connectDB;