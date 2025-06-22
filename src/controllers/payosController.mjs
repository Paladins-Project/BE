import { 
    createPaymentLinkService, 
    handleWebhookService, 
    getPaymentStatusService 
} from "../services/payosService.mjs";

/**
 * Create payment link for Pro package
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
        // Call service (no need for paymentData as it's hardcoded for Pro package)
        const result = await createPaymentLinkService(userId);
        // Handle service response
        if (result.success) {
            // Return in demo-compatible format
            return res.json({
                error: 0,
                message: "Success",
                data: {
                    checkoutUrl: result.data.checkoutUrl,
                    orderCode: result.data.orderCode,
                    amount: result.data.amount,
                    description: result.data.description
                }
            });
        } else {
            return res.status(result.status).json({
                error: -1,
                message: result.message,
                data: null
            });
        }
    } catch (error) {
        console.error('Create payment link controller error:', error);
        return res.status(500).json({
            error: -1,
            message: 'Internal server error',
            data: null
        });
    }
};

/**
 * Handle PayOS webhook notifications
 */
export const handleWebhook = async (req, res) => {
    try {
        console.log("payment webhook handler");        
        // Call service to handle webhook
        const result = await handleWebhookService(req.body);        
        // PayOS expects error: 0 for success
        if (result.success) {
            return res.json({
                error: 0,
                message: "Ok",
                data: result.data || null
            });
        } else {
            // Still return success to PayOS to acknowledge receipt
            return res.json({
            error: 0,
                message: "Ok",
                data: null
        });
        }
    } catch (error) {
        console.error('Webhook handler controller error:', error);        
        return res.json({
            error: -1,
            message: "failed",
            data: null,
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
                error: -1,
                message: 'Unauthorized',
                data: null
            });
        }
        const userId = req.user._id;
        const { orderCode } = req.params;

        if (!orderCode) {
            return res.status(400).json({
                error: -1,
                message: 'Order code is required',
                data: null
            });
        }
        // Call service
        const result = await getPaymentStatusService(parseInt(orderCode), userId);
        // Handle service response
        if (result.success) {
            return res.json({
                error: 0,
                message: "ok",
                data: result.data
            });
        } else {
            return res.status(result.status).json({
                error: -1,
                message: result.message,
                data: null
            });
        }
    } catch (error) {
        console.error('Get payment status controller error:', error);
        return res.status(500).json({
            error: -1,
            message: 'failed',
            data: null
        });
    }
};