import { Router } from 'express';
import AgentController from '../controllers/AgentController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();
const agentController = new AgentController();

// All routes require authentication
router.get('/models', authMiddleware, agentController.getAvailableModels);
router.post('/', authMiddleware, agentController.create);
router.get('/', authMiddleware, agentController.list);
router.get('/:id', authMiddleware, agentController.get);
router.put('/:id', authMiddleware, agentController.update);
router.delete('/:id', authMiddleware, agentController.delete);
router.post('/:id/message', authMiddleware, agentController.sendMessage);

export default router;
