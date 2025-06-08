import { createTeacherAsync } from '../services/teacherService.mjs';

export const createTeacher = async (req, res) => {
    try {
        const result = await createTeacherAsync(req.body);
        // Handle service response
        if (result.success) {
            return res.status(result.status).json({
                message: result.message,
                data: result.data
            });
        } else {
            return res.status(result.status).json({
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Teacher controller error:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
};
