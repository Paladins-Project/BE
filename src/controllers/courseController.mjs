import {
    createCourseAsync,
    getAllCoursesAsync,
    getCourseByIdAsync,
    updateCourseAsync,
    deleteCourseAsync,
    countKidsEnrolledInCourseAsync
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
        // Extract filters from request body
        const filtersInput = req.body.filters || {};
        const filters = {
            category: filtersInput.category && filtersInput.category.trim() ? filtersInput.category.trim() : undefined,
            ageGroup: filtersInput.ageGroup && filtersInput.ageGroup.trim() ? filtersInput.ageGroup.trim() : undefined,
            isPremium: filtersInput.isPremium !== null && filtersInput.isPremium !== undefined ? filtersInput.isPremium : undefined,
            isPublished: filtersInput.isPublished !== null && filtersInput.isPublished !== undefined ? filtersInput.isPublished : undefined,
            instructor: filtersInput.instructor && filtersInput.instructor.trim() ? filtersInput.instructor.trim() : undefined
        };

        // Extract pagination from request body
        const paginationInput = req.body.pagination || {};
        const pagination = {
            page: paginationInput.page ? parseInt(paginationInput.page) : 1,
            limit: paginationInput.limit ? parseInt(paginationInput.limit) : 10,
            sortBy: paginationInput.sortBy || 'createdAt',
            sortOrder: paginationInput.sortOrder || 'desc'
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

// Count kids enrolled in course
export const countKidsEnrolledInCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const result = await countKidsEnrolledInCourseAsync(courseId);
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
        console.error('Count kids enrolled in course controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


