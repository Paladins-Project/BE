import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        console.log('🔌 === DATABASE CONNECTION ===');
        const mongoURI = process.env.DBCONNECTIONSTRING;
        console.log('🌐 MongoDB URI:', mongoURI ? 'URI provided' : 'No URI found');
        
        if (!mongoURI) {
            throw new Error('DBCONNECTIONSTRING environment variable is not set');
        }
        
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        
        console.log('✅ Connected to MongoDB successfully');
        console.log('📊 Database name:', mongoose.connection.db.databaseName);
        console.log('🔗 Connection state:', mongoose.connection.readyState); // 1 = connected
        
        // Add connection event listeners
        mongoose.connection.on('error', (err) => {
            console.log('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('🔌 MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('🔌 MongoDB reconnected');
        });
        
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        console.error('Error details:', err);
        process.exit(1);
    }
};

export default connectDB; 