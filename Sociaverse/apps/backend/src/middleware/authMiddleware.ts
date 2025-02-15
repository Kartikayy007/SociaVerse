import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface AuthRequest extends Request {
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const authHeader = req.header('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
       res.status(401).json({
        status: 'error',
        message: 'Invalid authorization format'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
       res.status(401).json({
        status: 'error',
        message: 'No token, authorization denied'
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
     res.status(401).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Authentication failed'
    });

  }
};

export default authMiddleware;