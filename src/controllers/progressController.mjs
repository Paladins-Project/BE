import { 
    enrollCourseAsync,
    updateProgressAsync,
    deleteProgressAsync,
    getAllCourseProgressByKidIdAsync,
    getCourseProgressByIdAsync
} from '../services/progressService.mjs';

export const enrollCourse = async (req, res) => {
    try {
        const { kidId, courseId } = req.body;
        const result = await enrollCourseAsync(kidId, courseId);
        
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
        console.error('Enroll course controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

export const updateProgress = async (req, res) => {
    try {
        const { progressId } = req.params;
        const result = await updateProgressAsync(progressId, req.body);
        
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
        console.error('Update progress controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

export const deleteProgress = async (req, res) => {
    try {
        const { progressId } = req.params;
        const result = await deleteProgressAsync(progressId);
        
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
        console.error('Delete progress controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

export const getAllCourseProgressByKidId = async (req, res) => {
    try {
        const { kidId } = req.params;
        const result = await getAllCourseProgressByKidIdAsync(kidId);
        
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
        console.error('Get all course progress by kid ID controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

export const getCourseProgressById = async (req, res) => {
    try {
        const { progressId } = req.params;
        const result = await getCourseProgressByIdAsync(progressId);
        
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
        console.error('Get course progress by ID controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

