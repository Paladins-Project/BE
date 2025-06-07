import mongoose from 'mongoose';
import { User } from '../models/user.mjs';
import { Parent } from '../models/parent.mjs';
import { Kid } from '../models/kid.mjs';
import { hashPassword } from '../utils/helpers.mjs';
import dotenv from 'dotenv';

dotenv.config();

async function createKidwParent() {
  try {
    // Kết nối đến database
    await mongoose.connect(process.env.DBCONNECTIONSTRING);
    console.log('Connected to MongoDB');

    // Kiểm tra xem đã có family user nào chưa (theo email và role)
    const existingUser = await User.findOne({
      email: 'family@dailymate.com',
      role: 'parent'
    });

    if (existingUser) {
      console.log('Family user already exists');

      // Kiểm tra xem đã có parent profile chưa
      const existingParent = await Parent.findOne({ userId: existingUser._id });
      if (!existingParent) {
        console.log('Creating missing parent profile...');
        const parentProfile = new Parent({
          userId: existingUser._id,
          fullName: 'Sarah Johnson',
          dateOfBirth: new Date('1988-03-22'),
          gender: 'female',
          image: '',
          address: '456 Maple Avenue, Springfield, IL 62701',
          phoneNumber: '+84912345678',
          subscriptionType: 'free',
          subscriptionExpiry: null
        });
        await parentProfile.save();
        console.log('Parent profile created successfully');
      } else {
        console.log('Parent profile already exists');
      }

      // Kiểm tra xem đã có kid profile chưa
      const existingKid = await Kid.findOne({ userId: existingUser._id });
      if (!existingKid) {
        console.log('Creating missing kid profile...');
        const kidProfile = new Kid({
          userId: existingUser._id,
          fullName: 'Emma Johnson',
          dateOfBirth: new Date('2016-07-15'),
          gender: 'female',
          points: 150,
          level: 2,
          avatar: 'princess_avatar_1',
          unlockedAvatars: ['default_avatar_1', 'princess_avatar_1', 'cat_avatar_1'],
          achievements: [],
          streak: {
            current: 5,
            longest: 12
          }
        });
        await kidProfile.save();
        console.log('Kid profile created successfully');
      } else {
        console.log('Kid profile already exists');
      }
    } else {
      console.log('Creating new family user with parent and kid profiles...');

      // Tạo user với role parent (đại diện cho gia đình)
      const familyUser = new User({
        password: hashPassword('family123'),
        email: 'family@dailymate.com',
        role: 'parent',
        isActive: true,
        isVerified: true
      });

      const savedUser = await familyUser.save();
      console.log('Family user created successfully');

      // Tạo parent profile liên kết với user
      const parentProfile = new Parent({
        userId: savedUser._id,
        fullName: 'Sarah Johnson',
        dateOfBirth: new Date('1988-03-22'),
        gender: 'female',
        image: '',
        address: '456 Maple Avenue, Springfield, IL 62701',
        phoneNumber: '+84912345678',
        subscriptionType: 'free',
        subscriptionExpiry: null
      });

      await parentProfile.save();
      console.log('Parent profile created successfully');

      // Tạo kid profile liên kết với cùng user
      const kidProfile = new Kid({
        userId: savedUser._id,
        fullName: 'Emma Johnson',
        dateOfBirth: new Date('2016-07-15'),
        gender: 'female',
        points: 150,
        level: 2,
        avatar: 'princess_avatar_1',
        unlockedAvatars: ['default_avatar_1', 'princess_avatar_1', 'cat_avatar_1'],
        achievements: [],
        streak: {
          current: 5,
          longest: 12
        }
      });

      await kidProfile.save();
      console.log('Kid profile created successfully');

      console.log('Complete family account created:');
      console.log('- Email: family@dailymate.com');
      console.log('- Password: family123');
      console.log('- Role: parent');
      console.log('');
      console.log('Parent Profile:');
      console.log('- Full Name: Sarah Johnson');
      console.log('- Date of Birth: 1988-03-22');
      console.log('- Gender: female');
      console.log('- Address: 456 Maple Avenue, Springfield, IL 62701');
      console.log('- Phone: +84912345678');
      console.log('- Subscription: free');
      console.log('');
      console.log('Kid Profile:');
      console.log('- Full Name: Emma Johnson');
      console.log('- Date of Birth: 2016-07-15');
      console.log('- Gender: female');
      console.log('- Points: 150');
      console.log('- Level: 2');
      console.log('- Current Streak: 5 days');
      console.log('- Longest Streak: 12 days');
      console.log('- Unlocked Avatars: 3');
    }
  } catch (error) {
    console.error('Error creating family account:', error);

    // Rollback nếu có lỗi
    if (error.message.includes('E11000')) {
      console.error('Duplicate key error - family user might already exist');
    }
  } finally {
    // Đóng kết nối
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

createKidwParent();
