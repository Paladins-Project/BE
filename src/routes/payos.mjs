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
 * POST /api/payment/payos
 * Alternative webhook endpoint (similar to demo)
 */
router.post("/payment/payos", handleWebhook);

/**
 * GET /api/payment/status/:orderCode
 * Get payment status by orderCode
 * Requires: Authentication, valid orderCode parameter
 * Returns: Transaction status, amount, timestamps
 */
router.get("/payment/:orderCode", isAuthenticated, getPaymentStatus);

export default router;