import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/AuthService';
import tokenBlacklistService from '../services/TokenBlacklistService';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: User;
  token?: string;
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Check if token is blacklisted
    if (tokenBlacklistService.isBlacklisted(token)) {
      res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: 'Token has been invalidated',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Validate token
    const authService = new AuthService();
    const user = await authService.validateToken(token);

    // Attach user and token to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    res.status(401).json({
      status: 401,
      error: 'Unauthorized',
      message: error instanceof Error ? error.message : 'Authentication failed',
      timestamp: new Date().toISOString()
    });
  }
};

export default authMiddleware;
export { AuthRequest };
