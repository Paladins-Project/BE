import mongoose from 'mongoose';
import { User } from '../models/user.mjs';
import { Teacher } from '../models/teacher.mjs';
import { hashPassword } from '../utils/helpers.mjs';
import dotenv from 'dotenv';

dotenv.config();

async function createTeacher() {
  try {
    // Kết nối đến database
    await mongoose.connect(process.env.DBCONNECTIONSTRING);
    console.log('Connected to MongoDB');

    // Kiểm tra xem đã có teacher user nào chưa (theo email và role)
    const existingUser = await User.findOne({
      email: 'teacher@dailymate.com',
      role: 'teacher'
    });

    if (existingUser) {
      console.log('Teacher user already exists');

      // Kiểm tra xem đã có teacher profile chưa
      const existingTeacher = await Teacher.findOne({ userId: existingUser._id });
      if (!existingTeacher) {
        console.log('Creating missing teacher profile...');
        const teacherProfile = new Teacher({
          userId: existingUser._id,
          fullName: 'Sample Teacher',
          phoneNumber: '+84123456789',
          specializations: ['Mathematics', 'Science', 'English'],
          bio: 'Experienced educator with passion for teaching children and creating engaging learning experiences.',
          coursesCreated: []
        });
        await teacherProfile.save();
        console.log('Teacher profile created successfully');
      } else {
        console.log('Teacher profile already exists');
      }
    } else {
      console.log('Creating new teacher user and profile...');

      // Tạo user teacher với thông tin đầy đủ
      const teacherUser = new User({
        password: hashPassword('teacher123'),
        email: 'teacher@dailymate.com',
        role: 'teacher',
        isActive: true,
        isVerified: true
      });

      const savedUser = await teacherUser.save();
      console.log('Teacher user created successfully');

      // Tạo teacher profile liên kết với user
      const teacherProfile = new Teacher({
        userId: savedUser._id,
        fullName: 'Sample Teacher',
        phoneNumber: '+84123456789',
        specializations: ['Mathematics', 'Science', 'English'],
        bio: 'Experienced educator with passion for teaching children and creating engaging learning experiences.',
        coursesCreated: []
      });

      await teacherProfile.save();
      console.log('Teacher profile created successfully');

      console.log('Complete teacher account created:');
      console.log('- Email: teacher@dailymate.com');
      console.log('- Password: teacher123');
      console.log('- Role: teacher');
      console.log('- Full Name: Sample Teacher');
      console.log('- Phone: +84123456789');
      console.log('- Specializations: Mathematics, Science, English');
      console.log('- Bio: Experienced educator with passion for teaching children and creating engaging learning experiences.');
    }
  } catch (error) {
    console.error('Error creating teacher user:', error);

    // Rollback nếu có lỗi
    if (error.message.includes('E11000')) {
      console.error('Duplicate key error - teacher user might already exist');
    }
  } finally {
    // Đóng kết nối
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

createTeacher();
