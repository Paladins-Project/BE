import { Router } from 'express';
import { 
    createParent, 
    updateParent, 
    getParentById, 
    deleteParent, 
    getAllParent,
    getNumberOfParentByMonth,
    getNumberOfParentByYear
} from '../controllers/parentController.mjs';

const router = Router();

router.get('/parents', getAllParent);
router.get('/parents/count/month', getNumberOfParentByMonth);
router.get('/parents/count/year', getNumberOfParentByYear);
router.post('/parent/create', createParent);
router.put('/parent/:id', updateParent);
router.get('/parent/:id', getParentById);
router.delete('/parent/:id', deleteParent);

export default router;