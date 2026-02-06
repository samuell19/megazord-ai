import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import AuthController from '../controllers/AuthController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();
const authController = new AuthController();

// Rate limiter for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    status: 429,
    error: 'TooManyRequests',
    message: 'Too many authentication attempts, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public routes (with rate limiting)
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);
router.get('/validate', authMiddleware, authController.validateToken);

export default router;
