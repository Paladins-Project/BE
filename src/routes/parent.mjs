import { Router } from 'express';
import { createParent } from '../controllers/parentController.mjs';

const router = Router();

router.post('/parent/create', createParent);

export default router;