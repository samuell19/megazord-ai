import { Response } from 'express';
import ApiKeyService from '../services/ApiKeyService';
import { AuthRequest } from '../middleware/authMiddleware';

class ApiKeyController {
  private apiKeyService: ApiKeyService;

  constructor() {
    this.apiKeyService = new ApiKeyService();
  }

  store = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { key } = req.body;
      const userId = req.user!.id;

      // Input validation
      if (!key) {
        return res.status(400).json({
          status: 400,
          error: 'ValidationError',
          message: 'API key is required',
          timestamp: new Date().toISOString()
        });
      }

      if (typeof key !== 'string' || key.trim().length === 0) {
        return res.status(400).json({
          status: 400,
          error: 'ValidationError',
          message: 'API key must be a non-empty string',
          timestamp: new Date().toISOString()
        });
      }

      const result = await this.apiKeyService.store(userId, key);

      return res.status(201).json({
        status: 201,
        message: 'API key stored successfully',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(400).json({
        status: 400,
        error: 'ApiKeyError',
        message: error instanceof Error ? error.message : 'Failed to store API key',
        timestamp: new Date().toISOString()
      });
    }
  };

  get = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user!.id;
      const result = await this.apiKeyService.get(userId);

      if (!result) {
        return res.status(404).json({
          status: 404,
          error: 'NotFound',
          message: 'API key not found',
          timestamp: new Date().toISOString()
        });
      }

      return res.status(200).json({
        status: 200,
        message: 'API key retrieved successfully',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        error: 'ServerError',
        message: 'Failed to retrieve API key',
        timestamp: new Date().toISOString()
      });
    }
  };

  update = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { key } = req.body;
      const userId = req.user!.id;

      // Input validation
      if (!key) {
        return res.status(400).json({
          status: 400,
          error: 'ValidationError',
          message: 'API key is required',
          timestamp: new Date().toISOString()
        });
      }

      if (typeof key !== 'string' || key.trim().length === 0) {
        return res.status(400).json({
          status: 400,
          error: 'ValidationError',
          message: 'API key must be a non-empty string',
          timestamp: new Date().toISOString()
        });
      }

      const result = await this.apiKeyService.update(userId, key);

      return res.status(200).json({
        status: 200,
        message: 'API key updated successfully',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(400).json({
        status: 400,
        error: 'ApiKeyError',
        message: error instanceof Error ? error.message : 'Failed to update API key',
        timestamp: new Date().toISOString()
      });
    }
  };

  delete = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user!.id;
      await this.apiKeyService.delete(userId);

      return res.status(200).json({
        status: 200,
        message: 'API key deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        error: 'ServerError',
        message: 'Failed to delete API key',
        timestamp: new Date().toISOString()
      });
    }
  };
}

export default ApiKeyController;
