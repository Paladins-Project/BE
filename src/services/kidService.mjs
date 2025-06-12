import { User } from '../models/user.mjs';
import { Kid } from '../models/kid.mjs';
import { Parent } from '../models/parent.mjs';
import { hashPassword } from '../utils/helpers.mjs';
import { validateUser, validateKid, validateObjectIdParam, updateServiceValidator, updateKidValidator } from '../utils/validators.mjs';

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

// Update kid profile
export const updateKidAsync = async (kidId, kidData) => {
    try {
        // Validate kidId format
        const idValidation = validateObjectIdParam(kidId, 'kid ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Check if kid exists
        const existingKid = await Kid.findById(kidId);
        if (!existingKid) {
            return {
                success: false,
                status: 404,
                message: 'Kid not found'
            };
        }
        // Remove userId from update data to prevent changing it
        const { userId, ...updateData } = kidData;        
        // Validate update data using updateKidValidator
        const validation = updateKidValidator(updateData);
        if (!validation.success) {
            return validation;
        }
        // Update kid profile
        const updatedKid = await Kid.findByIdAndUpdate(
            kidId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('userId', 'email role isActive isVerified');
        return {
            success: true,
            status: 200,
            message: 'Kid updated successfully',
            data: updatedKid
        };
    } catch (error) {
        console.error('Update kid service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Kid update failed',
            error: error.message
        };
    }
};

// Delete kid profile and associated user
export const deleteKidAsync = async (kidId) => {
    try {
        // Validate kidId format
        const idValidation = validateObjectIdParam(kidId, 'kid ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Check if kid exists
        const kid = await Kid.findById(kidId);
        if (!kid) {
            return {
                success: false,
                status: 404,
                message: 'Kid not found'
            };
        }
        // Store userId for user deletion
        const userId = kid.userId;
        // Delete associated user account
        await User.findByIdAndDelete(userId);
        // Delete kid profile first
        await Kid.findByIdAndDelete(kidId);
        return {
            success: true,
            status: 200,
            message: 'Kid deleted successfully',
            data: { 
                deletedKidId: kidId,
                deletedUserId: userId
            }
        };
    } catch (error) {
        console.error('Delete kid service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Kid deletion failed',
            error: error.message
        };
    }
};

// Get kid by ID
export const getKidByIdAsync = async (kidId) => {
    try {
        // Validate kidId format
        const idValidation = validateObjectIdParam(kidId, 'kid ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Find kid by ID and populate user information
        const kid = await Kid.findById(kidId)
            .populate('userId', 'email role isActive isVerified createdAt updatedAt');

        if (!kid) {
            return {
                success: false,
                status: 404,
                message: 'Kid not found'
            };
        }
        return {
            success: true,
            status: 200,
            message: 'Kid retrieved successfully',
            data: kid
        };
    } catch (error) {
        console.error('Get kid by ID service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve kid',
            error: error.message
        };
    }
};

// Get all kids by parent ID
export const getAllKidByParentIdAsync = async (parentId) => {
    try {
        // Validate parentId format
        const idValidation = validateObjectIdParam(parentId, 'parent ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Check if parent exists and get their userId
        const parent = await Parent.findById(parentId).populate('userId', 'email role isActive isVerified');
        if (!parent) {
            return {
                success: false,
                status: 404,
                message: 'Parent not found'
            };
        }
        // Get the userId from the parent
        const parentUserId = parent.userId._id;

        // Find kids with the same userId as the parent
        const kids = await Kid.find({ userId: parentUserId })
            .populate('userId', 'email role isActive isVerified createdAt')
            .sort({ createdAt: -1 });
        return {
            success: true,
            status: 200,
            message: 'Kids retrieved successfully',
            data: {
                kids,
                parentInfo: {
                    parentId,
                    parentUserId,
                    parentFullName: parent.fullName,
                    parentEmail: parent.userId.email
                }
            }
        };
    } catch (error) {
        console.error('Get all kids by parent ID service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve kids',
            error: error.message
        };
    }
}; 