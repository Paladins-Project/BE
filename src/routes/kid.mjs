import { Router } from 'express';   
import { 
    createKid, 
    updateKid, 
    deleteKid, 
    getKidById, 
    getAllKidByParentId,
    createKidLinkedToParent,
    getAllKid,
    getNumberOfKidByMonth,
    getNumberOfKidByYear
} from '../controllers/kidController.mjs';

const router = Router();

router.get('/kids', getAllKid);
router.get('/kids/count/month', getNumberOfKidByMonth);
router.get('/kids/count/year', getNumberOfKidByYear);
router.get('/kid/parent/:parentId', getAllKidByParentId);
router.get('/kid/:kidId', getKidById);
router.post('/kid/parent', createKidLinkedToParent);
router.put('/kid/:kidId', updateKid);
router.delete('/kid/:kidId', deleteKid);

export default router;