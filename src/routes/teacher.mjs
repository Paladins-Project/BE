import { Router } from 'express';
import { createTeacher } from '../controllers/teacherController.mjs';

const router = Router();

router.post('/teacher/create', createTeacher);

export default router;