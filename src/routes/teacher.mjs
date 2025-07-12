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
// More specific routes first
router.get('/teacher/:id/courses', getAllCoursesByTeacherId);
// More general route last
router.get('/teacher/:id', getTeacherById);
router.delete('/teacher/:id', deleteTeacher);

export default router;