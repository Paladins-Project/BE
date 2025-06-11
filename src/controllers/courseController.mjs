import {
    createCourseAsync,
    getAllCoursesAsync,
    getCourseByIdAsync,
    updateCourseAsync,
    deleteCourseAsync,
    getCoursesByCategoryAsync
} from '../services/courseService.mjs';

// Create a new course
export const createCourse = async (req, res) => {
    try {
        const result = await createCourseAsync(req.body);
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
        console.error('Course controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all courses with optional filters and pagination
export const getAllCourses = async (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            ageGroup: req.query.ageGroup,
            isPremium: req.query.isPremium ? req.query.isPremium === 'true' : undefined,
            isPublished: req.query.isPublished ? req.query.isPublished === 'true' : undefined,
            instructor: req.query.instructor
        };

        const pagination = {
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 10,
            sortBy: req.query.sortBy || 'createdAt',
            sortOrder: req.query.sortOrder || 'desc'
        };

        const result = await getAllCoursesAsync(filters, pagination);
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
        console.error('Get all courses controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get course by ID
export const getCourseById = async (req, res) => {
    try {
        const { courseId } = req.params;
        const result = await getCourseByIdAsync(courseId);
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
        console.error('Get course by ID controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update course
export const updateCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const result = await updateCourseAsync(courseId, req.body);
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
        console.error('Update course controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete course
export const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const result = await deleteCourseAsync(courseId);
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
        console.error('Delete course controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get courses by category
export const getCoursesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const pagination = {
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 10,
            sortBy: req.query.sortBy || 'createdAt',
            sortOrder: req.query.sortOrder || 'desc'
        };

        const result = await getCoursesByCategoryAsync(category, pagination);
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
        console.error('Get courses by category controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

