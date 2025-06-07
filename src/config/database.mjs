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
        
        // Đảm bảo connection string có database name EXE2
        let finalConnectionString = mongoURI;
        
        // Nếu connection string không có database name, thêm EXE2
        if (!mongoURI.includes('mongodb://') && !mongoURI.includes('mongodb+srv://')) {
            throw new Error('Invalid MongoDB connection string format');
        }
        
        // Kiểm tra và thêm database name nếu chưa có
        if (!mongoURI.split('/').pop() || mongoURI.endsWith('/')) {
            finalConnectionString = mongoURI.replace(/\/$/, '') + '/EXE2';
        } else if (mongoURI.split('/').pop().split('?')[0] === '') {
            finalConnectionString = mongoURI.replace(/\/(\?|$)/, '/EXE2$1');
        }
        
        console.log('🎯 Final connection string database:', finalConnectionString.split('/').pop().split('?')[0]);
        console.log('⏳ Connecting to MongoDB...');
        
        await mongoose.connect(finalConnectionString, {
            dbName: 'EXE2' // Explicitly set database name
        });
        
        console.log('✅ Connected to MongoDB successfully');
        console.log('📊 Database name:', mongoose.connection.db.databaseName);
        console.log('🔗 Connection state:', mongoose.connection.readyState); // 1 = connected
        
        // Verify we're connected to the right database
        if (mongoose.connection.db.databaseName !== 'EXE2') {
            console.log('⚠️ Warning: Connected to wrong database, switching...');
            mongoose.connection.useDb('EXE2');
            console.log('✅ Switched to database EXE2');
        }
        
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