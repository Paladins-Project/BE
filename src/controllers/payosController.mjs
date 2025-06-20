import { 
    createPaymentLinkService, 
    handleWebhookService, 
    getPaymentStatusService 
} from "../services/payosService.mjs";

/**
 * Create payment link for premium subscription
 */
export const createPaymentLink = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Extract user ID correctly (using _id not id)
        const userId = req.user._id;
        
        // Extract optional payment customization from request body
        const paymentData = req.body || {};

        // Call service
        const result = await createPaymentLinkService(userId, paymentData);

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
        console.error('Create payment link controller error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Handle PayOS webhook notifications
 */
export const handleWebhook = async (req, res) => {
    try {
        // Extract webhook signature from headers if available
        const webhookSignature = req.headers['x-payos-signature'] || 
                                req.headers['payos-signature'] || 
                                null;

        // Call service to handle webhook
        const result = await handleWebhookService(req.body, webhookSignature);

        // Always return 200 to PayOS to acknowledge receipt
        // This prevents PayOS from retrying webhook calls
        return res.status(200).json({
            error: 0,
            message: "Success",
            success: result.success,
            details: result.success ? result.message : result.error
        });

    } catch (error) {
        console.error('Webhook handler controller error:', error);
        
        // Still return 200 to PayOS to prevent retries
        // Log the error for debugging
        return res.status(200).json({
            error: 1,
            message: "Internal error occurred",
            success: false
        });
    }
};

/**
 * Get payment status by order code
 */
export const getPaymentStatus = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const userId = req.user._id;
        const { orderCode } = req.params;

        if (!orderCode) {
            return res.status(400).json({
                success: false,
                message: 'Order code is required'
            });
        }

        // Call service
        const result = await getPaymentStatusService(parseInt(orderCode), userId);

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
        console.error('Get payment status controller error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};