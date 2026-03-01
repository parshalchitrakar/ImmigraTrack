import { Router } from 'express';
import { getCurrentVisa, getHistory, getPrediction } from '../controllers/visaController';

const router = Router();

router.get('/current', getCurrentVisa);
router.get('/history', getHistory);
router.get('/prediction', getPrediction);

export default router;
