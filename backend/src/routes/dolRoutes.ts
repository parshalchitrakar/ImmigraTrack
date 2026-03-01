import { Router } from 'express';
import { getCurrentDol, getHistory } from '../controllers/dolController';

const router = Router();

router.get('/current', getCurrentDol);
router.get('/history', getHistory);

export default router;
