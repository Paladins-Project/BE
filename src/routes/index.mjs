import { Router } from "express";
import homeRouter from '../routes/home.mjs';
import authRouter from '../routes/auth.mjs';
import kidRouter from '../routes/kid.mjs';
import parentRouter from '../routes/parent.mjs';
//import adminRouter from '../routes/admin.mjs';

const router = Router();

router.use('/', homeRouter);
router.use('/api', authRouter);
router.use('/api', kidRouter);
router.use('/api', parentRouter);
//router.use('/api', adminRouter);

export default router;