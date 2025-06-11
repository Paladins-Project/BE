import { Router } from 'express';
import {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getCoursesByCategory
} from '../controllers/courseController.mjs';

const router = Router();
router.post('/course', createCourse);                          
router.get('/course', getAllCourses);                        
router.get('/course/:courseId', getCourseById);                
router.put('/course/:courseId', updateCourse);                 
router.delete('/course/:courseId', deleteCourse);              
router.get('/course/category/:category', getCoursesByCategory); 

export default router;

