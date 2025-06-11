import {
    createLessonAsync,
    updateLessonAsync,
    deleteLessonAsync,
    getAllLessonsInCourseAsync,
    getLessonByIdAsync
} from '../services/lessonService.mjs';

// Create a new lesson
export const createLesson = async (req, res) => {
    try {
        const result = await createLessonAsync(req.body);
        // Handle service response
        if (result.success) {
            return res.status(result.status).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } else {
            return res.status(result.status).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Lesson controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update lesson
export const updateLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const result = await updateLessonAsync(lessonId, req.body);
        // Handle service response
        if (result.success) {
            return res.status(result.status).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } else {
            return res.status(result.status).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Update lesson controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete lesson
export const deleteLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const result = await deleteLessonAsync(lessonId);
        // Handle service response
        if (result.success) {
            return res.status(result.status).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } else {
            return res.status(result.status).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Delete lesson controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all lessons in a course
export const getAllLessonsInCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        const pagination = {
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 10,
            sortBy: req.query.sortBy || 'order',
            sortOrder: req.query.sortOrder || 'asc',
            isPublished: req.query.isPublished ? req.query.isPublished === 'true' : undefined
        };

        const result = await getAllLessonsInCourseAsync(courseId, pagination);
        // Handle service response
        if (result.success) {
            return res.status(result.status).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } else {
            return res.status(result.status).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Get all lessons in course controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get lesson by ID
export const getLessonById = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const result = await getLessonByIdAsync(lessonId);
        // Handle service response
        if (result.success) {
            return res.status(result.status).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } else {
            return res.status(result.status).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Get lesson by ID controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
