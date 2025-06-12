import { User } from '../models/user.mjs';
import { Parent } from '../models/parent.mjs';
import { hashPassword } from '../utils/helpers.mjs';
import { validateUser, validateParent, validateObjectIdParam, updateParentValidator } from '../utils/validators.mjs';

export const createParentAsync = async (parentData) => {
    try {
        const { 
            email, 
            password, 
            fullName, 
            dateOfBirth, 
            gender,
            image,
            address,
            phoneNumber
        } = parentData;        
        // Validate required fields according to schema
        if (!email || !password || !fullName || !gender) {
            return {
                success: false,
                status: 400,
                message: 'Missing required fields: email, password, fullName, gender'
            };
        }
        // Validate trước khi xử lý để tránh hash password không cần thiết
        const userValidation = validateUser({
            email,
            password,
            role: 'parent',
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

        // Prepare parent profile data
        const parentProfileData = {
            userId: savedUser._id.toString(),
            fullName,
            gender,
            subscriptionType: 'free',
            subscriptionExpiry: null
        };
        // Add optional fields if provided
        if (dateOfBirth) parentProfileData.dateOfBirth = new Date(dateOfBirth);
        if (image) parentProfileData.image = image;
        if (address) parentProfileData.address = address;
        if (phoneNumber) parentProfileData.phoneNumber = phoneNumber;
        // Validate parent data
        const parentValidation = validateParent(parentProfileData);
        if (parentValidation.error) {
            // If parent validation fails, remove the created user
            await User.findByIdAndDelete(savedUser._id);
            return {
                success: false,
                status: 400,
                message: parentValidation.error.details[0].message
            };
        }
        // Create parent profile
        const parent = new Parent(parentProfileData);
        const savedParent = await parent.save();
        return {
            success: true,
            status: 201,
            message: 'Parent created successfully',
            data: {
                userId: savedUser._id,
                email: savedUser.email,
                role: savedUser.role,
                parentId: savedParent._id,
                fullName: savedParent.fullName,
                dateOfBirth: savedParent.dateOfBirth,
                gender: savedParent.gender,
                image: savedParent.image,
                address: savedParent.address,
                phoneNumber: savedParent.phoneNumber,
                subscriptionType: savedParent.subscriptionType,
                subscriptionExpiry: savedParent.subscriptionExpiry
            }
        };
    } catch (error) {
        console.error('Create parent service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Parent creation failed',
            error: error.message
        };
    }
};

// Update parent profile
export const updateParentByIdAsync = async (parentId, parentData) => {
    try {
        // Validate parentId format
        const idValidation = validateObjectIdParam(parentId, 'parent ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Check if parent exists
        const existingParent = await Parent.findById(parentId);
        if (!existingParent) {
            return {
                success: false,
                status: 404,
                message: 'Parent not found'
            };
        }
        // Remove userId from update data to prevent changing it
        const { userId, ...updateData } = parentData;
        // Validate update data using updateParentValidator
        const validation = updateParentValidator(updateData);
        if (!validation.success) {
            return validation;
        }
        // Update parent profile
        const updatedParent = await Parent.findByIdAndUpdate(
            parentId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('userId', 'email role isActive isVerified');
        return {
            success: true,
            status: 200,
            message: 'Parent updated successfully',
            data: updatedParent
        };
    } catch (error) {
        console.error('Update parent service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Parent update failed',
            error: error.message
        };
    }
};

// Get parent by ID
export const getParentByIDAsync = async (parentId) => {
    try {
        // Validate parentId format
        const idValidation = validateObjectIdParam(parentId, 'parent ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Find parent by ID and populate user information
        const parent = await Parent.findById(parentId)
            .populate('userId', 'email role isActive isVerified createdAt updatedAt');
        if (!parent) {
            return {
                success: false,
                status: 404,
                message: 'Parent not found'
            };
        }
        return {
            success: true,
            status: 200,
            message: 'Parent retrieved successfully',
            data: parent
        };
    } catch (error) {
        console.error('Get parent by ID service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve parent',
            error: error.message
        };
    }
};

// Delete parent profile and associated user
export const deleteParentAsync = async (parentId) => {
    try {
        // Validate parentId format
        const idValidation = validateObjectIdParam(parentId, 'parent ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Check if parent exists
        const parent = await Parent.findById(parentId);
        if (!parent) {
            return {
                success: false,
                status: 404,
                message: 'Parent not found'
            };
        }
        // Store userId for user deletion
        const userId = parent.userId;
        // Delete associated user account
        await User.findByIdAndDelete(userId);
        // Delete parent profile first
        await Parent.findByIdAndDelete(parentId);
        return {
            success: true,
            status: 200,
            message: 'Parent deleted successfully',
            data: { 
                deletedParentId: parentId,
                deletedUserId: userId
            }
        };
    } catch (error) {
        console.error('Delete parent service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Parent deletion failed',
            error: error.message
        };
    }
}; 