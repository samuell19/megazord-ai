import { Response } from 'express';
import AgentService from '../services/AgentService';
import MessageProcessor from '../services/MessageProcessor';
import OpenRouterService from '../services/OpenRouterService';
import ApiKeyService from '../services/ApiKeyService';
import { AuthRequest } from '../middleware/authMiddleware';

class AgentController {
  private agentService: AgentService;
  private messageProcessor: MessageProcessor;
  private openRouterService: OpenRouterService;
  private apiKeyService: ApiKeyService;

  constructor() {
    this.agentService = new AgentService();
    this.messageProcessor = new MessageProcessor();
    this.openRouterService = new OpenRouterService();
    this.apiKeyService = new ApiKeyService();
  }

  create = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { name, model, configuration } = req.body;
      const userId = req.user!.id;

      // Input validation
      if (!name || !model) {
        return res.status(400).json({
          status: 400,
          error: 'ValidationError',
          message: 'Name and model are required',
          timestamp: new Date().toISOString()
        });
      }

      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          status: 400,
          error: 'ValidationError',
          message: 'Name must be a non-empty string',
          timestamp: new Date().toISOString()
        });
      }

      if (typeof model !== 'string' || model.trim().length === 0) {
        return res.status(400).json({
          status: 400,
          error: 'ValidationError',
          message: 'Model must be a non-empty string',
          timestamp: new Date().toISOString()
        });
      }

      const agent = await this.agentService.create(userId, {
        name,
        model,
        configuration
      });

      return res.status(201).json({
        status: 201,
        message: 'Agent created successfully',
        data: agent,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(400).json({
        status: 400,
        error: 'AgentError',
        message: error instanceof Error ? error.message : 'Failed to create agent',
        timestamp: new Date().toISOString()
      });
    }
  };

  list = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user!.id;
      const agents = await this.agentService.findByUser(userId);

      return res.status(200).json({
        status: 200,
        message: 'Agents retrieved successfully',
        data: agents,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        error: 'ServerError',
        message: 'Failed to retrieve agents',
        timestamp: new Date().toISOString()
      });
    }
  };

  get = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const agent = await this.agentService.findById(id, userId);

      if (!agent) {
        return res.status(404).json({
          status: 404,
          error: 'NotFound',
          message: 'Agent not found',
          timestamp: new Date().toISOString()
        });
      }

      return res.status(200).json({
        status: 200,
        message: 'Agent retrieved successfully',
        data: agent,
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
        message: 'Failed to retrieve agent',
        timestamp: new Date().toISOString()
      });
    }
  };

  update = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { name, model, configuration } = req.body;
      const userId = req.user!.id;

      // At least one field must be provided
      if (!name && !model && !configuration) {
        return res.status(400).json({
          status: 400,
          error: 'ValidationError',
          message: 'At least one field (name, model, or configuration) must be provided',
          timestamp: new Date().toISOString()
        });
      }

      const agent = await this.agentService.update(id, userId, {
        name,
        model,
        configuration
      });

      return res.status(200).json({
        status: 200,
        message: 'Agent updated successfully',
        data: agent,
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
        error: 'AgentError',
        message: error instanceof Error ? error.message : 'Failed to update agent',
        timestamp: new Date().toISOString()
      });
    }
  };

  delete = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await this.agentService.delete(id, userId);

      return res.status(200).json({
        status: 200,
        message: 'Agent deleted successfully',
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
        message: 'Failed to delete agent',
        timestamp: new Date().toISOString()
      });
    }
  };

  sendMessage = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { message, sessionId } = req.body;
      const userId = req.user!.id;

      // Input validation
      if (!message) {
        return res.status(400).json({
          status: 400,
          error: 'ValidationError',
          message: 'Message is required',
          timestamp: new Date().toISOString()
        });
      }

      if (typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
          status: 400,
          error: 'ValidationError',
          message: 'Message must be a non-empty string',
          timestamp: new Date().toISOString()
        });
      }

      // Process message
      const response = await this.messageProcessor.process(id, userId, {
        message,
        sessionId
      });

      return res.status(200).json({
        status: 200,
        message: 'Message processed successfully',
        data: response,
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

      if (error instanceof Error && error.message.includes('API key not configured')) {
        return res.status(400).json({
          status: 400,
          error: 'ConfigurationError',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      if (error instanceof Error && error.message.includes('recursion depth')) {
        return res.status(400).json({
          status: 400,
          error: 'RecursionLimitError',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(500).json({
        status: 500,
        error: 'ServerError',
        message: error instanceof Error ? error.message : 'Failed to process message',
        timestamp: new Date().toISOString()
      });
    }
  };

  getAvailableModels = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user!.id;

      // Get user's API key
      const apiKey = await this.apiKeyService.getDecrypted(userId);
      
      if (!apiKey) {
        return res.status(400).json({
          status: 400,
          error: 'ConfigurationError',
          message: 'API key not configured. Please configure your OpenRouter API key first.',
          timestamp: new Date().toISOString()
        });
      }

      // Fetch models from OpenRouter
      const models = await this.openRouterService.getAvailableModels(apiKey);

      return res.status(200).json({
        status: 200,
        message: 'Models retrieved successfully',
        data: models,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        error: 'ServerError',
        message: error instanceof Error ? error.message : 'Failed to retrieve models',
        timestamp: new Date().toISOString()
      });
    }
  };
}

export default AgentController;
