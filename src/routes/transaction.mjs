import { Router } from 'express';
import { getRevenue, getRevenueByYear } from '../controllers/transactionController.mjs';

const router = Router();

router.post('/transaction', getRevenue);
router.post('/transaction/year', getRevenueByYear);

export default router;
