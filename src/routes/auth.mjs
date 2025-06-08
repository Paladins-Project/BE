import { Router } from 'express';
import { login, getAuthStatus, logout, changePassword, sendVerificationEmail, verifyEmail, forgotPassword } from '../controllers/authController.mjs';
const router = Router();

router.post('/auth', login);
router.get('/auth/status', getAuthStatus);
router.post('/auth/logout', logout);
router.put('/auth/change-password', changePassword);
router.post('/auth/send-verification', sendVerificationEmail);
router.post('/auth/verify-email', verifyEmail);
router.post('/auth/forgot-password', forgotPassword);

// router.get('/auth/discord', discordAuth);
// router.get('/auth/discord/redirect', discordCallback);

export default router; 