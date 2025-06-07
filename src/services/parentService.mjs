import { User } from '../models/user.mjs';
import { Parent } from '../models/parent.mjs';
import { hashPassword } from '../utils/helpers.mjs';
import { validateUser, validateParent } from '../utils/validators.mjs';

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