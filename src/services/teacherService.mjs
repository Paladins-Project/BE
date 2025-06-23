import { User } from '../models/user.mjs';
import { Teacher } from '../models/teacher.mjs';
import { hashPassword } from '../utils/helpers.mjs';
import { validateUser, validateTeacher, updateTeacherValidator, validateObjectIdParam } from '../utils/validators.mjs';

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

export const updateTeacherAsync = async (teacherId, updateData) => {
    try {
        // Validate teacherId format
        const idValidation = validateObjectIdParam(teacherId, 'teacher ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Check if teacher exists
        const existingTeacher = await Teacher.findById(teacherId);
        if (!existingTeacher) {
            return {
                success: false,
                status: 404,
                message: 'Teacher not found'
            };
        }
        // Remove userId from update data to prevent changing it
        const { userId, ...cleanUpdateData } = updateData;
        // Validate update data using updateTeacherValidator
        const validation = updateTeacherValidator(cleanUpdateData);
        if (!validation.success) {
            return validation;
        }
        // Update teacher profile
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { $set: cleanUpdateData },
            { new: true, runValidators: true }
        ).populate('userId', 'email role isActive isVerified');
        return {
            success: true,
            status: 200,
            message: 'Teacher updated successfully',
            data: updatedTeacher
        };
    } catch (error) {
        console.error('Update teacher service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Teacher update failed',
            error: error.message
        };
    }
};

// Get teacher by ID
export const getTeacherByIDAsync = async (teacherId) => {
    try {
        // Validate teacherId format
        const idValidation = validateObjectIdParam(teacherId, 'teacher ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Find teacher by ID and populate user information
        const teacher = await Teacher.findById(teacherId)
            .populate('userId', 'email role isActive isVerified createdAt updatedAt');
        if (!teacher) {
            return {
                success: false,
                status: 404,
                message: 'Teacher not found'
            };
        }
        return {
            success: true,
            status: 200,
            message: 'Teacher retrieved successfully',
            data: teacher
        };
    } catch (error) {
        console.error('Get teacher by ID service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve teacher',
            error: error.message
        };
    }
};

// Delete teacher profile and associated user
export const deleteTeacherAsync = async (teacherId) => {
    try {
        // Validate teacherId format
        const idValidation = validateObjectIdParam(teacherId, 'teacher ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Check if teacher exists
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return {
                success: false,
                status: 404,
                message: 'Teacher not found'
            };
        }
        // Store userId for user deletion
        const userId = teacher.userId;
        // Delete associated user account
        await User.findByIdAndDelete(userId);
        // Delete teacher profile
        await Teacher.findByIdAndDelete(teacherId);
        return {
            success: true,
            status: 200,
            message: 'Teacher deleted successfully',
            data: { 
                deletedTeacherId: teacherId,
                deletedUserId: userId
            }
        };
    } catch (error) {
        console.error('Delete teacher service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Teacher deletion failed',
            error: error.message
        };
    }
};

// Get all teachers with pagination
export const getAllTeacherAsync = async (page = 1, limit = 10) => {
    try {
        // Convert page and limit to numbers and set defaults
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        // Get total count for pagination info (all teachers)
        const totalTeachers = await Teacher.countDocuments();
        
        // Calculate total pages
        const totalPages = Math.ceil(totalTeachers / limitNumber);
        
        // Find all teachers with pagination and populate user data
        const teachers = await Teacher.find()
            .populate({
                path: 'userId',
                select: 'email role isActive isVerified',
                options: { strictPopulate: false } // Allow null references
            })
            .select('-__v') // Exclude version field from teacher
            .skip(skip)
            .limit(limitNumber)
            .sort({ createdAt: -1 }); // Sort by newest first

        // Transform the data to match requirements: remove timestamps, keep only teacherId (not userId)
        const transformedTeachers = teachers.map(teacher => {
            const teacherObj = teacher.toObject();
            const userObj = teacherObj.userId;
            
            return {
                teacherId: teacherObj._id,
                fullName: teacherObj.fullName,
                phoneNumber: teacherObj.phoneNumber,
                specializations: teacherObj.specializations,
                bio: teacherObj.bio,
                coursesCreated: teacherObj.coursesCreated,
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
            message: 'Teachers retrieved successfully',
            data: {
                teachers: transformedTeachers,
                pagination: {
                    currentPage: pageNumber,
                    totalPages: totalPages,
                    totalTeachers: totalTeachers,
                    teachersReturned: transformedTeachers.length,
                    hasNextPage: pageNumber < totalPages,
                    hasPreviousPage: pageNumber > 1,
                    nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
                    previousPage: pageNumber > 1 ? pageNumber - 1 : null
                }
            }
        };
    } catch (error) {
        console.error('Get all teachers service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve teachers',
            error: error.message
        };
    }
};
