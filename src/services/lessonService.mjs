import { Lesson } from '../models/lesson.mjs';
import { Course } from '../models/course.mjs';
import { validateLesson } from '../utils/validators.mjs';
import mongoose from 'mongoose';

// Create a new lesson
export const createLessonAsync = async (lessonData) => {
    try {
        // Validate lesson data
        const validation = validateLesson(lessonData);
        if (validation.error) {
            return {
                success: false,
                status: 400,
                message: validation.error.details[0].message
            };
        }

        // Check if courseId is valid
        if (!mongoose.Types.ObjectId.isValid(lessonData.courseId)) {
            return {
                success: false,
                status: 400,
                message: 'Invalid course ID format'
            };
        }

        // Check if course exists
        const courseExists = await Course.findById(lessonData.courseId);
        if (!courseExists) {
            return {
                success: false,
                status: 404,
                message: 'Course not found'
            };
        }

        // Check if createdBy exists if provided
        if (lessonData.createdBy) {
            if (!mongoose.Types.ObjectId.isValid(lessonData.createdBy)) {
                return {
                    success: false,
                    status: 400,
                    message: 'Invalid createdBy ID format'
                };
            }
        }

        // Create new lesson
        const lesson = new Lesson(validation.value);
        const savedLesson = await lesson.save();

        // Populate course details if available
        await savedLesson.populate('courseId', 'title category');

        return {
            success: true,
            status: 201,
            message: 'Lesson created successfully',
            data: savedLesson
        };

    } catch (error) {
        console.error('Create lesson service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Lesson creation failed',
            error: error.message
        };
    }
};

// Update lesson
export const updateLessonAsync = async (lessonId, lessonData) => {
    try {
        // Validate lessonId format
        if (!mongoose.Types.ObjectId.isValid(lessonId)) {
            return {
                success: false,
                status: 400,
                message: 'Invalid lesson ID format'
            };
        }

        // Check if lesson exists
        const existingLesson = await Lesson.findById(lessonId);
        if (!existingLesson) {
            return {
                success: false,
                status: 404,
                message: 'Lesson not found'
            };
        }

        // Validate updated lesson data (exclude system fields from validation)
        const { _id, __v, createdAt, updatedAt, ...existingData } = existingLesson.toObject();
        const validation = validateLesson({ ...existingData, ...lessonData });
        if (validation.error) {
            return {
                success: false,
                status: 400,
                message: validation.error.details[0].message
            };
        }

        // Check if courseId is valid if provided
        if (lessonData.courseId) {
            if (!mongoose.Types.ObjectId.isValid(lessonData.courseId)) {
                return {
                    success: false,
                    status: 400,
                    message: 'Invalid course ID format'
                };
            }

            // Check if course exists
            const courseExists = await Course.findById(lessonData.courseId);
            if (!courseExists) {
                return {
                    success: false,
                    status: 404,
                    message: 'Course not found'
                };
            }
        }

        // Check if createdBy is valid if provided
        if (lessonData.createdBy && !mongoose.Types.ObjectId.isValid(lessonData.createdBy)) {
            return {
                success: false,
                status: 400,
                message: 'Invalid createdBy ID format'
            };
        }

        // Update lesson
        const updatedLesson = await Lesson.findByIdAndUpdate(
            lessonId,
            { $set: lessonData },
            { new: true, runValidators: true }
        ).populate('courseId', 'title category');

        return {
            success: true,
            status: 200,
            message: 'Lesson updated successfully',
            data: updatedLesson
        };

    } catch (error) {
        console.error('Update lesson service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Lesson update failed',
            error: error.message
        };
    }
};

// Delete lesson
export const deleteLessonAsync = async (lessonId) => {
    try {
        // Validate lessonId format
        if (!mongoose.Types.ObjectId.isValid(lessonId)) {
            return {
                success: false,
                status: 400,
                message: 'Invalid lesson ID format'
            };
        }

        // Check if lesson exists
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return {
                success: false,
                status: 404,
                message: 'Lesson not found'
            };
        }

        // Delete lesson
        await Lesson.findByIdAndDelete(lessonId);

        return {
            success: true,
            status: 200,
            message: 'Lesson deleted successfully',
            data: { deletedLessonId: lessonId }
        };

    } catch (error) {
        console.error('Delete lesson service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Lesson deletion failed',
            error: error.message
        };
    }
};

// Get all lessons in a course with pagination
export const getAllLessonsInCourseAsync = async (courseId, pagination = {}) => {
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
        const courseExists = await Course.findById(courseId);
        if (!courseExists) {
            return {
                success: false,
                status: 404,
                message: 'Course not found'
            };
        }

        const {
            page = 1,
            limit = 10,
            sortBy = 'order',
            sortOrder = 'asc',
            isPublished
        } = pagination;

        // Build query object
        const query = { courseId };
        if (isPublished !== undefined) {
            query.isPublished = isPublished;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        // Execute query
        const lessons = await Lesson.find(query)
            .populate('courseId', 'title category')
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalCount = await Lesson.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);

        return {
            success: true,
            status: 200,
            message: 'Lessons retrieved successfully',
            data: {
                lessons,
                courseInfo: {
                    courseId,
                    courseTitle: courseExists.title,
                    courseCategory: courseExists.category
                },
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
        console.error('Get all lessons in course service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve lessons',
            error: error.message
        };
    }
};

// Get lesson by ID
export const getLessonByIdAsync = async (lessonId) => {
    try {
        // Validate lessonId format
        if (!mongoose.Types.ObjectId.isValid(lessonId)) {
            return {
                success: false,
                status: 400,
                message: 'Invalid lesson ID format'
            };
        }

        // Find lesson by ID
        const lesson = await Lesson.findById(lessonId)
            .populate('courseId', 'title category ageGroup');

        if (!lesson) {
            return {
                success: false,
                status: 404,
                message: 'Lesson not found'
            };
        }

        return {
            success: true,
            status: 200,
            message: 'Lesson retrieved successfully',
            data: lesson
        };

    } catch (error) {
        console.error('Get lesson by ID service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve lesson',
            error: error.message
        };
    }
};
