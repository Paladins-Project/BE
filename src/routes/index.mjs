import { Router } from "express";

console.log('=== Loading route modules ===');

import homeRouter from '../routes/home.mjs';
console.log('homeRouter loaded');
import authRouter from '../routes/auth.mjs';
console.log('authRouter loaded');
import kidRouter from '../routes/kid.mjs';
console.log('kidRouter loaded');
import parentRouter from '../routes/parent.mjs';
console.log('parentRouter loaded');
import teacherRouter from '../routes/teacher.mjs';
console.log('teacherRouter loaded');
import courseRouter from '../routes/course.mjs';
console.log('courseRouter loaded');
import lessonRouter from '../routes/lesson.mjs';
console.log('lessonRouter loaded');
import testRouter from '../routes/test.mjs';
console.log('testRouter loaded');
import progressRouter from '../routes/progress.mjs';
console.log('progressRouter loaded');
import payosRouter from '../routes/payos.mjs';
console.log('payosRouter loaded');
import transactionRouter from '../routes/transaction.mjs';
console.log('transactionRouter loaded');
import reviewRouter from '../routes/review.mjs';
console.log('reviewRouter loaded');

console.log('=== Creating main router ===');
const router = Router();

console.log('=== Adding routes to main router ===');
router.use('/', homeRouter);                   
router.use('/api', authRouter);                 
router.use('/api', kidRouter);                  
router.use('/api', parentRouter);               
router.use('/api', teacherRouter);              
router.use('/api', courseRouter);               
router.use('/api', lessonRouter);               
router.use('/api', testRouter);                 
router.use('/api', progressRouter);             
router.use('/api', payosRouter);                
router.use('/api', transactionRouter);          
router.use('/api', reviewRouter);               
//router.use('/api', adminRouter);              

console.log('=== All routes added successfully ===');
console.log('=== Exporting router ===');

export default router;
