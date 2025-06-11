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
router.put('/lesson/:lessonId', updateLesson);
router.delete('/lesson/:lessonId', deleteLesson);
router.get('/lesson/course/:courseId', getAllLessonsInCourse);
router.get('/lesson/:lessonId', getLessonById);

export default router;
