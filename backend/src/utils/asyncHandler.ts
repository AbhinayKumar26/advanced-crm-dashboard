import { Request, Response, NextFunction } from 'express';

// A wrapper to pass async errors directly to our centralized error handler
export const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};