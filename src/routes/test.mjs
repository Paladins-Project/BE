import { Router } from 'express';
import {
    createTest,
    updateTest,
    deleteTest,
    getAllTestsInLesson,
    getAllTestsInCourse,
    getTestById
} from '../controllers/testController.mjs';

const router = Router();

router.post('/test', createTest);
router.get('/test/lesson/:lessonId', getAllTestsInLesson);
router.get('/test/course/:courseId', getAllTestsInCourse);
router.get('/test/:testId', getTestById);
router.put('/test/:testId', updateTest);
router.delete('/test/:testId', deleteTest);

export default router;
