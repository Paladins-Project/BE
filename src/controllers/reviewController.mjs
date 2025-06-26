import {
    createReviewAsync,
    updateReviewByIdAsync,
    getAllReviewByCourseIdAsync,
    getReviewByIdAsync,
    deleteReviewByIdAsync
} from '../services/reviewService.mjs';

// Create a new review
export const createReview = async (req, res) => {
    try {
        const result = await createReviewAsync(req.body);
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
        console.error('Create review controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update review by ID
export const updateReviewById = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const result = await updateReviewByIdAsync(reviewId, req.body);
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
        console.error('Update review controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all reviews by course ID with pagination
export const getAllReviewByCourseId = async (req, res) => {
    try {
        const { courseId } = req.params;
        // Extract pagination from query parameters or request body
        const pagination = {
            page: req.query.page || req.body.page || 1,
            limit: req.query.limit || req.body.limit || 10,
            sortBy: req.query.sortBy || req.body.sortBy || 'createdAt',
            sortOrder: req.query.sortOrder || req.body.sortOrder || 'desc'
        };

        const result = await getAllReviewByCourseIdAsync(courseId, pagination);
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
        console.error('Get all reviews by course ID controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get review by ID
export const getReviewById = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const result = await getReviewByIdAsync(reviewId);
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
        console.error('Get review by ID controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete review by ID
export const deleteReviewById = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const result = await deleteReviewByIdAsync(reviewId);
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
        console.error('Delete review controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
