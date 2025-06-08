import { User } from '../models/user.mjs';
import { Teacher } from '../models/teacher.mjs';
import { hashPassword } from '../utils/helpers.mjs';
import { validateUser, validateTeacher } from '../utils/validators.mjs';

export const createTeacherAsync = async (teacherData) => {
    try {
        const { 
            email, 
            password, 
            fullName, 
            phoneNumber,
            specializations,
            bio
        } = teacherData;
        
        // Validate required fields according to schema
        if (!email || !password || !fullName) {
            return {
                success: false,
                status: 400,
                message: 'Missing required fields: email, password, fullName'
            };
        }

        // Validate trước khi xử lý để tránh hash password không cần thiết
        const userValidation = validateUser({
            email,
            password,
            role: 'teacher',
            isActive: true,
            isVerified: false
        });

        if (userValidation.error) {
            return {
                success: false,
                status: 400,
                message: userValidation.error.details[0].message
            };
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return {
                success: false,
                status: 400,
                message: 'Email already exists'
            };
        }

        // Chỉ hash password sau khi validate thành công
        const userData = {
            ...userValidation.value,
            password: hashPassword(password)
        };

        const user = new User(userData);
        const savedUser = await user.save();

        // Prepare teacher profile data
        const teacherProfileData = {
            userId: savedUser._id.toString(),
            fullName,
            coursesCreated: []
        };
        
        // Add optional fields if provided
        if (phoneNumber) teacherProfileData.phoneNumber = phoneNumber;
        if (specializations && Array.isArray(specializations)) {
            teacherProfileData.specializations = specializations;
        }
        if (bio) teacherProfileData.bio = bio;

        // Validate teacher data
        const teacherValidation = validateTeacher(teacherProfileData);
        if (teacherValidation.error) {
            // If teacher validation fails, remove the created user
            await User.findByIdAndDelete(savedUser._id);
            return {
                success: false,
                status: 400,
                message: teacherValidation.error.details[0].message
            };
        }

        // Create teacher profile
        const teacher = new Teacher(teacherProfileData);
        const savedTeacher = await teacher.save();

        return {
            success: true,
            status: 201,
            message: 'Teacher created successfully',
            data: {
                userId: savedUser._id,
                email: savedUser.email,
                role: savedUser.role,
                teacherId: savedTeacher._id,
                fullName: savedTeacher.fullName,
                phoneNumber: savedTeacher.phoneNumber,
                specializations: savedTeacher.specializations,
                bio: savedTeacher.bio,
                coursesCreated: savedTeacher.coursesCreated
            }
        };

    } catch (error) {
        console.error('Create teacher service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Teacher creation failed',
            error: error.message
        };
    }
};
