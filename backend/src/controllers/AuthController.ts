import { Request, Response } from 'express';
import AuthService from '../services/AuthService';
import tokenBlacklistService from '../services/TokenBlacklistService';
import { AuthRequest } from '../middleware/authMiddleware';

class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, username, password } = req.body;

      // Input validation
      if (!email || !username || !password) {
        return res.status(400).json({
          status: 400,
          error: 'ValidationError',
          message: 'Email, username, and password are required',
          timestamp: new Date().toISOString()
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          status: 400,
          error: 'ValidationError',
          message: 'Password must be at least 6 characters long',
          timestamp: new Date().toISOString()
        });
      }

      const result = await this.authService.register({ email, username, password });

      return res.status(201).json({
        status: 201,
        message: 'User registered successfully',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(400).json({
        status: 400,
        error: 'RegistrationError',
        message: error instanceof Error ? error.message : 'Registration failed',
        timestamp: new Date().toISOString()
      });
    }
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password } = req.body;

      // Input validation
      if (!email || !password) {
        return res.status(400).json({
          status: 400,
          error: 'ValidationError',
          message: 'Email and password are required',
          timestamp: new Date().toISOString()
        });
      }

      const result = await this.authService.login({ email, password });

      return res.status(200).json({
        status: 200,
        message: 'Login successful',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(401).json({
        status: 401,
        error: 'AuthenticationError',
        message: error instanceof Error ? error.message : 'Authentication failed',
        timestamp: new Date().toISOString()
      });
    }
  };

  logout = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const token = req.token;

      if (token) {
        // Add token to blacklist
        tokenBlacklistService.addToken(token);
      }

      return res.status(200).json({
        status: 200,
        message: 'Logout successful',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        error: 'ServerError',
        message: 'Logout failed',
        timestamp: new Date().toISOString()
      });
    }
  };

  validateToken = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      // If we reach here, the token is valid (authMiddleware already validated it)
      const user = req.user;

      return res.status(200).json({
        status: 200,
        message: 'Token is valid',
        data: {
          user: {
            id: user!.id,
            email: user!.email,
            username: user!.username
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(401).json({
        status: 401,
        error: 'AuthenticationError',
        message: 'Invalid token',
        timestamp: new Date().toISOString()
      });
    }
  };
}

export default AuthController;
