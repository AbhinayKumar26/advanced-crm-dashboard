import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiResponse';
import User from '../models/User';

// Extend Express Request object to include the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check if token exists in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized, no token provided'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    
    // Fetch user and attach to the request object (exclude password hash)
    req.user = await User.findById(decoded.id).select('-passwordHash');
    
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized, user no longer exists'));
    }
    
    next();
  } catch (error) {
    return next(new ApiError(401, 'Not authorized, token failed or expired'));
  }
};