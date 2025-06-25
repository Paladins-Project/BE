import { 
    createTeacherAsync, 
    updateTeacherAsync, 
    getTeacherByIDAsync, 
    deleteTeacherAsync, 
    getAllTeacherAsync,
    getAllCourseCreatedByTeacherId
} from '../services/teacherService.mjs';

export const createTeacher = async (req, res) => {
    try {
        const result = await createTeacherAsync(req.body);
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
        console.error('Teacher controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

// Update teacher controller
export const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await updateTeacherAsync(id, req.body);
        
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
        console.error('Update teacher controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

// Get teacher by ID controller
export const getTeacherById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getTeacherByIDAsync(id);
        
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
        console.error('Get teacher by ID controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

// Delete teacher controller
export const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteTeacherAsync(id);
        
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
        console.error('Delete teacher controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

// Get all teachers controller
export const getAllTeacher = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const result = await getAllTeacherAsync(page, limit);
        
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
        console.error('Get all teachers controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

// Get all courses created by teacher ID controller
export const getAllCoursesByTeacherId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getAllCourseCreatedByTeacherId(id);
        
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
        console.error('Get courses by teacher ID controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};
