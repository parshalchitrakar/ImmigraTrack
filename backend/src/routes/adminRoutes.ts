import { Router, Request, Response, NextFunction } from 'express';
import { runBackfill } from '../controllers/adminController';

const router = Router();

const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization'];
  if (token === `Bearer ${process.env.ADMIN_TOKEN}`) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

router.post('/backfill', adminAuth, runBackfill);

export default router;
