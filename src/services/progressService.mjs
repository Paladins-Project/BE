import { CourseProgress } from '../models/courseProgress.mjs';
import { Kid } from '../models/kid.mjs';
import { Course } from '../models/course.mjs';
import { validateObjectIdParam } from '../utils/validators.mjs';
import { checkSubcriptionByKidId, checkLessonExist, checkTestExist } from '../utils/helpers.mjs';

export const enrollCourseAsync = async (kidId, courseId) => {
    try {
        const kidIdValidation = validateObjectIdParam(kidId, 'kid ID');
        if (!kidIdValidation.success) {
            return kidIdValidation;
        }
        const courseIdValidation = validateObjectIdParam(courseId, 'course ID');
        if (!courseIdValidation.success) {
            return courseIdValidation;
        }
        const kid = await Kid.findById(kidId);
        if (!kid) {
            return {
                success: false,
                status: 404,
                message: 'Kid not found'
            };
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return {
                success: false,
                status: 404,
                message: 'Course not found'
            };
        }
        const existingEnrollment = await CourseProgress.findOne({
            kidId: kidId,
            courseId: courseId
        });
        if (existingEnrollment) {
            return {
                success: false,
                status: 400,
                message: 'Kid is already enrolled in this course'
            };
        }
        if (course.isPremium) {
            // Course is premium - check subscription status
            const subscriptionCheck = await checkSubcriptionByKidId(kidId);
            if (!subscriptionCheck.success) {
                return subscriptionCheck;
            }
        }        
        // Create enrollment record (for both free and premium courses after validation)
        const courseProgress = new CourseProgress({
            courseId: courseId,
            kidId: kidId,
            status: false,
            testResults: [],
            lessonCompleted: []
        });
        const savedProgress = await courseProgress.save();
        return {
            success: true,
            status: 201,
            message: `Successfully enrolled in ${course.isPremium ? 'premium' : 'free'} course`,
            data: savedProgress
        };
    } catch (error) {
        console.error('Enroll course service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Course enrollment failed',
            error: error.message
        };
    }
};

export const updateProgressAsync = async (progressId, updateData) => {
    try {
        // Validate progressId format
        const idValidation = validateObjectIdParam(progressId, 'progress ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Check if course progress exists
        const existingProgress = await CourseProgress.findById(progressId);
        if (!existingProgress) {
            return {
                success: false,
                status: 404,
                message: 'Course progress not found'
            };
        }
        // Extract arrays and exclude courseId/kidId from updates to prevent changing core relationships
        const { testResults, lessonCompleted, courseId, kidId, status } = updateData;        
        const updateOperations = {};        
        // Validate and handle testResults if provided
        if (testResults && Array.isArray(testResults) && testResults.length > 0) {
            // Validate each testId
            for (const testResult of testResults) {
                if (testResult.testId) {
                    const testCheck = await checkTestExist(testResult.testId);
                    if (!testCheck.success) {
                        return {
                            success: false,
                            status: 400,
                            message: `Invalid test ID ${testResult.testId}: ${testCheck.message}`
                        };
                    }
                }
            }
            updateOperations.$push = updateOperations.$push || {};
            updateOperations.$push.testResults = { $each: testResults };
        }        
        // Validate and handle lessonCompleted if provided
        if (lessonCompleted && Array.isArray(lessonCompleted) && lessonCompleted.length > 0) {
            // Validate each lessonId
            for (const lesson of lessonCompleted) {
                if (lesson.lessonId) {
                    const lessonCheck = await checkLessonExist(lesson.lessonId);
                    if (!lessonCheck.success) {
                        return {
                            success: false,
                            status: 400,
                            message: `Invalid lesson ID ${lesson.lessonId}: ${lessonCheck.message}`
                        };
                    }
                }
            }
            updateOperations.$push = updateOperations.$push || {};
            updateOperations.$push.lessonCompleted = { $each: lessonCompleted };
        }
        // Handle status update if provided
        if (status !== undefined) {
            updateOperations.$set = { status };
        }
        // If no update operations, return error
        if (Object.keys(updateOperations).length === 0) {
            return {
                success: false,
                status: 400,
                message: 'No valid update data provided'
            };
        }
        // Update course progress
        const updatedProgress = await CourseProgress.findByIdAndUpdate(
            progressId,
            updateOperations,
            { new: true, runValidators: true }
        ).populate([
            { path: 'courseId', select: 'title category ageGroup isPremium' },
            { path: 'kidId', select: 'fullName dateOfBirth gender' },
            { path: 'testResults.testId', select: 'title description' },
            { path: 'lessonCompleted.lessonId', select: 'title description' }
        ]);
        return {
            success: true,
            status: 200,
            message: 'Course progress updated successfully',
            data: updatedProgress
        };
    } catch (error) {
        console.error('Update progress service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Course progress update failed',
            error: error.message
        };
    }
};

export const deleteProgressAsync = async (progressId) => {
    try {
        // Validate progressId format
        const idValidation = validateObjectIdParam(progressId, 'progress ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Check if course progress exists
        const existingProgress = await CourseProgress.findById(progressId);
        if (!existingProgress) {
            return {
                success: false,
                status: 404,
                message: 'Course progress not found'
            };
        }
        // Delete course progress
        await CourseProgress.findByIdAndDelete(progressId);
        return {
            success: true,
            status: 200,
            message: 'Course progress deleted successfully',
            data: { deletedProgressId: progressId }
        };
    } catch (error) {
        console.error('Delete progress service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Course progress deletion failed',
            error: error.message
        };
    }
};

export const getAllCourseProgressByKidIdAsync = async (kidId) => {
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
        // Find all course progress records for this kid
        const courseProgressList = await CourseProgress.find({ kidId: kidId })
            .populate([
                { path: 'courseId', select: 'title category ageGroup isPremium' },
                { path: 'kidId', select: 'fullName dateOfBirth gender' },
                { path: 'testResults.testId', select: 'title description' },
                { path: 'lessonCompleted.lessonId', select: 'title description' }
            ])
            .sort({ createdAt: -1 }); // Sort by newest first
        return {
            success: true,
            status: 200,
            message: 'Course progress records retrieved successfully',
            data: {
                kidInfo: {
                    kidId: kid._id,
                    fullName: kid.fullName,
                    dateOfBirth: kid.dateOfBirth,
                    gender: kid.gender
                },
                courseProgressList: courseProgressList,
                totalCount: courseProgressList.length
            }
        };
    } catch (error) {
        console.error('Get all course progress by kid ID service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve course progress records',
            error: error.message
        };
    }
};

export const getCourseProgressByIdAsync = async (progressId) => {
    try {
        const idValidation = validateObjectIdParam(progressId, 'progress ID');
        if (!idValidation.success) {
            return idValidation;
        }
        const courseProgress = await CourseProgress.findById(progressId)
            .populate([
                { path: 'courseId', select: 'title category ageGroup isPremium' },
                { path: 'kidId', select: 'fullName dateOfBirth gender' },
                { path: 'testResults.testId', select: 'title description' },
                { path: 'lessonCompleted.lessonId', select: 'title description' }
            ]);
        if (!courseProgress) {
            return {
                success: false,
                status: 404,
                message: 'Course progress not found'
            };
        }
        return {
            success: true,
            status: 200,
            message: 'Course progress retrieved successfully',
            data: courseProgress
        };
    } catch (error) {
        console.error('Get course progress by ID service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve course progress',
            error: error.message
        };
    }
};

