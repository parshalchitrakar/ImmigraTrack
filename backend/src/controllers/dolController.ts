import { Request, Response, NextFunction } from 'express';
import { getCurrentDolProcessing, getDolHistory } from '../services/dolService';

export const getCurrentDol = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getCurrentDolProcessing();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getDolHistory();
    res.json(data);
  } catch (error) {
    next(error);
  }
};
