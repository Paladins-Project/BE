import { Router } from "express";
import homeRouter from '../routes/home.mjs';
import authRouter from '../routes/auth.mjs';
// import cartRouter from '../routes/cart.mjs';
// import userRouter from '../routes/user.mjs';
// import productsRouter from '../routes/products.mjs';

const router = Router();

router.use('/', homeRouter);
router.use('/api', authRouter);
// router.use('/api', cartRouter);
// router.use('/api', userRouter);
// router.use('/api', productsRouter);

export default router;