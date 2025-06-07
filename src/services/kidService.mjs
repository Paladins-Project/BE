import { User } from '../models/user.mjs';
import { Kid } from '../models/kid.mjs';
import { hashPassword } from '../utils/helpers.mjs';
import { validateUser, validateKid } from '../utils/validators.mjs';

export const createKidAsync = async (kidData) => {
    try {
        const { 
            email, 
            password, 
            fullName, 
            dateOfBirth, 
            gender
        } = kidData;
        
        // Validate required fields according to schema
        if (!email || !password || !fullName || !dateOfBirth || !gender) {
            return {
                success: false,
                status: 400,
                message: 'Missing required fields!!!'
            };
        }

        // Validate user data
        const userValidation = validateUser({
            email,
            password,
            role: 'kid',
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

        // Create user data with hashed password
        const userData = {
            ...userValidation.value,
            password: hashPassword(password)
        };

        const user = new User(userData);
        const savedUser = await user.save();

        // Prepare kid profile data
        const kidProfileData = {
            userId: savedUser._id.toString(), // Convert ObjectId to string
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

        // Validate kid data
        const kidValidation = validateKid(kidProfileData);
        if (kidValidation.error) {
            // If kid validation fails, remove the created user
            await User.findByIdAndDelete(savedUser._id);
            return {
                success: false,
                status: 400,
                message: kidValidation.error.details[0].message
            };
        }

        // Create kid profile
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