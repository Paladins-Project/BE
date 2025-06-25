import { Router } from 'express';
import { 
    createTeacher, 
    updateTeacher, 
    getTeacherById, 
    deleteTeacher, 
    getAllTeacher,
    getAllCoursesByTeacherId
} from '../controllers/teacherController.mjs';

const router = Router();

router.get('/teachers', getAllTeacher);
router.post('/teacher/create', createTeacher);
router.put('/teacher/:id', updateTeacher);
router.get('/teacher/:id', getTeacherById);
router.get('/teacher/:id/courses', getAllCoursesByTeacherId);
router.delete('/teacher/:id', deleteTeacher);

export default router;