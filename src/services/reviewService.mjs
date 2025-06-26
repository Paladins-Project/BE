import { Review } from '../models/review.mjs';
import { Course } from '../models/course.mjs';
import { Kid } from '../models/kid.mjs';
import { Parent } from '../models/parent.mjs';
import { validateReview, validateObjectIdParam, updateReviewValidator } from '../utils/validators.mjs';
import { checkEnrollmentAsync } from '../utils/helpers.mjs';

// Create a new review
export const createReviewAsync = async (reviewData) => {
    try {
        // Validate review data
        const validation = validateReview(reviewData);
        if (validation.error) {
            return {
                success: false,
                status: 400,
                message: validation.error.details[0].message
            };
        }
        // Check if course exists
        const course = await Course.findById(reviewData.courseId);
        if (!course) {
            return {
                success: false,
                status: 404,
                message: 'Course not found'
            };
        }        
        // Check if kid or parent exists
        if (reviewData.kidId) {
            const kid = await Kid.findById(reviewData.kidId);
            if (!kid) {
                return {
                    success: false,
                    status: 404,
                    message: 'Kid not found'
                };
            }
        }
        if (reviewData.parentId) {
            const parent = await Parent.findById(reviewData.parentId);
            if (!parent) {
                return {
                    success: false,
                    status: 404,
                    message: 'Parent not found'
                };
            }
        }
        // Check enrollment before allowing review creation
        const isEnrolled = await checkEnrollmentAsync(
            reviewData.courseId, 
            reviewData.kidId, 
            reviewData.parentId
        );        
        if (!isEnrolled) {
            return {
                success: false,
                status: 403,
                message: 'Cannot create review. This account have not enrolled yet.'
            };
        }
        // Create new review
        const review = new Review(validation.value);
        const savedReview = await review.save();
        // Populate fullName based on kidId or parentId
        let populatedReview;
        if (savedReview.kidId) {
            populatedReview = await Review.findById(savedReview._id)
                .populate('courseId', 'title category')
                .populate('kidId', 'fullName');
        } else {
            populatedReview = await Review.findById(savedReview._id)
                .populate('courseId', 'title category')
                .populate('parentId', 'fullName');
        }
        return {
            success: true,
            status: 201,
            message: 'Review created successfully',
            data: populatedReview
        };
    } catch (error) {
        console.error('Create review service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Review creation failed',
            error: error.message
        };
    }
};

// Update review by ID
export const updateReviewByIdAsync = async (reviewId, updateData) => {
    try {
        // Validate reviewId format
        const idValidation = validateObjectIdParam(reviewId, 'review ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Validate update data
        const validation = updateReviewValidator(updateData);
        if (!validation.success) {
            return validation;
        }
        // Check if review exists
        const existingReview = await Review.findById(reviewId);
        if (!existingReview) {
            return {
                success: false,
                status: 404,
                message: 'Review not found'
            };
        }
        // If courseId is being updated, check if course exists
        if (updateData.courseId) {
            const course = await Course.findById(updateData.courseId);
            if (!course) {
                return {
                    success: false,
                    status: 404,
                    message: 'Course not found'
                };
            }
        }
        // If kidId is being updated, check if kid exists
        if (updateData.kidId) {
            const kid = await Kid.findById(updateData.kidId);
            if (!kid) {
                return {
                    success: false,
                    status: 404,
                    message: 'Kid not found'
                };
            }
        }
        // If parentId is being updated, check if parent exists
        if (updateData.parentId) {
            const parent = await Parent.findById(updateData.parentId);
            if (!parent) {
                return {
                    success: false,
                    status: 404,
                    message: 'Parent not found'
                };
            }
        }
        // Update review
        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        // Populate fullName based on kidId or parentId
        let populatedReview;
        if (updatedReview.kidId) {
            populatedReview = await Review.findById(updatedReview._id)
                .populate('courseId', 'title category')
                .populate('kidId', 'fullName');
        } else {
            populatedReview = await Review.findById(updatedReview._id)
                .populate('courseId', 'title category')
                .populate('parentId', 'fullName');
        }
        return {
            success: true,
            status: 200,
            message: 'Review updated successfully',
            data: populatedReview
        };
    } catch (error) {
        console.error('Update review service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Review update failed',
            error: error.message
        };
    }
};

// Get all reviews by course ID with pagination
export const getAllReviewByCourseIdAsync = async (courseId, pagination = {}) => {
    try {
        // Validate courseId format
        const idValidation = validateObjectIdParam(courseId, 'course ID');
        if (!idValidation.success) {
            return idValidation;
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
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = pagination;
        // Calculate pagination
        const skip = (page - 1) * limit;
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        // Execute query with pagination
        const reviews = await Review.find({ courseId: courseId })
            .populate('courseId', 'title category')
            .populate('kidId', 'fullName')
            .populate('parentId', 'fullName')
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(parseInt(limit));
        // Get total count for pagination
        const totalCount = await Review.countDocuments({ courseId: courseId });
        const totalPages = Math.ceil(totalCount / limit);
        return {
            success: true,
            status: 200,
            message: 'Reviews retrieved successfully',
            data: {
                reviews,
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
        console.error('Get all reviews by course ID service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve reviews',
            error: error.message
        };
    }
};

// Get review by ID
export const getReviewByIdAsync = async (reviewId) => {
    try {
        // Validate reviewId format
        const idValidation = validateObjectIdParam(reviewId, 'review ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Find review by ID
        const review = await Review.findById(reviewId)
            .populate('courseId', 'title category')
            .populate('kidId', 'fullName')
            .populate('parentId', 'fullName');
        if (!review) {
            return {
                success: false,
                status: 404,
                message: 'Review not found'
            };
        }
        return {
            success: true,
            status: 200,
            message: 'Review retrieved successfully',
            data: review
        };
    } catch (error) {
        console.error('Get review by ID service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve review',
            error: error.message
        };
    }
};

// Delete review by ID
export const deleteReviewByIdAsync = async (reviewId) => {
    try {
        // Validate reviewId format
        const idValidation = validateObjectIdParam(reviewId, 'review ID');
        if (!idValidation.success) {
            return idValidation;
        }
        // Check if review exists
        const review = await Review.findById(reviewId);
        if (!review) {
            return {
                success: false,
                status: 404,
                message: 'Review not found'
            };
        }
        // Delete review
        await Review.findByIdAndDelete(reviewId);
        return {
            success: true,
            status: 200,
            message: 'Review deleted successfully',
            data: { deletedReviewId: reviewId }
        };
    } catch (error) {
        console.error('Delete review service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Review deletion failed',
            error: error.message
        };
    }
};
