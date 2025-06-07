import { User } from '../models/user.mjs';
import { Kid } from '../models/kid.mjs';
import { hashPassword } from '../utils/helpers.mjs';

export const createKidAsync = async (kidData) => {
    try {
        const { 
            email, 
            password, 
            fullName, 
            dateOfBirth, 
            gender
        } = kidData;
        
        // Validate required fields theo schema
        if (!email || !password || !fullName || !dateOfBirth || !gender) {
            return {
                success: false,
                status: 400,
                message: 'Missing required fields: email, password, fullName, dateOfBirth, gender'
            };
        }

        // Validate gender enum
        if (!['male', 'female'].includes(gender)) {
            return {
                success: false,
                status: 400,
                message: 'Gender must be either male or female'
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

        // Create user with role='kid'
        const userData = {
            email,
            password: hashPassword(password),
            role: 'kid',
            isActive: true,
            isVerified: false
        };

        const user = new User(userData);
        const savedUser = await user.save();

        // Create kid profile
        const kidProfileData = {
            userId: savedUser._id,
            fullName,
            dateOfBirth: new Date(dateOfBirth),
            gender,
            points: 0,
            level: 0,
            avatar: 'img/default', // Always set default avatar
            unlockedAvatars: [],
            achievements: [],
            streak: {
                current: 0,
                longest: 0
            }
        };

        const kid = new Kid(kidProfileData);
        const savedKid = await kid.save();

        return {
            success: true,
            status: 201,
            message: 'Kid created successfully',
            data: {
                userId: savedUser._id,
                email: savedUser.email,
                role: savedUser.role,
                kidId: savedKid._id,
                fullName: savedKid.fullName,
                dateOfBirth: savedKid.dateOfBirth,
                gender: savedKid.gender,
                points: savedKid.points,
                level: savedKid.level,
                avatar: savedKid.avatar
            }
        };

    } catch (error) {
        console.error('Create kid service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Kid creation failed',
            error: error.message
        };
    }
}; 