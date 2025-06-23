import { createParentAsync, updateParentByIdAsync, getParentByIDAsync, deleteParentAsync, getAllParentAsync } from '../services/parentService.mjs';

export const createParent = async (req, res) => {
    try {
        const result = await createParentAsync(req.body);
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
        console.error('Parent controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

// Update parent controller
export const updateParent = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await updateParentByIdAsync(id, req.body);
        
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
        console.error('Update parent controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

// Get parent by ID controller
export const getParentById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getParentByIDAsync(id);
        
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
        console.error('Get parent by ID controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

// Delete parent controller
export const deleteParent = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteParentAsync(id);
        
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
        console.error('Delete parent controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

// Get all parents controller
export const getAllParent = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const result = await getAllParentAsync(page, limit);
        
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
        console.error('Get all parents controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};
