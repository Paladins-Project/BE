import { 
    createKidAsync, 
    updateKidAsync, 
    deleteKidAsync, 
    getKidByIdAsync, 
    getAllKidByParentIdAsync,
    createKidLinkedToParentAsync
} from '../services/kidService.mjs';

export const createKid = async (req, res) => {
    try {
        const result = await createKidAsync(req.body);
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
        console.error('Kid controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

export const updateKid = async (req, res) => {
    try {
        const { kidId } = req.params;
        const result = await updateKidAsync(kidId, req.body);
        
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
        console.error('Update kid controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

export const deleteKid = async (req, res) => {
    try {
        const { kidId } = req.params;
        const result = await deleteKidAsync(kidId);
        
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
        console.error('Delete kid controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

export const getKidById = async (req, res) => {
    try {
        const { kidId } = req.params;
        const result = await getKidByIdAsync(kidId);
        
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
        console.error('Get kid by ID controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

export const getAllKidByParentId = async (req, res) => {
    try {
        const { parentId } = req.params;
        
        const result = await getAllKidByParentIdAsync(parentId);
        
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
        console.error('Get all kids by parent ID controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

export const createKidLinkedToParent = async (req, res) => {
    try {
        const result = await createKidLinkedToParentAsync(req.body);
        
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
        console.error('Create kid linked to parent controller error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};
