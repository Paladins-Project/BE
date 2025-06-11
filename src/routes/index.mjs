import { Router } from "express";
import homeRouter from '../routes/home.mjs';
import authRouter from '../routes/auth.mjs';
import kidRouter from '../routes/kid.mjs';
import parentRouter from '../routes/parent.mjs';
import teacherRouter from '../routes/teacher.mjs';
import courseRouter from '../routes/course.mjs';
import lessonRouter from '../routes/lesson.mjs';
//import adminRouter from '../routes/admin.mjs';

const router = Router();

router.use('/', homeRouter);
router.use('/api', authRouter);
router.use('/api', kidRouter);
router.use('/api', parentRouter);
router.use('/api', teacherRouter);
router.use('/api', courseRouter);
router.use('/api', lessonRouter);
//router.use('/api', adminRouter);

export default router;