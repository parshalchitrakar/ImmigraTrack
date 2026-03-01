import { Request, Response, NextFunction } from 'express';
import { getAnalyticsMetrics } from '../services/analyticsService';

export const getMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, country } = req.query;
    if (!category || !country) {
      return res.status(400).json({ error: 'category and country are required' });
    }
    const data = await getAnalyticsMetrics(category as string, country as string);
    res.json(data);
  } catch (error) {
    next(error);
  }
};
