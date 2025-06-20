// src/routes/paymentRoutes.mjs
import { Router } from "express";
import { 
    createPaymentLink, 
    handleWebhook, 
    getPaymentStatus 
} from "../controllers/payosController.mjs";
import { isAuthenticated } from "../middleware/auth.mjs";

const router = Router();

// Create payment link - requires authentication
router.post("/payos/create-link", isAuthenticated, createPaymentLink);

// Get payment status by order code - requires authentication
router.get("/payos/status/:orderCode", isAuthenticated, getPaymentStatus);

// Handle webhook from PayOS - no authentication required (external service)
router.post("/payos/webhook", handleWebhook);

export default router;