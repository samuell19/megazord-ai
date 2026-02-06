import AgentRepository from '../repositories/AgentRepository';
import ApiKeyService from './ApiKeyService';
import OpenRouterService, { OpenRouterMessage } from './OpenRouterService';

interface MessageRequest {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

interface MessageResponse {
  response: string;
  model: string;
  tokensUsed?: number;
}

class MessageProcessor {
  private agentRepository: AgentRepository;
  private apiKeyService: ApiKeyService;
  private openRouterService: OpenRouterService;
  private maxRecursionDepth: number = 5;

  constructor() {
    this.agentRepository = new AgentRepository();
    this.apiKeyService = new ApiKeyService();
    this.openRouterService = new OpenRouterService();
  }

  async process(
    agentId: string,
    userId: string,
    request: MessageRequest,
    recursionDepth: number = 0
  ): Promise<MessageResponse> {
    // Check recursion limit
    if (recursionDepth >= this.maxRecursionDepth) {
      throw new Error(`Maximum recursion depth of ${this.maxRecursionDepth} exceeded`);
    }

    // Retrieve agent configuration
    const agent = await this.agentRepository.findById(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Verify ownership
    if (agent.userId !== userId) {
      throw new Error('Access denied. This agent belongs to another user.');
    }

    // Retrieve and decrypt user's API key
    const apiKey = await this.apiKeyService.getDecrypted(userId);
    if (!apiKey) {
      throw new Error('API key not configured. Please configure your OpenRouter API key first.');
    }

    // Build messages array
    const messages: OpenRouterMessage[] = [];

    // Add conversation history if provided
    if (request.conversationHistory && request.conversationHistory.length > 0) {
      messages.push(...request.conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    }

    // Add current message
    messages.push({
      role: 'user',
      content: request.message
    });

    // Call OpenRouter
    try {
      const response = await this.openRouterService.sendMessage(
        apiKey,
        agent.model,
        messages
      );

      // Extract response
      const assistantMessage = response.choices[0]?.message?.content || '';
      
      return {
        response: assistantMessage,
        model: response.model,
        tokensUsed: response.usage?.total_tokens
      };
    } catch (error) {
      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Failed to process message: ${error.message}`);
      }
      throw new Error('Failed to process message: Unknown error');
    }
  }
}

export default MessageProcessor;
export { MessageRequest, MessageResponse };
