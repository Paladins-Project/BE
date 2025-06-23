import { Router } from 'express';   
import { 
    createKid, 
    updateKid, 
    deleteKid, 
    getKidById, 
    getAllKidByParentId,
    createKidLinkedToParent,
    getAllKid
} from '../controllers/kidController.mjs';

const router = Router();

router.get('/kids', getAllKid);
router.get('/kid/parent/:parentId', getAllKidByParentId);
router.get('/kid/:kidId', getKidById);
router.post('/kid/parent', createKidLinkedToParent);
router.put('/kid/:kidId', updateKid);
router.delete('/kid/:kidId', deleteKid);

export default router;