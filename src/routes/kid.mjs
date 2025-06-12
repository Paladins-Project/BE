import { Router } from 'express';   
import { 
    createKid, 
    updateKid, 
    deleteKid, 
    getKidById, 
    getAllKidByParentId,
    createKidLinkedToParent
} from '../controllers/kidController.mjs';

const router = Router();

router.post('/kid/create', createKid);
router.post('/kid/create-linked-to-parent', createKidLinkedToParent);
router.put('/kid/:kidId', updateKid);
router.delete('/kid/:kidId', deleteKid);
router.get('/kid/parent/:parentId', getAllKidByParentId);
router.get('/kid/:kidId', getKidById);

export default router;