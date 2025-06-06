import mongoose from 'mongoose';
import User from '../models/user.mjs';
import Admin from '../models/admin.mjs';
import { hashPassword } from '../utils/helpers.mjs';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  try {
    // Kết nối đến database
    await mongoose.connect(process.env.DBCONNECTIONSTRING);
    console.log('Connected to MongoDB');

    // Kiểm tra xem đã có admin user nào chưa (theo email và role)
    const existingUser = await User.findOne({
      email: 'admin@dailymate.com',
      role: 'admin'
    });

    if (existingUser) {
      console.log('Admin user already exists');

      // Kiểm tra xem đã có admin profile chưa
      const existingAdmin = await Admin.findOne({ userId: existingUser._id });
      if (!existingAdmin) {
        console.log('Creating missing admin profile...');
        const adminProfile = new Admin({
          userId: existingUser._id,
          fullName: 'System Administrator',
          phoneNumber: '+84123456789'
        });
        await adminProfile.save();
        console.log('Admin profile created successfully');
      } else {
        console.log('Admin profile already exists');
      }
    } else {
      console.log('Creating new admin user and profile...');

      // Tạo user admin với thông tin đầy đủ
      const adminUser = new User({
        password: hashPassword('admin123'),
        email: 'admin@dailymate.com',
        role: 'admin',
        isActive: true,
        isVerified: true
      });

      const savedUser = await adminUser.save();
      console.log('Admin user created successfully');

      // Tạo admin profile liên kết với user
      const adminProfile = new Admin({
        userId: savedUser._id,
        fullName: 'System Administrator',
        phoneNumber: '+84123456789'
      });

      await adminProfile.save();
      console.log('Admin profile created successfully');

      console.log('Complete admin account created:');
      console.log('- Email: admin@dailymate.com');
      console.log('- Password: admin123');
      console.log('- Role: admin');
      console.log('- Full Name: System Administrator');
      console.log('- Phone: +84123456789');
    }
  } catch (error) {
    console.error('Error creating initial user:', error);

    // Rollback nếu có lỗi
    if (error.message.includes('E11000')) {
      console.error('Duplicate key error - admin user might already exist');
    }
  } finally {
    // Đóng kết nối
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

createAdmin();