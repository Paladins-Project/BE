import { Router } from 'express';
import { getRevenue } from '../controllers/transactionController.mjs';

const router = Router();

router.post('/transaction', getRevenue);

export default router;
