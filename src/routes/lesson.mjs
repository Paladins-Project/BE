import { Router } from 'express';
import {
    createLesson,
    updateLesson,
    deleteLesson,
    getAllLessonsInCourse,
    getLessonById
} from '../controllers/lessonController.mjs';

const router = Router();

// POST /lesson - Create a new lesson
router.post('/lesson', createLesson);

// PUT /lesson/:lessonId - Update a lesson
router.put('/lesson/:lessonId', updateLesson);

// DELETE /lesson/:lessonId - Delete a lesson
router.delete('/lesson/:lessonId', deleteLesson);

// GET /lesson/course/:courseId - Get all lessons in a course
router.get('/lesson/course/:courseId', getAllLessonsInCourse);

// GET /lesson/:lessonId - Get a specific lesson by ID
router.get('/lesson/:lessonId', getLessonById);

export default router;
