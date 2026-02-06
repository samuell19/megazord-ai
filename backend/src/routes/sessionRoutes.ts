import { Router } from 'express';
import SessionController from '../controllers/SessionController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();
const sessionController = new SessionController();

// All routes require authentication
router.post('/', authMiddleware, sessionController.create);
router.get('/agent/:agentId', authMiddleware, sessionController.listByAgent);
router.get('/:id', authMiddleware, sessionController.get);
router.get('/:id/messages', authMiddleware, sessionController.getMessages);
router.put('/:id', authMiddleware, sessionController.update);
router.delete('/:id', authMiddleware, sessionController.delete);

export default router;
