import{ createParentAsync } from '../services/parentService.mjs';

export const createParent = async (req, res) => {
    try {
        const result = await createParentAsync(req.body);
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
        console.error('Parent controller error:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
};
