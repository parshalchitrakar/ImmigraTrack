import { Request, Response, NextFunction } from 'express';

// Stub for future authentication logic
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Add JWT or session verification
  // For Phase 1 (MVP), we just pass through
  next();
};
