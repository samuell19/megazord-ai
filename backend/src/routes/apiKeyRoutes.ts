import { Router } from 'express';
import ApiKeyController from '../controllers/ApiKeyController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();
const apiKeyController = new ApiKeyController();

// All routes require authentication
router.post('/', authMiddleware, apiKeyController.store);
router.get('/', authMiddleware, apiKeyController.get);
router.put('/', authMiddleware, apiKeyController.update);
router.delete('/', authMiddleware, apiKeyController.delete);

export default router;
