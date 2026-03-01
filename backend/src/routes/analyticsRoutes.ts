import { Router } from 'express';
import { getMetrics } from '../controllers/analyticsController';

const router = Router();

router.get('/metrics', getMetrics);

export default router;
