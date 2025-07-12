import { Router } from 'express';
import { getHome } from '../controllers/homeController.mjs';

const router = Router();

router.get('/', getHome);

export default router; 