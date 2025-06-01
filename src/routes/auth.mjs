import { Router } from 'express';
import { login, getAuthStatus, logout, discordAuth, discordCallback } from '../controllers/authController.mjs';

const router = Router();

router.post('/auth', login);
router.get('/auth/status', getAuthStatus);
router.post('/auth/logout', logout);
router.get('/auth/discord', discordAuth);
router.get('/auth/discord/redirect', discordCallback);

export default router; 