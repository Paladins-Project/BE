import { Course } from '../models/course.mjs';
import { validateCourse } from '../utils/validators.mjs';
import mongoose from 'mongoose';

// Create a new course
export const createCourseAsync = async (courseData) => {
    try {
        // Validate course data
        const validation = validateCourse(courseData);
        if (validation.error) {
            return {
                success: false,
                status: 400,
                message: validation.error.details[0].message
            };
        }
        // Check if instructor exists if provided
        if (courseData.instructor) {
            if (!mongoose.Types.ObjectId.isValid(courseData.instructor)) {
                return {
                    success: false,
                    status: 400,
                    message: 'Invalid instructor ID format'
                };
            }
        }
        // Create new course
        const course = new Course(validation.value);
        const savedCourse = await course.save();

        // Populate instructor details if available
        await savedCourse.populate('instructor', 'fullName specializations');

        return {
            success: true,
            status: 201,
            message: 'Course created successfully',
            data: savedCourse
        };

    } catch (error) {
        console.error('Create course service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Course creation failed',
            error: error.message
        };
    }
};

// Get all courses with optional filters and pagination
export const getAllCoursesAsync = async (filters = {}, pagination = {}) => {
    try {
        const {
            category,
            ageGroup,
            isPremium,
            isPublished,
            instructor
        } = filters;

        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = pagination;

        // Build query object
        const query = {};
        
        if (category) query.category = new RegExp(category, 'i');
        if (ageGroup) query.ageGroup = ageGroup;
        if (isPremium !== undefined) query.isPremium = isPremium;
        if (isPublished !== undefined) query.isPublished = isPublished;
        if (instructor && mongoose.Types.ObjectId.isValid(instructor)) {
            query.instructor = instructor;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        // Execute query
        const courses = await Course.find(query)
            .populate('instructor', 'fullName specializations')
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalCount = await Course.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);

        return {
            success: true,
            status: 200,
            message: 'Courses retrieved successfully',
            data: {
                courses,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: totalCount,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        };

    } catch (error) {
        console.error('Get all courses service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve courses',
            error: error.message
        };
    }
};

// Get course by ID
export const getCourseByIdAsync = async (courseId) => {
    try {
        // Validate courseId format
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return {
                success: false,
                status: 400,
                message: 'Invalid course ID format'
            };
        }

        // Find course by ID
        const course = await Course.findById(courseId)
            .populate('instructor', 'fullName specializations bio');

        if (!course) {
            return {
                success: false,
                status: 404,
                message: 'Course not found'
            };
        }
        return {
            success: true,
            status: 200,
            message: 'Course retrieved successfully',
            data: course
        };
    } catch (error) {
        console.error('Get course by ID service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve course',
            error: error.message
        };
    }
};

// Update course
export const updateCourseAsync = async (courseId, courseData) => {
    try {
        // Validate courseId format
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return {
                success: false,
                status: 400,
                message: 'Invalid course ID format'
            };
        }
        // Check if course exists
        const existingCourse = await Course.findById(courseId);
        if (!existingCourse) {
            return {
                success: false,
                status: 404,
                message: 'Course not found'
            };
        }
        // Validate updated course data (exclude system fields from validation)
        const { _id, __v, createdAt, updatedAt, ...existingData } = existingCourse.toObject();
        const validation = validateCourse({ ...existingData, ...courseData });
        if (validation.error) {
            return {
                success: false,
                status: 400,
                message: validation.error.details[0].message
            };
        }
        // Check if instructor exists if provided
        if (courseData.instructor && !mongoose.Types.ObjectId.isValid(courseData.instructor)) {
            return {
                success: false,
                status: 400,
                message: 'Invalid instructor ID format'
            };
        }
        // Update course
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { $set: courseData },
            { new: true, runValidators: true }
        ).populate('instructor', 'fullName specializations');
        return {
            success: true,
            status: 200,
            message: 'Course updated successfully',
            data: updatedCourse
        };
    } catch (error) {
        console.error('Update course service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Course update failed',
            error: error.message
        };
    }
};

// Delete course
export const deleteCourseAsync = async (courseId) => {
    try {
        // Validate courseId format
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return {
                success: false,
                status: 400,
                message: 'Invalid course ID format'
            };
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return {
                success: false,
                status: 404,
                message: 'Course not found'
            };
        }

        // Delete course
        await Course.findByIdAndDelete(courseId);

        return {
            success: true,
            status: 200,
            message: 'Course deleted successfully',
            data: { deletedCourseId: courseId }
        };

    } catch (error) {
        console.error('Delete course service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Course deletion failed',
            error: error.message
        };
    }
};

// Get courses by category with pagination
export const getCoursesByCategoryAsync = async (category, pagination = {}) => {
    try {
        if (!category) {
            return {
                success: false,
                status: 400,
                message: 'Category is required'
            };
        }

        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = pagination;

        // Calculate pagination
        const skip = (page - 1) * limit;
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        // Query courses by category (case-insensitive)
        const query = { 
            category: new RegExp(category, 'i'),
            isPublished: true // Only show published courses
        };

        const courses = await Course.find(query)
            .populate('instructor', 'fullName specializations')
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalCount = await Course.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);

        return {
            success: true,
            status: 200,
            message: `Courses in category "${category}" retrieved successfully`,
            data: {
                courses,
                category,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: totalCount,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        };

    } catch (error) {
        console.error('Get courses by category service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve courses by category',
            error: error.message
        };
    }
};

