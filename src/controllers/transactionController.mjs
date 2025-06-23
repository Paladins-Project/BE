import { getRevenueByMonthAsync, getRevenueByYearAsync } from '../services/transactionService.mjs';

// Get revenue by month and year
export const getRevenue = async (req, res) => {
    try {
        const { month, year } = req.body;
        const result = await getRevenueByMonthAsync(month, year);
        
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
        console.error('Get revenue controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get revenue by year
export const getRevenueByYear = async (req, res) => {
    try {
        const { year } = req.body;
        const result = await getRevenueByYearAsync(year);
        
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
        console.error('Get revenue by year controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
