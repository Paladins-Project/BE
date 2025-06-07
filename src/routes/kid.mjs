import { Router } from 'express';   
import { createKid } from '../controllers/kidController.mjs';

const router = Router();

router.post('/kid/create', createKid);

export default router;