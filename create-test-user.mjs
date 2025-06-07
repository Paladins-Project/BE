import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/user.mjs';
import { hashPassword } from './src/utils/helpers.mjs';

dotenv.config();

const createTestUser = async () => {
    try {
        console.log('🔌 Connecting to database...');
        
        const mongoURI = process.env.DBCONNECTIONSTRING;
        
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
        
        await mongoose.connect(finalConnectionString, {
            dbName: 'EXE2' // Explicitly set database name
        });
        
        console.log('✅ Connected to MongoDB');
        console.log('📊 Database name:', mongoose.connection.db.databaseName);
        
        // Verify we're connected to the right database
        if (mongoose.connection.db.databaseName !== 'EXE2') {
            console.log('⚠️ Warning: Connected to wrong database, switching...');
            mongoose.connection.useDb('EXE2');
            console.log('✅ Switched to database EXE2');
        }

        // Check existing users
        console.log('\n📋 Checking existing users...');
        const existingUsers = await User.find({}, 'email role isActive isVerified');
        console.log('Found users:', existingUsers);

        if (existingUsers.length === 0) {
            console.log('\n➕ No users found, creating test user...');
            
            const testUser = new User({
                email: 'test@example.com',
                password: hashPassword('123456'),
                role: 'parent',
                isActive: true,
                isVerified: true
            });

            await testUser.save();
            console.log('✅ Test user created:', {
                email: testUser.email,
                role: testUser.role,
                isActive: testUser.isActive,
                isVerified: testUser.isVerified
            });
        } else {
            console.log('\n👥 Users already exist in database');
        }

        // Check if specific test user exists
        const testUser = await User.findOne({ email: 'test@example.com' });
        if (testUser) {
            console.log('\n🧪 Test user exists:', {
                email: testUser.email,
                role: testUser.role,
                isActive: testUser.isActive,
                isVerified: testUser.isVerified,
                hasPassword: !!testUser.password
            });
        } else {
            console.log('\n❌ Test user not found');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from database');
        process.exit(0);
    }
};

createTestUser(); 