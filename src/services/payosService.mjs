import dotenv from 'dotenv';
import PayOS from "@payos/node";
import { Transaction } from '../models/transaction.mjs';
import { Parent } from '../models/parent.mjs';
import { validatePaymentRequest, validateWebhookData, validateOrderCode, validateObjectIdParam } from '../utils/validators.mjs';
import { generateUniqueOrderCode } from '../utils/helpers.mjs';
import mongoose from 'mongoose';

dotenv.config();

// Initialize PayOS instance
const payOS = new PayOS(
    process.env.PAYOS_CLIENT_ID, 
    process.env.PAYOS_API_KEY, 
    process.env.PAYOS_CHECKSUM_KEY
);

// Payment configuration - can be moved to environment variables or database
const PAYMENT_CONFIG = {
    PRO_PLAN: {
        amount: 60000,
        description: "Pro Package Upgrade",
        durationDays: 30
    },
    FRONTEND_URL: `http://localhost:${process.env.FE_PORT || 3000}`,
    BACKEND_URL: `http://localhost:${process.env.PORT || 8386}`
};

/**
 * Create payment link and transaction record for Pro package
 * @param {string} userId - User ID from authenticated request
 * @returns {Object} Service response object
 */
export const createPaymentLinkService = async (userId) => {
    try {
        // Validate user ID
        const userIdValidation = validateObjectIdParam(userId, 'user ID');
        if (!userIdValidation.success) {
            return userIdValidation;
        }        
        // Generate unique order code
        const orderCode = await generateUniqueOrderCode();        
        // Prepare payment configuration for Pro package
        const paymentConfig = {
            amount: PAYMENT_CONFIG.PRO_PLAN.amount,
            description: PAYMENT_CONFIG.PRO_PLAN.description,
            orderCode: orderCode,
            returnUrl: `${PAYMENT_CONFIG.FRONTEND_URL}/payment-success`,
            cancelUrl: `${PAYMENT_CONFIG.FRONTEND_URL}/payment-cancelled`
        };        
        // Start database transaction for atomicity
        const session = await mongoose.startSession();
        session.startTransaction();        
        try {
            // Create transaction record
            const newTransaction = new Transaction({
                userId: userId,
                orderCode: orderCode,
                amount: paymentConfig.amount,
                description: paymentConfig.description,
                status: 'PENDING'
            });
            await newTransaction.save({ session });
            // Create PayOS payment link
            const paymentLink = await payOS.createPaymentLink(paymentConfig);
            // Commit transaction
            await session.commitTransaction();
            return {
                success: true,
                status: 201,
                message: 'Payment link created successfully',
                data: {
                    checkoutUrl: paymentLink.checkoutUrl,
                    orderCode: orderCode,
                    amount: paymentConfig.amount,
                    description: paymentConfig.description
                }
            };
        } catch (error) {
            // Rollback transaction on error
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error('Create payment link service error:', error);        
        // Handle specific PayOS errors
        if (error.code === 'INVALID_PARAMETER') {
            return {
                success: false,
                status: 400,
                message: 'Invalid payment parameters',
                error: error.message
            };
        }
        if (error.code === 'UNAUTHORIZED') {
            return {
                success: false,
                status: 401,
                message: 'PayOS authentication failed',
                error: error.message
            };
        }
        return {
            success: false,
            status: 500,
            message: 'Failed to create payment link',
            error: error.message
        };
    }
};

/**
 * Handle PayOS webhook securely
 * @param {Object} webhookBody - Webhook request body
 * @returns {Object} Service response object
 */
export const handleWebhookService = async (webhookBody) => {
    try {
        // Verify webhook data using PayOS verification
        let webhookData;
        try {
            webhookData = payOS.verifyPaymentWebhookData(webhookBody);
        } catch (error) {
            console.error('Webhook verification error:', error);
            return {
                success: false,
                status: 401,
                message: 'Webhook signature verification failed'
            };
        }
        const { orderCode, code, desc, description } = webhookData;        
        // Handle test transactions (similar to demo)
        if (description && ["Ma giao dich thu nghiem", "VQRIO123"].includes(description)) {
            return {
                success: true,
                status: 200,
                message: 'Test transaction acknowledged',
                data: webhookData
            };
        }        
        // Validate order code
        const orderCodeValidation = validateOrderCode(orderCode);
        if (orderCodeValidation.error) {
            return {
                success: false,
                status: 400,
                message: orderCodeValidation.error.details[0].message
            };
        }
        // Find transaction
        const transaction = await Transaction.findOne({ orderCode });
        if (!transaction) {
            return {
                success: false,
                status: 404,
                message: 'Transaction not found'
            };
        }
        // Skip if already processed
        if (transaction.status === 'SUCCESS' || transaction.status === 'FAILED') {
            return {
                success: true,
                status: 200,
                message: 'Transaction already processed'
            };
        }
        // Start database transaction for atomicity
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            if (code === "00") {
                // Payment successful
                transaction.status = 'SUCCESS';
                await transaction.save({ session });
                // Update parent subscription
                const parent = await Parent.findOne({ userId: transaction.userId }).session(session);
                if (parent) {
                    const newExpiryDate = new Date();
                    newExpiryDate.setDate(newExpiryDate.getDate() + PAYMENT_CONFIG.PRO_PLAN.durationDays);
                    parent.subscriptionType = 'premium';
                    parent.subscriptionExpiry = newExpiryDate;
                    await parent.save({ session });
                    console.log(`Premium subscription activated for user: ${parent.userId}`);
                } else {
                    console.warn(`Parent not found for user ID: ${transaction.userId}`);
                }
                await session.commitTransaction();
                return {
                    success: true,
                    status: 200,
                    message: 'Payment processed successfully',
                    data: {
                        orderCode,
                        status: 'SUCCESS',
                        amount: transaction.amount
                    }
                };
            } else {
                // Payment failed or cancelled
                transaction.status = code === "01" ? 'CANCELLED' : 'FAILED';
                await transaction.save({ session });
                await session.commitTransaction();
                return {
                    success: true,
                    status: 200,
                    message: 'Payment failure processed',
                    data: {
                        orderCode,
                        status: transaction.status,
                        reason: desc || 'Payment failed'
                    }
                };
            }
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error('Webhook handling service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to process webhook',
            error: error.message
        };
    }
};

/**
 * Get payment status by order code
 * @param {number} orderCode - Order code to check
 * @param {string} userId - User ID for authorization
 * @returns {Object} Service response object
 */
export const getPaymentStatusService = async (orderCode, userId) => {
    try {
        // Validate inputs
        const userIdValidation = validateObjectIdParam(userId, 'user ID');
        if (!userIdValidation.success) {
            return userIdValidation;
        }
        const orderCodeValidation = validateOrderCode(orderCode);
        if (orderCodeValidation.error) {
            return {
                success: false,
                status: 400,
                message: orderCodeValidation.error.details[0].message
            };
        }
        
        // Get payment information from PayOS
        let paymentInfo;
        try {
            paymentInfo = await payOS.getPaymentLinkInformation(orderCode);
        } catch (error) {
            console.log('PayOS API error:', error);
            // If PayOS fails, fallback to local database
        }
        
        // Find transaction with user verification
        const transaction = await Transaction.findOne({ 
            orderCode, 
            userId 
        });
        
        if (!transaction) {
            return {
                success: false,
                status: 404,
                message: 'Transaction not found or unauthorized'
            };
        }
        
        // Sync status from PayOS if available
        if (paymentInfo && paymentInfo.status) {
            // Update local transaction status based on PayOS status
            if (paymentInfo.status === 'PAID' && transaction.status !== 'SUCCESS') {
                transaction.status = 'SUCCESS';
                await transaction.save();
                
                // Update parent subscription if not already done
                const parent = await Parent.findOne({ userId: transaction.userId });
                if (parent && parent.subscriptionType !== 'premium') {
                    const newExpiryDate = new Date();
                    newExpiryDate.setDate(newExpiryDate.getDate() + PAYMENT_CONFIG.PRO_PLAN.durationDays);
                    parent.subscriptionType = 'premium';
                    parent.subscriptionExpiry = newExpiryDate;
                    await parent.save();
                }
            } else if (paymentInfo.status === 'CANCELLED' && transaction.status === 'PENDING') {
                transaction.status = 'CANCELLED';
                await transaction.save();
            }
        }
        
        return {
            success: true,
            status: 200,
            message: 'Payment status retrieved successfully',
            data: {
                orderCode: transaction.orderCode,
                amount: transaction.amount,
                status: transaction.status,
                payosStatus: paymentInfo?.status,
                createdAt: transaction.createdAt,
                updatedAt: transaction.updatedAt
            }
        };
    } catch (error) {
        console.error('Get payment status service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Failed to retrieve payment status',
            error: error.message
        };
    }
};