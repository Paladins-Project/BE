import { Test } from '../models/test.mjs';
import { Lesson } from '../models/lesson.mjs';
import { Course } from '../models/course.mjs';
import { Teacher } from '../models/teacher.mjs';
import { validateTest, validateQuestion, validateObjectIdParam } from '../utils/validators.mjs';
import mongoose from 'mongoose';



// Create a new test
export const createTestAsync = async (testData) => {
    try {
        // Validate test data
        const validation = validateTest(testData);
        if (validation.error) {
            return {
                success: false,
                status: 400,
                message: validation.error.details[0].message
            };
        }
        // Check if lesson exists
        const lessonExists = await Lesson.findById(testData.lessonId);
        if (!lessonExists) {
            return {
                success: false,
                status: 404,
                message: 'Lesson not found'
            };
        }
        // Check if teacher exists when createdBy is provided
        if (testData.createdBy) {
            const teacherExists = await Teacher.findById(testData.createdBy);
            if (!teacherExists) {
                return {
                    success: false,
                    status: 404,
                    message: 'Teacher not found'
                };
            }
        }
        // Validate each question if provided
        if (testData.questions && testData.questions.length > 0) {
            for (let i = 0; i < testData.questions.length; i++) {
                const questionValidation = validateQuestion(testData.questions[i]);
                if (questionValidation.error) {
                    return {
                        success: false,
                        status: 400,
                        message: `Question ${i + 1}: ${questionValidation.error.details[0].message}`
                    };
                }
            }
            // Calculate total points from questions
            testData.totalPoints = testData.questions.reduce((total, question) => {
                return total + (question.points || 10);
            }, 0);
        }
        // Create new test
        const test = new Test(validation.value);
        const savedTest = await test.save();

        // Populate lesson details and teacher info
        await savedTest.populate([
            { path: 'lessonId', select: 'title courseId' },
            { path: 'createdBy', select: 'fullName specializations' }
        ]);

        return {
            success: true,
            status: 201,
            message: 'Test created successfully',
            data: savedTest
        };
    } catch (error) {
        console.error('Create test service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Test creation failed',
            error: error.message
        };
    }
};

// Update test
export const updateTestAsync = async (testId, testData) => {
    try {
        // Validate testId format
        const idValidation = validateObjectIdParam(testId, 'test ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Check if test exists
        const existingTest = await Test.findById(testId);
        if (!existingTest) {
            return {
                success: false,
                status: 404,
                message: 'Test not found'
            };
        }
        // If lessonId is being updated, check if new lesson exists
        if (testData.lessonId && testData.lessonId !== existingTest.lessonId.toString()) {
            const lessonExists = await Lesson.findById(testData.lessonId);
            if (!lessonExists) {
                return {
                    success: false,
                    status: 404,
                    message: 'Lesson not found'
                };
            }
        }
        // Check if teacher exists when createdBy is being updated
        if (testData.createdBy) {
            const teacherExists = await Teacher.findById(testData.createdBy);
            if (!teacherExists) {
                return {
                    success: false,
                    status: 404,
                    message: 'Teacher not found'
                };
            }
        }
        // Validate questions if provided
        if (testData.questions && testData.questions.length > 0) {
            for (let i = 0; i < testData.questions.length; i++) {
                const questionValidation = validateQuestion(testData.questions[i]);
                if (questionValidation.error) {
                    return {
                        success: false,
                        status: 400,
                        message: `Question ${i + 1}: ${questionValidation.error.details[0].message}`
                    };
                }
            }
            // Recalculate total points if questions are updated
            testData.totalPoints = testData.questions.reduce((total, question) => {
                return total + (question.points || 10);
            }, 0);
        }

        // Update test
        const updatedTest = await Test.findByIdAndUpdate(
            testId,
            { $set: testData },
            { new: true, runValidators: true }
        ).populate([
            { path: 'lessonId', select: 'title courseId' },
            { path: 'createdBy', select: 'fullName specializations' }
        ]);

        return {
            success: true,
            status: 200,
            message: 'Test updated successfully',
            data: updatedTest
        };

    } catch (error) {
        console.error('Update test service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Test update failed',
            error: error.message
        };
    }
};

// Delete test
export const deleteTestAsync = async (testId) => {
    try {
        // Validate testId format
        const idValidation = validateObjectIdParam(testId, 'test ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Check if test exists
        const test = await Test.findById(testId);
        if (!test) {
            return {
                success: false,
                status: 404,
                message: 'Test not found'
            };
        }
        // Delete test
        await Test.findByIdAndDelete(testId);

        return {
            success: true,
            status: 200,
            message: 'Test deleted successfully',
            data: { deletedTestId: testId }
        };
    } catch (error) {
        console.error('Delete test service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Test deletion failed',
            error: error.message
        };
    }
};

// Get all tests in a lesson with pagination
export const getAllTestsInLessonAsync = async (lessonId, pagination = {}) => {
    try {
        // Validate lessonId format
        const idValidation = validateObjectIdParam(lessonId, 'lesson ID');
        if (!idValidation.success) {
            return idValidation;
        }

        // Check if lesson exists
        const lessonExists = await Lesson.findById(lessonId).populate('courseId', 'title category');
        if (!lessonExists) {
            return {
                success: false,
                status: 404,
                message: 'Lesson not found'
            };
        }
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = pagination;

        // Build query object
        const query = { lessonId };

        // Calculate pagination
        const skip = (page - 1) * limit;
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        // Execute query
        const tests = await Test.find(query)
            .populate('lessonId', 'title courseId')
            .populate('createdBy', 'fullName specializations')
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(parseInt(limit));
        // Get total count for pagination
        const totalCount = await Test.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);
        return {
            success: true,
            status: 200,
            message: 'Tests retrieved successfully',
            data: {
                tests,
                lessonInfo: {
                    lessonId,
                    lessonTitle: lessonExists.title,
                    courseId: lessonExists.courseId?._id,
                    courseTitle: lessonExists.courseId?.title,
                    courseCategory: lessonExists.courseId?.category
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
        console.error('Get all tests in lesson service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve tests',
            error: error.message
        };
    }
};

// Get all tests in a course with pagination
export const getAllTestsInCourseAsync = async (courseId, pagination = {}) => {
    try {
        // Validate courseId format
        const idValidation = validateObjectIdParam(courseId, 'course ID');
        if (!idValidation.success) {
            return idValidation;
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
        // Get all lessons in the course first
        const lessons = await Lesson.find({ courseId }).select('_id');
        const lessonIds = lessons.map(lesson => lesson._id);

        if (lessonIds.length === 0) {
            return {
                success: true,
                status: 200,
                message: 'No tests found in this course',
                data: {
                    tests: [],
                    courseInfo: {
                        courseId,
                        courseTitle: courseExists.title,
                        courseCategory: courseExists.category
                    },
                    pagination: {
                        currentPage: 1,
                        totalPages: 0,
                        totalItems: 0,
                        itemsPerPage: parseInt(pagination.limit || 10),
                        hasNextPage: false,
                        hasPrevPage: false
                    }
                }
            };
        }
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = pagination;

        // Build query object
        const query = { lessonId: { $in: lessonIds } };
        // Calculate pagination
        const skip = (page - 1) * limit;
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        // Execute query
        const tests = await Test.find(query)
            .populate('lessonId', 'title courseId')
            .populate('createdBy', 'fullName specializations')
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(parseInt(limit));
        // Get total count for pagination
        const totalCount = await Test.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);
        return {
            success: true,
            status: 200,
            message: 'Tests retrieved successfully',
            data: {
                tests,
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
        console.error('Get all tests in course service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve tests',
            error: error.message
        };
    }
};

// Get test by ID
export const getTestByIdAsync = async (testId) => {
    try {
        // Validate testId format
        const idValidation = validateObjectIdParam(testId, 'test ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Find test by ID
        const test = await Test.findById(testId)
            .populate('lessonId', 'title courseId')
            .populate('createdBy', 'fullName specializations');
        if (!test) {
            return {
                success: false,
                status: 404,
                message: 'Test not found'
            };
        }
        return {
            success: true,
            status: 200,
            message: 'Test retrieved successfully',
            data: test
        };
    } catch (error) {
        console.error('Get test by ID service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve test',
            error: error.message
        };
    }
};
