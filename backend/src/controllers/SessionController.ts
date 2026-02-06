import { Response } from 'express';
import SessionService from '../services/SessionService';
import MessageRepository from '../repositories/MessageRepository';
import { AuthRequest } from '../middleware/authMiddleware';

class SessionController {
  private sessionService: SessionService;
  private messageRepository: MessageRepository;

  constructor() {
    this.sessionService = new SessionService();
    this.messageRepository = new MessageRepository();
  }

  create = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { agentId, title } = req.body;
      const userId = req.user!.id;

      if (!agentId) {
        return res.status(400).json({
          status: 400,
          error: 'ValidationError',
          message: 'Agent ID is required',
          timestamp: new Date().toISOString()
        });
      }

      const session = await this.sessionService.create(userId, agentId, title);

      return res.status(201).json({
        status: 201,
        message: 'Session created successfully',
        data: session,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Access denied')) {
        return res.status(403).json({
          status: 403,
          error: 'Forbidden',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(400).json({
        status: 400,
        error: 'SessionError',
        message: error instanceof Error ? error.message : 'Failed to create session',
        timestamp: new Date().toISOString()
      });
    }
  };

  listByAgent = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { agentId } = req.params;
      const userId = req.user!.id;

      const sessions = await this.sessionService.findByAgent(agentId, userId);

      return res.status(200).json({
        status: 200,
        message: 'Sessions retrieved successfully',
        data: sessions,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Access denied')) {
        return res.status(403).json({
          status: 403,
          error: 'Forbidden',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(500).json({
        status: 500,
        error: 'ServerError',
        message: 'Failed to retrieve sessions',
        timestamp: new Date().toISOString()
      });
    }
  };

  get = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const session = await this.sessionService.findById(id, userId);

      if (!session) {
        return res.status(404).json({
          status: 404,
          error: 'NotFound',
          message: 'Session not found',
          timestamp: new Date().toISOString()
        });
      }

      return res.status(200).json({
        status: 200,
        message: 'Session retrieved successfully',
        data: session,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Access denied')) {
        return res.status(403).json({
          status: 403,
          error: 'Forbidden',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(500).json({
        status: 500,
        error: 'ServerError',
        message: 'Failed to retrieve session',
        timestamp: new Date().toISOString()
      });
    }
  };

  getMessages = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Verify session ownership
      const session = await this.sessionService.findById(id, userId);
      if (!session) {
        return res.status(404).json({
          status: 404,
          error: 'NotFound',
          message: 'Session not found',
          timestamp: new Date().toISOString()
        });
      }

      // Get messages
      const messages = await this.messageRepository.findBySession(id);

      return res.status(200).json({
        status: 200,
        message: 'Messages retrieved successfully',
        data: messages,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Access denied')) {
        return res.status(403).json({
          status: 403,
          error: 'Forbidden',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(500).json({
        status: 500,
        error: 'ServerError',
        message: 'Failed to retrieve messages',
        timestamp: new Date().toISOString()
      });
    }
  };

  update = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { title, metadata, isActive } = req.body;
      const userId = req.user!.id;

      const session = await this.sessionService.update(id, userId, {
        title,
        metadata,
        isActive
      });

      return res.status(200).json({
        status: 200,
        message: 'Session updated successfully',
        data: session,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Access denied')) {
        return res.status(403).json({
          status: 403,
          error: 'Forbidden',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({
          status: 404,
          error: 'NotFound',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(400).json({
        status: 400,
        error: 'SessionError',
        message: error instanceof Error ? error.message : 'Failed to update session',
        timestamp: new Date().toISOString()
      });
    }
  };

  delete = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await this.sessionService.delete(id, userId);

      return res.status(200).json({
        status: 200,
        message: 'Session deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Access denied')) {
        return res.status(403).json({
          status: 403,
          error: 'Forbidden',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({
          status: 404,
          error: 'NotFound',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(500).json({
        status: 500,
        error: 'ServerError',
        message: 'Failed to delete session',
        timestamp: new Date().toISOString()
      });
    }
  };
}

export default SessionController;
