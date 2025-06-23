import { Router } from 'express';
import { createParent, updateParent, getParentById, deleteParent, getAllParent } from '../controllers/parentController.mjs';

const router = Router();

router.get('/parents', getAllParent);
router.post('/parent/create', createParent);
router.put('/parent/:id', updateParent);
router.get('/parent/:id', getParentById);
router.delete('/parent/:id', deleteParent);

export default router;