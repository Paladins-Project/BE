import { Router } from 'express';
import {
    createReview,
    updateReviewById,
    getAllReviewByCourseId,
    getReviewById,
    deleteReviewById
} from '../controllers/reviewController.mjs';

const router = Router();

router.post('/reviews', createReview);
router.get('/reviews/course/:courseId', getAllReviewByCourseId);
router.get('/reviews/:reviewId', getReviewById);
router.put('/reviews/:reviewId', updateReviewById);
router.delete('/reviews/:reviewId', deleteReviewById);

export default router;
