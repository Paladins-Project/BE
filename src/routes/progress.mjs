import { Router } from 'express';   
import { 
    enrollCourse,
    updateProgress,
    deleteProgress,
    getAllCourseProgressByKidId,
    getCourseProgressById
} from '../controllers/progressController.mjs';

const router = Router();

// Enroll in a course
router.post('/progress/enroll', enrollCourse);

// Get all progress by kid ID (must be before /:progressId route)
router.get('/progress/kid/:kidId', getAllCourseProgressByKidId);

// Get progress by ID
router.get('/progress/:progressId', getCourseProgressById);

// Update progress by ID
router.put('/progress/:progressId', updateProgress);

// Delete progress by ID
router.delete('/progress/:progressId', deleteProgress);

export default router;

