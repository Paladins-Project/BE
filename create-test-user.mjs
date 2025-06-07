import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/user.mjs';
import { hashPassword } from './src/utils/helpers.mjs';

dotenv.config();

const createTestUser = async () => {
    try {
        console.log('🔌 Connecting to database...');
        await mongoose.connect(process.env.DBCONNECTIONSTRING);
        console.log('✅ Connected to MongoDB');

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