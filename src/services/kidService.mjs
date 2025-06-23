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
        // Delete kid profile 
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

export const createKidLinkedToParentAsync = async (kidData) => {
    try {
        const { 
            fullName, 
            dateOfBirth, 
            gender, 
            parentId 
        } = kidData;        
        // Validate required fields
        if (!fullName || !dateOfBirth || !gender || !parentId) {
            return {
                success: false,
                status: 400,
                message: 'Missing required fields: fullName, dateOfBirth, gender, parentId'
            };
        }
        // Validate parentId format
        const parentIdValidation = validateObjectIdParam(parentId, 'parent ID');
        if (!parentIdValidation.success) {
            return parentIdValidation;
        }
        // Check if parent exists by _id
        const parent = await Parent.findById(parentId);
        if (!parent) {
            return {
                success: false,
                status: 400,
                message: 'Parent not found'
            };
        }
        // Prepare kid profile data using parent's userId
        const kidProfileData = {
            userId: parent.userId.toString(), // Convert ObjectId to string
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
            message: 'Kid linked to parent successfully',
            data: {
                kidId: savedKid._id,
                fullName: savedKid.fullName,
                dateOfBirth: savedKid.dateOfBirth,
                gender: savedKid.gender,
                points: savedKid.points,
                level: savedKid.level,
                avatar: savedKid.avatar,
                parentId: parentId,
                userId: savedKid.userId
            }
        };
    } catch (error) {
        console.error('Create kid linked to parent service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Kid creation failed',
            error: error.message
        };
    }
};

export const getAllKidAsync = async (page = 1, limit = 10) => {
    try {
        // Convert page and limit to numbers and set defaults
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;
        // Get total count for pagination info (all kids)
        const totalKids = await Kid.countDocuments();        
        // Calculate total pages
        const totalPages = Math.ceil(totalKids / limitNumber);        
        // Find all kids with pagination and populate user data
        const kids = await Kid.find()
            .populate({
                path: 'userId',
                select: 'email role isActive isVerified',
                options: { strictPopulate: false } // Allow null references
            })
            .select('-__v') // Exclude version field from kid
            .skip(skip)
            .limit(limitNumber)
            .sort({ createdAt: -1 }); // Sort by newest first
        // Transform the data to match requirements: remove timestamps, keep only kidId (not userId)
        const transformedKids = kids.map(kid => {
            const kidObj = kid.toObject();
            const userObj = kidObj.userId;
            
            return {
                kidId: kidObj._id,
                fullName: kidObj.fullName,
                dateOfBirth: kidObj.dateOfBirth,
                gender: kidObj.gender,
                points: kidObj.points,
                level: kidObj.level,
                avatar: kidObj.avatar,
                unlockedAvatars: kidObj.unlockedAvatars,
                achievements: kidObj.achievements,
                streak: kidObj.streak,
                // User information - if userObj exists, include user data; otherwise set to null
                email: userObj ? userObj.email : null,
                role: userObj ? userObj.role : null,
                isActive: userObj ? userObj.isActive : null,
                isVerified: userObj ? userObj.isVerified : null
            };
        });
        return {
            success: true,
            status: 200,
            message: 'Kids retrieved successfully',
            data: {
                kids: transformedKids,
                pagination: {
                    currentPage: pageNumber,
                    totalPages: totalPages,
                    totalKids: totalKids,
                    kidsReturned: transformedKids.length,
                    hasNextPage: pageNumber < totalPages,
                    hasPreviousPage: pageNumber > 1,
                    nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
                    previousPage: pageNumber > 1 ? pageNumber - 1 : null
                }
            }
        };
    } catch (error) {
        console.error('Get all kids service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve kids',
            error: error.message
        };
    }
};

export const getNumberOfKidByMonthAsync = async (month, year) => {
    try {
        // Convert to numbers and validate
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);        
        if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > 3000) {
            return {
                success: false,
                status: 400,
                message: 'Invalid month or year. Month must be 1-12, year must be valid numbers'
            };
        }
        // Create date range for the specified month
        const startDate = new Date(yearNum, monthNum - 1, 1); // month - 1 because Date constructor uses 0-based months
        const endDate = new Date(yearNum, monthNum, 1); // First day of next month
        
        // Count kids created in the specified month
        const kidCount = await Kid.countDocuments({
            createdAt: {
                $gte: startDate,
                $lt: endDate
            }
        });
        
        return {
            success: true,
            status: 200,
            message: `Found ${kidCount} kids created in month ${monthNum}/${yearNum}`,
            data: {
                month: monthNum,
                year: yearNum,
                kidCount
            }
        };
    } catch (error) {
        console.error('Get number of kids by month service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to get number of kids by month',
            error: error.message
        };
    }
};

export const getNumberOfKidByYearAsync = async (year) => {
    try {
        // Convert to number and validate
        const yearNum = parseInt(year, 10);        
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > 3000) {
            return {
                success: false,
                status: 400,
                message: 'Invalid year. Year must be a valid number'
            };
        }
        // Create date range for the specified year
        const startDate = new Date(yearNum, 0, 1); // First day of the year
        const endDate = new Date(yearNum + 1, 0, 1); // First day of next year
        
        // Count kids created in the specified year
        const kidCount = await Kid.countDocuments({
            createdAt: {
                $gte: startDate,
                $lt: endDate
            }
        });
        
        return {
            success: true,
            status: 200,
            message: `Found ${kidCount} kids created in year ${yearNum}`,
            data: {
                year: yearNum,
                kidCount
            }
        };
    } catch (error) {
        console.error('Get number of kids by year service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to get number of kids by year',
            error: error.message
        };
    }
}; 