import { Router } from 'express';
import { getRevenue, getRevenueByYear, getAllTransactions } from '../controllers/transactionController.mjs';

const router = Router();

router.post('/transaction', getRevenue);
router.post('/transaction/year', getRevenueByYear);
router.get('/transactions', getAllTransactions);

export default router;
