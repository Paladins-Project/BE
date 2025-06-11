import { Router } from 'express';
import {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
} from '../controllers/courseController.mjs';

const router = Router();
router.post('/course/create', createCourse);
router.post('/course/all', getAllCourses);
router.get('/course/:courseId', getCourseById);
router.put('/course/:courseId', updateCourse);
router.delete('/course/:courseId', deleteCourse);             

export default router;

