import { Request, Response, NextFunction } from 'express';
import { runVisaBackfill } from '../jobs/backfillVisaHistory';

export const runBackfill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startYear, endYear } = req.body;
    
    if (!startYear || !endYear) {
        res.status(400).json({ error: 'startYear and endYear are required.' });
        return;
    }

    // Run backfill in the background to not lock the HTTP cycle
    runVisaBackfill(parseInt(startYear), parseInt(endYear)).then(result => {
      console.log(`Backfill finished: ${result.totalInserted} records inserted.`);
    }).catch(err => {
      console.error('Backfill error:', err);
    });

    res.json({ message: `Backfill started for years ${startYear}-${endYear} in the background.` });
  } catch (error) {
    next(error);
  }
};
