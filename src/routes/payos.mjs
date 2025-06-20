// src/routes/payos.mjs - PayOS Payment Routes
import { Router } from "express";
import { 
    createPaymentLink, 
    handleWebhook, 
    getPaymentStatus 
} from "../controllers/payosController.mjs";
import { isAuthenticated } from "../middleware/auth.mjs";

const router = Router();

/**
 * POST /api/payment/create-link
 * Create payment link for Pro package (60,000 VND)
 * Requires: Authentication
 * Body: None (hardcoded Pro package data)
 */
router.post("/payment/create-link", isAuthenticated, createPaymentLink);

/**
 * GET /api/payment/status/:orderCode
 * Get payment status by order code
 * Requires: Authentication, valid orderCode parameter
 * Returns: Transaction status, amount, timestamps
 */
router.get("/payment/status/:orderCode", isAuthenticated, getPaymentStatus);

/**
 * POST /api/payment/webhook
 * Handle PayOS webhook notifications
 * Requires: None (external service callback)
 * Security: Webhook signature verification in service layer
 * Note: Always returns 200 to prevent PayOS retries
 */
router.post("/payment/webhook", handleWebhook);

export default router;