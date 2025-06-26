import { Transaction } from '../models/transaction.mjs';

export const getRevenueByMonthAsync = async (month, year) => {
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

export const getRevenueByYearAsync = async (year) => {
    try {
        // Convert to number and validate
        const yearNum = parseInt(year, 10);        
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > 3000) {
            return {
                success: false,
                status: 400,
                message: 'Invalid year. Year must be a valid number'
            };
        }
        // Create date range for the specified year
        const startDate = new Date(yearNum, 0, 1); // First day of the year
        const endDate = new Date(yearNum + 1, 0, 1); // First day of next year
        // Count successful transactions in the specified year
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
                year: yearNum,
                successfulTransactions: successfulTransactionCount,
                revenue
            }
        };
    } catch (error) {
        console.error('Get revenue by year service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to calculate revenue',
            error: error.message
        };
    }

    
};

export const getAllTransactionAsync = async (page = 1, limit = 10) => {
    try {
        // Convert page and limit to numbers and set defaults
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;
        // Get total count for pagination info
        const totalTransactions = await Transaction.countDocuments();        
        // Calculate total pages
        const totalPages = Math.ceil(totalTransactions / limitNumber);
        // Use aggregation to join with User and Parent collections
        const transactions = await Transaction.aggregate([
            {
                $sort: { createdAt: -1 } // Sort by newest first
            },
            {
                $skip: skip
            },
            {
                $limit: limitNumber
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $lookup: {
                    from: "parents",
                    localField: "userId",
                    foreignField: "userId",
                    as: "parentDetails"
                }
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    orderCode: 1,
                    amount: 1,
                    description: 1,
                    paymentMethod: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    userEmail: { $arrayElemAt: ["$userDetails.email", 0] },
                    userRole: { $arrayElemAt: ["$userDetails.role", 0] },
                    parentFullName: { $arrayElemAt: ["$parentDetails.fullName", 0] },
                    parentSubscriptionExpiry: { $arrayElemAt: ["$parentDetails.subscriptionExpiry", 0] }
                }
            }
        ]);
        return {
            success: true,
            status: 200,
            message: 'Transactions retrieved successfully',
            data: {
                transactions,
                pagination: {
                    currentPage: pageNumber,
                    totalPages: totalPages,
                    totalItems: totalTransactions,
                    itemsPerPage: limitNumber,
                    itemsReturned: transactions.length,
                    hasNextPage: pageNumber < totalPages,
                    hasPreviousPage: pageNumber > 1,
                    nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
                    previousPage: pageNumber > 1 ? pageNumber - 1 : null
                }
            }
        };
    } catch (error) {
        console.error('Get all transactions service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve transactions',
            error: error.message
        };
    }
};
