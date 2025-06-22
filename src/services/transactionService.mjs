import { Transaction } from '../models/transaction.mjs';

export const getRevenueByMonth = async (month, year) => {
    try {
        // Convert to numbers and validate
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);        
        if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > 3000) {
            return {
                success: false,
                status: 400,
                message: 'Invalid month or year. Month must be 1-12, year must be valid numbers'
            };
        }
        // Create date range for the specified month
        const startDate = new Date(yearNum, monthNum - 1, 1); // month - 1 because Date constructor uses 0-based months
        const endDate = new Date(yearNum, monthNum, 1); // First day of next month
        // Count successful transactions in the specified month
        const successfulTransactionCount = await Transaction.countDocuments({
            status: 'SUCCESS',
            createdAt: {
                $gte: startDate,
                $lt: endDate
            }
        }); 
        const revenue = successfulTransactionCount * 60000;
        return {
            success: true,
            status: 200,
            message: 'Revenue calculated successfully',
            data: {
                month: monthNum,
                year: yearNum,
                successfulTransactions: successfulTransactionCount,
                revenue
            }
        };
    } catch (error) {
        console.error('Get revenue by month service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to calculate revenue',
            error: error.message
        };
    }
};
