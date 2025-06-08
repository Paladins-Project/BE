import { Router } from 'express';
import { getHome } from '../controllers/homeController.mjs';

const router = Router();

router.get('/', getHome);

// Test endpoint để kiểm tra error handling
router.get('/test-error', (req, res, next) => {
    // This will trigger our error handler
    const error = new Error('Test error for JSON response');
    error.status = 400;
    next(error);
});

export default router; 