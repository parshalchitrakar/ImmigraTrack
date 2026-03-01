import { Request, Response, NextFunction } from 'express';
import { getCurrentVisaDates, getVisaHistory } from '../services/visaService';
import { getPredictions } from '../services/predictionService';

export const getCurrentVisa = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getCurrentVisaDates();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, country, page, limit } = req.query;
    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 12;
    
    const data = await getVisaHistory(category as string, country as string, pageNum, limitNum);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getPrediction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getPredictions();
    res.json(data);
  } catch (error) {
    next(error);
  }
};
