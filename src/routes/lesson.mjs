import { Router } from 'express';
import {
    createLesson,
    updateLesson,
    deleteLesson,
    getAllLessonsInCourse,
    getLessonById
} from '../controllers/lessonController.mjs';

const router = Router();

router.post('/lesson', createLesson);
// More specific routes first
router.get('/lesson/course/:courseId', getAllLessonsInCourse);
// More general route last
router.get('/lesson/:lessonId', getLessonById);
router.put('/lesson/:lessonId', updateLesson);
router.delete('/lesson/:lessonId', deleteLesson);

export default router;
